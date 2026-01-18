import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
    Platform,
    Linking
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ExerciseDetailsModal = ({ visible, onClose, exercise, onEdit, onDelete }) => {
    if (!exercise) return null;

    const categoryIcons = {
        shoot: 'basketball',
        dribble: 'run',
        defense: 'shield',
        system: 'strategy',
        physical: 'dumbbell',
        mental: 'brain'
    };

    const categoryLabels = {
        shoot: 'Shoot',
        dribble: 'Conduite',
        defense: 'Défense',
        system: 'Système',
        physical: 'Physique',
        mental: 'Mental'
    };



    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={false}
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose}>
                        <Icon name="close" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Détails</Text>
                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            style={styles.headerButton}
                            onPress={() => onEdit(exercise)}
                        >
                            <Icon name="pencil" size={20} color="#4ECDC4" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.headerButton}
                            onPress={() => onDelete(exercise)}
                        >
                            <Icon name="delete" size={20} color="#FF6B35" />
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Exercise Name */}
                    <View style={styles.titleSection}>
                        <View style={styles.iconBadge}>
                            <Icon
                                name={categoryIcons[exercise.category] || 'dumbbell'}
                                size={32}
                                color="#FF6B35"
                            />
                        </View>
                        <Text style={styles.exerciseName}>{exercise.name}</Text>
                        <View style={styles.categoryBadge}>
                            <Text style={styles.categoryBadgeText}>
                                {categoryLabels[exercise.category] || exercise.category}
                            </Text>
                            {exercise.subcategory && (
                                <Text style={styles.subcategoryBadgeText}>
                                    • {exercise.subcategory}
                                </Text>
                            )}
                        </View>
                    </View>



                    {/* Description */}
                    {exercise.description && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>
                                <Icon name="text" size={18} color="#1A1A1A" /> Description
                            </Text>
                            <Text style={styles.descriptionText}>{exercise.description}</Text>
                        </View>
                    )}

                    {/* Details Grid */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            <Icon name="information" size={18} color="#1A1A1A" /> Informations
                        </Text>
                        <View style={styles.detailsGrid}>
                            {exercise.duration && (
                                <View style={styles.detailCard}>
                                    <Icon name="clock-outline" size={24} color="#4ECDC4" />
                                    <Text style={styles.detailValue}>{exercise.duration}</Text>
                                    <Text style={styles.detailLabel}>minutes</Text>
                                </View>
                            )}

                            {exercise.players_min && exercise.players_max && (
                                <View style={styles.detailCard}>
                                    <Icon name="account-group" size={24} color="#4ECDC4" />
                                    <Text style={styles.detailValue}>
                                        {exercise.players_min}-{exercise.players_max}
                                    </Text>
                                    <Text style={styles.detailLabel}>joueurs</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Equipment */}
                    {exercise.equipment && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>
                                <Icon name="basketball" size={18} color="#1A1A1A" /> Matériel nécessaire
                            </Text>
                            <View style={styles.equipmentContainer}>
                                <Icon name="checkbox-marked-circle" size={20} color="#4ECDC4" />
                                <Text style={styles.equipmentText}>{exercise.equipment}</Text>
                            </View>
                        </View>
                    )}

                    {/* Metadata */}
                    <View style={styles.metadataSection}>
                        {exercise.created_at && (
                            <View style={styles.metadataRow}>
                                <Icon name="calendar-plus" size={16} color="#999" />
                                <Text style={styles.metadataText}>
                                    Créé le {new Date(exercise.created_at).toLocaleDateString('fr-FR')}
                                </Text>
                            </View>
                        )}
                        {exercise.updated_at && exercise.updated_at !== exercise.created_at && (
                            <View style={styles.metadataRow}>
                                <Icon name="calendar-edit" size={16} color="#999" />
                                <Text style={styles.metadataText}>
                                    Modifié le {new Date(exercise.updated_at).toLocaleDateString('fr-FR')}
                                </Text>
                            </View>
                        )}
                    </View>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
        ...Platform.select({
            ios: {
                paddingTop: 50
            },
            android: {
                paddingTop: 20
            }
        })
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1A1A1A'
    },
    headerActions: {
        flexDirection: 'row'
    },
    headerButton: {
        padding: 8,
        marginLeft: 8
    },
    content: {
        flex: 1
    },
    titleSection: {
        alignItems: 'center',
        paddingVertical: 32,
        paddingHorizontal: 20,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5'
    },
    iconBadge: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#FFF7F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 2,
        borderColor: '#FF6B35'
    },
    exerciseName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A1A1A',
        textAlign: 'center',
        marginBottom: 12
    },
    categoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F0F0',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20
    },
    categoryBadgeText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666'
    },
    subcategoryBadgeText: {
        fontSize: 14,
        color: '#999',
        marginLeft: 4
    },
    section: {
        backgroundColor: '#FFF',
        marginTop: 16,
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#E5E5E5'
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 16
    },

    descriptionText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#666'
    },
    detailsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    detailCard: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#F5F7FA',
        paddingVertical: 20,
        paddingHorizontal: 16,
        marginHorizontal: 4,
        borderRadius: 12
    },
    detailValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginTop: 8
    },
    detailLabel: {
        fontSize: 12,
        color: '#999',
        marginTop: 4
    },
    equipmentContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#F5F7FA',
        padding: 16,
        borderRadius: 12
    },
    equipmentText: {
        flex: 1,
        fontSize: 16,
        color: '#666',
        marginLeft: 12,
        lineHeight: 22
    },
    metadataSection: {
        paddingHorizontal: 20,
        paddingVertical: 16
    },
    metadataRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8
    },
    metadataText: {
        fontSize: 12,
        color: '#999',
        marginLeft: 8
    }
});

export default ExerciseDetailsModal;
