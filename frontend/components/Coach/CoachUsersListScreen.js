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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AuthService from '../../services/authService';
import UserCreationModal from '../Admin/UserCreationModal';

const CoachUsersListScreen = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showUserModal, setShowUserModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await AuthService.getAllUsers();
            if (response.success) {
                // FILTER: Only keep 'joueur'
                const players = response.data.filter(u => u.role === 'joueur');
                setUsers(players);
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

    const filteredUsers = users.filter(user => {
        return user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Gestion Athlètes</Text>
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Icon name="magnify" size={20} color="#9ca3af" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Rechercher un joueur..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor="#9ca3af"
                    />
                </View>
            </View>

            {loading && !refreshing ? (
                <ActivityIndicator size="large" color="#f97316" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={filteredUsers}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.userCard}>
                            <View style={styles.roleIndicator} />
                            <View style={styles.userInfo}>
                                <Text style={styles.userName}>{item.name}</Text>
                                <Text style={styles.userEmail}>{item.email}</Text>
                                <View style={styles.roleBadge}>
                                    <Text style={styles.roleText}>Joueur</Text>
                                </View>
                            </View>
                            <Text style={styles.dateText}>
                                {new Date(item.created_at).toLocaleDateString()}
                            </Text>
                        </View>
                    )}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Icon name="account-off" size={48} color="#d1d5db" />
                            <Text style={styles.emptyText}>Aucun joueur trouvé</Text>
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
                lockedRole="joueur"
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
        backgroundColor: '#3b82f6',
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
        backgroundColor: '#eff6ff',
    },
    roleText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#3b82f6',
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
});

export default CoachUsersListScreen;
