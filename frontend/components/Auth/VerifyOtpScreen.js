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
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../config/theme';
import Button from '../UI/Button';
import Card from '../UI/Card';

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
                        <Icon name="arrow-left" size={24} color={COLORS.gray[900]} />
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    <Card padding="lg" shadow="md">
                        <View style={styles.iconContainer}>
                            <View style={styles.logoCircle}>
                                <Icon name="email-check-outline" size={40} color="white" />
                            </View>
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
                                    placeholderTextColor={COLORS.gray[300]}
                                />
                            ))}
                        </View>

                        <Button
                            title="Vérifier"
                            onPress={handleVerify}
                            loading={loading}
                            style={styles.verifyButton}
                        />

                        <TouchableOpacity
                            style={styles.resendButton}
                            onPress={onBack}
                        >
                            <Text style={styles.resendButtonText}>Renvoyer le code</Text>
                        </TouchableOpacity>
                    </Card>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background.main,
    },
    scrollContainer: {
        flexGrow: 1,
    },
    header: {
        paddingHorizontal: SPACING.lg,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        marginBottom: SPACING.lg,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.sm,
    },
    content: {
        padding: SPACING.lg,
        maxWidth: 500,
        width: '100%',
        alignSelf: 'center',
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    logoCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.md,
    },
    title: {
        ...TYPOGRAPHY.h2,
        color: COLORS.gray[900],
        textAlign: 'center',
        marginBottom: SPACING.sm,
    },
    subtitle: {
        ...TYPOGRAPHY.body,
        color: COLORS.gray[500],
        textAlign: 'center',
        marginBottom: SPACING.xl,
        lineHeight: 22,
    },
    emailText: {
        color: COLORS.gray[900],
        fontWeight: '600',
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: SPACING.xl,
        gap: 8,
    },
    otpInput: {
        flex: 1,
        height: 56,
        borderWidth: 1.5,
        borderColor: COLORS.gray[200],
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: COLORS.white,
        textAlign: 'center',
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.gray[900],
    },
    verifyButton: {
        marginTop: SPACING.md,
    },
    resendButton: {
        alignItems: 'center',
        marginTop: SPACING.lg,
        paddingVertical: 8,
    },
    resendButtonText: {
        color: COLORS.secondary,
        fontSize: 14,
        fontWeight: '600',
    },
});

export default VerifyOtpScreen;
