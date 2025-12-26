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
    Image
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AthleteService from '../../services/athleteService';

const AthleteListScreen = ({ onAddAthlete, onEditAthlete, onViewMedical }) => {
    const [athletes, setAthletes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterGroupe, setFilterGroupe] = useState(null);

    useEffect(() => {
        fetchAthletes();
    }, [filterGroupe]);

    const fetchAthletes = async () => {
        try {
            setLoading(true);
            const filters = {};
            if (filterGroupe) filters.groupe = filterGroupe;

            const response = await AthleteService.getAllAthletes(filters);
            if (response.success) {
                setAthletes(response.data);
            }
        } catch (error) {
            console.error('Error fetching athletes:', error);
            Alert.alert('Erreur', 'Impossible de charger les athlètes');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAthlete = (id, name) => {
        Alert.alert(
            'Supprimer l\'athlète',
            `Voulez-vous vraiment supprimer ${name} ?`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await AthleteService.deleteAthlete(id);
                            if (response.success) {
                                setAthletes(athletes.filter(a => a.id !== id));
                                Alert.alert('Succès', 'Athlète supprimé');
                            }
                        } catch (error) {
                            Alert.alert('Erreur', 'Impossible de supprimer l\'athlète');
                        }
                    }
                }
            ]
        );
    };

    const filteredAthletes = athletes.filter(a =>
        `${a.nom} ${a.prenom}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderAthleteItem = ({ item }) => (
        <TouchableOpacity
            style={styles.athleteCard}
            onPress={() => onEditAthlete(item)}
        >
            <View style={styles.athleteInfo}>
                <View style={styles.avatarContainer}>
                    {item.photo_url ? (
                        <Image source={{ uri: item.photo_url }} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Icon name="account" size={30} color="#9ca3af" />
                        </View>
                    )}
                    {item.blesse && (
                        <View style={styles.injuryBadge}>
                            <Icon name="plus" size={10} color="white" />
                        </View>
                    )}
                </View>
                <View style={styles.detailsContainer}>
                    <Text style={styles.athleteName}>{item.nom} {item.prenom}</Text>
                    <Text style={styles.athleteSubtext}>{item.groupe} • {item.poste}</Text>
                </View>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => onViewMedical(item)}
                >
                    <Icon name="medical-bag" size={22} color="#f97316" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeleteAthlete(item.id, `${item.prenom} ${item.nom}`)}
                >
                    <Icon name="trash-can-outline" size={22} color="#ef4444" />
                </TouchableOpacity>
                <Icon name="chevron-right" size={24} color="#d1d5db" />
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Athlètes</Text>
                <TouchableOpacity style={styles.addButton} onPress={onAddAthlete}>
                    <Icon name="plus" size={24} color="white" />
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <Icon name="magnify" size={20} color="#9ca3af" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Rechercher un athlète..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#9ca3af"
                />
            </View>

            {/* Filter Chips - Simplified for now */}
            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[styles.filterChip, !filterGroupe && styles.activeFilterChip]}
                    onPress={() => setFilterGroupe(null)}
                >
                    <Text style={[styles.filterText, !filterGroupe && styles.activeFilterText]}>Tous</Text>
                </TouchableOpacity>
                {['U13', 'U15', 'U17', 'Seniors'].map(groupe => (
                    <TouchableOpacity
                        key={groupe}
                        style={[styles.filterChip, filterGroupe === groupe && styles.activeFilterChip]}
                        onPress={() => setFilterGroupe(groupe)}
                    >
                        <Text style={[styles.filterText, filterGroupe === groupe && styles.activeFilterText]}>{groupe}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color="#f97316" />
                </View>
            ) : (
                <FlatList
                    data={filteredAthletes}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderAthleteItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Icon name="account-group-outline" size={64} color="#d1d5db" />
                            <Text style={styles.emptyText}>Aucun athlète trouvé</Text>
                        </View>
                    }
                    refreshing={loading}
                    onRefresh={fetchAthletes}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        paddingTop: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    addButton: {
        backgroundColor: '#f97316',
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#f97316',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        marginHorizontal: 24,
        paddingHorizontal: 16,
        borderRadius: 12,
        height: 48,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginBottom: 16,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#334155',
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        marginBottom: 20,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginRight: 8,
    },
    activeFilterChip: {
        backgroundColor: '#f97316',
        borderColor: '#f97316',
    },
    filterText: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '600',
    },
    activeFilterText: {
        color: 'white',
    },
    listContent: {
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    athleteCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    athleteInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 16,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    avatarPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    injuryBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#ef4444',
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    detailsContainer: {
        flex: 1,
    },
    athleteName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 2,
    },
    athleteSubtext: {
        fontSize: 13,
        color: '#64748b',
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButton: {
        padding: 8,
        marginRight: 4,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: '#94a3b8',
    },
});

export default AthleteListScreen;
