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
    Platform,
    Switch
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import MedicalRecordService from '../../services/medicalRecordService';

const PlayerMedicalModal = ({ visible, onClose, onSuccess, athleteId }) => {
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [formData, setFormData] = useState({
        allergies: '',
        antecedents: '',
        blessures: false,
        blessures_cours: '',
        certificat_date: ''
    });
    const [certificatFile, setCertificatFile] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        if (visible) {
            if (athleteId) {
                fetchMedicalRecord();
            } else {
                setLoadingData(false);
            }
        }
    }, [visible, athleteId]);

    const fetchMedicalRecord = async () => {
        try {
            setLoadingData(true);
            const response = await MedicalRecordService.getRecord(athleteId);
            if (response.success && response.data) {
                setFormData({
                    allergies: response.data.allergies || '',
                    antecedents: response.data.antecedents || '',
                    blessures: response.data.blessures_cours ? true : false,
                    blessures_cours: response.data.blessures_cours || '',
                    certificat_date: response.data.certificat_date || ''
                });
                if (response.data.certificat_date) {
                    setSelectedDate(new Date(response.data.certificat_date));
                }
            }
        } catch (error) {
            console.error('Fetch medical record error:', error);
        } finally {
            setLoadingData(false);
        }
    };

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (event, date) => {
        setShowDatePicker(false);
        if (date) {
            setSelectedDate(date);
            const formattedDate = date.toISOString().split('T')[0];
            handleChange('certificat_date', formattedDate);
        }
    };

    const handlePickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
                copyToCacheDirectory: true
            });

            if (!result.canceled) {
                setCertificatFile(result.assets[0]);
            }
        } catch (error) {
            console.error('Pick document error:', error);
            Alert.alert('Erreur', 'Impossible de sélectionner le fichier');
        }
    };

    const handleSubmit = async () => {
        if (!athleteId) {
            Alert.alert('Erreur', 'Veuillez d\'abord créer votre profil athlète');
            return;
        }

        try {
            setLoading(true);

            const payload = {
                ...formData,
                blessures_cours: formData.blessures ? formData.blessures_cours : null
            };

            const response = await MedicalRecordService.updateRecord(athleteId, payload, certificatFile);

            if (response.success) {
                Alert.alert('Succès', 'Votre fiche médicale a été enregistrée');
                onSuccess();
            } else {
                Alert.alert('Erreur', response.message || 'Impossible d\'enregistrer la fiche médicale');
            }
        } catch (error) {
            console.error('Save medical record error:', error);
            Alert.alert('Erreur', 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    const isCertificatExpired = () => {
        if (!formData.certificat_date) return false;
        const certDate = new Date(formData.certificat_date);
        const today = new Date();
        const oneYear = 365 * 24 * 60 * 60 * 1000;
        return (today - certDate) > oneYear;
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Fiche Médicale</Text>
                    <TouchableOpacity onPress={onClose}>
                        <Icon name="close" size={24} color="#64748b" />
                    </TouchableOpacity>
                </View>

                {loadingData ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color="#10b981" />
                    </View>
                ) : (
                    <ScrollView style={styles.form}>
                        {/* Certificate Alert */}
                        {isCertificatExpired() && (
                            <View style={styles.alertBox}>
                                <Icon name="alert" size={24} color="#ef4444" />
                                <Text style={styles.alertText}>
                                    Votre certificat médical est expiré. Veuillez le renouveler.
                                </Text>
                            </View>
                        )}

                        <Text style={styles.label}>Allergies</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={formData.allergies}
                            onChangeText={(t) => handleChange('allergies', t)}
                            placeholder="Décrivez vos allergies (alimentaires, médicamenteuses...)"
                            multiline
                            numberOfLines={3}
                        />

                        <Text style={styles.label}>Antécédents Médicaux</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={formData.antecedents}
                            onChangeText={(t) => handleChange('antecedents', t)}
                            placeholder="Opérations, maladies chroniques, traitements en cours..."
                            multiline
                            numberOfLines={3}
                        />

                        <View style={styles.switchContainer}>
                            <View style={styles.switchLabelContainer}>
                                <Text style={styles.label}>Blessure en cours</Text>
                                <Text style={styles.switchSubtext}>
                                    Cochez si vous avez une blessure actuellement
                                </Text>
                            </View>
                            <Switch
                                value={formData.blessures}
                                onValueChange={(val) => handleChange('blessures', val)}
                                trackColor={{ false: '#e2e8f0', true: '#fbbf24' }}
                                thumbColor={formData.blessures ? '#f59e0b' : '#f3f4f6'}
                            />
                        </View>

                        {formData.blessures && (
                            <>
                                <Text style={styles.label}>Détails de la blessure</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    value={formData.blessures_cours}
                                    onChangeText={(t) => handleChange('blessures_cours', t)}
                                    placeholder="Décrivez votre blessure et son évolution..."
                                    multiline
                                    numberOfLines={3}
                                />
                            </>
                        )}

                        <Text style={styles.label}>Date du Certificat Médical</Text>
                        <TouchableOpacity
                            style={styles.dateInput}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text style={styles.dateText}>
                                {formData.certificat_date || 'Sélectionner la date'}
                            </Text>
                            <Icon name="calendar" size={20} color="#64748b" />
                        </TouchableOpacity>

                        {showDatePicker && (
                            <DateTimePicker
                                value={selectedDate}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={handleDateChange}
                                maximumDate={new Date()}
                            />
                        )}

                        <Text style={styles.label}>Certificat Médical (PDF)</Text>
                        <TouchableOpacity style={styles.fileButton} onPress={handlePickDocument}>
                            <Icon name="file-pdf-box" size={24} color="#ef4444" />
                            <Text style={styles.fileButtonText}>
                                {certificatFile ? certificatFile.name : 'Sélectionner un fichier PDF'}
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.infoBox}>
                            <Icon name="information" size={20} color="#3b82f6" />
                            <Text style={styles.infoText}>
                                Le certificat médical doit avoir moins d'un an pour être valide.
                            </Text>
                        </View>

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
                )}
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    switchLabelContainer: {
        flex: 1,
        marginRight: 12,
    },
    switchSubtext: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 2,
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
    fileButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    fileButtonText: {
        fontSize: 14,
        color: '#64748b',
        marginLeft: 12,
        flex: 1,
    },
    alertBox: {
        flexDirection: 'row',
        backgroundColor: '#fee2e2',
        padding: 12,
        borderRadius: 12,
        marginBottom: 20,
        alignItems: 'center',
    },
    alertText: {
        flex: 1,
        marginLeft: 12,
        color: '#991b1b',
        fontSize: 14,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#dbeafe',
        padding: 12,
        borderRadius: 12,
        marginBottom: 20,
        alignItems: 'center',
    },
    infoText: {
        flex: 1,
        marginLeft: 12,
        color: '#1e40af',
        fontSize: 13,
    },
    submitBtn: {
        backgroundColor: '#10b981',
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

export default PlayerMedicalModal;
