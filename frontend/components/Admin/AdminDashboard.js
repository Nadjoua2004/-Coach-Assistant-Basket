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
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import DashboardService from '../../services/dashboardService';
import UserCreationModal from './UserCreationModal';

const AdminDashboard = ({ onNavigate }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);

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

  const handleActionPress = (action) => {
    if (action === 'users') {
      setShowUserModal(true);
    } else if (onNavigate) {
      onNavigate(action);
    }
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
          <TouchableOpacity style={styles.statCard} onPress={() => handleActionPress('users')}>
            <Icon name="account-group" size={32} color="#3b82f6" />
            <Text style={styles.statNumber}>{stats?.totalAthletes || 0}</Text>
            <Text style={styles.statLabel}>Total Joueurs</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statCard} onPress={() => handleActionPress('admin_exercises')}>
            <Icon name="dumbbell" size={32} color="#f97316" />
            <Text style={styles.statNumber}>{stats?.totalExercises || 0}</Text>
            <Text style={styles.statLabel}>Exercices</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statCard} onPress={() => handleActionPress('videos')}>
            <Icon name="video-collection" size={32} color="#10b981" />
            <Text style={styles.statLabel}>Vidéothèque</Text>
            <Text style={styles.statSubLabel}>Gérer les vidéos</Text>
          </TouchableOpacity>
          <View style={styles.statCard}>
            <Icon name="trending-up" size={32} color="#8b5cf6" />
            <Text style={styles.statNumber}>{stats?.attendanceRate || 0}%</Text>
            <Text style={styles.statLabel}>Assiduité</Text>
          </View>
        </View>

        <View style={styles.actionsCard}>
          <Text style={styles.actionsTitle}>Nouveaux inscrits (Joueurs)</Text>
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
            <Text style={styles.noRecentText}>Aucun nouvel inscrit ces 7 derniers jours.</Text>
          )}
        </View>

        <View style={styles.actionsCard}>
          <Text style={styles.actionsTitle}>Actions rapides</Text>
          <View style={styles.actionsList}>
            <TouchableOpacity
              style={[styles.actionButton, styles.blueAction]}
              onPress={() => handleActionPress('users')}
            >
              <Text style={styles.actionText}>Gérer les utilisateurs</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.greenAction]}
              onPress={() => handleActionPress('videos')}
            >
              <Text style={styles.actionText}>Bibliothèque Vidéos</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.orangeAction]}
              onPress={() => handleActionPress('admin_exercises')}
            >
              <Text style={styles.actionText}>Gestion Exercices</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <UserCreationModal
        visible={showUserModal}
        onClose={() => setShowUserModal(false)}
        onSuccess={fetchStats}
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
    marginBottom: 20,
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
  recentList: {
    gap: 12,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
  },
  playerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
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
  noRecentText: {
    textAlign: 'center',
    color: '#94a3b8',
    paddingVertical: 12,
  },
});

export default AdminDashboard;