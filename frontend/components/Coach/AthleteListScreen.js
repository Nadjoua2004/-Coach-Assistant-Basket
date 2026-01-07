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
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('card'); // 'card' or 'list'

    // Filters
    const [filterGroupe, setFilterGroupe] = useState(null);
    const [filterSexe, setFilterSexe] = useState(null);
    const [filterPoste, setFilterPoste] = useState(null);
    const [filterBlesse, setFilterBlesse] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchAthletes();
        useEffect(() => {
            fetchAthletes();
        }, [filterGroupe, filterSexe, filterPoste, filterBlesse]);

        const fetchAthletes = async () => {
            try {
                setLoading(true);
                const filters = {};
                const filters = {};
                if (filterGroupe) filters.groupe = filterGroupe;
                if (filterSexe) filters.sexe = filterSexe;
                if (filterPoste) filters.poste = filterPoste;
                if (filterBlesse) filters.blesse = true;

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

        const renderAthleteItem = ({ item }) => {
            if (viewMode === 'list') {
                return (
                    <TouchableOpacity
                        style={styles.athleteListItem}
                        onPress={() => onEditAthlete(item)}
                    >
                        <View style={styles.listAvatarContainer}>
                            {item.photo_url ? (
                                <Image source={{ uri: item.photo_url }} style={styles.listAvatar} />
                            ) : (
                                <View style={styles.listAvatarPlaceholder}>
                                    <Icon name="account" size={20} color="#9ca3af" />
                                </View>
                            )}
                            {item.blesse && (
                                <View style={styles.listInjuryBadge} />
                            )}
                        </View>
                        <View style={styles.listInfo}>
                            <Text style={styles.listName}>{item.nom} {item.prenom}</Text>
                            <Text style={styles.listSubtext}>{item.groupe} • {item.poste || 'N/A'}</Text>
                        </View>
                        <View style={styles.listActions}>
                            <TouchableOpacity style={{ marginRight: 12 }} onPress={() => onViewMedical(item)}>
                                <Icon name="medical-bag" size={20} color="#f97316" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDeleteAthlete(item.id, `${item.prenom} ${item.nom}`)}>
                                <Icon name="trash-can-outline" size={20} color="#ef4444" />
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                );
            }

            return (
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
        };

    };

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

            {/* Controls Row */}
            <View style={styles.controlsRow}>
                <TouchableOpacity
                    style={styles.filterToggleBtn}
                    onPress={() => setShowFilters(!showFilters)}
                >
                    <Icon name="filter-variant" size={20} color={showFilters ? "#f97316" : "#64748b"} />
                    <Text style={[styles.filterToggleText, showFilters && { color: '#f97316' }]}>Filtres</Text>
                </TouchableOpacity>

                <View style={styles.viewToggle}>
                    <TouchableOpacity
                        style={[styles.viewBtn, viewMode === 'card' && styles.activeViewBtn]}
                        onPress={() => setViewMode('card')}
                    >
                        <Icon name="view-grid" size={20} color={viewMode === 'card' ? 'white' : '#64748b'} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.viewBtn, viewMode === 'list' && styles.activeViewBtn]}
                        onPress={() => setViewMode('list')}
                    >
                        <Icon name="view-list" size={20} color={viewMode === 'list' ? 'white' : '#64748b'} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Expanded Filters */}
            {showFilters && (
                <View style={styles.advancedFilters}>
                    <View style={styles.filterGroup}>
                        <Text style={styles.filterLabel}>Groupe:</Text>
                        <View style={styles.chipsRow}>
                            <TouchableOpacity
                                style={[styles.filterChip, !filterGroupe && styles.activeFilterChip]}
                                onPress={() => setFilterGroupe(null)}
                            >
                                <Text style={[styles.filterText, !filterGroupe && styles.activeFilterText]}>Tous</Text>
                            </TouchableOpacity>
                            {['U13', 'U15', 'U17', 'Seniors'].map(g => (
                                <TouchableOpacity
                                    key={g}
                                    style={[styles.filterChip, filterGroupe === g && styles.activeFilterChip]}
                                    onPress={() => setFilterGroupe(g)}
                                >
                                    <Text style={[styles.filterText, filterGroupe === g && styles.activeFilterText]}>{g}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.filterGroup}>
                        <Text style={styles.filterLabel}>Sexe:</Text>
                        <View style={styles.chipsRow}>
                            {['M', 'F'].map(s => (
                                <TouchableOpacity
                                    key={s}
                                    style={[styles.filterChip, filterSexe === s && styles.activeFilterChip]}
                                    onPress={() => setFilterSexe(filterSexe === s ? null : s)}
                                >
                                    <Text style={[styles.filterText, filterSexe === s && styles.activeFilterText]}>{s === 'M' ? 'Garçons' : 'Filles'}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.filterGroup}>
                        <Text style={styles.filterLabel}>Poste:</Text>
                        <View style={styles.chipsRow}>
                            {['Meneur', 'Arrière', 'Ailier', 'Ailier fort', 'Pivot'].map(p => (
                                <TouchableOpacity
                                    key={p}
                                    style={[styles.filterChip, filterPoste === p && styles.activeFilterChip]}
                                    onPress={() => setFilterPoste(filterPoste === p ? null : p)}
                                >
                                    <Text style={[styles.filterText, filterPoste === p && styles.activeFilterText]}>{p}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.filterRowItem, filterBlesse && styles.activeFilterRowItem]}
                        onPress={() => setFilterBlesse(!filterBlesse)}
                    >
                        <Icon name={filterBlesse ? "check-box-outline" : "checkbox-blank-outline"} size={20} color={filterBlesse ? "#f97316" : "#64748b"} />
                        <Text style={[styles.filterRowText, filterBlesse && { color: "#f97316", fontWeight: 'bold' }]}>Afficher blessés uniquement</Text>
                    </TouchableOpacity>
                </View>
            )}

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
    controlsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        marginBottom: 16,
        alignItems: 'center',
    },
    filterToggleBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 8,
    },
    filterToggleText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    viewToggle: {
        flexDirection: 'row',
        backgroundColor: '#e2e8f0',
        borderRadius: 8,
        padding: 2,
    },
    viewBtn: {
        padding: 6,
        borderRadius: 6,
    },
    activeViewBtn: {
        backgroundColor: '#f97316',
    },
    advancedFilters: {
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#f1f5f9',
        padding: 16,
        marginBottom: 16,
    },
    filterGroup: {
        marginBottom: 12,
    },
    filterLabel: {
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: '700',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    chipsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    filterRowItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 4,
    },
    filterRowText: {
        fontSize: 14,
        color: '#64748b',
    },
    // List View Styles
    athleteListItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 12,
        marginBottom: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    listAvatarContainer: {
        marginRight: 12,
        position: 'relative',
    },
    listAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    listAvatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    listInjuryBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#ef4444',
        borderWidth: 1.5,
        borderColor: 'white',
    },
    listInfo: {
        flex: 1,
    },
    listName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1e293b',
    },
    listSubtext: {
        fontSize: 12,
        color: '#64748b',
    },
    listActions: {
        flexDirection: 'row',
        alignItems: 'center',
    }
});

export default AthleteListScreen;
