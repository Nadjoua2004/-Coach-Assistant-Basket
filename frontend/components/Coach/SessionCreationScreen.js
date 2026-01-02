import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  ActivityIndicator,
  Linking
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ExerciseSelectionModal from './ExerciseSelectionModal';
import SessionService from '../../services/sessionService';
import API_URL from '../../config/api';

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
  const [coolDown, setCoolDown] = useState('');
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    if (initialData) {
      setSessionTitle(`Copie de ${initialData.title}`);
      setObjective(initialData.objective || '');
      setDuration(initialData.total_duration?.toString() || '90');
      setLocation(initialData.lieu || 'Salle Principale');
      setWarmup(initialData.warmup || '');
      setMainContent(initialData.main_content || '');
      setCoolDown(initialData.cool_down || '');
      setTime(initialData.heure || initialData.time || '18:00');

      if (initialData.exercises) {
        setSelectedExercises(initialData.exercises);
      }
    }
  }, [initialData]);

  const handleSaveSession = async () => {
    if (!sessionTitle || !objective || !duration) {
      Alert.alert('Erreur', 'Veuillez remplir les champs obligatoires');
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
        cool_down: coolDown,
        exercises: selectedExercises.map(ex => ex.id),
        date,
        time,
        lieu: location,
        status: 'planifiée'
      };

      const response = await SessionService.createSession(sessionData);

      if (response.success) {
        setSessionId(response.data.id);
        Alert.alert('Succès', 'Séance créée avec succès');
        if (onSaveSession) onSaveSession();
      } else {
        Alert.alert('Erreur', response.message || 'Erreur lors de la création');
      }
    } catch (error) {
      console.error('Error saving session:', error);
      Alert.alert('Erreur', 'Impossible d\'enregistrer la séance');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!sessionId && !initialData?.id) {
      Alert.alert('Erreur', 'Enregistrez d\'abord la séance');
      return;
    }
    const id = sessionId || initialData.id;
    try {
      const url = `${API_URL}/api/sessions/export/${id}`;
      await Linking.openURL(url);
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Erreur', 'Échec de l\'export PDF');
    }
  };

  const renderExerciseItem = ({ item, drag, isActive }) => (
    <ScaleDecorator>
      <TouchableOpacity
        onLongPress={drag}
        disabled={isActive}
        style={[
          styles.exerciseItem,
          { backgroundColor: isActive ? '#fff7ed' : 'white' }
        ]}
      >
        <View style={styles.exerciseDragHandle}>
          <Icon name="drag-vertical" size={24} color="#9ca3af" />
        </View>
        <View style={styles.exerciseContent}>
          <Text style={styles.exerciseTitle}>{item.name}</Text>
          <Text style={styles.exerciseDetails}>
            {item.duration}min • {item.players_min || item.playersMin}-{item.players_max || item.playersMax} joueurs
          </Text>
        </View>
        <TouchableOpacity
          style={styles.exerciseDelete}
          onPress={() => setSelectedExercises(selectedExercises.filter(ex => ex.id !== item.id))}
        >
          <Icon name="delete-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
      </TouchableOpacity>
    </ScaleDecorator>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Icon name="arrow-left" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouvelle Séance</Text>
        <View style={{ width: 40 }} />
      </View>

      <GestureHandlerRootView style={{ flex: 1 }}>
        <DraggableFlatList
          data={selectedExercises}
          onDragEnd={({ data }) => setSelectedExercises(data)}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderExerciseItem}
          ListHeaderComponent={
            <View style={styles.formContainer}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Titre *</Text>
                <TextInput
                  style={styles.input}
                  value={sessionTitle}
                  onChangeText={setSessionTitle}
                  placeholder="Ex: Séance offensive"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Objectif *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={objective}
                  onChangeText={setObjective}
                  placeholder="Objectif de la séance..."
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.label}>Durée (min) *</Text>
                  <TextInput
                    style={styles.input}
                    value={duration}
                    onChangeText={setDuration}
                    keyboardType="numeric"
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Heure</Text>
                  <TextInput
                    style={styles.input}
                    value={time}
                    onChangeText={setTime}
                    placeholder="18:00"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Structure</Text>
                <View style={styles.structureCard}>
                  <Text style={styles.subLabel}>Échauffement</Text>
                  <TextInput
                    style={styles.structureInput}
                    value={warmup}
                    onChangeText={setWarmup}
                    multiline
                  />
                  <Text style={styles.subLabel}>Fond principal</Text>
                  <TextInput
                    style={styles.structureInput}
                    value={mainContent}
                    onChangeText={setMainContent}
                    multiline
                  />
                  <Text style={styles.subLabel}>Retour au calme</Text>
                  <TextInput
                    style={styles.structureInput}
                    value={coolDown}
                    onChangeText={setCoolDown}
                    multiline
                  />
                </View>
              </View>

              <View style={styles.exercisesHeader}>
                <Text style={styles.label}>Exercices sélectionnés</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => setIsModalVisible(true)}
                >
                  <Icon name="plus" size={18} color="white" />
                  <Text style={styles.addButtonText}>Ajouter</Text>
                </TouchableOpacity>
              </View>

              {selectedExercises.length === 0 && (
                <View style={styles.emptyState}>
                  <Icon name="drag-variant" size={40} color="#d1d5db" />
                  <Text style={styles.emptyStateText}>Glissez les exercices ici</Text>
                </View>
              )}
            </View>
          }
          ListFooterComponent={<View style={{ height: 120 }} />}
          contentContainerStyle={styles.scrollContent}
        />
      </GestureHandlerRootView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.footerButton, styles.saveButton, loading && styles.disabledButton]}
          onPress={handleSaveSession}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Icon name="check" size={20} color="white" />
              <Text style={styles.footerButtonText}>Enregistrer</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.footerButton, styles.exportButton]}
          onPress={handleExportPDF}
        >
          <Icon name="file-pdf-box" size={20} color="white" />
          <Text style={styles.footerButtonText}>PDF</Text>
        </TouchableOpacity>
      </View>

      <ExerciseSelectionModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSelectExercise={(ex) => {
          setSelectedExercises([...selectedExercises, ex]);
          setIsModalVisible(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  formContainer: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  structureCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  subLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  structureInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    marginBottom: 12,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  exercisesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: '#f97316',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 5,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  exerciseDragHandle: {
    marginRight: 10,
  },
  exerciseContent: {
    flex: 1,
  },
  exerciseTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  exerciseDetails: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  exerciseDelete: {
    padding: 5,
  },
  emptyState: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  emptyStateText: {
    marginTop: 10,
    fontSize: 14,
    color: '#9ca3af',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 20,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: '#f97316',
    flex: 2,
  },
  exportButton: {
    backgroundColor: '#3b82f6',
  },
  footerButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default SessionCreationScreen;