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
    ScrollView,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import ExerciseService from '../../services/exerciseService';
import ExerciseFormModal from './ExerciseFormModal';
import ExerciseDetailsModal from './ExerciseDetailsModal';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../config/theme';
import Button from '../UI/Button';
import Card from '../UI/Card';
import Input from '../UI/Input';

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

    // Categories configuration
    const categories = [
        { id: 'all', label: 'Tous', icon: 'view-grid', color: COLORS.gray[500] },
        { id: 'shoot', label: 'Shoot', icon: 'basketball', color: '#f97316' },
        { id: 'dribble', label: 'Conduite', icon: 'run', color: '#3b82f6' },
        { id: 'defense', label: 'Défense', icon: 'shield', color: '#10b981' },
        { id: 'system', label: 'Système', icon: 'strategy', color: '#8b5cf6' },
        { id: 'physical', label: 'Physique', icon: 'dumbbell', color: '#ef4444' },
        { id: 'mental', label: 'Mental', icon: 'brain', color: '#f59e0b' }
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

        if (selectedCategory !== 'all') {
            filtered = filtered.filter(ex => ex.category === selectedCategory);
        }

        if (selectedSubcategory !== 'all') {
            filtered = filtered.filter(ex => ex.subcategory === selectedSubcategory);
        }

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

    const handleFormSuccess = () => {
        setFormModalVisible(false);
        setEditMode(false);
        setSelectedExercise(null);
        loadExercises();
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

    const renderExerciseCard = ({ item }) => {
        const category = categories.find(c => c.id === item.category) || categories[0];

        return (
            <Card
                style={styles.exerciseCard}
                padding="none"
                onPress={() => handleViewDetails(item)}
            >
                <View style={styles.cardContent}>
                    <View style={[styles.categoryStrip, { backgroundColor: category.color }]} />
                    <View style={styles.cardMain}>
                        <View style={styles.cardTop}>
                            <View style={styles.cardTitleArea}>
                                <Text style={styles.exerciseName} numberOfLines={1}>{item.name}</Text>
                                <Text style={styles.exerciseSub}>
                                    {category.label} {item.subcategory ? `• ${item.subcategory}` : ''}
                                </Text>
                            </View>
                            <Icon name={category.icon} size={20} color={category.color} />
                        </View>

                        {Boolean(item.description) && (
                            <Text style={styles.exerciseDescription} numberOfLines={2}>
                                {item.description}
                            </Text>
                        )}

                        <View style={styles.cardFooter}>
                            <View style={styles.metaRow}>
                                {Boolean(item.duration) && (
                                    <View style={styles.metaItem}>
                                        <Icon name="clock-outline" size={14} color={COLORS.gray[400]} />
                                        <Text style={styles.metaText}>{item.duration} min</Text>
                                    </View>
                                )}
                                {Boolean(item.players_min) && (
                                    <View style={styles.metaItem}>
                                        <Icon name="account-group-outline" size={14} color={COLORS.gray[400]} />
                                        <Text style={styles.metaText}>{item.players_min}-{item.players_max || '+'}</Text>
                                    </View>
                                )}
                            </View>

                            <View style={styles.actions}>
                                <TouchableOpacity onPress={() => handleEditExercise(item)} style={styles.actionBtn}>
                                    <Icon name="pencil-outline" size={18} color={COLORS.gray[400]} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDeleteExercise(item)} style={styles.actionBtn}>
                                    <Icon name="trash-can-outline" size={18} color={COLORS.error + '80'} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Card>
        );
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Chargement de la bibliothèque...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    {onBack && (
                        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                            <Icon name="chevron-left" size={32} color={COLORS.gray[900]} />
                        </TouchableOpacity>
                    )}
                    <View>
                        <Text style={styles.headerTitle}>{isAdmin ? 'Catalogue' : 'Ma Bibliothèque'}</Text>
                        <Text style={styles.headerSubtitle}>{filteredExercises.length} exercices disponibles</Text>
                    </View>
                </View>

                <View style={styles.searchInput}>
                    <Icon name="magnify" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
                    <TextInput
                        style={styles.searchInputText}
                        placeholder="Rechercher un exercice..."
                        placeholderTextColor={COLORS.gray[400]}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {Boolean(searchQuery) && (
                        <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 6 }}>
                            <Icon name="close-circle" size={16} color={COLORS.gray[400]} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <View style={styles.filterSection}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterScroll}
                >
                    {categories.map(cat => (
                        <TouchableOpacity
                            key={cat.id}
                            onPress={() => {
                                setSelectedCategory(cat.id);
                                setSelectedSubcategory('all');
                            }}
                            style={[
                                styles.catBtn,
                                selectedCategory === cat.id && { backgroundColor: cat.color, borderColor: cat.color }
                            ]}
                        >
                            <Icon
                                name={cat.icon}
                                size={16}
                                color={selectedCategory === cat.id ? COLORS.white : COLORS.gray[400]}
                            />
                            <Text style={[
                                styles.catBtnText,
                                selectedCategory === cat.id && { color: COLORS.white }
                            ]}>
                                {cat.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {selectedCategory !== 'all' && subcategories[selectedCategory] && (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.subFilterScroll}
                    >
                        {subcategories[selectedCategory].map(sub => (
                            <TouchableOpacity
                                key={sub.id}
                                onPress={() => setSelectedSubcategory(sub.id)}
                                style={[
                                    styles.subChip,
                                    selectedSubcategory === sub.id && styles.subChipActive
                                ]}
                            >
                                <Text style={[
                                    styles.subChipText,
                                    selectedSubcategory === sub.id && styles.subChipTextActive
                                ]}>
                                    {sub.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
            </View>

            <FlatList
                data={filteredExercises}
                renderItem={renderExerciseCard}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconCircle}>
                            <Icon name="clipboard-search-outline" size={48} color={COLORS.gray[200]} />
                        </View>
                        <Text style={styles.emptyTitle}>Aucun exercice</Text>
                        <Text style={styles.emptyDesc}>
                            {searchQuery || selectedCategory !== 'all'
                                ? "Aucun exercice ne correspond à vos filtres."
                                : "Commencez par ajouter votre premier exercice à votre bibliothèque."}
                        </Text>
                        {!searchQuery && selectedCategory === 'all' && (
                            <Button title="Ajouter un exercice" onPress={handleCreateExercise} style={styles.emptyBtn} />
                        )}
                    </View>
                }
            />

            <TouchableOpacity style={styles.fab} onPress={handleCreateExercise} activeOpacity={0.9}>
                <Icon name="plus" size={32} color={COLORS.white} />
            </TouchableOpacity>

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
        backgroundColor: COLORS.gray[50],
    },
    header: {
        backgroundColor: COLORS.white,
        paddingHorizontal: SPACING.lg,
        paddingTop: Platform.OS === 'ios' ? 60 : 30,
        paddingBottom: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[100],
        ...SHADOWS.sm,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        marginLeft: -10,
    },
    headerTitle: {
        ...TYPOGRAPHY.h3,
        color: COLORS.gray[900],
    },
    headerSubtitle: {
        ...TYPOGRAPHY.bodySmall,
        color: COLORS.gray[400],
        marginTop: 2,
    },
    searchInput: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.gray[50],
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: COLORS.gray[100],
        paddingHorizontal: SPACING.lg,
        paddingRight: 8,
        height: 48,
        marginTop: 12,
    },
    searchInputText: {
        flex: 1,
        fontSize: 14,
        color: COLORS.gray[900],
        height: '100%',
    },
    filterSection: {
        backgroundColor: COLORS.white,
        paddingBottom: 4,
        ...SHADOWS.sm,
    },
    filterScroll: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: 16,
        gap: 10,
    },
    subFilterScroll: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: 12,
        gap: 8,
    },
    catBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 14,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.gray[100],
        gap: 8,
        ...SHADOWS.xs,
    },
    catBtnText: {
        ...TYPOGRAPHY.label,
        fontSize: 13,
        color: COLORS.gray[600],
    },
    subChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: COLORS.gray[50],
        borderWidth: 1,
        borderColor: COLORS.gray[100],
    },
    subChipActive: {
        backgroundColor: COLORS.gray[900],
        borderColor: COLORS.gray[900],
    },
    subChipText: {
        ...TYPOGRAPHY.label,
        fontSize: 12,
        color: COLORS.gray[500],
    },
    subChipTextActive: {
        color: COLORS.white,
    },
    listContent: {
        padding: SPACING.lg,
        paddingBottom: 120,
        gap: 16,
    },
    exerciseCard: {
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.gray[50],
        ...SHADOWS.sm,
    },
    cardContent: {
        flexDirection: 'row',
    },
    categoryStrip: {
        width: 6,
    },
    cardMain: {
        flex: 1,
        padding: 16,
    },
    cardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    cardTitleArea: {
        flex: 1,
        marginRight: 10,
    },
    exerciseName: {
        ...TYPOGRAPHY.h4,
        fontSize: 16,
        color: COLORS.gray[900],
    },
    exerciseSub: {
        ...TYPOGRAPHY.label,
        fontSize: 10,
        color: COLORS.gray[400],
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginTop: 4,
    },
    exerciseDescription: {
        ...TYPOGRAPHY.bodySmall,
        fontSize: 13,
        color: COLORS.gray[500],
        marginBottom: 16,
        lineHeight: 20,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: COLORS.gray[50],
    },
    metaRow: {
        flexDirection: 'row',
        gap: 12,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    metaText: {
        ...TYPOGRAPHY.bodySmall,
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.gray[400],
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionBtn: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: COLORS.gray[50],
        justifyContent: 'center',
        alignItems: 'center',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.gray[50],
    },
    loadingText: {
        ...TYPOGRAPHY.bodySmall,
        marginTop: 16,
        color: COLORS.gray[400],
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
    },
    emptyIconCircle: {
        width: 90,
        height: 90,
        borderRadius: 30,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        ...SHADOWS.md,
    },
    emptyTitle: {
        ...TYPOGRAPHY.h3,
        color: COLORS.gray[900],
    },
    emptyDesc: {
        ...TYPOGRAPHY.bodySmall,
        fontSize: 14,
        color: COLORS.gray[400],
        textAlign: 'center',
        marginTop: 12,
        paddingHorizontal: 50,
        lineHeight: 22,
    },
    emptyBtn: {
        marginTop: 32,
        height: 50,
        borderRadius: 14,
        paddingHorizontal: 32,
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 20,
        backgroundColor: COLORS.gray[900],
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.lg,
        elevation: 8,
    },
});

export default ExerciseManagerScreen;
