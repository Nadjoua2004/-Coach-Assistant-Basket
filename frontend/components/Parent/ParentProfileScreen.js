import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../Common/AuthProvider';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

const ParentProfileScreen = () => {
    const { user, logout } = useAuth();
    const [children, setChildren] = useState([
        { id: 1, name: 'Danyl Ouksel', team: 'U17', attendance: '92%' },
        { id: 2, name: 'Lina Ouksel', team: 'U15', attendance: '88%' } // Mock data for now
    ]);

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

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
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
                    <TouchableOpacity>
                        <Icon name="plus-circle" size={24} color="#f97316" />
                    </TouchableOpacity>
                </View>

                {children.map(child => (
                    <TouchableOpacity key={child.id} style={styles.childCard}>
                        <View style={styles.childAvatar}>
                            <Text style={styles.childInitials}>
                                {child.name.split(' ').map(n => n[0]).join('')}
                            </Text>
                        </View>
                        <View style={styles.childInfo}>
                            <Text style={styles.childName}>{child.name}</Text>
                            <Text style={styles.childTeam}>{child.team}</Text>
                        </View>
                        <View style={styles.childStats}>
                            <Text style={styles.statValue}>{child.attendance}</Text>
                            <Text style={styles.statLabel}>Présence</Text>
                        </View>
                        <Icon name="chevron-right" size={24} color="#94a3b8" />
                    </TouchableOpacity>
                ))}

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
});

export default ParentProfileScreen;
