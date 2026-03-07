import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import SessionService from '../../services/sessionService';
import PlanningService from '../../services/planningService';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../config/theme';
import Card from '../UI/Card';
import Input from '../UI/Input';

const SessionsListScreen = ({ onCreateSession, onReuseSession, onViewSession }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await SessionService.getAllSessions();
      if (response.success) {
        setSessions(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      Alert.alert('Erreur', 'Impossible de charger les séances');
    } finally {
      setLoading(false);
    }
  };

  const filteredSessions = sessions.filter(s =>
    (s.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.objective || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.lieu || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteSession = (sessionId) => {
    Alert.alert(
      'Supprimer la séance',
      'Voulez-vous vraiment supprimer ce modèle de séance ?',
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
    <Card
      style={styles.sessionCard}
      onPress={() => onViewSession && onViewSession(item)}
      padding="none"
    >
      <View style={styles.sessionItemContent}>
        <View style={styles.sessionMainInfo}>
          <View style={styles.sessionBadgeRow}>
            <View style={styles.timeBadge}>
              <Icon name="clock-outline" size={12} color={COLORS.primary} />
              <Text style={styles.timeBadgeText}>{item.total_duration} min</Text>
            </View>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>MODÈLE</Text>
            </View>
          </View>

          <Text style={styles.sessionTitleText} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.sessionObjText} numberOfLines={2}>
            {item.objective || "Aucun objectif spécifique"}
          </Text>

          <View style={styles.sessionMetaFooter}>
            <View style={styles.metaItem}>
              <Icon name="map-marker-outline" size={14} color={COLORS.gray[400]} />
              <Text style={styles.metaText}>{item.lieu || 'Non spécifié'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="basketball" size={14} color={COLORS.gray[400]} />
              <Text style={styles.metaText}>{item.exercises?.length || 0} ex.</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.deleteAction}
          onPress={() => handleDeleteSession(item.id)}
        >
          <Icon name="dots-vertical" size={20} color={COLORS.gray[300]} />
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Header with Search */}
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>Bibliothèque</Text>
        <Text style={styles.screenSub}>Gérez vos modèles de séances types</Text>

        <View style={styles.searchWrapper}>
          <Icon name="magnify" size={20} color={COLORS.primary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInputField}
            placeholder="Rechercher une séance..."
            placeholderTextColor={COLORS.gray[400]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {Boolean(searchQuery) && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.searchClearBtn}>
              <Icon name="close-circle" size={16} color={COLORS.gray[400]} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingTxt}>Chargement de la bibliothèque...</Text>
        </View>
      ) : filteredSessions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIllustration}>
            <Icon name="folder-open-outline" size={64} color={COLORS.gray[100]} />
          </View>
          <Text style={styles.emptyTitle}>
            {searchQuery ? "Aucun modèle trouvé" : "Bibliothèque vide"}
          </Text>
          <Text style={styles.emptyDescription}>
            {searchQuery
              ? "Ajustez votre recherche pour trouver ce que vous cherchez."
              : "Créez vos séances préférées une seule fois et réutilisez-les à volonté dans votre calendrier."}
          </Text>
          {!searchQuery && (
            <Button
              title="CRÉER MON PREMIER MODÈLE"
              onPress={() => onCreateSession && onCreateSession()}
              style={styles.firstBtn}
            />
          )}
        </View>
      ) : (
        <FlatList
          data={filteredSessions}
          renderItem={renderSessionItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          onRefresh={fetchSessions}
          refreshing={loading}
        />
      )}

      {/* Modern Floating Button */}
      {!loading && (
        <TouchableOpacity
          style={styles.mainFab}
          onPress={() => onCreateSession && onCreateSession()}
          activeOpacity={0.9}
        >
          <Icon name="plus" size={32} color={COLORS.white} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  screenHeader: {
    paddingHorizontal: SPACING.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
    paddingBottom: 24,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
    ...SHADOWS.sm,
  },
  screenTitle: {
    ...TYPOGRAPHY.h1,
    fontSize: 28,
    color: COLORS.gray[900],
  },
  screenSub: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.gray[400],
    marginTop: 4,
  },
  searchWrapper: {
    marginTop: 20,
    marginHorizontal: -SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.gray[100],
    paddingLeft: SPACING.lg,
    paddingRight: 8,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInputField: {
    flex: 1,
    fontSize: 14,
    color: COLORS.gray[900],
    height: '100%',
  },
  searchClearBtn: {
    padding: 8,
  },
  listContainer: {
    padding: SPACING.lg,
    paddingBottom: 120,
    gap: 16,
  },
  sessionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.gray[50],
  },
  sessionItemContent: {
    flexDirection: 'row',
  },
  sessionMainInfo: {
    flex: 1,
    padding: 16,
  },
  sessionBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.gray[50],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  timeBadgeText: {
    ...TYPOGRAPHY.label,
    fontSize: 10,
    color: COLORS.gray[700],
    fontWeight: '800',
  },
  typeBadge: {
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeBadgeText: {
    ...TYPOGRAPHY.label,
    fontSize: 9,
    color: COLORS.primary,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sessionTitleText: {
    ...TYPOGRAPHY.h3,
    fontSize: 17,
    color: COLORS.gray[900],
    marginBottom: 6,
  },
  sessionObjText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.gray[500],
    lineHeight: 20,
    marginBottom: 16,
  },
  sessionMetaFooter: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[50],
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.gray[400],
  },
  deleteAction: {
    padding: 12,
    justifyContent: 'flex-start',
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingTxt: {
    ...TYPOGRAPHY.bodySmall,
    marginTop: 16,
    color: COLORS.gray[400],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 80,
  },
  emptyIllustration: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    ...SHADOWS.md,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h2,
    fontSize: 22,
    color: COLORS.gray[900],
    textAlign: 'center',
  },
  emptyDescription: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 14,
    color: COLORS.gray[400],
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  firstBtn: {
    marginTop: 32,
    height: 54,
    borderRadius: 16,
    paddingHorizontal: 32,
    ...SHADOWS.md,
  },
  mainFab: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: COLORS.gray[900],
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.lg,
    elevation: 8,
  },
});

export default SessionsListScreen;