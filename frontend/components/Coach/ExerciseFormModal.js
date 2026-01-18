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
    Platform
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ExerciseService from '../../services/exerciseService';
import VideoService from '../../services/videoService';

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
        equipment: ''
    });
    const [videoLibrary, setVideoLibrary] = useState([]);
    const [loadingLibrary, setLoadingLibrary] = useState(false);
    const [selectedVideoUrl, setSelectedVideoUrl] = useState(null);
    const [videoMode, setVideoMode] = useState('library'); // 'library' or 'upload'
    const [videoFile, setVideoFile] = useState(null);
    const [errors, setErrors] = useState({});

    const categories = [
        { id: 'shoot', label: 'Shoot', icon: 'basketball' },
        { id: 'dribble', label: 'Conduite', icon: 'run' },
        { id: 'defense', label: 'Défense', icon: 'shield' },
        { id: 'system', label: 'Système', icon: 'strategy' },
        { id: 'physical', label: 'Physique', icon: 'dumbbell' },
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
            { id: 'individual', label: 'Individuel' },
            { id: 'help', label: 'Aide défensive' },
            { id: 'system', label: 'Système' }
        ],
        system: [
            { id: 'offense', label: 'Attaque' },
            { id: 'defense', label: 'Défense' },
            { id: 'transition', label: 'Transition' }
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
                equipment: exercise.equipment || ''
            });
            setSelectedVideoUrl(exercise.video_url || null);
        } else {
            resetForm();
        }
        loadVideoLibrary();
    }, [editMode, exercise, visible]);

    const loadVideoLibrary = async () => {
        try {
            setLoadingLibrary(true);
            const response = await VideoService.getAllVideos();
            if (response.success) {
                setVideoLibrary(response.data || []);
            }
        } catch (error) {
            console.error('Error loading video library:', error);
        } finally {
            setLoadingLibrary(false);
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
            equipment: ''
        });
        setSelectedVideoUrl(null);
        setErrors({});
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const handleCategoryChange = (categoryId) => {
        setFormData(prev => ({
            ...prev,
            category: categoryId,
            subcategory: '' // Reset subcategory when category changes
        }));
    };

    const handleSelectVideo = (videoUrl) => {
        setSelectedVideoUrl(videoUrl === selectedVideoUrl ? null : videoUrl);
    };

    const handlePickVideo = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'video/*',
                copyToCacheDirectory: true
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setVideoFile(result.assets[0]);
            }
        } catch (err) {
            console.error('Error picking video:', err);
            Alert.alert('Erreur', 'Impossible de sélectionner la vidéo');
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Le nom est requis';
        }

        if (!formData.category) {
            newErrors.category = 'La catégorie est requise';
        }

        if (formData.duration && isNaN(parseInt(formData.duration))) {
            newErrors.duration = 'La durée doit être un nombre';
        }

        if (formData.players_min && isNaN(parseInt(formData.players_min))) {
            newErrors.players_min = 'Doit être un nombre';
        }

        if (formData.players_max && isNaN(parseInt(formData.players_max))) {
            newErrors.players_max = 'Doit être un nombre';
        }

        if (formData.players_min && formData.players_max) {
            const min = parseInt(formData.players_min);
            const max = parseInt(formData.players_max);
            if (min > max) {
                newErrors.players_max = 'Doit être >= minimum';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) {
            return;
        }

        try {
            setLoading(true);

            const submitData = {
                ...formData,
                duration: formData.duration ? parseInt(formData.duration) : null,
                players_min: parseInt(formData.players_min),
                players_max: parseInt(formData.players_max),
                video_url: videoMode === 'library' ? selectedVideoUrl : (exercise?.video_url || null)
            };

            let response;
            if (editMode && exercise) {
                response = await ExerciseService.updateExercise(
                    exercise.id,
                    submitData,
                    videoMode === 'upload' ? videoFile : null
                );
            } else {
                response = await ExerciseService.createExercise(
                    submitData,
                    videoMode === 'upload' ? videoFile : null
                );
            }

            if (response.success) {
                Alert.alert(
                    'Succès',
                    editMode ? 'Exercice modifié avec succès' : 'Exercice créé avec succès'
                );
                resetForm();
                onSuccess();
            } else {
                Alert.alert('Erreur', response.message || 'Une erreur est survenue');
            }
        } catch (error) {
            console.error('Error saving exercise:', error);
            Alert.alert('Erreur', 'Impossible de sauvegarder l\'exercice');
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
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleClose} disabled={loading}>
                        <Icon name="close" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>
                        {editMode ? 'Modifier l\'exercice' : 'Nouvel exercice'}
                    </Text>
                    <TouchableOpacity onPress={handleSubmit} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator size="small" color="#FF6B35" />
                        ) : (
                            <Icon name="check" size={24} color="#4ECDC4" />
                        )}
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Name */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            Nom de l'exercice <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={[styles.input, errors.name && styles.inputError]}
                            value={formData.name}
                            onChangeText={(value) => handleInputChange('name', value)}
                            placeholder="Ex: Shoot à 3 points"
                            placeholderTextColor="#999"
                        />
                        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                    </View>

                    {/* Category */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            Catégorie <Text style={styles.required}>*</Text>
                        </Text>
                        <View style={styles.categoryGrid}>
                            {categories.map(cat => (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[
                                        styles.categoryCard,
                                        formData.category === cat.id && styles.categoryCardActive
                                    ]}
                                    onPress={() => handleCategoryChange(cat.id)}
                                >
                                    <Icon
                                        name={cat.icon}
                                        size={24}
                                        color={formData.category === cat.id ? '#FFF' : '#666'}
                                    />
                                    <Text
                                        style={[
                                            styles.categoryCardText,
                                            formData.category === cat.id && styles.categoryCardTextActive
                                        ]}
                                    >
                                        {cat.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Subcategory */}
                    {subcategories[formData.category] && (
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Sous-catégorie</Text>
                            <View style={styles.subcategoryContainer}>
                                {subcategories[formData.category].map(sub => (
                                    <TouchableOpacity
                                        key={sub.id}
                                        style={[
                                            styles.subcategoryChip,
                                            formData.subcategory === sub.id && styles.subcategoryChipActive
                                        ]}
                                        onPress={() => handleInputChange('subcategory', sub.id)}
                                    >
                                        <Text
                                            style={[
                                                styles.subcategoryChipText,
                                                formData.subcategory === sub.id && styles.subcategoryChipTextActive
                                            ]}
                                        >
                                            {sub.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Description */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={formData.description}
                            onChangeText={(value) => handleInputChange('description', value)}
                            placeholder="Décrivez l'exercice en détail..."
                            placeholderTextColor="#999"
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Duration and Players */}
                    <View style={styles.rowGroup}>
                        <View style={[styles.formGroup, styles.halfWidth]}>
                            <Text style={styles.label}>Durée (min)</Text>
                            <TextInput
                                style={[styles.input, errors.duration && styles.inputError]}
                                value={formData.duration}
                                onChangeText={(value) => handleInputChange('duration', value)}
                                placeholder="15"
                                placeholderTextColor="#999"
                                keyboardType="numeric"
                            />
                            {errors.duration && (
                                <Text style={styles.errorText}>{errors.duration}</Text>
                            )}
                        </View>
                    </View>

                    <View style={styles.rowGroup}>
                        <View style={[styles.formGroup, styles.halfWidth]}>
                            <Text style={styles.label}>Joueurs min</Text>
                            <TextInput
                                style={[styles.input, errors.players_min && styles.inputError]}
                                value={formData.players_min}
                                onChangeText={(value) => handleInputChange('players_min', value)}
                                placeholder="1"
                                placeholderTextColor="#999"
                                keyboardType="numeric"
                            />
                            {errors.players_min && (
                                <Text style={styles.errorText}>{errors.players_min}</Text>
                            )}
                        </View>

                        <View style={[styles.formGroup, styles.halfWidth]}>
                            <Text style={styles.label}>Joueurs max</Text>
                            <TextInput
                                style={[styles.input, errors.players_max && styles.inputError]}
                                value={formData.players_max}
                                onChangeText={(value) => handleInputChange('players_max', value)}
                                placeholder="12"
                                placeholderTextColor="#999"
                                keyboardType="numeric"
                            />
                            {errors.players_max && (
                                <Text style={styles.errorText}>{errors.players_max}</Text>
                            )}
                        </View>
                    </View>

                    {/* Equipment */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Matériel nécessaire</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.equipment}
                            onChangeText={(value) => handleInputChange('equipment', value)}
                            placeholder="Ex: 5 ballons, 10 cônes, 2 échelles"
                            placeholderTextColor="#999"
                        />
                    </View>

                    {/* Video Selection */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            Vidéo de démonstration <Text style={styles.optional}>(optionnel)</Text>
                        </Text>
                        <View style={styles.videoTabs}>
                            <TouchableOpacity
                                style={[styles.videoTab, videoMode === 'library' && styles.videoTabActive]}
                                onPress={() => setVideoMode('library')}
                            >
                                <Text style={[styles.videoTabText, videoMode === 'library' && styles.videoTabTextActive]}>Bibliothèque</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.videoTab, videoMode === 'upload' && styles.videoTabActive]}
                                onPress={() => setVideoMode('upload')}
                            >
                                <Text style={[styles.videoTabText, videoMode === 'upload' && styles.videoTabTextActive]}>Uploader</Text>
                            </TouchableOpacity>
                        </View>

                        {videoMode === 'library' ? (
                            <View style={styles.libraryContainer}>
                                {loadingLibrary ? (
                                    <ActivityIndicator size="small" color="#FF6B35" />
                                ) : (
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        style={styles.videoList}
                                    >
                                        {videoLibrary.map(video => (
                                            <TouchableOpacity
                                                key={video.id}
                                                style={[
                                                    styles.videoChip,
                                                    selectedVideoUrl === video.url && styles.videoChipActive
                                                ]}
                                                onPress={() => handleSelectVideo(video.url)}
                                            >
                                                <Icon
                                                    name={selectedVideoUrl === video.url ? "check-circle" : "video-outline"}
                                                    size={20}
                                                    color={selectedVideoUrl === video.url ? "#FFF" : "#666"}
                                                />
                                                <Text style={[
                                                    styles.videoChipText,
                                                    selectedVideoUrl === video.url && styles.videoChipTextActive
                                                ]}>
                                                    {video.title}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                        {videoLibrary.length === 0 && (
                                            <Text style={styles.noVideosText}>Aucune vidéo disponible.</Text>
                                        )}
                                    </ScrollView>
                                )}
                            </View>
                        ) : (
                            <View style={styles.uploadContainer}>
                                <TouchableOpacity
                                    style={styles.pickButton}
                                    onPress={handlePickVideo}
                                >
                                    <Icon name="upload" size={24} color="#666" />
                                    <Text style={styles.pickButtonText}>
                                        {videoFile ? videoFile.name : 'Choisir une vidéo'}
                                    </Text>
                                </TouchableOpacity>
                                {videoFile && (
                                    <TouchableOpacity
                                        style={styles.clearVideoButton}
                                        onPress={() => setVideoFile(null)}
                                    >
                                        <Icon name="close-circle" size={20} color="#FF6B35" />
                                        <Text style={styles.clearVideoText}>Effacer</Text>
                                    </TouchableOpacity>
                                )}
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
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20
    },
    formGroup: {
        marginBottom: 20
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 8
    },
    required: {
        color: '#FF6B35'
    },
    input: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#1A1A1A'
    },
    inputError: {
        borderColor: '#FF6B35'
    },
    textArea: {
        height: 100,
        paddingTop: 12
    },
    errorText: {
        fontSize: 12,
        color: '#FF6B35',
        marginTop: 4
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -4
    },
    categoryCard: {
        width: '31%',
        aspectRatio: 1,
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 12,
        margin: 4,
        justifyContent: 'center',
        alignItems: 'center'
    },
    categoryCardActive: {
        backgroundColor: '#FF6B35',
        borderColor: '#FF6B35'
    },
    categoryCardText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#666',
        marginTop: 8
    },
    categoryCardTextActive: {
        color: '#FFF'
    },
    subcategoryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -4
    },
    subcategoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        margin: 4,
        borderRadius: 20,
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E5E5E5'
    },
    subcategoryChipActive: {
        backgroundColor: '#4ECDC4',
        borderColor: '#4ECDC4'
    },
    subcategoryChipText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666'
    },
    subcategoryChipTextActive: {
        color: '#FFF'
    },
    rowGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    halfWidth: {
        width: '48%'
    },
    videoList: {
        flexDirection: 'row',
        paddingVertical: 8
    },
    videoChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 10
    },
    videoChipActive: {
        backgroundColor: '#4ECDC4',
        borderColor: '#4ECDC4'
    },
    videoChipText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#666'
    },
    videoChipTextActive: {
        color: '#FFF',
        fontWeight: 'bold'
    },
    noVideosText: {
        fontSize: 14,
        color: '#999',
        fontStyle: 'italic'
    },
    videoTabs: {
        flexDirection: 'row',
        backgroundColor: '#E5E5E5',
        borderRadius: 8,
        padding: 2,
        marginBottom: 12
    },
    videoTab: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 6
    },
    videoTabActive: {
        backgroundColor: '#FFF'
    },
    videoTabText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666'
    },
    videoTabTextActive: {
        color: '#1A1A1A'
    },
    uploadContainer: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#FFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderStyle: 'dashed'
    },
    pickButton: {
        alignItems: 'center'
    },
    pickButtonText: {
        marginTop: 8,
        fontSize: 14,
        color: '#666',
        textAlign: 'center'
    },
    clearVideoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        padding: 4
    },
    clearVideoText: {
        fontSize: 12,
        color: '#FF6B35',
        marginLeft: 4,
        fontWeight: '600'
    },
    optional: {
        fontSize: 12,
        color: '#999',
        fontWeight: 'normal'
    }
});

export default ExerciseFormModal;
