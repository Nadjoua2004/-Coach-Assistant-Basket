import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../Common/AuthProvider';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DashboardService from '../../services/dashboardService';
import PlanningService from '../../services/planningService';

const CoachHomeScreen = ({ onCreateSession, onNavigate }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsResult, planningResult] = await Promise.allSettled([
        DashboardService.getStats(),
        PlanningService.getAllPlanning({
          start_date: new Date().toISOString().split('T')[0]
        })
      ]);

      if (statsResult.status === 'fulfilled' && statsResult.value.success) {
        setStats(statsResult.value.data);
      } else {
        console.warn('Stats fetch failed or returned error');
      }

      if (planningResult.status === 'fulfilled' && planningResult.value.success) {
        setUpcomingSessions(planningResult.value.data.slice(0, 5));
      } else {
        console.warn('Planning fetch failed or returned error');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleMenuPress = (item) => {
    if (item.id === 1 && onNavigate) {
      onNavigate('exercises');
    } else if (item.id === 2 && onNavigate) {
      // Statistiques might go to a different screen later
      Alert.alert('Info', 'Module statistiques en cours de développement');
    } else if (item.id === 3 && onNavigate) {
      onNavigate('calendar');
    } else {
      Alert.alert('Info', `${item.title} en cours de développement`);
    }
  };

  const menuItems = [];

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
        {/* Header content... */}
        {/* Skipping detailed header for brevity in replace_file_content but keeping structure */}
        {/* Actual replacement below will match the actual file lines */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Coach Tracker</Text>
              <Text style={styles.welcome}>Bonjour, {user?.name?.split(' ')[0]}</Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Icon name="calendar-clock" size={28} color="#f97316" />
              </View>
              <Text style={styles.statNumber}>{stats?.sessionsThisWeek || 0}</Text>
              <Text style={styles.statLabel}>Séances</Text>
              <Text style={styles.statSubLabel}>cette semaine</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Icon name="account-group" size={28} color="#3b82f6" />
              </View>
              <Text style={styles.statNumber}>{stats?.totalAthletes || 0}</Text>
              <Text style={styles.statLabel}>Mes joueurs</Text>
              <Text style={styles.statSubLabel}>actifs: {stats?.activeAthletes || 0}</Text>
            </View>
          </View>
        </View>

        {/* ... Other sections (New Player, Upcoming Sessions) ... */}
        {/* We need to be careful with replace_file_content to not delete the middle content */}
        {/* I will perform smaller contiguous edits instead */}

        {/* New Player Registrations */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Nouveaux inscrits (Attente affectation)</Text>
          {stats?.recentPlayers?.length > 0 ? (
            <View style={styles.recentList}>
              {stats.recentPlayers.map((player) => (
                <View key={player.id} style={styles.recentItem}>
                  <View style={styles.playerAvatar}>
                    <Icon name="account" size={20} color="#64748b" />
                  </View>
                  <View style={styles.playerInfo}>
                    <Text style={styles.playerName}>{player.name}</Text>
                    <Text style={styles.playerDate}>Inscrit le {new Date(player.created_at).toLocaleDateString()}</Text>
                  </View>
                  <TouchableOpacity style={styles.assignButton}>
                    <Text style={styles.assignText}>Affecter</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>Aucun nouveau joueur inscrit cette semaine.</Text>
            </View>
          )}
        </View>

        {/* Upcoming Sessions */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Prochaines séances</Text>
            <TouchableOpacity onPress={() => onNavigate('calendar')}>
              <Icon name="plus-circle" size={24} color="#f97316" />
            </TouchableOpacity>
          </View>

          {upcomingSessions.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sessionsScroll}>
              {upcomingSessions.map((session) => (
                <TouchableOpacity
                  key={session.id}
                  style={styles.sessionCard}
                  onPress={() => onNavigate('calendar')}
                >
                  <View style={styles.sessionIcon}>
                    <Icon name={session.type === 'Match' ? 'trophy' : 'basketball'} size={24} color="#f97316" />
                  </View>
                  <Text style={styles.sessionTitle} numberOfLines={1}>{session.title}</Text>
                  <View style={styles.sessionDetails}>
                    <View style={styles.sessionDetail}>
                      <Icon name="clock-outline" size={14} color="#6b7280" />
                      <Text style={styles.sessionDetailText}>{session.date} • {session.heure}</Text>
                    </View>
                    <View style={styles.sessionDetail}>
                      <Icon name="account-group" size={14} color="#6b7280" />
                      <Text style={styles.sessionDetailText}>{session.groupe}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>Aucune séance programmée</Text>
            </View>
          )}
        </View>

        {/* Attendance Summary */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Assiduité globale</Text>
          </View>

          <View style={styles.activityList}>
            <View style={styles.attendanceSummary}>
              <View style={styles.rateContainer}>
                <Text style={styles.rateValue}>{stats?.attendanceRate || 0}%</Text>
                <Text style={styles.rateLabel}>Taux de présence</Text>
              </View>
              <View style={styles.rateBarContainer}>
                <View style={[styles.rateBar, { width: `${stats?.attendanceRate || 0}%` }]} />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// End of component

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff7ed',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
    marginBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  welcome: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 4,
  },
  notificationButton: {
    width: 48,
    height: 48,
    backgroundColor: '#f1f5f9',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    backgroundColor: '#ef4444',
    borderRadius: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff7ed',
    borderRadius: 20,
    padding: 20,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 4,
  },
  statSubLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  sectionContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  seeAll: {
    color: '#f97316',
    fontWeight: '500',
    fontSize: 14,
  },
  sessionsScroll: {
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  sessionCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: 280,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  sessionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#fff7ed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  sessionDetails: {
    gap: 8,
  },
  sessionDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sessionDetailText: {
    fontSize: 13,
    color: '#6b7280',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  menuIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  activityList: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff7ed',
  },
  emptyCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 16,
  },
  attendanceSummary: {
    padding: 8,
  },
  rateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  rateValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  rateLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  rateBarContainer: {
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  rateBar: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  recentList: {
    gap: 12,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  playerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff7ed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  playerDate: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  assignButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f97316',
  },
  assignText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
  },
});

export default CoachHomeScreen;