import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    Alert,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import AuthService from '../../services/authService';
import UserCreationModal from '../Admin/UserCreationModal';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../config/theme';
import Card from '../UI/Card';
import Input from '../UI/Input';

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
                const players = response.data.filter(u => u.role === 'joueur');
                setUsers(players);
            } else {
                Alert.alert('Erreur', response.message || 'Impossible de charger les joueurs');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            Alert.alert('Erreur', 'Impossible de charger les joueurs');
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

            <View style={styles.searchSection}>
                <Input
                    placeholder="Rechercher un joueur..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    icon="magnify"
                    containerStyle={styles.searchBar}
                />
            </View>

            {loading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredUsers}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <Card style={styles.userCard} padding="none">
                            <View style={styles.cardAccent} />
                            <View style={styles.cardContent}>
                                <View style={styles.userInfo}>
                                    <Text style={styles.userName}>{item.name}</Text>
                                    <Text style={styles.userEmail}>{item.email}</Text>
                                    <View style={styles.roleBadge}>
                                        <Text style={styles.roleText}>Joueur</Text>
                                    </View>
                                </View>
                                <View style={styles.metaInfo}>
                                    <Text style={styles.dateText}>
                                        Inscrit le {new Date(item.created_at).toLocaleDateString('fr-FR')}
                                    </Text>
                                </View>
                            </View>
                        </Card>
                    )}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Icon name="account-off-outline" size={64} color={COLORS.gray[200]} />
                            <Text style={styles.emptyText}>Aucun joueur trouvé</Text>
                            <Text style={styles.emptySubText}>La liste est vide ou aucun résultat ne correspond à votre recherche.</Text>
                        </View>
                    }
                />
            )}

            <TouchableOpacity
                style={styles.fab}
                onPress={() => setShowUserModal(true)}
                activeOpacity={0.8}
            >
                <Icon name="plus" size={30} color="white" />
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
        backgroundColor: COLORS.gray[50],
    },
    header: {
        paddingHorizontal: SPACING.lg,
        paddingTop: Platform.OS === 'ios' ? 60 : 30,
        paddingBottom: 20,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[100],
        ...SHADOWS.sm,
    },
    headerTitle: {
        ...TYPOGRAPHY.h2,
        fontSize: 24,
        color: COLORS.gray[900],
    },
    searchSection: {
        padding: 16,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[100],
    },
    searchBar: {
        marginBottom: 0,
        backgroundColor: COLORS.gray[50],
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.gray[100],
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    listContent: {
        padding: 16,
        paddingBottom: 120,
        gap: 12,
    },
    userCard: {
        marginBottom: 0,
        flexDirection: 'row',
        overflow: 'hidden',
        borderRadius: 20,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.gray[50],
        ...SHADOWS.sm,
    },
    cardAccent: {
        width: 6,
        backgroundColor: COLORS.primary,
    },
    cardContent: {
        flex: 1,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        ...TYPOGRAPHY.h4,
        fontSize: 16,
        color: COLORS.gray[900],
        marginBottom: 4,
    },
    userEmail: {
        ...TYPOGRAPHY.bodySmall,
        fontSize: 13,
        color: COLORS.gray[400],
        marginBottom: 10,
    },
    roleBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        backgroundColor: COLORS.primary + '10',
    },
    roleText: {
        ...TYPOGRAPHY.label,
        fontSize: 10,
        color: COLORS.primary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    metaInfo: {
        alignItems: 'flex-end',
    },
    dateText: {
        ...TYPOGRAPHY.bodySmall,
        fontSize: 10,
        fontWeight: '600',
        color: COLORS.gray[300],
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
    },
    emptyText: {
        ...TYPOGRAPHY.h3,
        color: COLORS.gray[900],
        marginTop: 24,
    },
    emptySubText: {
        ...TYPOGRAPHY.bodySmall,
        color: COLORS.gray[400],
        textAlign: 'center',
        marginTop: 8,
        paddingHorizontal: 50,
        lineHeight: 20,
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

export default CoachUsersListScreen;
