import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useAuth } from '../Common/AuthProvider';
import CoachProfileModal from './CoachProfileModal';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../config/theme';
import Card from '../UI/Card';

const CoachProfileScreen = ({ onLogout }) => {
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
            onPress: () => setIsEditModalVisible(true),
            iconColor: COLORS.primary
        },
        {
            id: 'notifications',
            title: 'Notifications',
            icon: 'bell-outline',
            subtitle: 'Alertes et messages',
            onPress: () => Alert.alert('Info', 'Module notifications en cours...'),
            iconColor: COLORS.secondary
        },
        {
            id: 'settings',
            title: 'Paramètres',
            icon: 'cog-outline',
            subtitle: 'Préférences de l\'application',
            onPress: () => Alert.alert('Info', 'Module paramètres en cours...'),
            iconColor: COLORS.gray[500]
        },
        {
            id: 'logout',
            title: 'Déconnexion',
            icon: 'logout',
            subtitle: 'Quitter votre session',
            onPress: handleLogout,
            iconColor: COLORS.error,
            isDestructive: true
        }
    ];

    const getAvatarLetters = () => {
        if (!user?.name) return '??';
        return user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            {user?.photo_url ? (
                                <Image source={{ uri: user.photo_url }} style={styles.avatarImage} />
                            ) : (
                                <Text style={styles.avatarText}>{getAvatarLetters()}</Text>
                            )}
                        </View>
                        <TouchableOpacity style={styles.editAvatarBtn} activeOpacity={0.8}>
                            <Icon name="camera" size={16} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.userName}>{user?.name || 'Coach'}</Text>
                    <View style={styles.roleBadge}>
                        <Text style={styles.userRole}>
                            {user?.role === 'coach' ? 'Coach Filial' : 'Coach Adjoint'}
                        </Text>
                    </View>
                </View>

                {/* Menu Section */}
                <View style={styles.menuWrapper}>
                    <Text style={styles.sectionTitle}>Compte & Paramètres</Text>
                    <Card padding="none" style={styles.menuCard}>
                        {menuItems.map((item, index) => (
                            <TouchableOpacity
                                key={item.id}
                                style={[
                                    styles.menuItem,
                                    index === menuItems.length - 1 && styles.lastMenuItem
                                ]}
                                onPress={item.onPress}
                                activeOpacity={0.6}
                            >
                                <View style={[styles.menuIcon, { backgroundColor: item.iconColor + '10' }]}>
                                    <Icon name={item.icon} size={24} color={item.iconColor} />
                                </View>
                                <View style={styles.menuInfo}>
                                    <Text style={[
                                        styles.menuTitle,
                                        item.isDestructive && { color: COLORS.error }
                                    ]}>
                                        {item.title}
                                    </Text>
                                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                                </View>
                                <Icon name="chevron-right" size={20} color={COLORS.gray[300]} />
                            </TouchableOpacity>
                        ))}
                    </Card>
                </View>

                <View style={styles.appInfo}>
                    <Icon name="basketball" size={24} color={COLORS.gray[200]} />
                    <Text style={styles.versionText}>Coach Assistant Basket v1.0.0</Text>
                </View>
            </ScrollView>

            <CoachProfileModal
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
        backgroundColor: COLORS.gray[50],
    },
    content: {
        flex: 1,
    },
    profileHeader: {
        backgroundColor: COLORS.white,
        alignItems: 'center',
        paddingTop: 60,
        paddingBottom: 40,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        ...SHADOWS.md,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 20,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 40,
        backgroundColor: COLORS.gray[50],
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.gray[100],
        overflow: 'hidden',
        ...SHADOWS.sm,
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    avatarText: {
        ...TYPOGRAPHY.h1,
        fontSize: 44,
        color: COLORS.primary,
        fontWeight: '800',
    },
    editAvatarBtn: {
        position: 'absolute',
        bottom: -5,
        right: -5,
        width: 40,
        height: 40,
        borderRadius: 14,
        backgroundColor: COLORS.gray[900],
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: COLORS.white,
        ...SHADOWS.md,
    },
    userName: {
        ...TYPOGRAPHY.h2,
        fontSize: 24,
        color: COLORS.gray[900],
    },
    roleBadge: {
        backgroundColor: COLORS.primary + '10',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        marginTop: 10,
    },
    userRole: {
        ...TYPOGRAPHY.label,
        fontSize: 10,
        color: COLORS.primary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontWeight: '800',
    },
    menuWrapper: {
        padding: 24,
        paddingTop: 32,
    },
    sectionTitle: {
        ...TYPOGRAPHY.label,
        fontSize: 11,
        color: COLORS.gray[400],
        marginBottom: 16,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    menuCard: {
        overflow: 'hidden',
        borderRadius: 24,
        ...SHADOWS.sm,
        borderWidth: 1,
        borderColor: COLORS.gray[50],
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[50],
        backgroundColor: COLORS.white,
    },
    lastMenuItem: {
        borderBottomWidth: 0,
    },
    menuIcon: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    menuInfo: {
        flex: 1,
    },
    menuTitle: {
        ...TYPOGRAPHY.h4,
        fontSize: 16,
        color: COLORS.gray[900],
    },
    menuSubtitle: {
        ...TYPOGRAPHY.bodySmall,
        fontSize: 12,
        color: COLORS.gray[400],
        marginTop: 2,
    },
    appInfo: {
        alignItems: 'center',
        paddingVertical: 48,
        opacity: 0.6
    },
    versionText: {
        ...TYPOGRAPHY.bodySmall,
        fontSize: 11,
        fontWeight: '700',
        color: COLORS.gray[300],
        marginTop: 10
    }
});

export default CoachProfileScreen;
