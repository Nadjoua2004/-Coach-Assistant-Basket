import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    Image,
    ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import AthleteService from '../../services/athleteService';

const PlayerProfileModal = ({ visible, onClose, onSuccess, userEmail, userName }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nom: userName?.split(' ')[0] || '',
        prenom: userName?.split(' ').slice(1).join(' ') || '',
        sexe: 'M',
        date_naissance: '',
        taille: '',
        poids: '',
        poste: '',
        numero_licence: '',
        contact_parent: '',
        groupe: 'U17' // Default group
    });
    const [photo, setPhoto] = useState(null);

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setPhoto(result.assets[0]);
        }
    };

    const handleSubmit = async () => {
        if (!formData.nom || !formData.prenom || !formData.date_naissance) {
            Alert.alert('Erreur', 'Veuillez remplir les champs obligatoires (Nom, Prénom, Date de naissance)');
            return;
        }

        try {
            setLoading(true);

            // Prepare payload
            // Convert types if necessary
            const payload = {
                ...formData,
                taille: formData.taille ? parseInt(formData.taille) : null,
                poids: formData.poids ? parseFloat(formData.poids) : null,
                poste: formData.poste ? parseInt(formData.poste) : null,
            };

            const response = await AthleteService.createAthlete(payload, photo);

            if (response.success) {
                Alert.alert('Succès', 'Votre profil a été créé avec succès !');
                onSuccess();
                onClose();
            } else {
                Alert.alert('Erreur', response.message || 'Impossible de créer le profil');
            }
        } catch (error) {
            console.error('Create profile error:', error);
            Alert.alert('Erreur', 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Compléter mon Profil</Text>
                    <TouchableOpacity onPress={onClose}>
                        <Icon name="close" size={24} color="#64748b" />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.form}>
                    <View style={styles.banner}>
                        <Icon name="information-outline" size={24} color="#3b82f6" />
                        <Text style={styles.bannerText}>
                            Ces informations permettront à votre coach de mieux suivre votre progression et votresanté.
                        </Text>
                    </View>

                    {/* Photo Upload */}
                    <View style={styles.photoSection}>
                        <TouchableOpacity onPress={handlePickImage} style={styles.photoContainer}>
                            {photo ? (
                                <Image source={{ uri: photo.uri }} style={styles.photo} />
                            ) : (
                                <View style={styles.photoPlaceholder}>
                                    <Icon name="camera" size={32} color="#94a3b8" />
                                    <Text style={styles.photoText}>Ajouter une photo</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.label}>Nom *</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.nom}
                        onChangeText={(t) => handleChange('nom', t)}
                        placeholder="Votre nom"
                    />

                    <Text style={styles.label}>Prénom *</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.prenom}
                        onChangeText={(t) => handleChange('prenom', t)}
                        placeholder="Votre prénom"
                    />

                    <View style={styles.row}>
                        <View style={styles.halfInput}>
                            <Text style={styles.label}>Sexe *</Text>
                            <View style={styles.radioGroup}>
                                <TouchableOpacity
                                    style={[styles.radioBtn, formData.sexe === 'M' && styles.radioBtnActive]}
                                    onPress={() => handleChange('sexe', 'M')}
                                >
                                    <Text style={[styles.radioText, formData.sexe === 'M' && styles.radioTextActive]}>M</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.radioBtn, formData.sexe === 'F' && styles.radioBtnActive]}
                                    onPress={() => handleChange('sexe', 'F')}
                                >
                                    <Text style={[styles.radioText, formData.sexe === 'F' && styles.radioTextActive]}>F</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.halfInput}>
                            <Text style={styles.label}>Date de Naissance *</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.date_naissance}
                                onChangeText={(t) => handleChange('date_naissance', t)}
                                placeholder="YYYY-MM-DD"
                            />
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.halfInput}>
                            <Text style={styles.label}>Taille (cm)</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.taille}
                                onChangeText={(t) => handleChange('taille', t)}
                                keyboardType="numeric"
                                placeholder="ex: 185"
                            />
                        </View>
                        <View style={styles.halfInput}>
                            <Text style={styles.label}>Poids (kg)</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.poids}
                                onChangeText={(t) => handleChange('poids', t)}
                                keyboardType="numeric"
                                placeholder="ex: 80"
                            />
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.halfInput}>
                            <Text style={styles.label}>Poste (1-5)</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.poste}
                                onChangeText={(t) => handleChange('poste', t)}
                                keyboardType="numeric"
                                placeholder="1"
                            />
                        </View>
                        <View style={styles.halfInput}>
                            <Text style={styles.label}>N° Licence</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.numero_licence}
                                onChangeText={(t) => handleChange('numero_licence', t)}
                                placeholder="D123456"
                            />
                        </View>
                    </View>

                    <Text style={styles.label}>Contact Parent / Urgence</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.contact_parent}
                        onChangeText={(t) => handleChange('contact_parent', t)}
                        placeholder="Téléphone du tuteur"
                        keyboardType="phone-pad"
                    />

                    <TouchableOpacity
                        style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.submitBtnText}>Enregistrer mon Profil</Text>
                        )}
                    </TouchableOpacity>
                    <View style={{ height: 40 }} />
                </ScrollView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    form: {
        padding: 20,
    },
    banner: {
        flexDirection: 'row',
        backgroundColor: '#dbeafe',
        padding: 12,
        borderRadius: 12,
        marginBottom: 24,
        alignItems: 'center',
    },
    bannerText: {
        flex: 1,
        marginLeft: 12,
        color: '#1e40af',
        fontSize: 14,
    },
    photoSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    photoContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#e2e8f0',
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderStyle: 'dashed',
    },
    photo: {
        width: '100%',
        height: '100%',
    },
    photoPlaceholder: {
        alignItems: 'center',
    },
    photoText: {
        fontSize: 10,
        color: '#64748b',
        marginTop: 4,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 8,
    },
    input: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        marginBottom: 20,
        color: '#1e293b',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfInput: {
        width: '48%',
    },
    radioGroup: {
        flexDirection: 'row',
        marginBottom: 20,
        backgroundColor: '#e2e8f0',
        borderRadius: 12,
        padding: 4,
    },
    radioBtn: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    radioBtnActive: {
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    radioText: {
        fontWeight: '600',
        color: '#64748b',
    },
    radioTextActive: {
        color: '#f97316',
    },
    submitBtn: {
        backgroundColor: '#f97316',
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 12,
    },
    submitBtnDisabled: {
        opacity: 0.7,
    },
    submitBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default PlayerProfileModal;
