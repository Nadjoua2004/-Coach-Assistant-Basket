import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SessionService from '../../services/sessionService';

const SessionsListScreen = ({ onCreateSession }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await SessionService.getAllSessions();
      if (response.success) {
        setSessions(response.data);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      Alert.alert('Erreur', 'Impossible de charger les séances');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = (sessionId) => {
    Alert.alert(
      'Supprimer la séance',
      'Êtes-vous sûr de vouloir supprimer cette séance ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await SessionService.deleteSession(sessionId);
              if (response.success) {
                setSessions(prev => prev.filter(session => session.id !== sessionId));
              }
            } catch (error) {
              console.error('Error deleting session:', error);
              Alert.alert('Erreur', 'Impossible de supprimer la séance');
            }
          }
        }
      ]
    );
  };

  const renderSessionItem = ({ item }) => (
    <TouchableOpacity
      style={styles.sessionCard}
      onPress={() => {
        console.log('View session details:', item.id);
      }}
    >
      <View style={styles.sessionHeader}>
        <View style={styles.sessionTitleContainer}>
          <View style={[
            styles.statusIndicator,
            { backgroundColor: item.status === 'terminée' ? '#10b981' : '#f97316' }
          ]} />
          <Text style={styles.sessionTitle}>{item.title}</Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteSession(item.id)}
        >
          <Icon name="delete-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <Text style={styles.sessionObjective}>{item.objective}</Text>

      <View style={styles.sessionDetails}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Icon name="calendar" size={16} color="#6b7280" />
            <Text style={styles.detailText}>
              {new Date(item.date).toLocaleDateString()} • {item.time}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="clock-outline" size={16} color="#6b7280" />
            <Text style={styles.detailText}>{item.total_duration || item.duration} min</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Icon name="account-group" size={16} color="#6b7280" />
            <Text style={styles.detailText}>{item.players_count || item.playersCount || 0} joueurs</Text>
          </View>
          <View style={[
            styles.statusBadge,
            { backgroundColor: item.status === 'terminée' ? '#10b98120' : '#f9731620' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: item.status === 'terminée' ? '#10b981' : '#f97316' }
            ]}>
              {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Inconnu'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes séances</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f97316" />
          <Text style={styles.loadingText}>Chargement des séances...</Text>
        </View>
      ) : sessions.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="clipboard-text-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyStateTitle}>Aucune séance créée</Text>
          <Text style={styles.emptyStateText}>
            Créez votre première séance d'entraînement
          </Text>
        </View>
      ) : (
        <FlatList
          data={sessions}
          renderItem={renderSessionItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={onCreateSession}
      >
        <Icon name="plus" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff7ed',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 30,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 20,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  sessionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sessionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  deleteButton: {
    padding: 4,
  },
  sessionObjective: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  sessionDetails: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 56,
    height: 56,
    backgroundColor: '#f97316',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
    fontSize: 14,
  },
});

export default SessionsListScreen;