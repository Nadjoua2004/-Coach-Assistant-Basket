import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  Modal,
  FlatList,
  SectionList,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ExerciseSelectionModal from './ExerciseSelectionModal';
const { width, height } = Dimensions.get('window');
import SessionService from '../../services/sessionService';
const SessionCreationScreen = ({ onBack, onSaveSession }) => {
  const [sessionTitle, setSessionTitle] = useState('');
  const [objective, setObjective] = useState('');
  const [totalDuration, setTotalDuration] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('18:00');
  const [location, setLocation] = useState('Salle Principale');
  const [warmup, setWarmup] = useState('');
  const [mainContent, setMainContent] = useState('');
  const [cooldown, setCooldown] = useState('');
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSaveSession = async () => {
    if (!sessionTitle || !objective || !totalDuration) {
      Alert.alert('Erreur', 'Veuillez remplir les champs obligatoires');
      return;
    }

    setLoading(true);
    try {
      const sessionData = {
        title: sessionTitle,
        objective,
        total_duration: parseInt(totalDuration),
        warmup,
        main_content: mainContent,
        cooldown,
        exercises: selectedExercises.map(ex => ex.id),
        date,
        time,
        lieu: location,
        status: 'planifiée'
      };

      const response = await SessionService.createSession(sessionData);

      if (response.success) {
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

  const handleExportPDF = () => {
    // PDF export logic
    Alert.alert('Export PDF', 'PDF exporté avec succès');
  };

  const handleToggleOffline = () => {
    // Toggle offline availability
    Alert.alert('Offline', 'Disponibilité hors ligne modifiée');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
          >
            <Icon name="arrow-left" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Créer une séance</Text>
          <View style={{ width: 40 }} />
        </View>
        {/* Basic Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations de base</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Titre de la séance *</Text>
            <TextInput
              style={styles.input}
              value={sessionTitle}
              onChangeText={setSessionTitle}
              placeholder="Ex: Entraînement offensif"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Objectif principal *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={objective}
              onChangeText={setObjective}
              placeholder="Décrivez l'objectif de cette séance..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Durée totale (minutes) *</Text>
            <TextInput
              style={styles.input}
              value={totalDuration}
              onChangeText={setTotalDuration}
              placeholder="120"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Date (YYYY-MM-DD) *</Text>
            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholder="2024-01-25"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Heure (HH:MM) *</Text>
            <TextInput
              style={styles.input}
              value={time}
              onChangeText={setTime}
              placeholder="18:00"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Lieu *</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="Salle Principale"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        {/* Session Structure Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Structure de la séance</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Échauffement</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={warmup}
              onChangeText={setWarmup}
              placeholder="Description de l'échauffement..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={2}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Fond principal</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={mainContent}
              onChangeText={setMainContent}
              placeholder="Contenu principal de la séance..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Fin de séance</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={cooldown}
              onChangeText={setCooldown}
              placeholder="Retour au calme et débriefing..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={2}
            />
          </View>
        </View>

        {/* Exercises Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Exercices</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowExerciseModal(true)}
            >
              <Icon name="plus" size={20} color="white" />
              <Text style={styles.addButtonText}>Ajouter</Text>
            </TouchableOpacity>
          </View>

          {selectedExercises.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="clipboard-text-outline" size={48} color="#d1d5db" />
              <Text style={styles.emptyStateText}>Aucun exercice ajouté</Text>
              <Text style={styles.emptyStateSubtext}>
                Cliquez sur "Ajouter" pour sélectionner des exercices
              </Text>
            </View>
          ) : (
            <View style={styles.exercisesList}>
              {selectedExercises.map((exercise, index) => (
                <ExerciseItem
                  key={exercise.id}
                  exercise={exercise}
                  index={index}
                  onDrag={() => {/* Drag logic */ }}
                />
              ))}
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.saveButton, loading && styles.disabledButton]}
            onPress={handleSaveSession}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Icon name="content-save" size={20} color="white" />
                <Text style={styles.actionButtonText}>Enregistrer</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.exportButton]}
            onPress={handleExportPDF}
          >
            <Icon name="file-pdf-box" size={20} color="white" />
            <Text style={styles.actionButtonText}>Export PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.offlineButton]}
            onPress={handleToggleOffline}
          >
            <Icon name="download" size={20} color="white" />
            <Text style={styles.actionButtonText}>Hors ligne</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Exercise Selection Modal */}
      <ExerciseSelectionModal
        visible={showExerciseModal}
        onClose={() => setShowExerciseModal(false)}
        onSelectExercise={(exercise) => {
          setSelectedExercises([...selectedExercises, exercise]);
          setShowExerciseModal(false);
        }}
      />
    </View>
  );
};

// Exercise Item Component
const ExerciseItem = ({ exercise, index, onDrag }) => (
  <TouchableOpacity style={styles.exerciseItem}>
    <View style={styles.exerciseDragHandle}>
      <Icon name="drag-vertical" size={20} color="#9ca3af" />
    </View>
    <View style={styles.exerciseContent}>
      <Text style={styles.exerciseTitle}>{exercise.name}</Text>
      <Text style={styles.exerciseDetails}>
        {exercise.duration}min • {exercise.playersMin}-{exercise.playersMax} joueurs
      </Text>
      {exercise.equipment && (
        <Text style={styles.exerciseEquipment}>
          <Icon name="toolbox-outline" size={12} color="#6b7280" /> {exercise.equipment}
        </Text>
      )}
    </View>
    <TouchableOpacity style={styles.exerciseDelete}>
      <Icon name="delete-outline" size={20} color="#ef4444" />
    </TouchableOpacity>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff7ed',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 25,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  section: {
    backgroundColor: 'white',
    marginTop: 16,
    padding: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: 'white',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#f97316',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'center',
  },
  exercisesList: {
    marginTop: 8,
  },
  exerciseItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  exerciseDragHandle: {
    paddingRight: 12,
  },
  exerciseContent: {
    flex: 1,
  },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  exerciseDetails: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  exerciseEquipment: {
    fontSize: 12,
    color: '#6b7280',
  },
  exerciseDelete: {
    padding: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  saveButton: {
    backgroundColor: '#f97316',
  },
  exportButton: {
    backgroundColor: '#3b82f6',
  },
  offlineButton: {
    backgroundColor: '#10b981',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
});

export default SessionCreationScreen;