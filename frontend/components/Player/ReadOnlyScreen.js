import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../Common/AuthProvider';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AthleteService from '../../services/athleteService';
import PlayerProfileModal from './PlayerProfileModal';
import PlanningService from '../../services/planningService';
import AttendanceService from '../../services/attendanceService';

const ReadOnlyScreen = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasProfile, setHasProfile] = useState(true); // Assume true initially to avoid flicker
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // 1. Check for Athlete Profile
      try {
        const profileRes = await AthleteService.getMyProfile();
        // If we get a profile, hasProfile = true. If data is null, false.
        setHasProfile(!!(profileRes.success && profileRes.data));
      } catch (e) {
        console.log('Profile check failed (likely no profile yet)', e);
        setHasProfile(false);
      }

      // 2. Fetch Planning
      const planningRes = await PlanningService.getAllPlanning({
        start_date: new Date().toISOString().split('T')[0]
      });

      if (planningRes.success) {
        setEvents(planningRes.data);
      }

      // 3. Fetch Stats
      const statsRes = await AttendanceService.getStats();
      if (statsRes.success) {
        setStats(statsRes.data);
      }
    } catch (error) {
      console.error('Error fetching player data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.title}>
          Bonjour {user?.name?.split(' ')[0]}
        </Text>
        <Text style={styles.subtitle}>Votre planning et vos statistiques</Text>

        {!hasProfile && (
          <TouchableOpacity
            style={styles.profileAlert}
            onPress={() => setShowProfileModal(true)}
          >
            <View style={styles.alertIcon}>
              <Icon name="account-alert" size={32} color="white" />
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>Profil Incomplet</Text>
              <Text style={styles.alertText}>
                Complétez votre profil athlète pour permettre au coach de suivre vos performances.
              </Text>
            </View>
            <Icon name="chevron-right" size={24} color="white" />
          </TouchableOpacity>
        )}

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Prochains événements</Text>
          {events.length > 0 ? (
            events.map((event) => (
              <View key={event.id} style={styles.eventCard}>
                <View style={styles.eventHeader}>
                  <View style={[styles.eventIcon, { backgroundColor: event.type === 'Match' ? '#fee2e2' : '#dbeafe' }]}>
                    <Icon
                      name={event.type === 'Match' ? 'trophy' : 'basketball'}
                      size={24}
                      color={event.type === 'Match' ? '#ef4444' : '#3b82f6'}
                    />
                  </View>
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventDate}>{new Date(event.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
                  </View>
                </View>
                <Text style={styles.eventDetails}>{event.heure} • {event.lieu || 'Salle Principale'}</Text>
                <Text style={styles.eventGroup}>Groupe: {event.groupe}</Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>Aucun événement à venir</Text>
            </View>
          )}

          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Mes statistiques (Global)</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats?.attendanceRate || 0}%</Text>
                <Text style={styles.statLabel}>Assiduité Équipe</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats?.total || 0}</Text>
                <Text style={styles.statLabel}>Total Séances</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <PlayerProfileModal
        visible={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSuccess={fetchData}
        userEmail={user?.email}
        userName={user?.name}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  // ... existing styles ...
  profileAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f97316',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  alertIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  alertText: {
    fontSize: 12,
    color: 'white',
    opacity: 0.9,
    lineHeight: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  content: {
    gap: 16,
  },
  eventCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 8,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  eventDate: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  eventDetails: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  eventGroup: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  emptyCard: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  emptyText: {
    color: '#94a3b8',
  },
  statsCard: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    marginTop: 16,
    marginBottom: 40,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f97316',
  },
  statLabel: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
  },
});

export default ReadOnlyScreen;