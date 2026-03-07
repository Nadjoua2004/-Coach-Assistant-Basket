import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import ExerciseSelectionModal from './ExerciseSelectionModal';
import ExerciseFormModal from './ExerciseFormModal';
import SessionService from '../../services/sessionService';
import ExerciseService from '../../services/exerciseService';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../config/theme';
import Button from '../UI/Button';
import Card from '../UI/Card';
import Input from '../UI/Input';

const { width } = Dimensions.get('window');

const SessionCreationScreen = ({ onBack, onSaveSession, initialData }) => {
  const [sessionTitle, setSessionTitle] = useState('');
  const [objective, setObjective] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('18:00');
  const [location, setLocation] = useState('Salle Principale');
  const [duration, setDuration] = useState('90');
  const [warmup, setWarmup] = useState('');
  const [mainContent, setMainContent] = useState('');
  const [cooldown, setCooldown] = useState('');
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isExerciseFormVisible, setIsExerciseFormVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  // Inline library state
  const [allExercises, setAllExercises] = useState([]);
  const [libSearch, setLibSearch] = useState('');
  const [libCategory, setLibCategory] = useState('all');
  const [libLoading, setLibLoading] = useState(true);

  const libCategories = [
    { id: 'all', label: 'Tous', icon: 'view-grid', color: COLORS.gray[500] },
    { id: 'shoot', label: 'Shoot', icon: 'basketball', color: '#f97316' },
    { id: 'dribble', label: 'Conduite', icon: 'run', color: '#3b82f6' },
    { id: 'defense', label: 'Défense', icon: 'shield', color: '#10b981' },
    { id: 'system', label: 'Système', icon: 'strategy', color: '#8b5cf6' },
    { id: 'physical', label: 'Physique', icon: 'dumbbell', color: '#ef4444' },
    { id: 'mental', label: 'Mental', icon: 'brain', color: '#f59e0b' },
  ];

  const filteredLibExercises = useMemo(() => {
    let list = allExercises;
    if (libCategory !== 'all') list = list.filter(e => e.category === libCategory);
    if (libSearch.trim()) {
      const q = libSearch.toLowerCase();
      list = list.filter(e =>
        e.name?.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allExercises, libCategory, libSearch]);

  useEffect(() => {
    // Load library
    ExerciseService.getAllExercises().then(res => {
      if (res.success) setAllExercises(res.data || []);
    }).catch(() => { }).finally(() => setLibLoading(false));
  }, []);

  useEffect(() => {
    if (initialData) {
      setSessionTitle(`Copie de ${initialData.title}`);
      setObjective(initialData.objective || '');
      setDuration(initialData.total_duration?.toString() || '90');
      setLocation(initialData.lieu || 'Salle Principale');
      setWarmup(initialData.warmup || '');
      setMainContent(initialData.main_content || '');
      setCooldown(initialData.cooldown || initialData.cool_down || '');
      setTime(initialData.heure || initialData.time || '18:00');
      if (initialData.exercises) setSelectedExercises(initialData.exercises);
    }
  }, [initialData]);

  const toggleExercise = (ex) => {
    const already = selectedExercises.find(e => e.id === ex.id);
    if (already) {
      setSelectedExercises(selectedExercises.filter(e => e.id !== ex.id));
    } else {
      setSelectedExercises([...selectedExercises, ex]);
    }
  };

  const handleSaveSession = async () => {
    if (!sessionTitle || !objective || !duration) {
      Alert.alert('Champs requis', 'Le titre, l\'objectif et la durée sont obligatoires.');
      return;
    }

    setLoading(true);
    try {
      const sessionData = {
        title: sessionTitle,
        objective,
        total_duration: parseInt(duration),
        warmup,
        main_content: mainContent,
        cooldown: cooldown,
        exercises: selectedExercises.map(ex => ex.id),
        date,
        heure: time,
        lieu: location,
        status: 'planifiée'
      };

      const response = await SessionService.createSession(sessionData);

      if (response.success) {
        setSessionId(response.data.id);
        Alert.alert('Succès', 'La séance a été créée et ajoutée au calendrier.');
        if (onSaveSession) onSaveSession();
      } else {
        Alert.alert('Erreur', response.message || 'Erreur lors de la création');
      }
    } catch (error) {
      console.error('Error saving session:', error);
      Alert.alert('Erreur', 'Impossible d\'enregistrer la séance.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!sessionId && !initialData?.id) {
      Alert.alert('Note', 'Enregistrez d\'abord la séance pour pouvoir l\'exporter.');
      return;
    }
    const id = sessionId || initialData.id;
    try {
      const url = `${API_URL}/api/sessions/${id}/export-pdf`;
      await Linking.openURL(url);
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Erreur', 'Impossible de générer le PDF.');
    }
  };

  const renderExerciseItem = ({ item, drag, isActive }) => (
    <ScaleDecorator>
      <Card
        style={[
          styles.exerciseItem,
          isActive && styles.exerciseItemActive
        ]}
        padding="md"
        shadow="sm"
        onLongPress={drag}
      >
        <View style={styles.exerciseDragHandle}>
          <Icon name="dots-vertical" size={24} color={COLORS.gray[300]} />
        </View>
        <View style={styles.exerciseContent}>
          <Text style={styles.exerciseTitle}>{item.name}</Text>
          <View style={styles.exerciseMeta}>
            <Icon name="timer-outline" size={14} color={COLORS.gray[400]} />
            <Text style={styles.exerciseMetaText}>{item.duration} min</Text>
            <View style={styles.separator} />
            <Icon name="account-group-outline" size={14} color={COLORS.gray[400]} />
            <Text style={styles.exerciseMetaText}>{item.players_min || item.playersMin}-{item.players_max || item.playersMax}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.exerciseDelete}
          onPress={() => setSelectedExercises(selectedExercises.filter(ex => ex.id !== item.id))}
        >
          <View style={styles.deleteIconContainer}>
            <Icon name="close" size={18} color={COLORS.error} />
          </View>
        </TouchableOpacity>
      </Card>
    </ScaleDecorator>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Icon name="chevron-left" size={32} color={COLORS.primary} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>{initialData ? 'Dupliquer Séance' : 'Nouvelle Séance'}</Text>
            <Text style={styles.headerSubtitle}>Configurez votre entraînement</Text>
          </View>
        </View>
      </View>

      <GestureHandlerRootView style={{ flex: 1 }}>
        <DraggableFlatList
          data={selectedExercises}
          onDragEnd={({ data }) => setSelectedExercises(data)}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderExerciseItem}
          ListHeaderComponent={
            <View style={styles.formContainer}>
              <View style={styles.section}>

                <Card style={styles.formCard} padding="lg">
                  <Input
                    label="Titre de la séance"
                    value={sessionTitle}
                    onChangeText={setSessionTitle}
                    placeholder="Ex: Perfectionnement Shoot"
                    icon="format-title"
                  />

                  <Input
                    label="Objectif principal"
                    value={objective}
                    onChangeText={setObjective}
                    placeholder="Qu'allez-vous travailler aujourd'hui ?"
                    multiline
                    numberOfLines={2}
                    icon="target"
                  />

                  <View style={styles.formRow}>
                    <View style={{ flex: 1 }}>
                      <Input
                        label="Durée (min)"
                        value={duration}
                        onChangeText={setDuration}
                        keyboardType="numeric"
                        icon="timer-outline"
                        placeholder="90"
                      />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Input
                        label="Heure"
                        value={time}
                        onChangeText={setTime}
                        placeholder="18:00"
                        icon="clock-outline"
                      />
                    </View>
                  </View>

                  <Input
                    label="Lieu"
                    value={location}
                    onChangeText={setLocation}
                    placeholder="Gymnase municipal"
                    icon="map-marker-outline"
                  />
                </Card>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>STRUCTURE DE LA SÉANCE</Text>
                <Card style={styles.formCard} padding="lg">
                  <View style={styles.structureField}>
                    <Text style={styles.structureLabel}>1. Échauffement</Text>
                    <TextInput
                      style={styles.structureInput}
                      value={warmup}
                      onChangeText={setWarmup}
                      multiline
                      placeholder="Indiquez les exercices de mise en train..."
                      placeholderTextColor={COLORS.gray[300]}
                    />
                  </View>

                  <View style={styles.structureField}>
                    <Text style={styles.structureLabel}>2. Corps de séance</Text>
                    <TextInput
                      style={styles.structureInput}
                      value={mainContent}
                      onChangeText={setMainContent}
                      multiline
                      placeholder="Détaillez le contenu technique..."
                      placeholderTextColor={COLORS.gray[300]}
                    />
                  </View>

                  <View style={styles.structureField}>
                    <Text style={styles.structureLabel}>3. Fin de séance</Text>
                    <TextInput
                      style={styles.structureInput}
                      value={cooldown}
                      onChangeText={setCooldown}
                      multiline
                      placeholder="Retour au calme, étirements..."
                      placeholderTextColor={COLORS.gray[300]}
                    />
                  </View>
                </Card>
              </View>

              {/* EXERCISES SECTION — inline mini-library */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>EXERCICES SPÉCIFIQUES</Text>

                {/* Mini Library Browser */}
                <Card style={styles.libCard} padding="none">
                  {/* Search */}
                  <View style={styles.libSearchRow}>
                    <Icon name="magnify" size={18} color={COLORS.primary} style={{ marginLeft: 12 }} />
                    <TextInput
                      style={styles.libSearchInput}
                      placeholder="Rechercher un exercice..."
                      placeholderTextColor={COLORS.gray[400]}
                      value={libSearch}
                      onChangeText={setLibSearch}
                    />
                    {Boolean(libSearch) && (
                      <TouchableOpacity onPress={() => setLibSearch('')} style={{ padding: 8 }}>
                        <Icon name="close-circle" size={16} color={COLORS.gray[400]} />
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Category chips */}
                  <ScrollView horizontal nestedScrollEnabled showsHorizontalScrollIndicator={false} style={styles.libChipsRow} contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}>
                    {libCategories.map(cat => (
                      <TouchableOpacity
                        key={cat.id}
                        style={[styles.libChip, libCategory === cat.id && { backgroundColor: cat.color }]}
                        onPress={() => setLibCategory(cat.id)}
                      >
                        <Icon name={cat.icon} size={13} color={libCategory === cat.id ? COLORS.white : cat.color} />
                        <Text style={[styles.libChipText, libCategory === cat.id && { color: COLORS.white }]}>{cat.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  {/* Exercise list */}
                  {libLoading ? (
                    <ActivityIndicator color={COLORS.primary} style={{ padding: 20 }} />
                  ) : filteredLibExercises.length === 0 ? (
                    <Text style={styles.libEmpty}>Aucun exercice trouvé</Text>
                  ) : (
                    filteredLibExercises.map(ex => {
                      const isSelected = Boolean(selectedExercises.find(e => e.id === ex.id));
                      const cat = libCategories.find(c => c.id === ex.category);
                      return (
                        <TouchableOpacity
                          key={ex.id}
                          style={[styles.libRow, isSelected && styles.libRowSelected]}
                          onPress={() => toggleExercise(ex)}
                          activeOpacity={0.7}
                        >
                          <View style={[styles.libDot, { backgroundColor: cat?.color || COLORS.gray[400] }]} />
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.libExName, isSelected && { color: COLORS.primary }]} numberOfLines={1}>{ex.name}</Text>
                            <Text style={styles.libExMeta}>{ex.duration || '?'} min • {ex.players_min || '?'}-{ex.players_max || '?'} joueurs</Text>
                          </View>
                          <Icon
                            name={isSelected ? 'check-circle' : 'plus-circle-outline'}
                            size={22}
                            color={isSelected ? COLORS.primary : COLORS.gray[300]}
                          />
                        </TouchableOpacity>
                      );
                    })
                  )}
                </Card>
              </View>
            </View>
          }
          ListFooterComponent={<View style={{ height: 40 }} />}
          contentContainerStyle={styles.scrollContent}
        />
      </GestureHandlerRootView>

      <View style={styles.footer}>
        <Button
          title={loading ? "Création..." : "Enregistrer la séance"}
          onPress={handleSaveSession}
          loading={loading}
          variant="primary"
          leftIcon="content-save-outline"
          style={styles.saveButton}
        />

        <TouchableOpacity
          style={styles.exportButton}
          onPress={handleExportPDF}
        >
          <Icon name="file-pdf-box" size={26} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <ExerciseSelectionModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSelectExercise={(ex) => {
          setSelectedExercises([...selectedExercises, ex]);
          setIsModalVisible(false);
        }}
        onCreateNew={() => {
          setIsModalVisible(false);
          setIsExerciseFormVisible(true);
        }}
      />

      <ExerciseFormModal
        visible={isExerciseFormVisible}
        onClose={() => setIsExerciseFormVisible(false)}
        onSuccess={(newExercise) => {
          setIsExerciseFormVisible(false);
          if (newExercise) {
            setSelectedExercises(prev => [...prev, newExercise]);
          }
        }}
        editMode={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
    ...SHADOWS.sm,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginLeft: -10,
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.gray[900],
  },
  headerSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.gray[400],
    marginTop: 2,
  },
  formContainer: {
    padding: SPACING.lg,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    ...TYPOGRAPHY.label,
    fontSize: 11,
    color: COLORS.gray[400],
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginLeft: 4,
  },
  formCard: {
    borderRadius: 24,
    ...SHADOWS.md,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  structureField: {
    marginBottom: 20,
  },
  structureLabel: {
    ...TYPOGRAPHY.label,
    fontSize: 12,
    color: COLORS.gray[900],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  structureInput: {
    backgroundColor: COLORS.gray[50],
    borderWidth: 1,
    borderColor: COLORS.gray[100],
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    color: COLORS.gray[800],
    minHeight: 120,
    textAlignVertical: 'top',
    lineHeight: 22,
  },
  addExerciseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  addExerciseText: {
    ...TYPOGRAPHY.label,
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
    marginLeft: 6,
  },
  addExerciseBigBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 16,
    gap: 8,
  },
  addExerciseBigBtnText: {
    ...TYPOGRAPHY.label,
    fontSize: 13,
    color: COLORS.white,
    fontWeight: '700',
  },
  dragHelpText: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 11,
    color: COLORS.gray[400],
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.gray[50],
    backgroundColor: COLORS.white,
    ...SHADOWS.sm,
  },
  exerciseItemActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    ...SHADOWS.md,
    transform: [{ scale: 1.02 }],
  },
  exerciseDragHandle: {
    paddingLeft: 12,
    paddingRight: 8,
  },
  exerciseContent: {
    flex: 1,
    paddingVertical: 12,
  },
  exerciseTitle: {
    ...TYPOGRAPHY.h4,
    fontSize: 15,
    color: COLORS.gray[900],
  },
  exerciseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  exerciseMetaText: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.gray[400],
    marginLeft: 5,
  },
  separator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.gray[200],
    marginHorizontal: 10,
  },
  exerciseDelete: {
    padding: 12,
  },
  deleteIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.error + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: COLORS.gray[100],
    borderStyle: 'dashed',
    marginTop: 8,
  },
  emptyStateText: {
    marginTop: 16,
    ...TYPOGRAPHY.h4,
    color: COLORS.gray[900],
  },
  emptyStateSubtext: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.gray[400],
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  footer: {
    backgroundColor: COLORS.white,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 44 : 24,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
    gap: 12,
    ...SHADOWS.lg,
  },
  saveButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    ...SHADOWS.md,
  },
  exportButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  // Mini library styles
  libCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  libSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
    paddingRight: 4,
  },
  libSearchInput: {
    flex: 1,
    height: 44,
    paddingHorizontal: 10,
    color: COLORS.gray[900],
    fontSize: 14,
  },
  libChipsRow: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
    paddingVertical: 10,
  },
  libChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.gray[100],
    gap: 4,
    marginRight: 8,
  },
  libChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray[600],
  },
  libRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[50],
    gap: 10,
  },
  libRowSelected: {
    backgroundColor: COLORS.primary + '08',
  },
  libDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  libExName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray[800],
  },
  libExMeta: {
    fontSize: 11,
    color: COLORS.gray[400],
    marginTop: 2,
  },
  libEmpty: {
    textAlign: 'center',
    color: COLORS.gray[400],
    fontSize: 13,
    padding: 24,
    fontStyle: 'italic',
  },
});

export default SessionCreationScreen;