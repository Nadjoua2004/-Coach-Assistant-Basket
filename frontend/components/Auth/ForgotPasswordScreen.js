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
    ScrollView,
    Dimensions
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import AuthService from '../../services/authService';

const { width } = Dimensions.get('window');

const ForgotPasswordScreen = ({ onBack, onCodeSent }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendCode = async () => {
        if (!email) {
            Alert.alert('Erreur', 'Veuillez entrer votre adresse email');
            return;
        }

        setLoading(true);
        try {
            const result = await AuthService.forgotPassword(email);
            if (result.success) {
                Alert.alert('Succès', result.message || 'Un code a été envoyé.');
                onCodeSent(email);
            } else {
                Alert.alert('Erreur', result.message || 'Impossible d\'envoyer le code.');
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
                        <Icon name="lock-reset" size={60} color="#f97316" />
                    </View>

                    <Text style={styles.title}>Mot de passe oublié</Text>
                    <Text style={styles.subtitle}>
                        Entrez votre adresse email pour recevoir un code de vérification à 6 chiffres.
                    </Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <View style={styles.inputContainer}>
                            <Icon name="email-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="votre-email@club.dz"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                placeholderTextColor="#94a3b8"
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.sendButton, loading && styles.disabledButton]}
                        onPress={handleSendCode}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.sendButtonText}>Envoyer le code</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.cancelButton} onPress={onBack}>
                        <Text style={styles.cancelButtonText}>Annuler</Text>
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
        marginBottom: 24,
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
    sendButton: {
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
        marginBottom: 16,
    },
    sendButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledButton: {
        opacity: 0.7,
    },
    cancelButton: {
        padding: 12,
    },
    cancelButtonText: {
        color: '#64748b',
        fontSize: 14,
        fontWeight: '500',
    },
});

export default ForgotPasswordScreen;
