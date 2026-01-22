import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import ExerciseService from '../../services/exerciseService';
import ExerciseFormModal from './ExerciseFormModal';
import ExerciseDetailsModal from './ExerciseDetailsModal';

const ExerciseManagerScreen = ({ onBack, isAdmin }) => {
    const [exercises, setExercises] = useState([]);
    const [filteredExercises, setFilteredExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedSubcategory, setSelectedSubcategory] = useState('all');

    // Modals
    const [formModalVisible, setFormModalVisible] = useState(false);
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [editMode, setEditMode] = useState(false);

    // Categories configuration (from US-10)
    const categories = [
        { id: 'all', label: 'Tous', icon: 'view-grid' },
        { id: 'shoot', label: 'Shoot', icon: 'basketball' },
        { id: 'dribble', label: 'Conduite', icon: 'run' },
        { id: 'defense', label: 'Défense', icon: 'shield' },
        { id: 'system', label: 'Système', icon: 'strategy' },
        { id: 'physical', label: 'Physique', icon: 'dumbbell' },
        { id: 'mental', label: 'Mental', icon: 'brain' }
    ];

    const subcategories = {
        shoot: [
            { id: 'all', label: 'Tous' },
            { id: 'catch_shoot', label: 'Catch & Shoot' },
            { id: 'free_throw', label: 'Lancers francs' },
            { id: 'runner', label: 'Pénétrations' }
        ],
        dribble: [
            { id: 'all', label: 'Tous' },
            { id: 'ball_handling', label: 'Maniement' },
            { id: 'crossover', label: 'Crossover' }
        ],
        defense: [
            { id: 'all', label: 'Tous' },
            { id: 'individual', label: 'Individuel' },
            { id: 'help', label: 'Aide défensive' },
            { id: 'system', label: 'Système' }
        ],
        system: [
            { id: 'all', label: 'Tous' },
            { id: 'offense', label: 'Attaque' },
            { id: 'defense', label: 'Défense' },
            { id: 'transition', label: 'Transition' }
        ]
    };

    useEffect(() => {
        loadExercises();
    }, []);

    useEffect(() => {
        filterExercises();
    }, [exercises, searchQuery, selectedCategory, selectedSubcategory]);

    const loadExercises = async () => {
        try {
            setLoading(true);
            const response = await ExerciseService.getAllExercises();
            if (response.success) {
                setExercises(response.data || []);
            }
        } catch (error) {
            console.error('Error loading exercises:', error);
            Alert.alert('Erreur', 'Impossible de charger les exercices');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadExercises();
        setRefreshing(false);
    };

    const filterExercises = () => {
        let filtered = [...exercises];

        // Filter by category
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(ex => ex.category === selectedCategory);
        }

        // Filter by subcategory
        if (selectedSubcategory !== 'all') {
            filtered = filtered.filter(ex => ex.subcategory === selectedSubcategory);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(ex =>
                ex.name?.toLowerCase().includes(query) ||
                ex.description?.toLowerCase().includes(query) ||
                ex.equipment?.toLowerCase().includes(query)
            );
        }

        setFilteredExercises(filtered);
    };

    const handleCreateExercise = () => {
        setSelectedExercise(null);
        setEditMode(false);
        setFormModalVisible(true);
    };

    const handleEditExercise = (exercise) => {
        setSelectedExercise(exercise);
        setEditMode(true);
        setDetailsModalVisible(false);
        setFormModalVisible(true);
    };

    const handleDeleteExercise = (exercise) => {
        Alert.alert(
            'Supprimer l\'exercice',
            `Êtes-vous sûr de vouloir supprimer "${exercise.name}" ?`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await ExerciseService.deleteExercise(exercise.id);
                            Alert.alert('Succès', 'Exercice supprimé');
                            loadExercises();
                        } catch (error) {
                            Alert.alert('Erreur', 'Impossible de supprimer l\'exercice');
                        }
                    }
                }
            ]
        );
    };

    const handleViewDetails = (exercise) => {
        setSelectedExercise(exercise);
        setDetailsModalVisible(true);
    };

    const handleFormSuccess = () => {
        setFormModalVisible(false);
        loadExercises();
    };

    const renderExerciseCard = ({ item }) => (
        <TouchableOpacity
            style={styles.exerciseCard}
            onPress={() => handleViewDetails(item)}
        >
            <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                    <Icon
                        name={categories.find(c => c.id === item.category)?.icon || 'dumbbell'}
                        size={24}
                        color="#FF6B35"
                    />
                    <View style={styles.cardHeaderText}>
                        <Text style={styles.exerciseName}>{item.name}</Text>
                        <Text style={styles.exerciseCategory}>
                            {categories.find(c => c.id === item.category)?.label || item.category}
                            {item.subcategory && ` • ${item.subcategory}`}
                        </Text>
                    </View>
                </View>

            </View>

            {item.description && (
                <Text style={styles.exerciseDescription} numberOfLines={2}>
                    {item.description}
                </Text>
            )}

            <View style={styles.cardFooter}>
                <View style={styles.cardFooterInfo}>
                    {item.duration && (
                        <View style={styles.infoTag}>
                            <Icon name="clock-outline" size={14} color="#666" />
                            <Text style={styles.infoText}>{item.duration} min</Text>
                        </View>
                    )}
                    {item.players_min && item.players_max && (
                        <View style={styles.infoTag}>
                            <Icon name="account-group" size={14} color="#666" />
                            <Text style={styles.infoText}>
                                {item.players_min}-{item.players_max} joueurs
                            </Text>
                        </View>
                    )}
                </View>

                <View style={styles.cardActions}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleEditExercise(item)}
                    >
                        <Icon name="pencil" size={18} color="#4ECDC4" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleDeleteExercise(item)}
                    >
                        <Icon name="delete" size={18} color="#FF6B35" />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Icon name="dumbbell" size={64} color="#CCC" />
            <Text style={styles.emptyStateText}>Aucun exercice trouvé</Text>
            <Text style={styles.emptyStateSubtext}>
                {searchQuery || selectedCategory !== 'all'
                    ? 'Essayez de modifier vos filtres'
                    : 'Créez votre premier exercice'}
            </Text>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF6B35" />
                <Text style={styles.loadingText}>Chargement des exercices...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {onBack && (
                        <TouchableOpacity onPress={onBack} style={{ marginRight: 16 }}>
                            <Icon name="arrow-left" size={24} color="#1A1A1A" />
                        </TouchableOpacity>
                    )}
                    <View>
                        <Text style={styles.headerTitle}>{isAdmin ? 'Gestion Exercices' : 'Exercices'}</Text>
                        <Text style={styles.headerSubtitle}>
                            {filteredExercises.length} exercice{filteredExercises.length > 1 ? 's' : ''}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Icon name="magnify" size={20} color="#999" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Rechercher un exercice..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#999"
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Icon name="close-circle" size={20} color="#999" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Category Filters */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoriesContainer}
                contentContainerStyle={styles.categoriesContent}
            >
                {categories.map(category => (
                    <TouchableOpacity
                        key={category.id}
                        style={[
                            styles.categoryButton,
                            selectedCategory === category.id && styles.categoryButtonActive
                        ]}
                        onPress={() => {
                            setSelectedCategory(category.id);
                            setSelectedSubcategory('all');
                        }}
                    >
                        <Icon
                            name={category.icon}
                            size={18}
                            color={selectedCategory === category.id ? '#FFF' : '#666'}
                        />
                        <Text
                            style={[
                                styles.categoryButtonText,
                                selectedCategory === category.id && styles.categoryButtonTextActive
                            ]}
                        >
                            {category.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Subcategory Filters */}
            {selectedCategory !== 'all' && subcategories[selectedCategory] && (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.subcategoriesContainer}
                    contentContainerStyle={styles.subcategoriesContent}
                >
                    {subcategories[selectedCategory].map(sub => (
                        <TouchableOpacity
                            key={sub.id}
                            style={[
                                styles.subcategoryChip,
                                selectedSubcategory === sub.id && styles.subcategoryChipActive
                            ]}
                            onPress={() => setSelectedSubcategory(sub.id)}
                        >
                            <Text
                                style={[
                                    styles.subcategoryChipText,
                                    selectedSubcategory === sub.id && styles.subcategoryChipTextActive
                                ]}
                            >
                                {sub.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}

            {/* Exercise List */}
            <FlatList
                data={filteredExercises}
                renderItem={renderExerciseCard}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={renderEmptyState}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#FF6B35']}
                    />
                }
            />

            {/* Floating Action Button (FAB) at Bottom Right */}
            <TouchableOpacity
                style={styles.fabRight}
                onPress={handleCreateExercise}
            >
                <Icon name="plus" size={32} color="#FFF" />
            </TouchableOpacity>

            {/* Modals */}
            <ExerciseFormModal
                visible={formModalVisible}
                onClose={() => setFormModalVisible(false)}
                onSuccess={handleFormSuccess}
                exercise={editMode ? selectedExercise : null}
                editMode={editMode}
            />

            <ExerciseDetailsModal
                visible={detailsModalVisible}
                onClose={() => setDetailsModalVisible(false)}
                exercise={selectedExercise}
                onEdit={handleEditExercise}
                onDelete={handleDeleteExercise}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA'
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F7FA'
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5'
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1A1A1A'
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 4
    },
    fabRight: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FF6B35',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#FF6B35',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        zIndex: 100
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        marginHorizontal: 20,
        marginVertical: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E5E5'
    },
    searchIcon: {
        marginRight: 8
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#1A1A1A'
    },
    categoriesContainer: {
        maxHeight: 50,
        marginBottom: 12
    },
    categoriesContent: {
        paddingHorizontal: 20
    },
    categoryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
        borderRadius: 20,
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E5E5E5'
    },
    categoryButtonActive: {
        backgroundColor: '#FF6B35',
        borderColor: '#FF6B35'
    },
    categoryButtonText: {
        marginLeft: 6,
        fontSize: 14,
        fontWeight: '500',
        color: '#666'
    },
    categoryButtonTextActive: {
        color: '#FFF'
    },
    subcategoriesContainer: {
        maxHeight: 40,
        marginBottom: 12
    },
    subcategoriesContent: {
        paddingHorizontal: 20
    },
    subcategoryChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginRight: 8,
        borderRadius: 16,
        backgroundColor: '#F0F0F0'
    },
    subcategoryChipActive: {
        backgroundColor: '#4ECDC4'
    },
    subcategoryChipText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#666'
    },
    subcategoryChipTextActive: {
        color: '#FFF'
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20
    },
    exerciseCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8
    },
    cardHeaderLeft: {
        flexDirection: 'row',
        flex: 1
    },
    cardHeaderText: {
        marginLeft: 12,
        flex: 1
    },
    exerciseName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 4
    },
    exerciseCategory: {
        fontSize: 12,
        color: '#666'
    },
    exerciseDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
        lineHeight: 20
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    cardFooterInfo: {
        flexDirection: 'row',
        flex: 1
    },
    infoTag: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 12
    },
    infoText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4
    },
    cardActions: {
        flexDirection: 'row'
    },
    actionButton: {
        padding: 8,
        marginLeft: 8
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#999',
        marginTop: 16
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#BBB',
        marginTop: 8
    }
});

export default ExerciseManagerScreen;
