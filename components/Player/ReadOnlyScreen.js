import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../Common/AuthProvider';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ReadOnlyScreen = () => {
  const { user } = useAuth();
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>
          Bonjour {user?.name?.split(' ')[0]}
        </Text>
        <Text style={styles.subtitle}>Votre planning de la semaine</Text>

        <View style={styles.content}>
          <View style={styles.eventCard}>
            <View style={styles.eventHeader}>
              <View style={[styles.eventIcon, { backgroundColor: '#dbeafe' }]}>
                <Icon name="calendar" size={24} color="#3b82f6" />
              </View>
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>Entraînement U15</Text>
                <Text style={styles.eventDate}>Lundi 25 Nov</Text>
              </View>
            </View>
            <Text style={styles.eventDetails}>16:00 - 18:00 • Salle Principale</Text>
          </View>

          <View style={styles.eventCard}>
            <View style={styles.eventHeader}>
              <View style={[styles.eventIcon, { backgroundColor: '#dcfce7' }]}>
                <Icon name="calendar" size={24} color="#10b981" />
              </View>
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>Match amical</Text>
                <Text style={styles.eventDate}>Mercredi 27 Nov</Text>
              </View>
            </View>
            <Text style={styles.eventDetails}>18:00 - 20:00 • Terrain extérieur</Text>
          </View>

          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Mes statistiques</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>92%</Text>
                <Text style={styles.statLabel}>Présence</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>24</Text>
                <Text style={styles.statLabel}>Séances</Text>
              </View>
            </View>
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
  scrollView: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 24,
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
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  eventDetails: {
    fontSize: 14,
    color: '#64748b',
  },
  statsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
});

export default ReadOnlyScreen;