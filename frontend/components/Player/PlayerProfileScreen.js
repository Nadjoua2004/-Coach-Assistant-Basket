import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    Alert,
    ScrollView,
    TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../Common/AuthProvider';
import AthleteService from '../../services/athleteService';
import PlayerProfileModal from './PlayerProfileModal';
import PlayerMedicalModal from './PlayerMedicalModal';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const PlayerProfileScreen = () => {
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [athlete, setAthlete] = useState(null);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showMedicalModal, setShowMedicalModal] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await AthleteService.getMyProfile();
            if (response.success) {
                setAthlete(response.data);
            }
        } catch (error) {
            console.error('Fetch profile error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = () => {
        fetchProfile();
        setShowProfileModal(false);
    };

    const handleMedicalUpdate = () => {
        fetchProfile();
        setShowMedicalModal(false);
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#f97316" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header with user name */}
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        <Icon name="account" size={40} color="#f97316" />
                    </View>
                    <Text style={styles.userName}>{user?.name}</Text>
                    <Text style={styles.userRole}>Joueur</Text>
                </View>

                {/* Mon Profil Section */}
                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => setShowProfileModal(true)}
                >
                    <View style={styles.menuIcon}>
                        <Icon name="account-edit" size={24} color="#f97316" />
                    </View>
                    <View style={styles.menuContent}>
                        <Text style={styles.menuTitle}>Mon Profil</Text>
                        <Text style={styles.menuSubtitle}>
                            {athlete ? 'Informations personnelles et sportives' : 'Complétez votre profil'}
                        </Text>
                    </View>
                    <Icon name="chevron-right" size={24} color="#94a3b8" />
                </TouchableOpacity>

                {/* Fiche Médicale Section */}
                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => setShowMedicalModal(true)}
                >
                    <View style={styles.menuIcon}>
                        <Icon name="medical-bag" size={24} color="#10b981" />
                    </View>
                    <View style={styles.menuContent}>
                        <Text style={styles.menuTitle}>Fiche Médicale</Text>
                        <Text style={styles.menuSubtitle}>Allergies, certificat médical</Text>
                    </View>
                    <Icon name="chevron-right" size={24} color="#94a3b8" />
                </TouchableOpacity>

                {/* Notifications */}
                <TouchableOpacity style={styles.menuItem}>
                    <View style={styles.menuIcon}>
                        <Icon name="bell-outline" size={24} color="#6366f1" />
                    </View>
                    <View style={styles.menuContent}>
                        <Text style={styles.menuTitle}>Notifications</Text>
                        <Text style={styles.menuSubtitle}>Gérer vos préférences</Text>
                    </View>
                    <Icon name="chevron-right" size={24} color="#94a3b8" />
                </TouchableOpacity>

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
                    onPress={logout}
                >
                    <View style={[styles.menuIcon, styles.logoutIcon]}>
                        <Icon name="logout" size={24} color="#ef4444" />
                    </View>
                    <View style={styles.menuContent}>
                        <Text style={[styles.menuTitle, styles.logoutText]}>Déconnexion</Text>
                    </View>
                </TouchableOpacity>
            </ScrollView>

            {/* Profile Modal */}
            <PlayerProfileModal
                visible={showProfileModal}
                onClose={() => setShowProfileModal(false)}
                onSuccess={handleProfileUpdate}
                athlete={athlete}
            />

            {/* Medical Modal */}
            <PlayerMedicalModal
                visible={showMedicalModal}
                onClose={() => setShowMedicalModal(false)}
                onSuccess={handleMedicalUpdate}
                athleteId={athlete?.id}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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

export default PlayerProfileScreen;
