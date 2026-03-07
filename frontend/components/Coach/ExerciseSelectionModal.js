import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Platform
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import ExerciseService from '../../services/exerciseService';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../config/theme';
import Button from '../UI/Button';
import Card from '../UI/Card';
import Input from '../UI/Input';

const ExerciseSelectionModal = ({ visible, onClose, onSelectExercise, onCreateNew }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchExercises(); // Initial fetch for search
    } else {
      // Reset state on close
      setSelectedCategory(null);
      setSelectedSubcategory(null);
      setSearchQuery('');
    }
  }, [visible]);

  // Exercise categories data
  const categories = [
    { id: 'shoot', name: 'Shoot', icon: 'basketball-hoop', color: '#FF5722' },
    { id: 'dribble', name: 'Maniement', icon: 'basketball', color: '#4CAF50' },
    { id: 'defense', name: 'Défense', icon: 'shield-check', color: '#2196F3' },
    { id: 'system', name: 'Tactique', icon: 'strategy', color: '#9C27B0' },
    { id: 'physical', name: 'Physique', icon: 'lightning-bolt', color: '#FFC107' },
    { id: 'mental', name: 'Mental', icon: 'brain', color: '#E91E63' }
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
    if (onCreateNew) onCreateNew();
  };

  const filteredExercises = exercises.filter(ex =>
    ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (ex.description && ex.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderContent = () => {
    // Top Priority: If user is searching, show results everywhere
    if (searchQuery.trim().length > 0) {
      return (
        <View style={{ flex: 1 }}>
          <FlatList
            data={filteredExercises}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ padding: SPACING.md }}
            renderItem={({ item }) => (
              <Card
                style={styles.exerciseListCard}
                padding="md"
                onPress={() => handleSelectExercise(item)}
              >
                <View style={styles.exInfo}>
                  <Text style={styles.exName}>{item.name}</Text>
                  <View style={styles.exMeta}>
                    <View style={styles.exMetaItem}>
                      <Icon name="clock-outline" size={14} color={COLORS.gray[400]} />
                      <Text style={styles.exMetaText}>{item.duration} min</Text>
                    </View>
                    <View style={styles.exMetaItem}>
                      <Icon name="account-group" size={14} color={COLORS.gray[400]} />
                      <Text style={styles.exMetaText}>
                        {item.players_min}-{item.players_max}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.addBtn}>
                  <Icon name="plus" size={20} color={COLORS.white} />
                </View>
              </Card>
            )}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Icon name="basket-outline" size={48} color={COLORS.gray[200]} />
                <Text style={styles.emptyTxt}>Aucun exercice trouvé</Text>
              </View>
            }
          />
        </View>
      );
    }

    if (!selectedCategory) {
      return (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{ padding: SPACING.md }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.categoryCard}
              onPress={() => handleSelectCategory(item)}
              activeOpacity={0.7}
            >
              <View style={[styles.categoryIconContainer, { backgroundColor: item.color + '15' }]}>
                <Icon name={item.icon} size={32} color={item.color} />
              </View>
              <Text style={styles.categoryNameText}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      );
    }

    if (!selectedSubcategory) {
      return (
        <View style={{ flex: 1 }}>
          <View style={styles.breadcrumb}>
            <TouchableOpacity onPress={() => setSelectedCategory(null)} style={styles.breadcrumbItem}>
              <Text style={styles.breadcrumbText}>Catégories</Text>
            </TouchableOpacity>
            <Icon name="chevron-right" size={16} color={COLORS.gray[300]} />
            <Text style={[styles.breadcrumbText, { color: COLORS.primary, fontWeight: '700' }]}>
              {selectedCategory.name}
            </Text>
          </View>
          <FlatList
            data={subcategoriesMap[selectedCategory.id] || []}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: SPACING.md }}
            renderItem={({ item }) => (
              <Card
                style={styles.listCard}
                padding="lg"
                onPress={() => handleSelectSubcategory(item)}
              >
                <Text style={styles.listCardTitle}>{item.name}</Text>
                <Icon name="chevron-right" size={20} color={COLORS.gray[300]} />
              </Card>
            )}
          />
        </View>
      );
    }

    return (
      <View style={{ flex: 1 }}>
        <View style={styles.breadcrumb}>
          <TouchableOpacity onPress={() => setSelectedCategory(null)} style={styles.breadcrumbItem}>
            <Text style={styles.breadcrumbText}>Catégories</Text>
          </TouchableOpacity>
          <Icon name="chevron-right" size={16} color={COLORS.gray[300]} />
          <TouchableOpacity onPress={() => setSelectedSubcategory(null)} style={styles.breadcrumbItem}>
            <Text style={styles.breadcrumbText}>{selectedCategory.name}</Text>
          </TouchableOpacity>
          <Icon name="chevron-right" size={16} color={COLORS.gray[300]} />
          <Text style={[styles.breadcrumbText, { color: COLORS.primary, fontWeight: '700' }]}>
            {selectedSubcategory.name}
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={filteredExercises}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ padding: SPACING.md }}
            renderItem={({ item }) => (
              <Card
                style={styles.exerciseListCard}
                padding="md"
                onPress={() => handleSelectExercise(item)}
              >
                <View style={styles.exInfo}>
                  <Text style={styles.exName}>{item.name}</Text>
                  <View style={styles.exMeta}>
                    <View style={styles.exMetaItem}>
                      <Icon name="clock-outline" size={14} color={COLORS.gray[400]} />
                      <Text style={styles.exMetaText}>{item.duration} min</Text>
                    </View>
                    <View style={styles.exMetaItem}>
                      <Icon name="account-group" size={14} color={COLORS.gray[400]} />
                      <Text style={styles.exMetaText}>
                        {item.players_min}-{item.players_max}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.addBtn}>
                  <Icon name="plus" size={20} color={COLORS.white} />
                </View>
              </Card>
            )}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Icon name="basket-outline" size={48} color={COLORS.gray[200]} />
                <Text style={styles.emptyTxt}>Aucun exercice dans cette catégorie</Text>
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
      <View style={styles.modalBg}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Ajouter un exercice</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Icon name="close" size={24} color={COLORS.gray[400]} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchBar}>
            <Icon name="magnify" size={20} color={COLORS.primary} style={styles.searchBarIcon} />
            <TextInput
              style={styles.searchInputCustom}
              placeholder="Rechercher un exercice..."
              placeholderTextColor={COLORS.gray[400]}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {Boolean(searchQuery) && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.searchBarClear}>
                <Icon name="close-circle" size={16} color={COLORS.gray[400]} />
              </TouchableOpacity>
            )}
          </View>

          <View style={{ flex: 1 }}>
            {renderContent()}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end'
  },
  modalSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: '92%',
    ...SHADOWS.lg
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[50]
  },
  modalTitle: {
    ...TYPOGRAPHY.h3,
    fontSize: 20,
    color: COLORS.gray[900]
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.gray[50],
    alignItems: 'center',
    justifyContent: 'center'
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.gray[100],
    paddingLeft: 20,
    paddingRight: 8,
    height: 48,
  },
  searchBarIcon: {
    marginRight: 8,
  },
  searchBarClear: {
    padding: 8,
  },
  searchInputCustom: {
    flex: 1,
    fontSize: 14,
    color: COLORS.gray[900],
    height: '100%',
  },
  categoryCard: {
    flex: 1,
    aspectRatio: 1,
    margin: 8,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray[50],
    ...SHADOWS.sm
  },
  categoryIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  categoryNameText: {
    ...TYPOGRAPHY.label,
    fontSize: 13,
    color: COLORS.gray[800],
    textAlign: 'center'
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingHorizontal: 24,
    backgroundColor: COLORS.gray[50],
    gap: 10
  },
  breadcrumbItem: {
    paddingVertical: 4
  },
  breadcrumbText: {
    ...TYPOGRAPHY.label,
    fontSize: 12,
    color: COLORS.gray[400]
  },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    ...SHADOWS.xs
  },
  listCardTitle: {
    ...TYPOGRAPHY.body,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.gray[800]
  },
  exerciseListCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    ...SHADOWS.sm
  },
  exInfo: {
    flex: 1
  },
  exName: {
    ...TYPOGRAPHY.h4,
    fontSize: 16,
    color: COLORS.gray[900],
    marginBottom: 6
  },
  exMeta: {
    flexDirection: 'row',
    gap: 12
  },
  exMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  exMetaText: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.gray[400]
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: COLORS.gray[900],
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm
  },
  bottomActions: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 44 : 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[50],
    backgroundColor: COLORS.white
  },
  customForm: {
    padding: 24
  },
  formBack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24
  },
  formBackText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.gray[400],
    fontWeight: '700'
  },
  formHeader: {
    ...TYPOGRAPHY.h2,
    fontSize: 24,
    color: COLORS.gray[900],
    marginBottom: 32
  },
  emptyBox: {
    alignItems: 'center',
    padding: 80
  },
  emptyTxt: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.gray[300],
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center'
  }
});

export default ExerciseSelectionModal;