import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import AthleteService from '../../services/athleteService';
import ProfileImagePicker from '../Common/ProfileImagePicker';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../config/theme';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Card from '../UI/Card';

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

    const handleSave = async () => {
        if (!formData.nom || !formData.prenom || !formData.date_naissance) {
            Alert.alert('Champs requis', 'Veuillez remplir au moins le nom, le prénom et la date de naissance.');
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
                if (athlete?.id?.toString().startsWith('temp_') && athlete.user_id) {
                    athleteData.user_id = athlete.user_id;
                }
                response = await AthleteService.createAthlete(athleteData, photo);
            }

            if (response.success) {
                Alert.alert('Succès', isEditing ? 'Profil mis à jour' : 'Athlète ajouté au club');
                onSave(response.data);
            }
        } catch (error) {
            console.error('Error saving athlete:', error);
            Alert.alert('Erreur', 'Impossible d\'enregistrer les modifications.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <View style={styles.screenHeader}>
                <View style={styles.headerRow}>
                    <TouchableOpacity style={styles.backButton} onPress={onBack}>
                        <Icon name="arrow-left" size={24} color={COLORS.gray[900]} />
                    </TouchableOpacity>
                    <View style={styles.headerTxtWrapper}>
                        <Text style={styles.screenTitle}>{isEditing ? 'Éditer le profil' : 'Nouvel athlète'}</Text>
                        <Text style={styles.screenSubtitle}>{isEditing ? `${formData.prenom} ${formData.nom}` : 'Ajout à l\'effectif club'}</Text>
                    </View>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollBody}
                showsVerticalScrollIndicator={false}
            >
                {/* Photo & Identity Section */}
                <View style={styles.photoContainer}>
                    <ProfileImagePicker
                        initialImage={athlete?.photo_url}
                        onImageSelected={setPhoto}
                        size={110}
                    />
                    <Text style={styles.photoNote}>Appuyez pour changer la photo</Text>
                </View>

                {/* Section: Identity */}
                <View style={styles.sectionBlock}>
                    <Text style={styles.sectionHeading}>IDENTITÉ ET ÉTAT CIVIL</Text>
                    <Card style={styles.formCard} padding="lg">
                        <View style={styles.dualField}>
                            <View style={{ flex: 1 }}>
                                <Input
                                    label="Prénom"
                                    value={formData.prenom}
                                    onChangeText={(t) => handleChange('prenom', t)}
                                    placeholder="Ex: Bilal"
                                    style={styles.fieldInput}
                                />
                            </View>
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Input
                                    label="Nom"
                                    value={formData.nom}
                                    onChangeText={(t) => handleChange('nom', t)}
                                    placeholder="Ex: Dahmani"
                                    style={styles.fieldInput}
                                />
                            </View>
                        </View>

                        <Text style={styles.inlineLabel}>Genre</Text>
                        <View style={styles.genderSwitcher}>
                            <TouchableOpacity
                                style={[styles.genderOption, formData.sexe === 'M' && styles.genderOptionActive]}
                                onPress={() => handleChange('sexe', 'M')}
                            >
                                <Icon name="gender-male" size={18} color={formData.sexe === 'M' ? COLORS.white : COLORS.gray[400]} />
                                <Text style={[styles.genderOptionText, formData.sexe === 'M' && styles.genderOptionTextOn]}>Masculin</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.genderOption, formData.sexe === 'F' && styles.genderOptionActive]}
                                onPress={() => handleChange('sexe', 'F')}
                            >
                                <Icon name="gender-female" size={18} color={formData.sexe === 'F' ? COLORS.white : COLORS.gray[400]} />
                                <Text style={[styles.genderOptionText, formData.sexe === 'F' && styles.genderOptionTextOn]}>Féminin</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.inlineLabel}>Date de naissance</Text>
                        <TouchableOpacity
                            style={styles.datePickerToggle}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text style={[styles.dateText, !formData.date_naissance && { color: COLORS.gray[300] }]}>
                                {formData.date_naissance || 'Sélectionner la date'}
                            </Text>
                            <Icon name="calendar-edit" size={20} color={COLORS.primary} />
                        </TouchableOpacity>
                    </Card>
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

                {/* Section: Physical Data */}
                <View style={styles.sectionBlock}>
                    <Text style={styles.sectionHeading}>MORPHOLOGIE ET PHYSIQUE</Text>
                    <Card style={styles.formCard} padding="lg">
                        <View style={styles.dualField}>
                            <View style={{ flex: 1 }}>
                                <Input
                                    label="Taille (cm)"
                                    value={formData.taille}
                                    onChangeText={(t) => handleChange('taille', t)}
                                    keyboardType="numeric"
                                    placeholder="185"
                                    icon="ruler"
                                    style={styles.fieldInput}
                                />
                            </View>
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Input
                                    label="Poids (kg)"
                                    value={formData.poids}
                                    onChangeText={(t) => handleChange('poids', t)}
                                    keyboardType="numeric"
                                    placeholder="82"
                                    icon="weight"
                                    style={styles.fieldInput}
                                />
                            </View>
                        </View>
                    </Card>
                </View>

                {/* Section: Club Data */}
                <View style={styles.sectionBlock}>
                    <Text style={styles.sectionHeading}>INFORMATIONS SPORTIVES</Text>
                    <Card style={styles.formCard} padding="lg">
                        <Text style={styles.inlineLabel}>Catégorie</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
                            {['U13', 'U15', 'U17', 'Seniors'].map(g => (
                                <TouchableOpacity
                                    key={g}
                                    style={[styles.groupChipBtn, formData.groupe === g && styles.groupChipBtnOn]}
                                    onPress={() => handleChange('groupe', g)}
                                >
                                    <Text style={[styles.groupChipBtnTxt, formData.groupe === g && styles.groupChipBtnTxtOn]}>{g}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <View style={styles.dualField}>
                            <View style={{ flex: 1 }}>
                                <Input
                                    label="Poste (1-5)"
                                    value={formData.poste}
                                    onChangeText={(t) => {
                                        if (t === '' || (parseInt(t) >= 1 && parseInt(t) <= 5)) {
                                            handleChange('poste', t);
                                        }
                                    }}
                                    keyboardType="numeric"
                                    placeholder="Ex: 5"
                                    style={styles.fieldInput}
                                />
                            </View>
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Input
                                    label="N° Licence"
                                    value={formData.numero_licence}
                                    onChangeText={(t) => handleChange('numero_licence', t)}
                                    placeholder="FR-..."
                                    style={styles.fieldInput}
                                />
                            </View>
                        </View>

                        <Input
                            label="Contact d'urgence"
                            value={formData.contact_parent}
                            onChangeText={(t) => handleChange('contact_parent', t)}
                            placeholder="Mobile du tuteur ou parent"
                            keyboardType="phone-pad"
                            icon="phone"
                            style={styles.fieldInput}
                        />
                    </Card>
                </View>

                {/* Section: Medical */}
                <View style={styles.sectionBlock}>
                    <Text style={styles.sectionHeading}>NOTES MÉDICALES</Text>
                    <Card style={styles.formCard} padding="lg">
                        <Input
                            label="Allergies connues"
                            value={formData.allergies}
                            onChangeText={(t) => handleChange('allergies', t)}
                            placeholder="Aucune allergie signalée..."
                            multiline
                            numberOfLines={2}
                            style={styles.fieldInput}
                        />
                        <Input
                            label="Pépin physique actuel"
                            value={formData.blessures_cours}
                            onChangeText={(t) => handleChange('blessures_cours', t)}
                            placeholder="Zones de douleur ou blessures..."
                            multiline
                            numberOfLines={2}
                            style={styles.fieldInput}
                        />
                        <Input
                            label="Historique médical"
                            value={formData.antecedents}
                            onChangeText={(t) => handleChange('antecedents', t)}
                            placeholder="Antécédents importants..."
                            multiline
                            numberOfLines={2}
                            style={styles.fieldInput}
                        />
                    </Card>
                </View>

                <Button
                    title={isEditing ? 'METTRE À JOUR LE PROFIL' : 'ENREGISTRER L\'ATHLÈTE'}
                    onPress={handleSave}
                    loading={loading}
                    style={styles.mainActionBtn}
                />
                <View style={{ height: 60 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    screenHeader: {
        backgroundColor: COLORS.white,
        paddingHorizontal: SPACING.lg,
        paddingTop: Platform.OS === 'ios' ? 60 : 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[50],
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        width: 40,
        height: 40,
        marginLeft: -10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTxtWrapper: {
        marginLeft: 4,
    },
    screenTitle: {
        ...TYPOGRAPHY.h2,
        color: COLORS.gray[900],
    },
    screenSubtitle: {
        ...TYPOGRAPHY.bodySmall,
        color: COLORS.gray[400],
        marginTop: 2,
    },
    scrollBody: {
        padding: SPACING.lg,
    },
    photoContainer: {
        alignItems: 'center',
        marginVertical: 24,
    },
    photoNote: {
        ...TYPOGRAPHY.label,
        color: COLORS.primary,
        fontSize: 12,
        marginTop: 12,
        fontWeight: '700',
    },
    sectionBlock: {
        marginBottom: 32,
    },
    sectionHeading: {
        ...TYPOGRAPHY.label,
        fontSize: 10,
        color: COLORS.gray[400],
        letterSpacing: 1.5,
        marginBottom: 12,
        marginLeft: 4,
    },
    formCard: {
        ...SHADOWS.sm,
        borderWidth: 1,
        borderColor: COLORS.gray[50],
    },
    dualField: {
        flexDirection: 'row',
    },
    fieldInput: {
        backgroundColor: COLORS.gray[50],
        borderWidth: 0,
        borderRadius: 12,
    },
    inlineLabel: {
        ...TYPOGRAPHY.bodySmall,
        fontWeight: '700',
        color: COLORS.gray[700],
        marginBottom: 10,
        marginTop: 6,
    },
    genderSwitcher: {
        flexDirection: 'row',
        backgroundColor: COLORS.gray[50],
        padding: 4,
        borderRadius: 14,
        marginBottom: 16,
    },
    genderOption: {
        flex: 1,
        flexDirection: 'row',
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        gap: 8,
    },
    genderOptionActive: {
        backgroundColor: COLORS.gray[900],
        ...SHADOWS.xs,
    },
    genderOptionText: {
        ...TYPOGRAPHY.label,
        color: COLORS.gray[500],
        fontSize: 13,
    },
    genderOptionTextOn: {
        color: COLORS.white,
    },
    datePickerToggle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 52,
        backgroundColor: COLORS.gray[50],
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    dateText: {
        ...TYPOGRAPHY.body,
        fontSize: 15,
        color: COLORS.gray[900],
    },
    chipsScroll: {
        gap: 10,
        paddingBottom: 4,
        marginBottom: 20,
    },
    groupChipBtn: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: COLORS.gray[50],
        borderWidth: 1,
        borderColor: COLORS.gray[100],
    },
    groupChipBtnOn: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    groupChipBtnTxt: {
        ...TYPOGRAPHY.label,
        color: COLORS.gray[600],
        fontSize: 13,
    },
    groupChipBtnTxtOn: {
        color: COLORS.white,
    },
    mainActionBtn: {
        marginTop: 10,
        height: 56,
        borderRadius: 16,
        ...SHADOWS.md,
    },
});

export default AthleteFormScreen;
