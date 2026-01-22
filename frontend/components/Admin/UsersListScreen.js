import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    TextInput,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import AuthService from '../../services/authService';
import UserCreationModal from './UserCreationModal';

const UsersListScreen = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showUserModal, setShowUserModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await AuthService.getAllUsers();
            if (response.success) {
                setUsers(response.data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchUsers();
    };

    const handleDeleteUser = (user) => {
        Alert.alert(
            'Confirmation',
            `Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.name} ?`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        const result = await AuthService.deleteUser(user.id);
                        if (result.success) {
                            fetchUsers();
                        } else {
                            Alert.alert('Erreur', result.message);
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return '#ef4444';
            case 'coach': return '#f97316';
            case 'adjoint': return '#eab308';
            case 'joueur': return '#3b82f6';
            case 'parent': return '#10b981';
            default: return '#6b7280';
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = filterRole ? user.role === filterRole : true;
        return matchesSearch && matchesRole;
    });

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Gestion Utilisateurs</Text>
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Icon name="magnify" size={20} color="#9ca3af" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Rechercher un utilisateur..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor="#9ca3af"
                    />
                </View>
            </View>

            <View style={styles.filtersContainer}>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={[null, 'admin', 'coach', 'adjoint', 'joueur', 'parent']}
                    keyExtractor={(item) => item || 'all'}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.filterChip,
                                filterRole === item && styles.filterChipActive
                            ]}
                            onPress={() => setFilterRole(item)}
                        >
                            <Text style={[
                                styles.filterText,
                                filterRole === item && styles.filterTextActive
                            ]}>
                                {item ? item.charAt(0).toUpperCase() + item.slice(1) : 'Tous'}
                            </Text>
                        </TouchableOpacity>
                    )}
                    contentContainerStyle={{ paddingHorizontal: 16 }}
                />
            </View>

            {loading && !refreshing ? (
                <ActivityIndicator size="large" color="#f97316" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={filteredUsers}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.userCard}>
                            <View style={[styles.roleIndicator, { backgroundColor: getRoleColor(item.role) }]} />
                            <View style={styles.userInfo}>
                                <Text style={styles.userName}>{item.name}</Text>
                                <Text style={styles.userEmail}>{item.email}</Text>
                                <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) + '20' }]}>
                                    <Text style={[styles.roleText, { color: getRoleColor(item.role) }]}>
                                        {item.role.charAt(0).toUpperCase() + item.role.slice(1)}
                                    </Text>
                                </View>
                            </View>
                            <Text style={styles.dateText}>
                                {new Date(item.created_at).toLocaleDateString()}
                            </Text>

                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={() => handleDeleteUser(item)}
                            >
                                <Icon name="trash-can-outline" size={24} color="#ef4444" />
                            </TouchableOpacity>
                        </View>
                    )}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Icon name="account-off" size={48} color="#d1d5db" />
                            <Text style={styles.emptyText}>Aucun utilisateur trouvé</Text>
                        </View>
                    }
                />
            )}

            <TouchableOpacity
                style={styles.fab}
                onPress={() => setShowUserModal(true)}
            >
                <Icon name="plus" size={32} color="white" />
            </TouchableOpacity>

            <UserCreationModal
                visible={showUserModal}
                onClose={() => setShowUserModal(false)}
                onSuccess={fetchUsers}
            />
        </SafeAreaView>
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
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#f97316',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#f97316',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
        zIndex: 100,
    },
    searchContainer: {
        padding: 16,
        backgroundColor: 'white',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#1e293b',
    },
    filtersContainer: {
        backgroundColor: 'white',
        paddingBottom: 16,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    filterChipActive: {
        backgroundColor: '#f97316',
        borderColor: '#f97316',
    },
    filterText: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
    },
    filterTextActive: {
        color: 'white',
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
        overflow: 'hidden',
    },
    roleIndicator: {
        width: 4,
        height: 40,
        borderRadius: 2,
        marginRight: 16,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 8,
    },
    roleBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    roleText: {
        fontSize: 12,
        fontWeight: '600',
    },
    dateText: {
        fontSize: 12,
        color: '#94a3b8',
        marginLeft: 8,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: '#94a3b8',
    },
    deleteButton: {
        padding: 8,
        marginLeft: 'auto',
    },
});

export default UsersListScreen;
