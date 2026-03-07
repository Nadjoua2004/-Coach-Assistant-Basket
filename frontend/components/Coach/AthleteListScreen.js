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
    Image,
    Platform,
    ScrollView,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import AthleteService from '../../services/athleteService';
import AuthService from '../../services/authService';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../config/theme';
import Card from '../UI/Card';
import Input from '../UI/Input';
import Button from '../UI/Button';

const AthleteListScreen = ({ onAddAthlete, onEditAthlete, onViewMedical }) => {
    const [athletes, setAthletes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('card');

    // Filters
    const [filterGroupe, setFilterGroupe] = useState(null);
    const [filterSexe, setFilterSexe] = useState(null);
    const [filterPoste, setFilterPoste] = useState(null);
    const [filterBlesse, setFilterBlesse] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchAthletes();
    }, [filterGroupe, filterSexe, filterPoste, filterBlesse]);

    const fetchAthletes = async () => {
        try {
            setLoading(true);
            const filters = {};
            if (filterGroupe) filters.groupe = filterGroupe;
            if (filterSexe) filters.sexe = filterSexe;
            if (filterPoste) filters.poste = filterPoste;
            if (filterBlesse) filters.blesse = true;

            const athleteRes = await AthleteService.getAllAthletes(filters);
            let athletesData = athleteRes.success ? athleteRes.data : [];

            let unlinkedPlayers = [];
            if (!filterGroupe && !filterSexe && !filterPoste && !filterBlesse) {
                try {
                    const userRes = await AuthService.getAllUsers();
                    if (userRes.success) {
                        const players = userRes.data.filter(u => u.role === 'joueur');
                        const athleteUserIds = new Set(athletesData.map(a => a.user_id).filter(id => id));
                        const unlinkedPlayersList = players.filter(p => !athleteUserIds.has(p.id));

                        unlinkedPlayers = unlinkedPlayersList.map(p => {
                            const nameParts = p.name.split(' ');
                            return {
                                id: `temp_${p.id}`,
                                user_id: p.id,
                                nom: nameParts[0] || p.name,
                                prenom: nameParts.slice(1).join(' ') || '',
                                email: p.email,
                                groupe: 'Nouveau',
                                photo_url: null,
                                is_unlinked: true
                            };
                        });
                    }
                } catch (err) {
                    console.error('Error fetching auth users:', err);
                }
            }

            const mergedMap = new Map();
            athletesData.forEach(a => mergedMap.set(a.id, a));
            unlinkedPlayers.forEach(p => {
                if (!mergedMap.has(p.id)) mergedMap.set(p.id, p);
            });

            setAthletes(Array.from(mergedMap.values()));
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
            `Voulez-vous vraiment supprimer ${name} de votre effectif ?`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: async () => {
                        if (id.toString().startsWith('temp_')) {
                            setAthletes(prev => prev.filter(a => a.id !== id));
                            return;
                        }
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
        const isUnlinked = item.is_unlinked;

        if (viewMode === 'list') {
            return (
                <Card style={styles.listRow} padding="none" onPress={() => onEditAthlete(item)}>
                    <View style={styles.listRowContent}>
                        <View style={styles.listAvatar}>
                            {item.photo_url ? (
                                <Image source={{ uri: item.photo_url }} style={styles.avatarImg} />
                            ) : (
                                <Text style={styles.avatarTxt}>{item.prenom[0]}{item.nom[0]}</Text>
                            )}
                            {Boolean(item.blesse) && <View style={styles.injuryDot} />}
                        </View>
                        <View style={styles.listInfo}>
                            <Text style={styles.listNameText}>{item.prenom} {item.nom}</Text>
                            <Text style={styles.listSubText}>
                                {isUnlinked ? item.email : `${item.groupe} • ${item.poste || 'No Poste'}`}
                            </Text>
                        </View>
                        <TouchableOpacity style={styles.listAction} onPress={() => onViewMedical(item)}>
                            <Icon name="medical-bag" size={20} color={COLORS.gray[300]} />
                        </TouchableOpacity>
                    </View>
                </Card>
            );
        }

        return (
            <Card
                style={styles.gridCard}
                padding="none"
                onPress={() => onEditAthlete(item)}
            >
                <View style={styles.gridCardContent}>
                    <View style={styles.gridAvatarWrapper}>
                        {item.photo_url ? (
                            <Image source={{ uri: item.photo_url }} style={styles.gridAvatarImg} />
                        ) : (
                            <View style={styles.gridAvatarPlaceholder}>
                                <Text style={styles.gridAvatarTxt}>{item.prenom[0]}{item.nom[0]}</Text>
                            </View>
                        )}
                        {item.blesse && (
                            <View style={styles.gridInjuryBadge}>
                                <Icon name="plus" size={10} color="white" />
                            </View>
                        )}
                    </View>

                    <Text style={styles.gridNameText} numberOfLines={1}>{item.prenom} {item.nom}</Text>
                    <View style={styles.gridBadgeRow}>
                        <View style={[styles.gridBadge, isUnlinked && styles.incompleteBadge]}>
                            <Text style={[styles.gridBadgeText, isUnlinked && styles.incompleteBadgeText]}>
                                {isUnlinked ? 'À COMPLÉTER' : item.groupe}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.gridActionsRow}>
                        {!isUnlinked && (
                            <TouchableOpacity
                                style={styles.gridActionBtn}
                                onPress={() => onViewMedical(item)}
                            >
                                <Icon name="medical-bag" size={18} color={COLORS.primary} />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={styles.gridActionBtn}
                            onPress={() => handleDeleteAthlete(item.id, `${item.prenom} ${item.nom}`)}
                        >
                            <Icon name="trash-can-outline" size={18} color={COLORS.gray[300]} />
                        </TouchableOpacity>
                    </View>
                </View>
            </Card>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <Text style={styles.headerTitle}>Effectif</Text>
                    <TouchableOpacity style={styles.addBtn} onPress={() => onAddAthlete && onAddAthlete()}>
                        <Icon name="plus" size={24} color={COLORS.white} />
                    </TouchableOpacity>
                </View>

                <View style={styles.searchBox}>
                    <Icon name="magnify" size={20} color={COLORS.primary} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInputField}
                        placeholder="Chercher un joueur..."
                        placeholderTextColor={COLORS.gray[400]}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {Boolean(searchQuery) && (
                        <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.searchClear}>
                            <Icon name="close-circle" size={16} color={COLORS.gray[400]} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <View style={styles.tabsPanel}>
                <TouchableOpacity
                    style={[styles.filterToggle, showFilters && styles.filterToggleOn]}
                    onPress={() => setShowFilters(!showFilters)}
                >
                    <Icon name="tune" size={18} color={showFilters ? COLORS.white : COLORS.gray[500]} />
                    <Text style={[styles.filterToggleLabel, showFilters && styles.filterToggleLabelOn]}>Filtres</Text>
                    {(filterGroupe || filterPoste || filterBlesse) && <View style={styles.dot} />}
                </TouchableOpacity>

                <View style={styles.viewModeSwitcher}>
                    <TouchableOpacity
                        style={[styles.modeBtn, viewMode === 'card' && styles.modeBtnOn]}
                        onPress={() => setViewMode('card')}
                    >
                        <Icon name="view-grid" size={18} color={viewMode === 'card' ? COLORS.primary : COLORS.gray[400]} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.modeBtn, viewMode === 'list' && styles.modeBtnOn]}
                        onPress={() => setViewMode('list')}
                    >
                        <Icon name="view-sequential" size={18} color={viewMode === 'list' ? COLORS.primary : COLORS.gray[400]} />
                    </TouchableOpacity>
                </View>
            </View>

            {showFilters && (
                <View style={styles.filtersPanel}>
                    <View style={styles.fSection}>
                        <Text style={styles.fSectionTitle}>CATÉGORIE</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.fChips}>
                            {['U13', 'U15', 'U17', 'Seniors'].map(g => (
                                <TouchableOpacity
                                    key={g}
                                    style={[styles.fChip, filterGroupe === g && styles.fChipOn]}
                                    onPress={() => setFilterGroupe(filterGroupe === g ? null : g)}
                                >
                                    <Text style={[styles.fChipTxt, filterGroupe === g && styles.fChipTxtOn]}>{g}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <View style={styles.fSection}>
                        <Text style={styles.fSectionTitle}>POSTE</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.fChips}>
                            {['Meneur', 'Arrière', 'Ailier', 'Ailier fort', 'Pivot'].map(p => (
                                <TouchableOpacity
                                    key={p}
                                    style={[styles.fChip, filterPoste === p && styles.fChipOn]}
                                    onPress={() => setFilterPoste(filterPoste === p ? null : p)}
                                >
                                    <Text style={[styles.fChipTxt, filterPoste === p && styles.fChipTxtOn]}>{p}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <View style={styles.fActions}>
                        <TouchableOpacity
                            style={styles.injuryToggle}
                            onPress={() => setFilterBlesse(!filterBlesse)}
                        >
                            <Icon
                                name={filterBlesse ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"}
                                size={18}
                                color={filterBlesse ? COLORS.error : COLORS.gray[300]}
                            />
                            <Text style={[styles.injuryLabel, filterBlesse && { color: COLORS.error }]}>Uniquement les blessés</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                setFilterGroupe(null);
                                setFilterPoste(null);
                                setFilterBlesse(false);
                            }}
                        >
                            <Text style={styles.resetBtnTxt}>Réinitialiser</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {loading ? (
                <View style={styles.centerBox}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredAthletes}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderAthleteItem}
                    contentContainerStyle={styles.listBody}
                    numColumns={viewMode === 'card' ? 2 : 1}
                    key={viewMode}
                    showsVerticalScrollIndicator={false}
                    onRefresh={fetchAthletes}
                    refreshing={loading}
                    ListEmptyComponent={
                        <View style={styles.emptyBox}>
                            <Icon name="account-search-outline" size={60} color={COLORS.gray[100]} />
                            <Text style={styles.emptyLabel}>Aucun athlète trouvé</Text>
                            <Text style={styles.emptySubLabel}>Essayez d'ajuster vos filtres ou effectuez une nouvelle recherche.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    header: {
        backgroundColor: COLORS.white,
        paddingHorizontal: SPACING.lg,
        paddingTop: Platform.OS === 'ios' ? 60 : 20,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        ...TYPOGRAPHY.h1,
        color: COLORS.gray[900],
    },
    addBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.sm,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.gray[50],
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: COLORS.gray[100],
        marginHorizontal: -SPACING.lg,
        paddingLeft: SPACING.lg,
        paddingRight: 8,
        height: 48,
        marginTop: 12,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchClear: {
        padding: 8,
    },
    searchInputField: {
        flex: 1,
        fontSize: 14,
        color: COLORS.gray[900],
        height: '100%',
    },
    tabsPanel: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
    },
    filterToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.gray[50],
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        gap: 8,
        position: 'relative',
    },
    filterToggleOn: {
        backgroundColor: COLORS.gray[900],
    },
    filterToggleLabel: {
        ...TYPOGRAPHY.label,
        color: COLORS.gray[600],
        fontSize: 13,
    },
    filterToggleLabelOn: {
        color: COLORS.white,
    },
    dot: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.primary,
    },
    viewModeSwitcher: {
        flexDirection: 'row',
        backgroundColor: COLORS.gray[50],
        borderRadius: 12,
        padding: 4,
    },
    modeBtn: {
        width: 36,
        height: 36,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modeBtnOn: {
        backgroundColor: COLORS.white,
        ...SHADOWS.xs,
    },
    filtersPanel: {
        backgroundColor: COLORS.white,
        padding: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[50],
        ...SHADOWS.sm,
    },
    fSection: {
        marginBottom: 16,
    },
    fSectionTitle: {
        ...TYPOGRAPHY.label,
        fontSize: 10,
        color: COLORS.gray[400],
        letterSpacing: 1,
        marginBottom: 10,
    },
    fChips: {
        gap: 8,
    },
    fChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: COLORS.gray[50],
    },
    fChipOn: {
        backgroundColor: COLORS.primary,
    },
    fChipTxt: {
        ...TYPOGRAPHY.label,
        fontSize: 12,
        color: COLORS.gray[600],
    },
    fChipTxtOn: {
        color: COLORS.white,
    },
    fActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    injuryToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    injuryLabel: {
        ...TYPOGRAPHY.bodySmall,
        color: COLORS.gray[500],
        fontWeight: '600',
    },
    resetBtnTxt: {
        ...TYPOGRAPHY.label,
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: '700',
    },
    listBody: {
        padding: SPACING.lg - 8,
        paddingBottom: 40,
    },
    gridCard: {
        flex: 1,
        margin: 8,
        backgroundColor: COLORS.white,
        ...SHADOWS.sm,
        borderWidth: 1,
        borderColor: COLORS.gray[50],
    },
    gridCardContent: {
        padding: 16,
        alignItems: 'center',
    },
    gridAvatarWrapper: {
        position: 'relative',
        marginBottom: 16,
    },
    gridAvatarImg: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: COLORS.gray[100],
    },
    gridAvatarPlaceholder: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: COLORS.gray[100],
        justifyContent: 'center',
        alignItems: 'center',
    },
    gridAvatarTxt: {
        ...TYPOGRAPHY.h3,
        color: COLORS.gray[400],
        fontSize: 22,
    },
    gridInjuryBadge: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 3,
        borderColor: COLORS.white,
        backgroundColor: COLORS.error,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gridNameText: {
        ...TYPOGRAPHY.h4,
        color: COLORS.gray[900],
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 6,
    },
    gridBadgeRow: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    gridBadge: {
        backgroundColor: COLORS.gray[50],
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    incompleteBadge: {
        backgroundColor: COLORS.warning + '12',
    },
    gridBadgeText: {
        ...TYPOGRAPHY.label,
        fontSize: 9,
        fontWeight: '800',
        color: COLORS.gray[500],
    },
    incompleteBadgeText: {
        color: COLORS.warning,
    },
    gridActionsRow: {
        flexDirection: 'row',
        gap: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: COLORS.gray[50],
        width: '100%',
        justifyContent: 'center',
    },
    gridActionBtn: {
        padding: 4,
    },
    listRow: {
        marginBottom: 12,
        marginHorizontal: 8,
        backgroundColor: COLORS.white,
        ...SHADOWS.xs,
    },
    listRowContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    listAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.gray[100],
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        position: 'relative',
    },
    avatarImg: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    avatarTxt: {
        ...TYPOGRAPHY.h4,
        color: COLORS.gray[400],
        fontSize: 16,
    },
    injuryDot: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: COLORS.error,
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    listInfo: {
        flex: 1,
    },
    listNameText: {
        ...TYPOGRAPHY.h4,
        color: COLORS.gray[900],
        fontSize: 15,
    },
    listSubText: {
        ...TYPOGRAPHY.bodySmall,
        color: COLORS.gray[400],
        fontSize: 12,
        marginTop: 2,
    },
    listAction: {
        padding: 8,
    },
    centerBox: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 300,
    },
    emptyBox: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 100,
        paddingHorizontal: 40,
    },
    emptyLabel: {
        ...TYPOGRAPHY.h3,
        color: COLORS.gray[900],
        marginTop: 24,
    },
    emptySubLabel: {
        ...TYPOGRAPHY.body,
        color: COLORS.gray[400],
        textAlign: 'center',
        marginTop: 10,
    }
});

export default AthleteListScreen;
