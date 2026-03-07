import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Platform,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useAuth } from '../Common/AuthProvider';
import DashboardService from '../../services/dashboardService';
import PlanningService from '../../services/planningService';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../config/theme';
import Card from '../UI/Card';
import Button from '../UI/Button';

const { width } = Dimensions.get('window');

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
      }

      if (planningResult.status === 'fulfilled' && planningResult.value.success) {
        setUpcomingSessions(planningResult.value.data.slice(0, 5));
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

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* Top Bar */}
        <View style={styles.topHeader}>
          <TouchableOpacity
            style={styles.profileBox}
            onPress={() => onNavigate('profile')}
            activeOpacity={0.7}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'C'}</Text>
            </View>
            <View>
              <Text style={styles.greetingHeader}>Content de vous revoir,</Text>
              <Text style={styles.userNameHeader}>{user?.name?.split(' ')[0] || 'Coach'} 🏀</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.notifBtn}>
            <Icon name="bell-outline" size={22} color={COLORS.gray[900]} />
            <View style={styles.notifBadge} />
          </TouchableOpacity>
        </View>

        {/* Hero Dashboard Panel */}
        <View style={styles.heroWrapper}>
          <View style={styles.heroPanel}>
            <View style={styles.heroMain}>
              <Text style={styles.heroTitle}>Vue d'ensemble</Text>
              <Text style={styles.heroSubtitle}>Vos activités de la semaine</Text>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{stats?.sessionsThisWeek || 0}</Text>
                <Text style={styles.statLabel}>SÉANCES</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{stats?.totalAthletes || 0}</Text>
                <Text style={styles.statLabel}>JOUEURS</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{stats?.attendanceRate || 0}%</Text>
                <Text style={styles.statLabel}>PRÉSENCE</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionHeaderCompact}>
          <Text style={styles.sectionTitleSmall}>Raccourcis</Text>
        </View>
        <View style={styles.actionsGrid}>
          <ActionItem
            label="Exercices"
            icon="basketball"
            color="#FF6B00"
            onPress={() => onNavigate('exercises')}
          />
          <ActionItem
            label="Planning"
            icon="calendar-clock"
            color="#4F46E5"
            onPress={() => onNavigate('calendar')}
          />
          <ActionItem
            label="Équipe"
            icon="account-group"
            color="#10B981"
            onPress={() => onNavigate('athletes')}
          />
          <ActionItem
            label="Appel"
            icon="check-decagram"
            color="#F59E0B"
            onPress={() => onNavigate('attendance')}
          />
        </View>

        {/* Upcoming Sessions Slider */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Planning prochain</Text>
            <TouchableOpacity onPress={() => onNavigate('calendar')}>
              <Text style={styles.seeAllText}>Tout voir</Text>
            </TouchableOpacity>
          </View>

          {upcomingSessions.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
              decelerationRate="fast"
              snapToInterval={width * 0.75 + 16}
            >
              {upcomingSessions.map((session) => (
                <Card key={session.id} style={styles.sessionCard} padding="md">
                  <View style={styles.sessionCardHeader}>
                    <View style={styles.sessionBadge}>
                      <Text style={styles.sessionBadgeText}>
                        {new Date(session.date).toLocaleDateString('fr-FR', { weekday: 'short' }).toUpperCase()}
                      </Text>
                      <Text style={styles.sessionBadgeDate}>{new Date(session.date).getDate()}</Text>
                    </View>
                    <View style={styles.timeTag}>
                      <Icon name="clock-outline" size={12} color={COLORS.gray[400]} />
                      <Text style={styles.timeTagText}>{session.heure}</Text>
                    </View>
                  </View>

                  <Text style={styles.sessionTitleText} numberOfLines={1}>{session.title}</Text>

                  <View style={styles.cardFooter}>
                    <View style={styles.groupInfo}>
                      <Icon name="account-multiple" size={14} color={COLORS.primary} />
                      <Text style={styles.groupText}>{session.groupe}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.detailsBtn}
                      onPress={() => onNavigate('calendar', { selectedDate: session.date })}
                    >
                      <Icon name="chevron-right" size={20} color={COLORS.gray[300]} />
                    </TouchableOpacity>
                  </View>
                </Card>
              ))}
            </ScrollView>
          ) : (
            <TouchableOpacity
              style={styles.emptyCard}
              onPress={() => onCreateSession()}
              activeOpacity={0.8}
            >
              <View style={styles.emptyIconBox}>
                <Icon name="plus" size={24} color={COLORS.gray[400]} />
              </View>
              <Text style={styles.emptyText}>Commencez par planifier une séance</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Progress Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Collective</Text>
          <Card style={styles.performanceCard} padding="lg">
            <View style={styles.perfHeader}>
              <View>
                <Text style={styles.perfMainVal}>{stats?.attendanceRate || 0}%</Text>
                <Text style={styles.perfLabel}>Taux d'assiduité global</Text>
              </View>
              <View style={styles.perfBadge}>
                <Icon name="trending-up" size={16} color={COLORS.success} />
                <Text style={styles.perfBadgeText}>+2%</Text>
              </View>
            </View>

            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBarFill, { width: `${stats?.attendanceRate || 0}%` }]} />
            </View>

            <View style={styles.perfFooter}>
              <Icon name="information-outline" size={14} color={COLORS.gray[400]} />
              <Text style={styles.perfHint}>
                L'équipe est très régulière cette saison.
              </Text>
            </View>
          </Card>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const ActionItem = ({ label, icon, color, onPress }) => (
  <TouchableOpacity style={styles.actionWrap} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.actionIcon, { backgroundColor: color + '15' }]}>
      <Icon name={icon} size={24} color={color} />
    </View>
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  scrollView: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
  },
  profileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  avatarText: {
    ...TYPOGRAPHY.h3,
    color: COLORS.white,
    fontSize: 18,
  },
  greetingHeader: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.gray[400],
    fontSize: 12,
  },
  userNameHeader: {
    ...TYPOGRAPHY.h3,
    color: COLORS.gray[900],
    fontSize: 17,
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gray[50],
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  notifBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
  heroWrapper: {
    padding: SPACING.lg,
  },
  heroPanel: {
    backgroundColor: COLORS.gray[900],
    borderRadius: 28,
    padding: 24,
    ...SHADOWS.md,
  },
  heroMain: {
    marginBottom: 20,
  },
  heroTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.white,
    fontSize: 22,
  },
  heroSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.gray[400],
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statBox: {
    flex: 1,
  },
  statValue: {
    ...TYPOGRAPHY.h2,
    color: COLORS.white,
    fontSize: 24,
  },
  statLabel: {
    ...TYPOGRAPHY.label,
    color: COLORS.gray[500],
    fontSize: 9,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.gray[800],
    marginHorizontal: 12,
  },
  sectionHeaderCompact: {
    paddingHorizontal: SPACING.lg,
    marginBottom: 12,
  },
  sectionTitleSmall: {
    ...TYPOGRAPHY.label,
    fontSize: 11,
    color: COLORS.gray[400],
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    marginBottom: 32,
  },
  actionWrap: {
    alignItems: 'center',
    width: '22%',
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    ...SHADOWS.xs,
  },
  actionLabel: {
    ...TYPOGRAPHY.label,
    fontSize: 11,
    color: COLORS.gray[600],
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.gray[900],
    fontSize: 18,
  },
  seeAllText: {
    ...TYPOGRAPHY.label,
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  horizontalScroll: {
    paddingRight: SPACING.lg,
  },
  sessionCard: {
    width: width * 0.75,
    marginRight: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.gray[50],
    ...SHADOWS.sm,
  },
  sessionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sessionBadge: {
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
  },
  sessionBadgeText: {
    ...TYPOGRAPHY.label,
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: '800',
  },
  sessionBadgeDate: {
    ...TYPOGRAPHY.h4,
    color: COLORS.primary,
    fontSize: 15,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.gray[50],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timeTagText: {
    ...TYPOGRAPHY.label,
    fontSize: 10,
    color: COLORS.gray[600],
  },
  sessionTitleText: {
    ...TYPOGRAPHY.h4,
    fontSize: 16,
    color: COLORS.gray[900],
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[50],
    paddingTop: 12,
  },
  groupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  groupText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.gray[600],
    fontWeight: '700',
    fontSize: 12,
  },
  detailsBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray[100],
    borderStyle: 'dashed',
  },
  emptyIconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.gray[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.gray[400],
    textAlign: 'center',
  },
  performanceCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    ...SHADOWS.sm,
  },
  perfHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  perfMainVal: {
    ...TYPOGRAPHY.h1,
    fontSize: 32,
    color: COLORS.gray[900],
  },
  perfLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.gray[400],
    marginTop: 2,
  },
  perfBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  perfBadgeText: {
    ...TYPOGRAPHY.label,
    color: COLORS.success,
    fontSize: 11,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: COLORS.gray[50],
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.success,
    borderRadius: 5,
  },
  perfFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  perfHint: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.gray[400],
    fontSize: 11,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
});

export default CoachHomeScreen;