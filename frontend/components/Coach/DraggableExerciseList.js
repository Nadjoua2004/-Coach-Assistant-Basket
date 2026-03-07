import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../config/theme';

const DraggableExerciseList = ({ exercises, onExercisesChange, onDeleteExercise }) => {
  const renderItem = ({ item, drag, isActive }) => (
    <ScaleDecorator>
      <TouchableOpacity
        style={[
          styles.exerciseItem,
          isActive && styles.activeItem
        ]}
        onLongPress={drag}
        delayLongPress={200}
        activeOpacity={0.9}
      >
        <View style={styles.exerciseDragHandle}>
          <Icon name="dots-vertical" size={24} color={COLORS.gray[300]} />
        </View>
        <View style={styles.exerciseContent}>
          <Text style={styles.exerciseTitle}>{item.name}</Text>
          <View style={styles.metaRow}>
            <Icon name="timer-outline" size={14} color={COLORS.gray[400]} />
            <Text style={styles.exerciseDuration}>{item.duration} min</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.exerciseDelete}
          onPress={() => onDeleteExercise(item.id)}
        >
          <View style={styles.deleteIconContainer}>
            <Icon name="close" size={18} color={COLORS.error} />
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </ScaleDecorator>
  );

  return (
    <DraggableFlatList
      data={exercises}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      onDragEnd={({ data }) => onExercisesChange(data)}
      contentContainerStyle={styles.listContainer}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: 20,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.gray[50],
    ...SHADOWS.sm,
  },
  activeItem: {
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
    paddingVertical: 14,
  },
  exerciseTitle: {
    ...TYPOGRAPHY.h4,
    fontSize: 15,
    color: COLORS.gray[900],
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  exerciseDuration: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray[400],
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
});

export default DraggableExerciseList;