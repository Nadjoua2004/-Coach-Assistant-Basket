import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../Common/AuthProvider';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import AthleteService from '../../services/athleteService';
import AddChildModal from './AddChildModal';

const ParentProfileScreen = ({ onSelectChild }) => {
    const { user, logout } = useAuth();
    const [children, setChildren] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        fetchChildren();
    }, []);

    const fetchChildren = async () => {
        try {
            setLoading(true);
            const response = await AthleteService.getAllAthletes();
            if (response.success) {
                setChildren(response.data);
            }
        } catch (error) {
            console.error('Error fetching children:', error);
            // Alert.alert('Erreur', 'Impossible de charger vos enfants');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchChildren();
    };

    const handleLogout = () => {
        Alert.alert(
            'Déconnexion',
            'Êtes-vous sûr de vouloir vous déconnecter ?',
            [
                { text: 'Annuler', style: 'cancel' },
                { text: 'Déconnexion', style: 'destructive', onPress: logout }
            ]
        );
    };

    const handleAddChild = (newChild) => {
        setChildren(prev => [...prev, newChild]);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#f97316']} />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        <Icon name="account-child" size={40} color="#f97316" />
                    </View>
                    <Text style={styles.userName}>Bienvenue parent</Text>
                    <Text style={styles.userRole}>{user?.name}</Text>
                </View>

                {/* Children Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Vos Enfants</Text>
                    <TouchableOpacity onPress={() => setShowAddModal(true)}>
                        <Icon name="plus-circle" size={28} color="#f97316" />
                    </TouchableOpacity>
                </View>

                {loading && !refreshing ? (
                    <ActivityIndicator size="large" color="#f97316" style={{ marginVertical: 20 }} />
                ) : children.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Icon name="account-group-outline" size={48} color="#cbd5e1" />
                        <Text style={styles.emptyText}>Aucun enfant ajouté</Text>
                        <TouchableOpacity
                            style={styles.addButtonSmall}
                            onPress={() => setShowAddModal(true)}
                        >
                            <Text style={styles.addButtonSmallText}>Ajouter mon premier enfant</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    children.map(child => (
                        <TouchableOpacity
                            key={child.id}
                            style={styles.childCard}
                            onPress={() => onSelectChild(child)}
                        >
                            <View style={styles.childAvatar}>
                                <Text style={styles.childInitials}>
                                    {child.prenom[0]}{child.nom[0]}
                                </Text>
                            </View>
                            <View style={styles.childInfo}>
                                <Text style={styles.childName}>{child.prenom} {child.nom}</Text>
                                <Text style={styles.childTeam}>{child.groupe}</Text>
                            </View>
                            <View style={styles.childStats}>
                                <Text style={styles.statValue}>{child.attendance || '0%'}</Text>
                                <Text style={styles.statLabel}>Présence</Text>
                            </View>
                            <Icon name="chevron-right" size={24} color="#94a3b8" />
                        </TouchableOpacity>
                    ))
                )}

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Options</Text>
                </View>

                {/* Settings */}
                <TouchableOpacity style={styles.menuItem}>
                    <View style={styles.menuIcon}>
                        <Icon name="cog-outline" size={24} color="#64748b" />
                    </View>
                    <View style={styles.menuContent}>
                        <Text style={styles.menuTitle}>Paramètres</Text>
                        <Text style={styles.menuSubtitle}>Configuration de l'application</Text>
                    </View>
                    <Icon name="chevron-right" size={24} color="#94a3b8" />
                </TouchableOpacity>

                {/* Logout */}
                <TouchableOpacity
                    style={[styles.menuItem, styles.logoutItem]}
                    onPress={handleLogout}
                >
                    <View style={[styles.menuIcon, styles.logoutIcon]}>
                        <Icon name="logout" size={24} color="#ef4444" />
                    </View>
                    <View style={styles.menuContent}>
                        <Text style={[styles.menuTitle, styles.logoutText]}>Déconnexion</Text>
                    </View>
                </TouchableOpacity>
            </ScrollView>

            <AddChildModal
                visible={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSave={handleAddChild}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    header: {
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#fff7ed',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    userRole: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 4,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingHorizontal: 4,
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#475569',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    childCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    childAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#e0f2fe',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    childInitials: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0284c7',
    },
    childInfo: {
        flex: 1,
    },
    childName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
    },
    childTeam: {
        fontSize: 13,
        color: '#64748b',
    },
    childStats: {
        alignItems: 'flex-end',
        marginRight: 12,
    },
    statValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    statLabel: {
        fontSize: 11,
        color: '#64748b',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    menuIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    menuContent: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 2,
    },
    menuSubtitle: {
        fontSize: 13,
        color: '#64748b',
    },
    logoutItem: {
        marginTop: 20,
        borderColor: '#fee2e2',
        borderWidth: 1,
    },
    logoutIcon: {
        backgroundColor: '#fef2f2',
    },
    logoutText: {
        color: '#ef4444',
    },
    emptyState: {
        alignItems: 'center',
        padding: 40,
        backgroundColor: 'white',
        borderRadius: 20,
        marginVertical: 10,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#cbd5e1',
    },
    emptyText: {
        marginTop: 12,
        fontSize: 16,
        color: '#64748b',
        fontWeight: '500',
    },
    addButtonSmall: {
        marginTop: 20,
        backgroundColor: '#f97316',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 12,
    },
    addButtonSmallText: {
        color: 'white',
        fontWeight: '600',
    },
});

export default ParentProfileScreen;
