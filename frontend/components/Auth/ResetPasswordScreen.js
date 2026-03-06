import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import AuthService from '../../services/authService';

const ResetPasswordScreen = ({ email, otp, onBack, onSuccess }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleReset = async () => {
        if (!password || !confirmPassword) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        setLoading(true);
        try {
            const result = await AuthService.resetPassword(email, otp, password);
            if (result.success) {
                Alert.alert('Succès', 'Votre mot de passe a été réinitialisé avec succès !', [
                    { text: 'OK', onPress: onSuccess }
                ]);
            } else {
                Alert.alert('Erreur', result.message || 'Échec de la réinitialisation');
            }
        } catch (error) {
            Alert.alert('Erreur', 'Une erreur est survenue.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={onBack}>
                        <Icon name="arrow-left" size={24} color="#1e293b" />
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    <View style={styles.iconContainer}>
                        <Icon name="shield-check-outline" size={60} color="#f97316" />
                    </View>

                    <Text style={styles.title}>Nouveau mot de passe</Text>
                    <Text style={styles.subtitle}>
                        Créez un nouveau mot de passe sécurisé pour votre compte.
                    </Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Nouveau mot de passe</Text>
                        <View style={styles.inputContainer}>
                            <Icon name="lock-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="••••••••"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                placeholderTextColor="#94a3b8"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Confirmer le mot de passe</Text>
                        <View style={styles.inputContainer}>
                            <Icon name="lock-check-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                                placeholderTextColor="#94a3b8"
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.resetButton, loading && styles.disabledButton]}
                        onPress={handleReset}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.resetButtonText}>Réinitialiser</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    scrollContainer: {
        flexGrow: 1,
        padding: 24,
    },
    header: {
        marginTop: 20,
        marginBottom: 40,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#fff7ed',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
    },
    inputGroup: {
        width: '100%',
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 8,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        height: 56,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#1e293b',
    },
    resetButton: {
        width: '100%',
        height: 56,
        backgroundColor: '#f97316',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#f97316',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
        marginTop: 12,
    },
    resetButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledButton: {
        opacity: 0.7,
    },
});

export default ResetPasswordScreen;
