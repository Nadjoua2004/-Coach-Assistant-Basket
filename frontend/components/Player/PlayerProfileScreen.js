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
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import AttendanceService from '../../services/attendanceService';
import PlanningService from '../../services/planningService';

const PlayerProfileScreen = () => {
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [athlete, setAthlete] = useState(null);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showMedicalModal, setShowMedicalModal] = useState(false);
    const [displayName, setDisplayName] = useState(user?.name || '');
    const [attendanceStats, setAttendanceStats] = useState(null);
    const [upcomingSessions, setUpcomingSessions] = useState([]);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await AthleteService.getMyProfile();
            if (response.success && response.data) {
                const athleteData = response.data;
                setAthlete(athleteData);
                if (athleteData.prenom && athleteData.nom) {
                    setDisplayName(`${athleteData.prenom} ${athleteData.nom}`);
                }

                // Fetch stats and sessions
                const [statsRes, planningRes] = await Promise.all([
                    AttendanceService.getStats({ athlete_id: athleteData.id }),
                    PlanningService.getAllPlanning({ start_date: new Date().toISOString().split('T')[0] })
                ]);

                if (statsRes.success) setAttendanceStats(statsRes.data);
                if (planningRes.success) {
                    // Filter sessions where athlete is assigned
                    const mySessions = (planningRes.data || []).filter(s =>
                        (s.athletes_assignes || []).includes(athleteData.id)
                    );
                    setUpcomingSessions(mySessions);
                }
            }
        } catch (error) {
            console.error('Fetch profile error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = () => {
        fetchProfile(); // Refresh profile data and name
        setShowProfileModal(false);
    };

    const handleMedicalUpdate = () => {
        fetchProfile();
        setShowMedicalModal(false);
    };

    const handleLogout = () => {
        Alert.alert(
            'Déconnexion',
            'Êtes-vous sûr de vouloir vous déconnecter ?',
            [
                {
                    text: 'Annuler',
                    style: 'cancel'
                },
                {
                    text: 'Déconnexion',
                    style: 'destructive',
                    onPress: logout
                }
            ]
        );
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
                    <Text style={styles.userName}>{displayName}</Text>
                    <Text style={styles.userRole}>Joueur • {athlete?.groupe || 'U17'}</Text>
                </View>

                {/* Stats Section */}
                {attendanceStats && (
                    <View style={styles.statsContainer}>
                        <View style={styles.statBox}>
                            <Text style={styles.statValue}>{attendanceStats.attendanceRate}%</Text>
                            <Text style={styles.statLabel}>Présence</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statBox}>
                            <Text style={styles.statValue}>{attendanceStats.present}</Text>
                            <Text style={styles.statLabel}>Séances</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statBox}>
                            <Text style={styles.statValue}>{attendanceStats.absent}</Text>
                            <Text style={styles.statLabel}>Absences</Text>
                        </View>
                    </View>
                )}

                {/* Upcoming Sessions */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Mes prochaines séances</Text>
                </View>
                {upcomingSessions.length > 0 ? (
                    upcomingSessions.map(session => (
                        <View key={session.id} style={styles.sessionItem}>
                            <View style={styles.sessionDate}>
                                <Text style={styles.sessionDay}>{new Date(session.date).getDate()}</Text>
                                <Text style={styles.sessionMonth}>
                                    {new Date(session.date).toLocaleDateString('fr-FR', { month: 'short' })}
                                </Text>
                            </View>
                            <View style={styles.sessionInfo}>
                                <Text style={styles.sessionTheme}>{session.theme}</Text>
                                <Text style={styles.sessionMeta}>{session.heure} • {session.lieu}</Text>
                            </View>
                        </View>
                    ))
                ) : (
                    <View style={styles.emptySessions}>
                        <Text style={styles.emptyText}>Aucune séance prévue</Text>
                    </View>
                )}

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Options</Text>
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
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        marginBottom: 24,
        alignItems: 'center',
        justifyContent: 'space-around',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    statBox: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    statLabel: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: '#f1f5f9',
    },
    sectionHeader: {
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#475569',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    sessionItem: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        alignItems: 'center',
    },
    sessionDate: {
        width: 50,
        alignItems: 'center',
        borderRightWidth: 1,
        borderRightColor: '#f1f5f9',
        marginRight: 16,
        paddingRight: 12,
    },
    sessionDay: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#f97316',
    },
    sessionMonth: {
        fontSize: 12,
        color: '#94a3b8',
        textTransform: 'uppercase',
    },
    sessionInfo: {
        flex: 1,
    },
    sessionTheme: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
    },
    sessionMeta: {
        fontSize: 13,
        color: '#64748b',
        marginTop: 2,
    },
    emptySessions: {
        padding: 20,
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        borderRadius: 16,
        marginBottom: 20,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#cbd5e1',
    },
    emptyText: {
        color: '#94a3b8',
        fontSize: 14,
    },
});

export default PlayerProfileScreen;
