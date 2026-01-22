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

const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
  const { login, register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('joueur');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
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
              <Icon name="camera" size={40} color="white" />
            </View>
            <Text style={styles.title}>Coach Assistant</Text>
            <Text style={styles.subtitle}>Belouizdad Basket-Ball 2011</Text>
          </View>

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
                <View style={[styles.inputContainer, styles.halfInput]}>
                  <Text style={styles.label}>Prénom</Text>
                  <TextInput
                    style={styles.input}
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="Votre prénom"
                    placeholderTextColor="#9ca3af"
                    returnKeyType="next"
                  />
                </View>
                <View style={[styles.inputContainer, styles.halfInput]}>
                  <Text style={styles.label}>Nom</Text>
                  <TextInput
                    style={styles.input}
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Votre nom"
                    placeholderTextColor="#9ca3af"
                    returnKeyType="next"
                  />
                </View>
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="votre-email@club.dz"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#9ca3af"
                returnKeyType="next"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Mot de passe</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry
                placeholderTextColor="#9ca3af"
                returnKeyType="done"
              />
              {isSignUp && (
                <Text style={styles.passwordHint}>
                  Minimum 8 caractères avec chiffres et lettres
                </Text>
              )}
            </View>

            {isSignUp && (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Confirmer le mot de passe</Text>
                  <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="••••••••"
                    secureTextEntry
                    placeholderTextColor="#9ca3af"
                    returnKeyType="done"
                  />
                </View>
                <View style={styles.inputContainer}>
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

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={isSignUp ? handleSignUp : handleLogin}
              activeOpacity={0.8}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>
                {loading ? 'Chargement...' : (isSignUp ? "S'inscrire" : "Se connecter")}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.switchMode} onPress={toggleMode} activeOpacity={0.7}>
            <Text style={styles.switchModeText}>
              {isSignUp
                ? "Déjà un compte ? Se connecter"
                : "Pas de compte ? S'inscrire"}
            </Text>
          </TouchableOpacity>

          {!isSignUp && (
            <>
              <TouchableOpacity style={styles.forgotPassword} activeOpacity={0.7}>
                <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
              </TouchableOpacity>

           
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    minHeight: height, // Set minimum height to screen height
  },
  content: {
    padding: 20,
    minHeight: height, // Ensure content fills the screen
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    backgroundColor: '#f97316',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  activeToggle: {
    backgroundColor: '#f97316',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeToggleText: {
    color: 'white',
    fontWeight: '600',
  },
  form: {
    marginBottom: 24,
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  halfInput: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  passwordHint: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
    marginLeft: 4,
  },
  loginButton: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  switchMode: {
    alignItems: 'center',
    marginBottom: 20,
  },
  switchModeText: {
    color: '#ea580c',
    fontSize: 14,
    fontWeight: '500',
  },
  forgotPassword: {
    alignItems: 'center',
    marginBottom: 32,
  },
  forgotPasswordText: {
    color: '#ea580c',
    fontSize: 14,
    fontWeight: '500',
  },
  roleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  roleButtonActive: {
    backgroundColor: '#f97316',
    borderColor: '#f97316',
  },
  roleButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  roleButtonTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  demoBanner: {
    backgroundColor: '#fff7ed',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffedd5',
    marginTop: 8,
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#9a3412',
    marginBottom: 8,
  },
  demoItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  demoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#c2410c',
    width: 60,
  },
  demoValue: {
    fontSize: 13,
    color: '#9a3412',
    flex: 1,
  },
  demoHint: {
    fontSize: 11,
    color: '#ea580c',
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default LoginScreen;