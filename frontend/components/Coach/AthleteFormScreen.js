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
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AthleteService from '../../services/athleteService';

const AthleteFormScreen = ({ athlete, onBack, onSave }) => {
    const isEditing = !!athlete;
    const [loading, setLoading] = useState(false);

    // Form state
    const [nom, setNom] = useState(athlete?.nom || '');
    const [prenom, setPrenom] = useState(athlete?.prenom || '');
    const [dateNaissance, setDateNaissance] = useState(athlete?.date_naissance || '');
    const [sexe, setSexe] = useState(athlete?.sexe || 'M');
    const [groupe, setGroupe] = useState(athlete?.groupe || 'U15');
    const [poste, setPoste] = useState(athlete?.poste || 'Meneur');
    const [taille, setTaille] = useState(athlete?.taille?.toString() || '');
    const [poids, setPoids] = useState(athlete?.poids?.toString() || '');
    const [numeroLicence, setNumeroLicence] = useState(athlete?.numero_licence || '');
    const [telephone, setTelephone] = useState(athlete?.telephone || '');
    const [email, setEmail] = useState(athlete?.email || '');
    const [adresse, setAdresse] = useState(athlete?.adresse || '');

    const handleSave = async () => {
        if (!nom || !prenom || !groupe) {
            Alert.alert('Erreur', 'Veuillez remplir les champs obligatoires (Nom, Prénom, Groupe)');
            return;
        }

        const athleteData = {
            nom,
            prenom,
            date_naissance: dateNaissance,
            sexe,
            groupe,
            poste,
            taille: taille ? parseFloat(taille) : null,
            poids: poids ? parseFloat(poids) : null,
            numero_licence: numeroLicence,
            telephone,
            email,
            adresse,
        };

        try {
            setLoading(true);
            let response;
            if (isEditing) {
                response = await AthleteService.updateAthlete(athlete.id, athleteData);
            } else {
                response = await AthleteService.createAthlete(athleteData);
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

    const renderInput = (label, value, onChangeText, placeholder, keyboardType = 'default', required = false) => (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{label}{required && ' *'}</Text>
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                keyboardType={keyboardType}
                placeholderTextColor="#94a3b8"
            />
        </View>
    );

    const renderPicker = (label, options, currentValue, onSelect) => (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.pickerContainer}>
                {options.map(option => (
                    <TouchableOpacity
                        key={option.value}
                        style={[
                            styles.pickerOption,
                            currentValue === option.value && styles.activePickerOption
                        ]}
                        onPress={() => onSelect(option.value)}
                    >
                        <Text style={[
                            styles.pickerText,
                            currentValue === option.value && styles.activePickerText
                        ]}>
                            {option.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Icon name="arrow-left" size={24} color="#1e293b" />
                </TouchableOpacity>
                <Text style={styles.title}>{isEditing ? 'Modifier' : 'Ajouter'} un athlète</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.formContent}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Informations Personnelles</Text>
                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            {renderInput('Nom', nom, setNom, 'Belaidi', 'default', true)}
                        </View>
                        <View style={{ flex: 1, marginLeft: 8 }}>
                            {renderInput('Prénom', prenom, setPrenom, 'Mohamed', 'default', true)}
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            {renderInput('Date de naissance', dateNaissance, setDateNaissance, 'AAAA-MM-JJ', 'default')}
                        </View>
                        <View style={{ flex: 1, marginLeft: 8 }}>
                            {renderPicker('Sexe', [
                                { label: 'H', value: 'M' },
                                { label: 'F', value: 'F' }
                            ], sexe, setSexe)}
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            {renderInput('Taille (cm)', taille, setTaille, '185', 'numeric')}
                        </View>
                        <View style={{ flex: 1, marginLeft: 8 }}>
                            {renderInput('Poids (kg)', poids, setPoids, '75', 'numeric')}
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Sportif & Administratif</Text>
                    {renderPicker('Groupe', [
                        { label: 'U13', value: 'U13' },
                        { label: 'U15', value: 'U15' },
                        { label: 'U17', value: 'U17' },
                        { label: 'Seniors', value: 'Seniors' }
                    ], groupe, setGroupe)}

                    {renderPicker('Poste', [
                        { label: 'Meneur', value: 'Meneur' },
                        { label: 'Arrière', value: 'Arrière' },
                        { label: 'Ailier', value: 'Ailier' },
                        { label: 'Pivot', value: 'Pivot' }
                    ], poste, setPoste)}

                    {renderInput('Numéro de licence', numeroLicence, setNumeroLicence, 'LLL-XXXXX')}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contact</Text>
                    {renderInput('Téléphone', telephone, setTelephone, '05XX XX XX XX', 'phone-pad')}
                    {renderInput('Email', email, setEmail, 'email@exemple.dz', 'email-address')}
                    {renderInput('Adresse', adresse, setAdresse, 'Quartier, Ville')}
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
                            {isEditing ? 'Mettre à jour' : 'Enregistrer'} l'athlète
                        </Text>
                    )}
                </TouchableOpacity>
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
        marginBottom: 16,
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
    row: {
        flexDirection: 'row',
    },
    pickerContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    pickerOption: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    activePickerOption: {
        backgroundColor: '#f97316',
        borderColor: '#f97316',
    },
    pickerText: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '600',
    },
    activePickerText: {
        color: 'white',
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
