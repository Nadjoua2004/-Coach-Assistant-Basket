import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Image
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import AthleteService from '../../services/athleteService';

const AthleteFormScreen = ({ athlete, onBack, onSave }) => {
    const isEditing = !!athlete && !athlete.id?.toString().startsWith('temp_');
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
        groupe: athlete?.groupe || 'U17',
        allergies: athlete?.medical_records?.[0]?.allergies || '',
        blessures_cours: athlete?.medical_records?.[0]?.blessures_cours || '',
        antecedents: athlete?.medical_records?.[0]?.antecedents || '',
        certificat_date: athlete?.medical_records?.[0]?.certificat_date || ''
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
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setPhoto(result.assets[0]);
        }
    };

    const handleSave = async () => {
        if (!formData.nom || !formData.prenom || !formData.date_naissance) {
            Alert.alert('Erreur', 'Veuillez remplir les champs obligatoires (Nom, Prénom, Date de naissance)');
            return;
        }

        const athleteData = {
            ...formData,
            taille: formData.taille ? parseFloat(formData.taille) : null,
            poids: formData.poids ? parseFloat(formData.poids) : null,
            poste: formData.poste ? parseInt(formData.poste) : null,
        };

        try {
            setLoading(true);
            let response;
            if (isEditing) {
                response = await AthleteService.updateAthlete(athlete.id, athleteData, photo);
            } else {
                // If we have a temp athlete, pass the user_id from it to link the new athlete
                if (athlete?.id?.toString().startsWith('temp_') && athlete.user_id) {
                    athleteData.user_id = athlete.user_id;
                }
                response = await AthleteService.createAthlete(athleteData, photo);
            }

            if (response.success) {
                Alert.alert('Succès', `Athlète ${isEditing ? 'mis à jour' : 'créé'} avec succès`);
                onSave(response.data);
            }
        } catch (error) {
            console.error('Error saving athlete:', error);
            Alert.alert('Erreur', 'Impossible d\'enregistrer l\'athlète');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
            keyboardVerticalOffset={0}
        >
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Icon name="arrow-left" size={24} color="#1e293b" />
                </TouchableOpacity>
                <Text style={styles.title}>{isEditing ? 'Modifier' : 'Ajouter'} un athlète</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.formContent}>
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

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Informations Personnelles</Text>
                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <Text style={styles.label}>Nom *</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.nom}
                                onChangeText={(t) => handleChange('nom', t)}
                                placeholder="Belaidi"
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 8 }}>
                            <Text style={styles.label}>Prénom *</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.prenom}
                                onChangeText={(t) => handleChange('prenom', t)}
                                placeholder="Mohamed"
                            />
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 8 }}>
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
                        <View style={{ flex: 1, marginLeft: 8 }}>
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
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <Text style={styles.label}>Taille (cm)</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.taille}
                                onChangeText={(t) => handleChange('taille', t)}
                                keyboardType="numeric"
                                placeholder="185"
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 8 }}>
                            <Text style={styles.label}>Poids (kg)</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.poids}
                                onChangeText={(t) => handleChange('poids', t)}
                                keyboardType="numeric"
                                placeholder="75"
                            />
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Sportif & Administratif</Text>

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

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 8 }}>
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
                        <View style={{ flex: 1, marginLeft: 8 }}>
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
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Informations Médicales</Text>
                    <Text style={styles.label}>Allergies</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={formData.allergies}
                        onChangeText={(t) => handleChange('allergies', t)}
                        placeholder="Ex: Arachides, Pénicilline..."
                        multiline
                    />

                    <Text style={styles.label}>Blessures en cours</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={formData.blessures_cours}
                        onChangeText={(t) => handleChange('blessures_cours', t)}
                        placeholder="Ex: Entorse cheville droite..."
                        multiline
                    />

                    <Text style={styles.label}>Antécédents / Notes</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={formData.antecedents}
                        onChangeText={(t) => handleChange('antecedents', t)}
                        placeholder="Historique médical important..."
                        multiline
                    />
                </View>

                <TouchableOpacity
                    style={[styles.saveButton, loading && styles.disabledButton]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.saveButtonText}>
                            {isEditing ? 'Mettre à jour' : 'Enregistrer'}
                        </Text>
                    )}
                </TouchableOpacity>
                <View style={{ height: 100 }} />
            </ScrollView>
        </KeyboardAvoidingView>
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
        padding: 24,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    backButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    formContent: {
        padding: 24,
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
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
        marginBottom: 8,
    },
    input: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        color: '#1e293b',
        marginBottom: 16,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    row: {
        flexDirection: 'row',
    },
    radioGroup: {
        flexDirection: 'row',
        marginBottom: 16,
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
        marginBottom: 16,
    },
    dateText: {
        fontSize: 16,
        color: '#1e293b',
    },
    groupContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 16,
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
    saveButton: {
        backgroundColor: '#f97316',
        borderRadius: 16,
        padding: 18,
        alignItems: 'center',
        marginBottom: 40,
        shadowColor: '#f97316',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    disabledButton: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
    },
});

export default AthleteFormScreen;
