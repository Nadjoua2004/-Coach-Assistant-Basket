import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Switch
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import MedicalRecordService from '../../services/medicalRecordService';

const MedicalRecordScreen = ({ athlete, onBack }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [record, setRecord] = useState(null);

    // Form state
    const [groupeSanguin, setGroupeSanguin] = useState('');
    const [allergies, setAllergies] = useState('');
    const [traitements, setTraitements] = useState('');
    const [antecedents, setAntecedents] = useState('');
    const [aptitudeSportive, setAptitudeSportive] = useState(true);
    const [notesCoach, setNotesCoach] = useState('');

    useEffect(() => {
        fetchMedicalRecord();
    }, [athlete.id]);

    const fetchMedicalRecord = async () => {
        try {
            setLoading(true);
            const response = await MedicalRecordService.getRecord(athlete.id);
            if (response.success && response.data) {
                const data = response.data;
                setRecord(data);
                setGroupeSanguin(data.groupe_sanguin || '');
                setAllergies(data.allergies || '');
                setTraitements(data.traitements_en_cours || '');
                setAntecedents(data.antecedents || '');
                setAptitudeSportive(data.aptitude_sportive ?? true);
                setNotesCoach(data.notes_coach || '');
            }
        } catch (error) {
            console.error('Error fetching medical record:', error);
            Alert.alert('Erreur', 'Impossible de charger le dossier médical');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const recordData = {
                groupe_sanguin: groupeSanguin,
                allergies,
                traitements_en_cours: traitements,
                antecedents,
                aptitude_sportive: aptitudeSportive,
                notes_coach: notesCoach
            };

            const response = await MedicalRecordService.updateRecord(athlete.id, recordData);
            if (response.success) {
                Alert.alert('Succès', 'Dossier médical mis à jour');
                setRecord(response.data);
            }
        } catch (error) {
            console.error('Error saving medical record:', error);
            Alert.alert('Erreur', 'Impossible d\'enregistrer le dossier');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#f97316" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Icon name="arrow-left" size={24} color="#1e293b" />
                </TouchableOpacity>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Dossier Médical</Text>
                    <Text style={styles.subtitle}>{athlete.prenom} {athlete.nom}</Text>
                </View>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.formContent}>
                <View style={styles.infoCard}>
                    <View style={styles.statusRow}>
                        <View style={styles.statusInfo}>
                            <Icon
                                name={aptitudeSportive ? "check-circle" : "alert-circle"}
                                size={24}
                                color={aptitudeSportive ? "#10b981" : "#ef4444"}
                            />
                            <Text style={styles.statusLabel}>Aptitude Sportive</Text>
                        </View>
                        <Switch
                            value={aptitudeSportive}
                            onValueChange={setAptitudeSportive}
                            trackColor={{ false: '#e2e8f0', true: '#fed7aa' }}
                            thumbColor={aptitudeSportive ? '#f97316' : '#94a3b8'}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Informations de Santé</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Groupe Sanguin</Text>
                        <View style={styles.bloodTypeContainer}>
                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                                <TouchableOpacity
                                    key={type}
                                    style={[
                                        styles.bloodTypeChip,
                                        groupeSanguin === type && styles.activeBloodType
                                    ]}
                                    onPress={() => setGroupeSanguin(type)}
                                >
                                    <Text style={[
                                        styles.bloodTypeText,
                                        groupeSanguin === type && styles.activeBloodTypeText
                                    ]}>
                                        {type}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Allergies</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={allergies}
                            onChangeText={setAllergies}
                            placeholder="Ex: Pénicilline, Arachides..."
                            multiline
                            numberOfLines={3}
                            placeholderTextColor="#94a3b8"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Traitements en cours</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={traitements}
                            onChangeText={setTraitements}
                            placeholder="Médicaments, doses..."
                            multiline
                            numberOfLines={3}
                            placeholderTextColor="#94a3b8"
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Historique & Notes</Text>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Antécédents médicaux</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={antecedents}
                            onChangeText={setAntecedents}
                            placeholder="Opérations, blessures graves..."
                            multiline
                            numberOfLines={4}
                            placeholderTextColor="#94a3b8"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Notes du coach (privé)</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={notesCoach}
                            onChangeText={setNotesCoach}
                            placeholder="Observations sur la forme, précautions..."
                            multiline
                            numberOfLines={4}
                            placeholderTextColor="#94a3b8"
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.saveButton, saving && styles.disabledButton]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <Icon name="content-save" size={20} color="white" style={{ marginRight: 8 }} />
                            <Text style={styles.saveButtonText}>Mettre à jour le dossier</Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        flexDirection: 'row',
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
    titleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    subtitle: {
        fontSize: 14,
        color: '#64748b',
    },
    formContent: {
        padding: 24,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginLeft: 12,
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
    inputGroup: {
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
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    bloodTypeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    bloodTypeChip: {
        width: 50,
        height: 40,
        borderRadius: 10,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeBloodType: {
        backgroundColor: '#ef4444',
        borderColor: '#ef4444',
    },
    bloodTypeText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#64748b',
    },
    activeBloodTypeText: {
        color: 'white',
    },
    saveButton: {
        backgroundColor: '#f97316',
        borderRadius: 16,
        padding: 18,
        flexDirection: 'row',
        justifyContent: 'center',
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

export default MedicalRecordScreen;
