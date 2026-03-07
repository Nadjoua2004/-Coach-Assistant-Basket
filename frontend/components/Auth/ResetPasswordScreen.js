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
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../config/theme';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Card from '../UI/Card';

const ResetPasswordScreen = ({ email, otp, onBack, onSuccess }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
                        <Icon name="arrow-left" size={24} color={COLORS.gray[900]} />
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    <Card padding="lg" shadow="md">
                        <View style={styles.iconContainer}>
                            <View style={styles.logoCircle}>
                                <Icon name="shield-check-outline" size={40} color="white" />
                            </View>
                        </View>

                        <Text style={styles.title}>Nouveau mot de passe</Text>
                        <Text style={styles.subtitle}>
                            Créez un nouveau mot de passe sécurisé pour votre compte.
                        </Text>

                        <Input
                            label="Nouveau mot de passe"
                            placeholder="••••••••"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            icon={<Icon name="lock-outline" size={20} color={COLORS.gray[400]} />}
                            rightIcon={
                                <Icon name={showPassword ? "eye-off" : "eye"} size={22} color={COLORS.gray[400]} />
                            }
                            onRightIconPress={() => setShowPassword(!showPassword)}
                        />

                        <Input
                            label="Confirmer le mot de passe"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showConfirmPassword}
                            icon={<Icon name="lock-check-outline" size={20} color={COLORS.gray[400]} />}
                            rightIcon={
                                <Icon name={showConfirmPassword ? "eye-off" : "eye"} size={22} color={COLORS.gray[400]} />
                            }
                            onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        />

                        <Button
                            title="Réinitialiser"
                            onPress={handleReset}
                            loading={loading}
                            style={styles.resetButton}
                        />
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
    resetButton: {
        marginTop: SPACING.md,
    },
});

export default ResetPasswordScreen;
