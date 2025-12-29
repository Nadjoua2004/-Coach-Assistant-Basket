import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AuthService from '../../services/authService';

const UserCreationModal = ({ visible, onClose, onSuccess, lockedRole }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState(lockedRole || 'joueur');
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!email || !password || !name) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        setLoading(true);
        try {
            const result = await AuthService.adminCreateUser({
                email,
                password,
                name,
                role
            });

            if (result.success) {
                Alert.alert('Succès', 'Utilisateur créé avec succès');
                setEmail('');
                setPassword('');
                setName('');
                setRole('joueur');
                onSuccess && onSuccess();
                onClose();
            } else {
                Alert.alert('Erreur', result.message || 'Erreur lors de la création');
            }
        } catch (error) {
            Alert.alert('Erreur', 'Une erreur inattendue est survenue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalContent}
                >
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Ajouter un utilisateur</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Icon name="close" size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Nom complet</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Ex: Malik Kaouha"
                                placeholderTextColor="#94a3b8"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="email@exemple.com"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                placeholderTextColor="#94a3b8"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Mot de passe</Text>
                            <TextInput
                                style={styles.input}
                                value={password}
                                onChangeText={setPassword}
                                placeholder="••••••••"
                                secureTextEntry
                                placeholderTextColor="#94a3b8"
                            />
                        </View>

                        {!lockedRole && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Rôle</Text>
                                <View style={styles.roleGrid}>
                                    {['admin', 'coach', 'adjoint', 'joueur', 'parent'].map((r) => (
                                        <TouchableOpacity
                                            key={r}
                                            style={[styles.roleOption, role === r && styles.roleOptionActive]}
                                            onPress={() => setRole(r)}
                                        >
                                            <Text style={[styles.roleText, role === r && styles.roleTextActive]}>
                                                {r.charAt(0).toUpperCase() + r.slice(1)}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={onClose}
                            disabled={loading}
                        >
                            <Text style={styles.cancelText}>Annuler</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.createButton, loading && styles.disabledButton]}
                            onPress={handleCreate}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <Text style={styles.createText}>Créer</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90%',
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    form: {
        marginBottom: 24,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        color: '#1e293b',
    },
    roleGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    roleOption: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    roleOptionActive: {
        backgroundColor: '#f97316',
        borderColor: '#f97316',
    },
    roleText: {
        fontSize: 13,
        color: '#64748b',
    },
    roleTextActive: {
        color: 'white',
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
    },
    cancelText: {
        color: '#475569',
        fontWeight: '600',
    },
    createButton: {
        flex: 2,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        backgroundColor: '#f97316',
    },
    createText: {
        color: 'white',
        fontWeight: 'bold',
    },
    disabledButton: {
        opacity: 0.7,
    }
});

export default UserCreationModal;
