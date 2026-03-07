import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  Keyboard,
  Platform
} from 'react-native';
import { useAuth } from '../Common/AuthProvider';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../config/theme';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Card from '../UI/Card';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ onForgotPassword }) => {
  const { login, register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('joueur');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const scrollViewRef = useRef(null);

  const handleLogin = async () => {
    Keyboard.dismiss();

    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Erreur', result.message || 'Email ou mot de passe incorrect');
    }
  };

  const handleSignUp = async () => {
    Keyboard.dismiss();

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
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
    const name = `${firstName} ${lastName}`;
    const result = await register(email, password, name, role);
    setLoading(false);

    if (result.success) {
      Alert.alert('Succès', 'Compte créé avec succès');
    } else {
      Alert.alert('Erreur', result.message || 'Erreur lors de l\'inscription');
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    if (!isSignUp) {
      setFirstName('');
      setLastName('');
    }
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Icon name="basket" size={40} color="white" />
            </View>
            <Text style={styles.title}>Coach Assistant</Text>
            <Text style={styles.subtitle}>Belouizdad Basket-Ball 2011</Text>
          </View>

          <Card padding="lg" shadow="md">
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleButton, !isSignUp && styles.activeToggle]}
                onPress={() => setIsSignUp(false)}
              >
                <Text style={[styles.toggleText, !isSignUp && styles.activeToggleText]}>
                  Connexion
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, isSignUp && styles.activeToggle]}
                onPress={() => setIsSignUp(true)}
              >
                <Text style={[styles.toggleText, isSignUp && styles.activeToggleText]}>
                  Inscription
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              {isSignUp && (
                <View style={styles.nameContainer}>
                  <Input
                    label="Prénom"
                    placeholder="Votre prénom"
                    value={firstName}
                    onChangeText={setFirstName}
                    containerStyle={styles.halfInput}
                    returnKeyType="next"
                  />
                  <Input
                    label="Nom"
                    placeholder="Votre nom"
                    value={lastName}
                    onChangeText={setLastName}
                    containerStyle={styles.halfInput}
                    returnKeyType="next"
                  />
                </View>
              )}

              <Input
                label="Email"
                placeholder="votre-email@club.dz"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                icon={<Icon name="email-outline" size={20} color={COLORS.gray[400]} />}
                returnKeyType="next"
              />

              <Input
                label="Mot de passe"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                icon={<Icon name="lock-outline" size={20} color={COLORS.gray[400]} />}
                rightIcon={
                  <Icon name={showPassword ? "eye-off" : "eye"} size={22} color={COLORS.gray[400]} />
                }
                onRightIconPress={() => setShowPassword(!showPassword)}
                hint={isSignUp ? "Minimum 8 caractères avec chiffres et lettres" : null}
                returnKeyType="done"
              />

              {isSignUp && (
                <>
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
                    returnKeyType="done"
                  />
                  <View style={styles.roleFieldContainer}>
                    <Text style={styles.label}>Rôle</Text>
                    <View style={styles.roleContainer}>
                      {['joueur', 'parent'].map((r) => (
                        <TouchableOpacity
                          key={r}
                          style={[styles.roleButton, role === r && styles.roleButtonActive]}
                          onPress={() => setRole(r)}
                        >
                          <Text style={[styles.roleButtonText, role === r && styles.roleButtonTextActive]}>
                            {r === 'joueur' ? 'Joueur' : 'Parent'}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </>
              )}

              <Button
                title={isSignUp ? "S'inscrire" : "Se connecter"}
                onPress={isSignUp ? handleSignUp : handleLogin}
                loading={loading}
                style={styles.loginButton}
              />
            </View>

            <TouchableOpacity style={styles.switchMode} onPress={toggleMode} activeOpacity={0.7}>
              <Text style={styles.switchModeText}>
                {isSignUp
                  ? "Déjà un compte ? Se connecter"
                  : "Pas de compte ? S'inscrire"}
              </Text>
            </TouchableOpacity>

            {!isSignUp && (
              <TouchableOpacity
                style={styles.forgotPassword}
                activeOpacity={0.7}
                onPress={onForgotPassword}
              >
                <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
              </TouchableOpacity>
            )}
          </Card>
        </View>
      </ScrollView>
    </View>
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
  content: {
    padding: SPACING.lg,
    flex: 1,
    justifyContent: 'center',
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logo: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.primary,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.gray[900],
    marginBottom: 4,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.gray[500],
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.md,
    padding: 4,
    marginBottom: SPACING.lg,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
  },
  activeToggle: {
    backgroundColor: COLORS.white,
    ...SHADOWS.sm,
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.gray[500],
  },
  activeToggleText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  form: {
    width: '100%',
  },
  nameContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  halfInput: {
    flex: 1,
  },
  roleFieldContainer: {
    marginBottom: SPACING.md,
  },
  label: {
    ...TYPOGRAPHY.label,
    color: COLORS.gray[700],
    marginBottom: SPACING.sm,
    marginLeft: 4,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  roleButtonText: {
    fontSize: 14,
    color: COLORS.gray[600],
    fontWeight: '500',
  },
  roleButtonTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  loginButton: {
    marginTop: SPACING.sm,
  },
  switchMode: {
    alignItems: 'center',
    marginTop: SPACING.lg,
    paddingVertical: 8,
  },
  switchModeText: {
    color: COLORS.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingVertical: 8,
  },
  forgotPasswordText: {
    color: COLORS.gray[500],
    fontSize: 14,
    fontWeight: '500',
  },
});

export default LoginScreen;