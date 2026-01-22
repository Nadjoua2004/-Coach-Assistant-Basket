import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useAuth } from '../Common/AuthProvider';
import AdminProfileModal from './AdminProfileModal';

const AdminProfileScreen = ({ onLogout }) => {
    const { user, updateUser } = useAuth();
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);

    const handleLogout = () => {
        Alert.alert(
            "Déconnexion",
            "Êtes-vous sûr de vouloir vous déconnecter ?",
            [
                { text: "Annuler", style: "cancel" },
                { text: "Déconnecter", onPress: onLogout, style: "destructive" }
            ]
        );
    };

    const menuItems = [
        {
            id: 'profile',
            title: 'Mon Profil',
            icon: 'account-outline',
            subtitle: 'Gérer vos informations personnelles',
            onPress: () => setIsEditModalVisible(true)
        },
        {
            id: 'notifications',
            title: 'Notifications',
            icon: 'bell-outline',
            subtitle: 'Alertes et messages',
            onPress: () => Alert.alert('Info', 'Module notifications en cours...')
        },
        {
            id: 'settings',
            title: 'Paramètres',
            icon: 'cog-outline',
            subtitle: 'Préférences de l\'application',
            onPress: () => Alert.alert('Info', 'Module paramètres en cours...')
        },
        {
            id: 'logout',
            title: 'Déconnexion',
            icon: 'logout',
            subtitle: 'Quitter votre session',
            onPress: handleLogout,
            color: '#ef4444'
        }
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                            </Text>
                        </View>
                        <TouchableOpacity style={styles.editAvatarBtn}>
                            <Icon name="camera" size={16} color="white" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.userName}>{user?.name}</Text>
                    <Text style={styles.userRole}>Administrateur</Text>
                </View>

                {/* Menu */}
                <View style={styles.menuContainer}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[
                                styles.menuItem,
                                index === menuItems.length - 1 && styles.lastMenuItem
                            ]}
                            onPress={item.onPress}
                        >
                            <View style={[styles.menuIcon, { backgroundColor: item.color ? `${item.color}15` : '#f1f5f9' }]}>
                                <Icon name={item.icon} size={24} color={item.color || '#64748b'} />
                            </View>
                            <View style={styles.menuInfo}>
                                <Text style={[styles.menuTitle, item.color && { color: item.color }]}>{item.title}</Text>
                                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                            </View>
                            <Icon name="chevron-right" size={20} color="#cbd5e1" />
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.appInfo}>
                    <Text style={styles.versionText}>Coach Assistant Basket v1.0.0</Text>
                </View>
            </ScrollView>

            <AdminProfileModal
                visible={isEditModalVisible}
                onClose={() => setIsEditModalVisible(false)}
                onUpdate={updateUser}
                user={user}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    content: {
        flex: 1,
    },
    profileHeader: {
        backgroundColor: 'white',
        alignItems: 'center',
        paddingVertical: 40,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#f97316',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#fff7ed',
    },
    avatarText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: 'white',
    },
    editAvatarBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#1e293b',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    userRole: {
        fontSize: 14,
        color: '#f97316',
        fontWeight: 'bold',
        marginTop: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    menuContainer: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    lastMenuItem: {
        borderBottomWidth: 0,
    },
    menuIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    menuInfo: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#334155',
    },
    menuSubtitle: {
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 2,
    },
    appInfo: {
        alignItems: 'center',
        paddingBottom: 40,
    },
    versionText: {
        fontSize: 12,
        color: '#cbd5e1',
    }
});

export default AdminProfileScreen;
