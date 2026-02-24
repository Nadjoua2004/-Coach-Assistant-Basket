import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    TextInput,
    Alert
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import AthleteService from '../../services/athleteService';

const ManageKidsModal = ({ visible, onClose, parent }) => {
    const [loading, setLoading] = useState(false);
    const [linkedKids, setLinkedKids] = useState([]);
    const [allAthletes, setAllAthletes] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [mode, setMode] = useState('linked'); // 'linked' or 'search'

    useEffect(() => {
        if (visible && parent) {
            fetchData();
        }
    }, [visible, parent]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch kids linked to this parent
            const linkedResponse = await AthleteService.getAllAthletes({ parent_id: parent.id });
            if (linkedResponse.success) {
                setLinkedKids(linkedResponse.data);
            }

            // Fetch all athletes (for search/link)
            const allResponse = await AthleteService.getAllAthletes();
            if (allResponse.success) {
                setAllAthletes(allResponse.data);
            }
        } catch (error) {
            console.error('Error fetching kids data:', error);
            Alert.alert('Erreur', 'Impossible de charger les données');
        } finally {
            setLoading(false);
        }
    };

    const handleLink = async (athlete) => {
        try {
            setLoading(true);
            const response = await AthleteService.linkParent(athlete.id, parent.id);
            if (response.success) {
                Alert.alert('Succès', `${athlete.prenom} ${athlete.nom} a été lié à ${parent.name}`);
                fetchData();
            }
        } catch (error) {
            console.error('Error linking kid:', error);
            Alert.alert('Erreur', 'Impossible de lier l\'enfant');
        } finally {
            setLoading(false);
        }
    };

    const handleUnlink = async (athlete) => {
        Alert.alert(
            'Délier',
            `Souhaitez-vous délier ${athlete.prenom} ${athlete.nom} de ${parent.name} ?`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Délier',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            // Set parent_id to null
                            const response = await AthleteService.linkParent(athlete.id, null);
                            if (response.success) {
                                fetchData();
                            }
                        } catch (error) {
                            console.error('Error unlinking kid:', error);
                            Alert.alert('Erreur', 'Impossible de délier l\'enfant');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const filteredSearchItems = allAthletes.filter(item => {
        const nameMatches = `${item.prenom} ${item.nom}`.toLowerCase().includes(searchQuery.toLowerCase());
        const alreadyLinked = linkedKids.some(k => k.id === item.id);
        return nameMatches && !alreadyLinked;
    });

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.headerTitle}>Gérer les enfants</Text>
                            <Text style={styles.headerSubtitle}>Parent: {parent?.name}</Text>
                        </View>
                        <TouchableOpacity onPress={onClose}>
                            <Icon name="close" size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.tabs}>
                        <TouchableOpacity
                            style={[styles.tab, mode === 'linked' && styles.activeTab]}
                            onPress={() => setMode('linked')}
                        >
                            <Text style={[styles.tabText, mode === 'linked' && styles.activeTabText]}>
                                Liés ({linkedKids.length})
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, mode === 'search' && styles.activeTab]}
                            onPress={() => setMode('search')}
                        >
                            <Text style={[styles.tabText, mode === 'search' && styles.activeTabText]}>
                                Ajouter
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {mode === 'search' && (
                        <View style={styles.searchBar}>
                            <Icon name="magnify" size={20} color="#94a3b8" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Rechercher un athlète..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>
                    )}

                    {loading ? (
                        <View style={styles.centerContent}>
                            <ActivityIndicator size="large" color="#f97316" />
                        </View>
                    ) : (
                        <FlatList
                            data={mode === 'linked' ? linkedKids : filteredSearchItems}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <View style={styles.athleteItem}>
                                    <View style={styles.avatar}>
                                        <Text style={styles.avatarText}>
                                            {item.prenom[0]}{item.nom[0]}
                                        </Text>
                                    </View>
                                    <View style={styles.athleteInfo}>
                                        <Text style={styles.athleteName}>{item.prenom} {item.nom}</Text>
                                        <Text style={styles.athleteDetails}>{item.groupe} • {item.poste ? `Poste ${item.poste}` : 'Poste non défini'}</Text>
                                    </View>
                                    {mode === 'linked' ? (
                                        <TouchableOpacity
                                            style={styles.actionButton}
                                            onPress={() => handleUnlink(item)}
                                        >
                                            <Icon name="link-off" size={20} color="#ef4444" />
                                        </TouchableOpacity>
                                    ) : (
                                        <TouchableOpacity
                                            style={styles.actionButton}
                                            onPress={() => handleLink(item)}
                                        >
                                            <Icon name="link-plus" size={20} color="#10b981" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}
                            ListEmptyComponent={
                                <View style={styles.emptyContainer}>
                                    <Icon name={mode === 'linked' ? 'account-search-outline' : 'magnify'} size={48} color="#cbd5e1" />
                                    <Text style={styles.emptyText}>
                                        {mode === 'linked' ? 'Aucun enfant lié' : 'Aucun athlète disponible'}
                                    </Text>
                                </View>
                            }
                            contentContainerStyle={styles.listContent}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#f8fafc',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '80%',
        paddingTop: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#64748b',
    },
    tabs: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        marginBottom: 16,
        gap: 12,
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#e2e8f0',
    },
    activeTab: {
        backgroundColor: '#f97316',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    activeTabText: {
        color: 'white',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        marginHorizontal: 24,
        height: 44,
        backgroundColor: 'white',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginBottom: 16,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
    },
    listContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    athleteItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 12,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#64748b',
    },
    athleteInfo: {
        flex: 1,
    },
    athleteName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
    },
    athleteDetails: {
        fontSize: 12,
        color: '#94a3b8',
    },
    actionButton: {
        padding: 8,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    emptyText: {
        marginTop: 12,
        fontSize: 16,
        color: '#94a3b8',
    }
});

export default ManageKidsModal;
