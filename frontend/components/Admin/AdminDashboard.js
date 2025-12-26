import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DashboardService from '../../services/dashboardService';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await DashboardService.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
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
        <Text style={styles.title}>Tableau de bord Admin</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Icon name="account-group" size={32} color="#3b82f6" />
            <Text style={styles.statNumber}>{stats?.totalAthletes || 0}</Text>
            <Text style={styles.statLabel}>Total Joueurs</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="calendar" size={32} color="#10b981" />
            <Text style={styles.statNumber}>{stats?.sessionsThisWeek || 0}</Text>
            <Text style={styles.statLabel}>Séances/Semaine</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="trending-up" size={32} color="#f97316" />
            <Text style={styles.statNumber}>{stats?.attendanceRate || 0}%</Text>
            <Text style={styles.statLabel}>Assiduité</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="alert-circle-outline" size={32} color="#ef4444" />
            <Text style={styles.statNumber}>{stats?.injuredAthletes || 0}</Text>
            <Text style={styles.statLabel}>Joueurs blessés</Text>
          </View>
        </View>

        <View style={styles.actionsCard}>
          <Text style={styles.actionsTitle}>Actions rapides</Text>
          <View style={styles.actionsList}>
            <TouchableOpacity style={[styles.actionButton, styles.blueAction]}>
              <Text style={styles.actionText}>Gérer les utilisateurs</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.greenAction]}>
              <Text style={styles.actionText}>Sauvegardes système</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.orangeAction]}>
              <Text style={styles.actionText}>Rapports d'activité</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  actionsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  actionsList: {
    gap: 12,
  },
  actionButton: {
    padding: 16,
    borderRadius: 12,
  },
  blueAction: {
    backgroundColor: '#dbeafe',
  },
  greenAction: {
    backgroundColor: '#dcfce7',
  },
  orangeAction: {
    backgroundColor: '#ffedd5',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default AdminDashboard;