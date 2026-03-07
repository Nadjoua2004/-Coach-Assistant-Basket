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
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../config/theme';
import Button from '../UI/Button';
import Card from '../UI/Card';

const ExerciseDetailsModal = ({ visible, onClose, exercise, onEdit, onDelete }) => {
    if (!exercise) return null;

    const categoryIcons = {
        shoot: 'basketball-hoop',
        dribble: 'basketball',
        defense: 'shield-check',
        system: 'strategy',
        physical: 'lightning-bolt',
        mental: 'brain'
    };

    const categoryLabels = {
        shoot: 'Lancers & Paniers',
        dribble: 'Maniement & Dribble',
        defense: 'Défense & Interceptions',
        system: 'Tactique & Systèmes',
        physical: 'Condition Physique',
        mental: 'Mental & Focus'
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={false}
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <Icon name="close" size={24} color={COLORS.gray[900]} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Détails Exercice</Text>
                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            style={[styles.headerAction, { backgroundColor: COLORS.info + '10' }]}
                            onPress={() => onEdit(exercise)}
                        >
                            <Icon name="pencil" size={20} color={COLORS.info} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.headerAction, { backgroundColor: COLORS.error + '10' }]}
                            onPress={() => onDelete(exercise)}
                        >
                            <Icon name="trash-can-outline" size={20} color={COLORS.error} />
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.heroSection}>
                        <View style={styles.iconContainer}>
                            <Icon
                                name={categoryIcons[exercise.category] || 'basketball'}
                                size={44}
                                color={COLORS.primary}
                            />
                        </View>
                        <Text style={styles.exerciseName}>{exercise.name}</Text>
                        <View style={styles.tagRow}>
                            <View style={styles.categoryTag}>
                                <Text style={styles.categoryTagText}>
                                    {categoryLabels[exercise.category] || exercise.category}
                                </Text>
                            </View>
                            {Boolean(exercise.subcategory) && (
                                <View style={styles.subcategoryTag}>
                                    <Text style={styles.subcategoryTagText}>
                                        {exercise.subcategory}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    <View style={styles.infoGrid}>
                        <Card style={styles.infoCard} padding="md">
                            <Icon name="clock-time-four-outline" size={24} color={COLORS.primary} />
                            <Text style={styles.infoValue}>{exercise.duration || '0'}</Text>
                            <Text style={styles.infoLabel}>Minutes</Text>
                        </Card>
                        <Card style={styles.infoCard} padding="md">
                            <Icon name="account-group" size={24} color={COLORS.primary} />
                            <Text style={styles.infoValue}>
                                {exercise.players_min || 0}-{exercise.players_max || 12}
                            </Text>
                            <Text style={styles.infoLabel}>Joueurs</Text>
                        </Card>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>DESCRIPTION</Text>
                        <Card style={styles.descCard} padding="lg">
                            <Text style={styles.descriptionText}>
                                {exercise.description || 'Aucune description fournie.'}
                            </Text>
                        </Card>
                    </View>

                    {Boolean(exercise.equipment) && (
                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>MATÉRIEL</Text>
                            <Card style={styles.equipmentCard} padding="md">
                                <View style={styles.equipmentIconBox}>
                                    <Icon name="hammer-wrench" size={20} color={COLORS.white} />
                                </View>
                                <Text style={styles.equipmentText}>{exercise.equipment}</Text>
                            </Card>
                        </View>
                    )}

                    <View style={styles.footerInfo}>
                        <Text style={styles.footerText}>
                            Ajouté le {new Date(exercise.created_at || Date.now()).toLocaleDateString('fr-FR')}
                        </Text>
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
        backgroundColor: COLORS.gray[50]
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingTop: Platform.OS === 'ios' ? 60 : 30,
        paddingBottom: 20,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[100],
        ...SHADOWS.sm
    },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: COLORS.gray[50],
        alignItems: 'center',
        justifyContent: 'center'
    },
    headerTitle: {
        flex: 1,
        marginLeft: 16,
        ...TYPOGRAPHY.h3,
        fontSize: 18,
        color: COLORS.gray[900]
    },
    headerActions: {
        flexDirection: 'row',
        gap: 10
    },
    headerAction: {
        width: 36,
        height: 36,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.xs
    },
    content: {
        flex: 1
    },
    heroSection: {
        alignItems: 'center',
        paddingVertical: 48,
        paddingHorizontal: SPACING.xl,
        backgroundColor: COLORS.white,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        ...SHADOWS.md
    },
    iconContainer: {
        width: 96,
        height: 96,
        borderRadius: 32,
        backgroundColor: COLORS.gray[50],
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: COLORS.gray[100]
    },
    exerciseName: {
        ...TYPOGRAPHY.h1,
        fontSize: 28,
        color: COLORS.gray[900],
        textAlign: 'center',
        marginBottom: 20
    },
    tagRow: {
        flexDirection: 'row',
        gap: 10,
        flexWrap: 'wrap',
        justifyContent: 'center'
    },
    categoryTag: {
        backgroundColor: COLORS.gray[900],
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 14
    },
    categoryTagText: {
        ...TYPOGRAPHY.label,
        fontSize: 11,
        color: COLORS.white,
        textTransform: 'uppercase',
        letterSpacing: 0.5
    },
    subcategoryTag: {
        backgroundColor: COLORS.primary + '10',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.primary + '20'
    },
    subcategoryTagText: {
        ...TYPOGRAPHY.label,
        fontSize: 11,
        color: COLORS.primary,
        textTransform: 'uppercase',
        letterSpacing: 0.5
    },
    infoGrid: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.lg,
        paddingTop: 32,
        paddingBottom: 24,
        gap: 16
    },
    infoCard: {
        flex: 1,
        alignItems: 'center',
        borderRadius: 24,
        backgroundColor: COLORS.white,
        paddingVertical: 20,
        ...SHADOWS.sm
    },
    infoValue: {
        ...TYPOGRAPHY.h2,
        fontSize: 24,
        color: COLORS.gray[900],
        marginTop: 10
    },
    infoLabel: {
        ...TYPOGRAPHY.label,
        color: COLORS.gray[400],
        fontSize: 10,
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginTop: 2
    },
    section: {
        paddingHorizontal: SPACING.lg,
        marginBottom: 24
    },
    sectionLabel: {
        ...TYPOGRAPHY.label,
        fontSize: 11,
        color: COLORS.gray[400],
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginLeft: 4,
        marginBottom: 12
    },
    descCard: {
        backgroundColor: COLORS.white,
        borderRadius: 24,
        ...SHADOWS.sm
    },
    descriptionText: {
        ...TYPOGRAPHY.body,
        fontSize: 15,
        color: COLORS.gray[700],
        lineHeight: 26
    },
    equipmentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 16,
        ...SHADOWS.sm
    },
    equipmentIconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: COLORS.gray[900],
        justifyContent: 'center',
        alignItems: 'center'
    },
    equipmentText: {
        flex: 1,
        ...TYPOGRAPHY.body,
        fontSize: 15,
        color: COLORS.gray[700],
        fontWeight: '700'
    },
    footerInfo: {
        alignItems: 'center',
        paddingVertical: 32
    },
    footerText: {
        ...TYPOGRAPHY.bodySmall,
        color: COLORS.gray[300],
        fontSize: 11,
        fontWeight: '600'
    }
});

export default ExerciseDetailsModal;
