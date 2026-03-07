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
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../config/theme';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Card from '../UI/Card';

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
                        <Icon name="arrow-left" size={24} color={COLORS.gray[900]} />
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    <Card padding="lg" shadow="md">
                        <View style={styles.iconContainer}>
                            <View style={styles.logoCircle}>
                                <Icon name="lock-reset" size={40} color="white" />
                            </View>
                        </View>

                        <Text style={styles.title}>Mot de passe oublié</Text>
                        <Text style={styles.subtitle}>
                            Entrez votre adresse email pour recevoir un code de vérification à 6 chiffres.
                        </Text>

                        <Input
                            label="Email"
                            placeholder="votre-email@club.dz"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            icon={<Icon name="email-outline" size={20} color={COLORS.gray[400]} />}
                        />

                        <Button
                            title="Envoyer le code"
                            onPress={handleSendCode}
                            loading={loading}
                            style={styles.sendButton}
                        />

                        <TouchableOpacity style={styles.cancelButton} onPress={onBack}>
                            <Text style={styles.cancelButtonText}>Annuler</Text>
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
    sendButton: {
        marginTop: SPACING.md,
    },
    cancelButton: {
        alignItems: 'center',
        marginTop: SPACING.lg,
        paddingVertical: 8,
    },
    cancelButtonText: {
        color: COLORS.gray[500],
        fontSize: 14,
        fontWeight: '500',
    },
});

export default ForgotPasswordScreen;
