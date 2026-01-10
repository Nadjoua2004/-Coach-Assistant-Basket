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
    ActivityIndicator,
    Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import AthleteService from '../../services/athleteService';

const PlayerProfileModal = ({ visible, onClose, onSuccess, athlete }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nom: athlete?.nom || '',
        prenom: athlete?.prenom || '',
        date_naissance: athlete?.date_naissance || '',
        sexe: athlete?.sexe || 'M',
        taille: athlete?.taille?.toString() || '',
        poids: athlete?.poids?.toString() || '',
        poste: athlete?.poste?.toString() || '',
        numero_licence: athlete?.numero_licence || '',
        contact_parent: athlete?.contact_parent || '',
        groupe: athlete?.groupe || 'U17'
    });
    const [photo, setPhoto] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(
        athlete?.date_naissance ? new Date(athlete.date_naissance) : new Date()
    );

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (event, date) => {
        setShowDatePicker(false);
        if (date) {
            setSelectedDate(date);
            const formattedDate = date.toISOString().split('T')[0];
            handleChange('date_naissance', formattedDate);
        }
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

            const payload = {
                ...formData,
                taille: formData.taille ? parseInt(formData.taille) : null,
                poids: formData.poids ? parseFloat(formData.poids) : null,
                poste: formData.poste ? parseInt(formData.poste) : null,
            };

            let response;
            if (athlete) {
                response = await AthleteService.updateAthlete(athlete.id, payload, photo);
            } else {
                response = await AthleteService.createAthlete(payload, photo);
            }

            if (response.success) {
                Alert.alert('Succès', 'Votre profil a été enregistré avec succès !');
                onSuccess();
            } else {
                Alert.alert('Erreur', response.message || 'Impossible d\'enregistrer le profil');
            }
        } catch (error) {
            console.error('Save profile error:', error);
            Alert.alert('Erreur', 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Mon Profil</Text>
                    <TouchableOpacity onPress={onClose}>
                        <Icon name="close" size={24} color="#64748b" />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.form}>
                    {/* Photo Upload */}
                    <View style={styles.photoSection}>
                        <TouchableOpacity onPress={handlePickImage} style={styles.photoContainer}>
                            {photo ? (
                                <Image source={{ uri: photo.uri }} style={styles.photo} />
                            ) : athlete?.photo_url ? (
                                <Image source={{ uri: athlete.photo_url }} style={styles.photo} />
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
                            <TouchableOpacity
                                style={styles.dateInput}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Text style={styles.dateText}>
                                    {formData.date_naissance || 'Sélectionner'}
                                </Text>
                                <Icon name="calendar" size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {showDatePicker && (
                        <DateTimePicker
                            value={selectedDate}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={handleDateChange}
                            maximumDate={new Date()}
                        />
                    )}

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
                                onChangeText={(t) => {
                                    if (t === '' || (parseInt(t) >= 1 && parseInt(t) <= 5)) {
                                        handleChange('poste', t);
                                    }
                                }}
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

                    <Text style={styles.label}>Groupe</Text>
                    <View style={styles.groupContainer}>
                        {['U13', 'U15', 'U17', 'Seniors'].map(g => (
                            <TouchableOpacity
                                key={g}
                                style={[styles.groupBtn, formData.groupe === g && styles.groupBtnActive]}
                                onPress={() => handleChange('groupe', g)}
                            >
                                <Text style={[styles.groupText, formData.groupe === g && styles.groupTextActive]}>{g}</Text>
                            </TouchableOpacity>
                        ))}
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
                            <Text style={styles.submitBtnText}>Enregistrer</Text>
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
        borderWidth: 2,
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
    dateInput: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 12,
        marginBottom: 20,
    },
    dateText: {
        fontSize: 16,
        color: '#1e293b',
    },
    groupContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 20,
        backgroundColor: '#e2e8f0',
        borderRadius: 12,
        padding: 4,
    },
    groupBtn: {
        flex: 1,
        minWidth: '23%',
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
        margin: 2,
    },
    groupBtnActive: {
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    groupText: {
        fontWeight: '600',
        color: '#64748b',
    },
    groupTextActive: {
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
