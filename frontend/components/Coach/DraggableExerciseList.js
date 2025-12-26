// components/DraggableExerciseList.js
import React from 'react';
import DraggableFlatList from 'react-native-draggable-flatlist';

const DraggableExerciseList = ({ exercises, setExercises }) => {
  const renderItem = ({ item, drag, isActive }) => (
    <TouchableOpacity 
      style={[
        styles.exerciseItem,
        isActive && styles.activeItem
      ]}
      onLongPress={drag}
      delayLongPress={200}
    >
      <View style={styles.exerciseDragHandle}>
        <Icon name="drag-vertical" size={20} color="#9ca3af" />
      </View>
      <View style={styles.exerciseContent}>
        <Text style={styles.exerciseTitle}>{item.name}</Text>
        <Text style={styles.exerciseDuration}>{item.duration} min</Text>
      </View>
      <TouchableOpacity 
        style={styles.exerciseDelete}
        onPress={() => handleDeleteExercise(item.id)}
      >
        <Icon name="delete-outline" size={20} color="#ef4444" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <DraggableFlatList
      data={exercises}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      onDragEnd={({ data }) => setExercises(data)}
    />
  );
};