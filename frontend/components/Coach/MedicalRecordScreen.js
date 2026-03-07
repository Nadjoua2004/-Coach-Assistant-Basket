import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Switch,
    Platform
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import MedicalRecordService from '../../services/medicalRecordService';
import * as DocumentPicker from 'expo-document-picker';
import * as Linking from 'expo-linking';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../config/theme';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Input from '../UI/Input';

const MedicalRecordScreen = ({ athlete, onBack }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [record, setRecord] = useState(null);
    const [certificate, setCertificate] = useState(null);

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

    const handlePickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
                copyToCacheDirectory: true
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setCertificate(result.assets[0]);
            }
        } catch (error) {
            console.error('Error picking document:', error);
            Alert.alert('Erreur', 'Impossible de sélectionner le document');
        }
    };

    const handleViewCertificate = () => {
        if (record?.certificat_pdf_url) {
            Linking.openURL(record.certificat_pdf_url);
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

            const response = await MedicalRecordService.updateRecord(athlete.id, recordData, certificate);
            if (response.success) {
                Alert.alert('Succès', 'Dossier médical mis à jour');
                setRecord(response.data);
                setCertificate(null); // Clear selected file after save
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
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Icon name="chevron-left" size={32} color={COLORS.gray[900]} />
                </TouchableOpacity>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Dossier Médical</Text>
                    <Text style={styles.subtitle}>{athlete.prenom} {athlete.nom}</Text>
                </View>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.formContent}
                showsVerticalScrollIndicator={false}
            >
                <Card style={styles.statusCard}>
                    <View style={styles.statusRow}>
                        <View style={styles.statusInfo}>
                            <View style={[
                                styles.statusDot,
                                { backgroundColor: aptitudeSportive ? COLORS.success : COLORS.error }
                            ]} />
                            <View>
                                <Text style={styles.statusLabel}>Aptitude Sportive</Text>
                                <Text style={styles.statusSubLabel}>
                                    {aptitudeSportive ? "Autorisé à la pratique" : "Pratique restreinte / Non autorisé"}
                                </Text>
                            </View>
                        </View>
                        <Switch
                            value={aptitudeSportive}
                            onValueChange={setAptitudeSportive}
                            trackColor={{ false: COLORS.gray[200], true: COLORS.primary + '40' }}
                            thumbColor={aptitudeSportive ? COLORS.primary : COLORS.gray[400]}
                        />
                    </View>
                </Card>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Données Vitales</Text>

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
                                    activeOpacity={0.7}
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

                    <Text style={styles.label}>Certificat Médical (PDF)</Text>
                    <Card style={styles.fileCard} padding="none">
                        {Boolean(record?.certificat_pdf_url) && (
                            <TouchableOpacity
                                style={styles.viewFileButton}
                                onPress={handleViewCertificate}
                                activeOpacity={0.6}
                            >
                                <View style={styles.pdfIcon}>
                                    <Icon name="file-pdf-box" size={32} color={COLORS.error} />
                                </View>
                                <View style={styles.fileInfo}>
                                    <Text style={styles.fileName}>Certificat médical actuel</Text>
                                    <Text style={styles.fileDate}>Mise à jour le {new Date(record.updated_at).toLocaleDateString('fr-FR')}</Text>
                                </View>
                                <Icon name="chevron-right" size={20} color={COLORS.gray[300]} />
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={[styles.uploadArea, certificate && styles.uploadAreaActive]}
                            onPress={handlePickDocument}
                        >
                            <Icon
                                name={certificate ? "file-check" : "cloud-upload-outline"}
                                size={24}
                                color={certificate ? COLORS.success : COLORS.gray[400]}
                            />
                            <View style={styles.uploadInfo}>
                                <Text style={[styles.uploadText, certificate && styles.uploadTextActive]}>
                                    {certificate ? certificate.name : "Télécharger un nouveau PDF"}
                                </Text>
                                {Boolean(certificate) && (
                                    <Text style={styles.uploadSize}>
                                        {(certificate.size / 1024 / 1024).toFixed(2)} MB
                                    </Text>
                                )}
                            </View>
                            {!Boolean(certificate) && (
                                <View style={styles.uploadBtn}>
                                    <Text style={styles.uploadBtnText}>Parcourir</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </Card>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Antécédents & Alertes</Text>

                    <Input
                        label="Allergies"
                        value={allergies}
                        onChangeText={setAllergies}
                        placeholder="Ex: Pénicilline, Arachides..."
                        multiline
                        numberOfLines={3}
                        icon="alert-decagram-outline"
                    />

                    <Input
                        label="Traitements en cours"
                        value={traitements}
                        onChangeText={setTraitements}
                        placeholder="Médicaments, doses..."
                        multiline
                        numberOfLines={3}
                        icon="pill"
                    />

                    <Input
                        label="Antécédents médicaux"
                        value={antecedents}
                        onChangeText={setAntecedents}
                        placeholder="Opérations, blessures graves..."
                        multiline
                        numberOfLines={4}
                        icon="history"
                    />
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Icon name="shield-lock-outline" size={20} color={COLORS.gray[400]} />
                        <Text style={styles.sectionTitleSmall}>Espace Entraîneur (Privé)</Text>
                    </View>

                    <Input
                        label="Notes confidentielles"
                        value={notesCoach}
                        onChangeText={setNotesCoach}
                        placeholder="Observations sur la forme, précautions particulières..."
                        multiline
                        numberOfLines={4}
                        icon="notebook-edit-outline"
                    />
                </View>

                <Button
                    title="Enregistrer les modifications"
                    onPress={handleSave}
                    loading={saving}
                    icon="content-save"
                    style={styles.saveBtn}
                />

                <View style={{ height: 20 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.gray[50],
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        paddingTop: Platform.OS === 'ios' ? 60 : 30,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[100],
        ...SHADOWS.sm,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        marginLeft: -10,
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    title: {
        ...TYPOGRAPHY.h3,
        color: COLORS.gray[900],
    },
    subtitle: {
        ...TYPOGRAPHY.bodySmall,
        color: COLORS.gray[400],
        marginTop: 2,
    },
    formContent: {
        padding: SPACING.lg,
        paddingBottom: 40,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.white,
    },
    statusCard: {
        marginBottom: 24,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.gray[50],
        ...SHADOWS.xs,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 12,
    },
    statusLabel: {
        ...TYPOGRAPHY.h4,
        fontSize: 15,
        color: COLORS.gray[900],
    },
    statusSubLabel: {
        ...TYPOGRAPHY.bodySmall,
        color: COLORS.gray[400],
        fontSize: 11,
        marginTop: 2,
    },
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        ...TYPOGRAPHY.label,
        fontSize: 12,
        color: COLORS.gray[400],
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: 16,
    },
    sectionTitleSmall: {
        ...TYPOGRAPHY.label,
        fontSize: 11,
        color: COLORS.gray[400],
        marginLeft: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        ...TYPOGRAPHY.label,
        fontSize: 12,
        color: COLORS.gray[500],
        marginBottom: 12,
    },
    bloodTypeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    bloodTypeChip: {
        width: '22.5%',
        height: 48,
        borderRadius: 14,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.gray[100],
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.xs,
    },
    activeBloodType: {
        backgroundColor: COLORS.gray[900],
        borderColor: COLORS.gray[900],
    },
    bloodTypeText: {
        ...TYPOGRAPHY.h4,
        fontSize: 13,
        color: COLORS.gray[600],
    },
    activeBloodTypeText: {
        color: COLORS.white,
    },
    fileCard: {
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.gray[100],
        backgroundColor: COLORS.white,
    },
    viewFileButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[50],
    },
    pdfIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: COLORS.error + '10',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    fileInfo: {
        flex: 1,
    },
    fileName: {
        ...TYPOGRAPHY.h4,
        fontSize: 14,
        color: COLORS.gray[900],
    },
    fileDate: {
        ...TYPOGRAPHY.bodySmall,
        fontSize: 11,
        color: COLORS.gray[400],
        marginTop: 2,
    },
    uploadArea: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: COLORS.gray[50],
    },
    uploadAreaActive: {
        backgroundColor: COLORS.success + '10',
    },
    uploadInfo: {
        flex: 1,
        marginLeft: 12,
    },
    uploadText: {
        ...TYPOGRAPHY.bodySmall,
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.gray[500],
    },
    uploadTextActive: {
        color: COLORS.success,
    },
    uploadSize: {
        ...TYPOGRAPHY.bodySmall,
        fontSize: 10,
        color: COLORS.gray[400],
        marginTop: 2,
    },
    uploadBtn: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.gray[200],
        ...SHADOWS.xs,
    },
    uploadBtnText: {
        ...TYPOGRAPHY.label,
        fontSize: 10,
        color: COLORS.gray[600],
    },
    saveBtn: {
        borderRadius: 16,
        marginTop: 10,
        height: 56,
        ...SHADOWS.md,
    }
});

export default MedicalRecordScreen;
