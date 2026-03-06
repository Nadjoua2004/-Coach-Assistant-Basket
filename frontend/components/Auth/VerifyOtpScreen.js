import React, { useState, useRef } from 'react';
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

const VerifyOtpScreen = ({ email, onBack, onVerified }) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const inputRefs = useRef([]);

    const handleOtpChange = (value, index) => {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyPress = (e, index) => {
        // Handle backspace
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleVerify = async () => {
        const otpString = otp.join('');
        if (otpString.length < 6) {
            Alert.alert('Erreur', 'Veuillez entrer le code complet à 6 chiffres');
            return;
        }

        setLoading(true);
        try {
            const result = await AuthService.verifyOtp(email, otpString);
            if (result.success) {
                onVerified(otpString);
            } else {
                Alert.alert('Erreur', result.message || 'Code invalide ou expiré');
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
                        <Icon name="email-check-outline" size={60} color="#f97316" />
                    </View>

                    <Text style={styles.title}>Vérification</Text>
                    <Text style={styles.subtitle}>
                        Nous avons envoyé un code à 6 chiffres à :{"\n"}
                        <Text style={styles.emailText}>{email}</Text>
                    </Text>

                    <View style={styles.otpContainer}>
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(ref) => (inputRefs.current[index] = ref)}
                                style={styles.otpInput}
                                value={digit}
                                onChangeText={(value) => handleOtpChange(value, index)}
                                onKeyPress={(e) => handleKeyPress(e, index)}
                                keyboardType="number-pad"
                                maxLength={1}
                                selectTextOnFocus
                            />
                        ))}
                    </View>

                    <TouchableOpacity
                        style={[styles.verifyButton, loading && styles.disabledButton]}
                        onPress={handleVerify}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.verifyButtonText}>Vérifier</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.resendButton}
                        onPress={onBack} // For simplicity, go back to re-request
                    >
                        <Text style={styles.resendButtonText}>Renvoyer le code</Text>
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
        marginBottom: 40,
        lineHeight: 24,
    },
    emailText: {
        color: '#1e293b',
        fontWeight: '600',
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 40,
    },
    otpInput: {
        width: 48,
        height: 56,
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        backgroundColor: 'white',
        textAlign: 'center',
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    verifyButton: {
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
    verifyButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledButton: {
        opacity: 0.7,
    },
    resendButton: {
        padding: 12,
    },
    resendButtonText: {
        color: '#ea580c',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default VerifyOtpScreen;
