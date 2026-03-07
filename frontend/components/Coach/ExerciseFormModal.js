import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import ExerciseService from '../../services/exerciseService';
import VideoService from '../../services/videoService';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../config/theme';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Card from '../UI/Card';

const ExerciseFormModal = ({ visible, onClose, onSuccess, exercise, editMode }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'shoot',
        subcategory: '',
        duration: '',
        players_min: '1',
        players_max: '12',
        equipment: '',
        video_id: null
    });
    const [videos, setVideos] = useState([]);
    const [errors, setErrors] = useState({});

    const categories = [
        { id: 'shoot', label: 'Shoot', icon: 'basketball-hoop' },
        { id: 'dribble', label: 'Dribble', icon: 'basketball' },
        { id: 'defense', label: 'Défense', icon: 'shield-check' },
        { id: 'system', label: 'Tactique', icon: 'strategy' },
        { id: 'physical', label: 'Physique', icon: 'lightning-bolt' },
        { id: 'mental', label: 'Mental', icon: 'brain' }
    ];

    const subcategories = {
        shoot: [
            { id: 'catch_shoot', label: 'Catch & Shoot' },
            { id: 'free_throw', label: 'Lancers francs' },
            { id: 'runner', label: 'Pénétrations' }
        ],
        dribble: [
            { id: 'ball_handling', label: 'Maniement' },
            { id: 'crossover', label: 'Crossover' }
        ],
        defense: [
            { id: 'individual', label: '1 contre 1' },
            { id: 'help', label: 'Aide défensive' },
            { id: 'system', label: 'Zone / Presse' }
        ],
        system: [
            { id: 'offense', label: 'Attaque' },
            { id: 'defense', label: 'Défense Co' },
            { id: 'transition', label: 'Contre-attaque' }
        ]
    };

    useEffect(() => {
        if (editMode && exercise) {
            setFormData({
                name: exercise.name || '',
                description: exercise.description || '',
                category: exercise.category || 'shoot',
                subcategory: exercise.subcategory || '',
                duration: exercise.duration?.toString() || '',
                players_min: exercise.players_min?.toString() || '1',
                players_max: exercise.players_max?.toString() || '12',
                equipment: exercise.equipment || '',
                video_id: exercise.video_id || null
            });
        } else {
            resetForm();
        }
        fetchVideos();
    }, [editMode, exercise, visible]);

    const fetchVideos = async () => {
        try {
            const response = await VideoService.getAllVideos();
            if (response.success) {
                setVideos(response.data);
            }
        } catch (error) {
            console.error('Error fetching videos:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            category: 'shoot',
            subcategory: '',
            duration: '',
            players_min: '1',
            players_max: '12',
            equipment: '',
            video_id: null
        });
        setErrors({});
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const handleCategoryChange = (categoryId) => {
        setFormData(prev => ({
            ...prev,
            category: categoryId,
            subcategory: ''
        }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Le nom est requis';
        if (!formData.category) newErrors.category = 'La catégorie est requise';
        if (formData.duration && isNaN(parseInt(formData.duration))) newErrors.duration = 'Doit être un nombre';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        try {
            setLoading(true);
            const { video_id, ...dataWithoutVideo } = formData;
            const submitData = {
                ...dataWithoutVideo,
                duration: formData.duration ? parseInt(formData.duration) : null,
                players_min: formData.players_min ? parseInt(formData.players_min) : 1,
                players_max: formData.players_max ? parseInt(formData.players_max) : 12,
            };

            const response = editMode
                ? await ExerciseService.updateExercise(exercise.id, submitData)
                : await ExerciseService.createExercise(submitData);

            if (response.success) {
                resetForm();
                if (onSuccess) onSuccess(response.data);
            } else {
                Alert.alert('Erreur', response.message || 'Une erreur est survenue');
            }
        } catch (error) {
            console.error('Error saving exercise:', error);
            Alert.alert('Erreur', 'Impossible de sauvegarder');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            resetForm();
            onClose();
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={false}
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior="padding"
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
            >
                <View style={styles.container}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={handleClose} disabled={loading} style={styles.headerAction}>
                            <Icon name="close" size={24} color={COLORS.gray[900]} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>
                            {editMode ? 'Modifier' : 'Nouvel Exercice'}
                        </Text>
                        <TouchableOpacity onPress={handleSubmit} disabled={loading} style={styles.saveBtn}>
                            {loading ? (
                                <ActivityIndicator size="small" color={COLORS.white} />
                            ) : (
                                <Text style={styles.saveBtnText}>{editMode ? 'MODIFIER' : 'CRÉER'}</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        style={styles.content}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        keyboardDismissMode="interactive"
                    >
                        <Card style={styles.sectionCard} padding="lg">
                            <Input
                                label="NOM DE L'EXERCICE *"
                                value={formData.name}
                                onChangeText={(value) => handleInputChange('name', value)}
                                placeholder="Ex: Shooting Fondamental"
                                error={errors.name}
                                icon="basketball-hoop-outline"
                            />

                            <Text style={styles.fieldLabel}>CATÉGORIE *</Text>
                            <View style={styles.categoryGrid}>
                                {categories.map(cat => (
                                    <TouchableOpacity
                                        key={cat.id}
                                        style={[
                                            styles.catButton,
                                            formData.category === cat.id && styles.catButtonActive
                                        ]}
                                        onPress={() => handleCategoryChange(cat.id)}
                                    >
                                        <View style={[
                                            styles.catIconBox,
                                            formData.category === cat.id && styles.catIconBoxActive
                                        ]}>
                                            <Icon
                                                name={cat.icon}
                                                size={22}
                                                color={formData.category === cat.id ? COLORS.white : COLORS.gray[400]}
                                            />
                                        </View>
                                        <Text style={[
                                            styles.catText,
                                            formData.category === cat.id && styles.catTextActive
                                        ]}>
                                            {cat.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {subcategories[formData.category] && (
                                <View style={{ marginTop: 20 }}>
                                    <Text style={styles.fieldLabel}>SOUS-CATÉGORIE</Text>
                                    <View style={styles.subGrid}>
                                        {subcategories[formData.category].map(sub => (
                                            <TouchableOpacity
                                                key={sub.id}
                                                style={[
                                                    styles.subChip,
                                                    formData.subcategory === sub.id && styles.subChipActive
                                                ]}
                                                onPress={() => handleInputChange('subcategory', sub.id)}
                                            >
                                                <Text style={[
                                                    styles.subChipText,
                                                    formData.subcategory === sub.id && styles.subChipTextActive
                                                ]}>
                                                    {sub.label}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            )}
                        </Card>

                        <Card style={styles.sectionCard} padding="lg">
                            <Input
                                label="DESCRIPTION"
                                value={formData.description}
                                onChangeText={(value) => handleInputChange('description', value)}
                                placeholder="Détails de l'exercice..."
                                multiline
                                numberOfLines={3}
                                icon="text-subject"
                            />
                        </Card>

                        <Card style={styles.sectionCard} padding="lg">
                            <View style={styles.row}>
                                <View style={{ flex: 1, marginRight: 12 }}>
                                    <Input
                                        label="DURÉE (MIN)"
                                        value={formData.duration}
                                        onChangeText={(value) => handleInputChange('duration', value)}
                                        placeholder="15"
                                        keyboardType="numeric"
                                        error={errors.duration}
                                        icon="timer-outline"
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Input
                                        label="MATÉRIEL"
                                        value={formData.equipment}
                                        onChangeText={(value) => handleInputChange('equipment', value)}
                                        placeholder="Plots, ballons..."
                                        icon="hammer-wrench"
                                    />
                                </View>
                            </View>
                            <View style={styles.row}>
                                <View style={{ flex: 1, marginRight: 12 }}>
                                    <Input
                                        label="JOUEURS MIN"
                                        value={formData.players_min}
                                        onChangeText={(value) => handleInputChange('players_min', value)}
                                        placeholder="1"
                                        keyboardType="numeric"
                                        icon="account"
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Input
                                        label="JOUEURS MAX"
                                        value={formData.players_max}
                                        onChangeText={(value) => handleInputChange('players_max', value)}
                                        placeholder="12"
                                        keyboardType="numeric"
                                        icon="account-group"
                                    />
                                </View>
                            </View>

                            {/* VIDEO SELECTION */}
                            <Text style={[styles.fieldLabel, { marginTop: 24 }]}>VIDÉO ASSOCIÉE (OPTIONNEL)</Text>
                            {videos.length > 0 ? (
                                <View style={{ gap: 12, marginTop: 8 }}>
                                    <TouchableOpacity
                                        style={[
                                            styles.videoCard,
                                            formData.video_id === null && styles.videoCardActive
                                        ]}
                                        onPress={() => handleInputChange('video_id', null)}
                                    >
                                        <View style={styles.videoCardContent}>
                                            <Icon
                                                name="close-circle-outline"
                                                size={24}
                                                color={formData.video_id === null ? COLORS.white : COLORS.gray[400]}
                                            />
                                            <View style={{ marginLeft: 12 }}>
                                                <Text style={[
                                                    styles.videoCardTitle,
                                                    formData.video_id === null && styles.videoCardTitleActive
                                                ]}>
                                                    Aucune vidéo
                                                </Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>

                                    {videos.map(video => (
                                        <TouchableOpacity
                                            key={video.id}
                                            style={[
                                                styles.videoCard,
                                                formData.video_id === video.id && styles.videoCardActive
                                            ]}
                                            onPress={() => handleInputChange('video_id', video.id)}
                                        >
                                            <View style={styles.videoCardContent}>
                                                <View style={[
                                                    styles.videoIconBox,
                                                    formData.video_id === video.id && styles.videoIconBoxActive
                                                ]}>
                                                    <Icon
                                                        name="play-circle"
                                                        size={28}
                                                        color={formData.video_id === video.id ? COLORS.white : COLORS.primary}
                                                    />
                                                </View>
                                                <View style={{ marginLeft: 12, flex: 1 }}>
                                                    <Text style={[
                                                        styles.videoCardTitle,
                                                        formData.video_id === video.id && styles.videoCardTitleActive
                                                    ]} numberOfLines={2}>
                                                        {video.title}
                                                    </Text>
                                                    {Boolean(video.description) && (
                                                        <Text style={[
                                                            styles.videoCardDesc,
                                                            formData.video_id === video.id && styles.videoCardDescActive
                                                        ]} numberOfLines={1}>
                                                            {video.description}
                                                        </Text>
                                                    )}
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            ) : (
                                <Text style={{ ...TYPOGRAPHY.bodySmall, color: COLORS.gray[400], fontStyle: 'italic' }}>
                                    Aucune vidéo disponible dans la bibliothèque. Demandez à un admin d'en ajouter.
                                </Text>
                            )}
                        </Card>
                        <View style={{ height: 100 }} />
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
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
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingTop: Platform.OS === 'ios' ? 60 : 20,
        paddingBottom: SPACING.md,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[100],
        ...SHADOWS.sm
    },
    headerAction: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        marginLeft: -10
    },
    headerTitle: {
        ...TYPOGRAPHY.h3,
        color: COLORS.gray[900]
    },
    saveBtn: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
        ...SHADOWS.sm
    },
    saveBtnText: {
        color: COLORS.white,
        ...TYPOGRAPHY.label,
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 0.5
    },
    content: {
        flex: 1,
        padding: SPACING.lg
    },
    sectionCard: {
        marginBottom: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.gray[50],
        ...SHADOWS.xs
    },
    fieldLabel: {
        ...TYPOGRAPHY.label,
        fontSize: 11,
        color: COLORS.gray[400],
        marginBottom: 16,
        marginTop: 8,
        letterSpacing: 1,
        textTransform: 'uppercase'
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12
    },
    catButton: {
        width: '30%',
        aspectRatio: 1,
        backgroundColor: COLORS.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.gray[50],
        justifyContent: 'center',
        alignItems: 'center',
        padding: 8,
        ...SHADOWS.xs
    },
    catButtonActive: {
        backgroundColor: COLORS.gray[900],
        borderColor: COLORS.gray[900]
    },
    catIconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: COLORS.gray[50],
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8
    },
    catIconBoxActive: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)'
    },
    catText: {
        ...TYPOGRAPHY.label,
        fontSize: 10,
        color: COLORS.gray[500],
        textAlign: 'center'
    },
    catTextActive: {
        color: COLORS.white
    },
    subGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8
    },
    subChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: COLORS.gray[50],
        borderWidth: 1,
        borderColor: COLORS.gray[100]
    },
    subChipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary
    },
    subChipText: {
        ...TYPOGRAPHY.bodySmall,
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.gray[600]
    },
    subChipTextActive: {
        color: COLORS.white
    },
    row: {
        flexDirection: 'row',
        marginBottom: 4
    },
    videoCard: {
        backgroundColor: COLORS.gray[50],
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.gray[100]
    },
    videoCardActive: {
        backgroundColor: COLORS.gray[900],
        borderColor: COLORS.gray[900]
    },
    videoCardContent: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    videoIconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: COLORS.primary + '15',
        justifyContent: 'center',
        alignItems: 'center'
    },
    videoIconBoxActive: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)'
    },
    videoCardTitle: {
        ...TYPOGRAPHY.label,
        fontSize: 14,
        color: COLORS.gray[800],
        marginBottom: 4
    },
    videoCardTitleActive: {
        color: COLORS.white
    },
    videoCardDesc: {
        ...TYPOGRAPHY.bodySmall,
        fontSize: 12,
        color: COLORS.gray[500]
    },
    videoCardDescActive: {
        color: COLORS.gray[300]
    }
});

export default ExerciseFormModal;
