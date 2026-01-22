import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import ExerciseService from '../../services/exerciseService';

const ExerciseSelectionModal = ({ visible, onClose, onSelectExercise }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCustomExercise, setShowCustomExercise] = useState(false);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);

  // Exercise categories data
  const categories = [
    { id: 'shoot', name: 'Shoot', icon: 'basketball-hoop' },
    { id: 'dribble', name: 'Maniement de balle', icon: 'basketball' },
    { id: 'defense', name: 'Défense', icon: 'shield' },
    { id: 'system', name: 'Systèmes / Tactique', icon: 'sitemap' },
    { id: 'physical', name: 'Physique', icon: 'dumbbell' },
    { id: 'mental', name: 'Mental', icon: 'brain' }
  ];

  // Subcategories mapping
  const subcategoriesMap = {
    shoot: [
      { id: 'catch_shoot', name: 'Catch & Shoot' },
      { id: 'free_throw', name: 'Lancer-franc' },
      { id: 'runner', name: 'Runner / Layup' },
      { id: 'post_up', name: 'Jeu au poste' }
    ],
    dribble: [
      { id: 'ball_handling', name: 'Ball Handling' },
      { id: 'crossover', name: 'Crossover' },
      { id: 'speed_dribble', name: 'Dribble de vitesse' }
    ],
    defense: [
      { id: 'individual', name: 'Individuelle' },
      { id: 'help', name: 'Aide défensive' },
      { id: 'system', name: 'Défense de zone / système' }
    ],
    system: [
      { id: 'offense', name: 'Attaque' },
      { id: 'defense', name: 'Défense collective' },
      { id: 'transition', name: 'Contre-attaque' }
    ],
    physical: [
      { id: 'conditioning', name: 'Cardio / Condition physique' },
      { id: 'strength', name: 'Renforcement musculaire' },
      { id: 'agility', name: 'Agilité / Vitesse' }
    ],
    mental: [
      { id: 'visualization', name: 'Visualisation' },
      { id: 'focus', name: 'Concentration' }
    ]
  };

  const fetchExercises = async (category = null, subcategory = null) => {
    try {
      setLoading(true);
      const filters = {};
      if (category) filters.category = category;
      if (subcategory) filters.subcategory = subcategory;

      const response = await ExerciseService.getAllExercises(filters);
      if (response.success) {
        setExercises(response.data);
      }
    } catch (error) {
      console.error('Error fetching exercises:', error);
      Alert.alert('Erreur', 'Impossible de charger les exercices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible && !selectedCategory) {
      // Initial state
    }
  }, [visible]);

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null);
  };

  const handleSelectSubcategory = (subcategory) => {
    setSelectedSubcategory(subcategory);
    fetchExercises(selectedCategory.id, subcategory.id);
  };

  const handleSelectExercise = (exercise) => {
    onSelectExercise(exercise);
  };

  const handleCreateCustomExercise = () => {
    setShowCustomExercise(true);
  };

  const filteredExercises = exercises.filter(ex =>
    ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (ex.description && ex.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderContent = () => {
    if (showCustomExercise) {
      return (
        <CustomExerciseForm
          onSave={async (exerciseData, videoFile) => {
            try {
              const response = await ExerciseService.createExercise(exerciseData, videoFile);
              if (response.success) {
                onSelectExercise(response.data);
                onClose();
              }
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de créer l\'exercice');
            }
          }}
          onCancel={() => setShowCustomExercise(false)}
        />
      );
    }

    // Step 1: Select Category
    if (!selectedCategory) {
      return (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.categoryItem}
              onPress={() => handleSelectCategory(item)}
            >
              <View style={styles.categoryIcon}>
                <Icon name={item.icon} size={24} color="#f97316" />
              </View>
              <Text style={styles.categoryName}>{item.name}</Text>
              <Icon name="chevron-right" size={20} color="#d1d5db" />
            </TouchableOpacity>
          )}
        />
      );
    }

    // Step 2: Select Subcategory
    if (!selectedSubcategory) {
      return (
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedCategory(null)}
          >
            <Icon name="arrow-left" size={20} color="#6b7280" />
            <Text style={styles.backButtonText}>{selectedCategory.name}</Text>
          </TouchableOpacity>
          <FlatList
            data={subcategoriesMap[selectedCategory.id] || []}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.categoryItem}
                onPress={() => handleSelectSubcategory(item)}
              >
                <Text style={styles.categoryName}>{item.name}</Text>
                <Icon name="chevron-right" size={20} color="#d1d5db" />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyExercises}>
                <Text style={styles.emptyText}>Aucune sous-catégorie trouvée</Text>
              </View>
            }
          />
        </View>
      );
    }

    // Step 3: Select Exercise
    return (
      <View style={{ flex: 1 }}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setSelectedSubcategory(null)}
        >
          <Icon name="arrow-left" size={20} color="#6b7280" />
          <Text style={styles.backButtonText}>{selectedSubcategory.name}</Text>
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator size="large" color="#f97316" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={filteredExercises}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.exerciseItem}
                onPress={() => handleSelectExercise(item)}
              >
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{item.name}</Text>
                  <View style={styles.exerciseDetails}>
                    <View style={styles.exerciseDetail}>
                      <Icon name="clock-outline" size={14} color="#6b7280" />
                      <Text style={styles.exerciseDetailText}>{item.duration} min</Text>
                    </View>
                    <View style={styles.exerciseDetail}>
                      <Icon name="account-group" size={14} color="#6b7280" />
                      <Text style={styles.exerciseDetailText}>
                        {item.players_min || item.playersMin}-{item.players_max || item.playersMax} joueurs
                      </Text>
                    </View>
                  </View>
                </View>
                <Icon name="plus-circle" size={24} color="#f97316" />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyExercises}>
                <Icon name="clipboard-text-outline" size={48} color="#d1d5db" />
                <Text style={styles.emptyText}>Aucun exercice trouvé</Text>
              </View>
            }
          />
        )}
      </View>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderLeft}>
              <Text style={styles.modalTitle}>Sélectionner un exercice</Text>
              <TouchableOpacity
                style={styles.manageButton}
                onPress={() => {
                  onClose();
                }}
              >
                <Icon name="cog" size={16} color="#f97316" />
                <Text style={styles.manageButtonText}>Gérer</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Icon name="magnify" size={20} color="#9ca3af" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un exercice..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={{ flex: 1, minHeight: 400 }}>
            {renderContent()}
          </View>

          <TouchableOpacity
            style={styles.customExerciseButton}
            onPress={handleCreateCustomExercise}
          >
            <Icon name="plus-circle-outline" size={20} color="#3b82f6" />
            <Text style={styles.customExerciseButtonText}>Ajouter mon propre exercice</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

// Custom Exercise Form Component
const CustomExerciseForm = ({ onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [playersMin, setPlayersMin] = useState('');
  const [playersMax, setPlayersMax] = useState('');
  const [equipment, setEquipment] = useState('');
  const [category, setCategory] = useState('');

  const handleSave = () => {
    if (!name || !duration) {
      Alert.alert('Erreur', 'Veuillez remplir les champs obligatoires');
      return;
    }

    onSave({
      name,
      description,
      duration: parseInt(duration),
      players_min: playersMin ? parseInt(playersMin) : 1,
      players_max: playersMax ? parseInt(playersMax) : 12,
      equipment,
      category: category || 'Personnalisé'
    });
  };

  return (
    <ScrollView style={styles.customForm}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={onCancel}
      >
        <Icon name="arrow-left" size={20} color="#6b7280" />
        <Text style={styles.backButtonText}>Retour</Text>
      </TouchableOpacity>

      <Text style={styles.formTitle}>Nouvel exercice</Text>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Nom de l'exercice *</Text>
        <TextInput
          style={styles.formInput}
          value={name}
          onChangeText={setName}
          placeholder="Ex: Shoot en mouvement"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Description</Text>
        <TextInput
          style={[styles.formInput, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Décrivez l'exercice..."
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.formRow}>
        <View style={[styles.formGroup, styles.halfInput]}>
          <Text style={styles.formLabel}>Durée (min) *</Text>
          <TextInput
            style={styles.formInput}
            value={duration}
            onChangeText={setDuration}
            placeholder="15"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Catégorie</Text>
          <TextInput
            style={styles.formInput}
            value={category}
            onChangeText={setCategory}
            placeholder="Ex: Shoot"
          />
        </View>
      </View>

      <View style={styles.formRow}>
        <View style={[styles.formGroup, styles.halfInput]}>
          <Text style={styles.formLabel}>Joueurs min</Text>
          <TextInput
            style={styles.formInput}
            value={playersMin}
            onChangeText={setPlayersMin}
            placeholder="1"
            keyboardType="numeric"
          />
        </View>

        <View style={[styles.formGroup, styles.halfInput]}>
          <Text style={styles.formLabel}>Joueurs max</Text>
          <TextInput
            style={styles.formInput}
            value={playersMax}
            onChangeText={setPlayersMax}
            placeholder="12"
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Matériel nécessaire</Text>
        <TextInput
          style={styles.formInput}
          value={equipment}
          onChangeText={setEquipment}
          placeholder="Ballons, plots, cerceaux..."
        />
      </View>

      <TouchableOpacity
        style={styles.formSaveButton}
        onPress={handleSave}
      >
        <Text style={styles.formSaveButtonText}>Enregistrer l'exercice</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '92%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff7ed',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 12,
    borderWidth: 1,
    borderColor: '#ffedd5',
  },
  manageButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f97316',
    marginLeft: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff7ed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryName: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backButtonText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 8,
  },
  subcategoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  subcategoryName: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  exerciseDetails: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  exerciseDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  exerciseDetailText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  exerciseEquipment: {
    fontSize: 12,
    color: '#6b7280',
  },
  emptyExercises: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 12,
  },
  customExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  customExerciseButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
    marginLeft: 8,
  },
  customForm: {
    padding: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  formSaveButton: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  formSaveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ExerciseSelectionModal;