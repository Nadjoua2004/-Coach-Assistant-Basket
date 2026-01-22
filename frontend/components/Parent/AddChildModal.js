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
    Modal
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import AthleteService from '../../services/athleteService';
import { SafeAreaView } from 'react-native-safe-area-context';

const AddChildModal = ({ visible, onClose, onSave }) => {
    const [loading, setLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        date_naissance: '',
        sexe: 'M',
        taille: '',
        poids: '',
        poste: '',
        groupe: 'U17'
    });

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
            const response = await AthleteService.createAthlete(athleteData);
            if (response.success) {
                Alert.alert('Succès', 'Enfant ajouté avec succès');
                onSave(response.data);
                onClose();
            }
        } catch (error) {
            console.error('Error adding child:', error);
            Alert.alert('Erreur', 'Impossible d\'ajouter l\'enfant');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={false}>
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.backButton}>
                        <Icon name="close" size={24} color="#1e293b" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Ajouter un enfant</Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView contentContainerStyle={styles.formContent}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Informations Personnelles</Text>
                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: 8 }}>
                                <Text style={styles.label}>Nom *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.nom}
                                    onChangeText={(t) => handleChange('nom', t)}
                                    placeholder="Nom"
                                />
                            </View>
                            <View style={{ flex: 1, marginLeft: 8 }}>
                                <Text style={styles.label}>Prénom *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.prenom}
                                    onChangeText={(t) => handleChange('prenom', t)}
                                    placeholder="Prénom"
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
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Détails Basket</Text>
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
                                <Text style={styles.label}>Poste (1-5)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.poste}
                                    onChangeText={(t) => handleChange('poste', t)}
                                    keyboardType="numeric"
                                    placeholder="1"
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
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButton, loading && styles.disabledButton]}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.saveButtonText}>Enregistrer l'enfant</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
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

export default AddChildModal;
