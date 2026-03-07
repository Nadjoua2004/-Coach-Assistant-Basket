import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import AuthService from '../../services/authService';
import ProfileImagePicker from '../Common/ProfileImagePicker';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../config/theme';
import Button from '../UI/Button';
import Input from '../UI/Input';

const CoachProfileModal = ({ visible, onClose, onUpdate, user }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        club_role: user?.club_role || '',
    });
    const [photo, setPhoto] = useState(null);

    const handleSave = async () => {
        if (!formData.name || !formData.email) {
            Alert.alert('Champs requis', 'Le nom et l\'email sont obligatoires pour votre profil.');
            return;
        }

        try {
            setLoading(true);
            const response = await AuthService.updateProfile(formData, photo);

            if (response.success) {
                onUpdate(response.data);
                Alert.alert('Succès', 'Votre profil coach a été mis à jour.');
                onClose();
            } else {
                Alert.alert('Erreur', response.message || 'Échec de la mise à jour.');
            }
        } catch (error) {
            Alert.alert('Erreur', 'Une erreur technique est survenue.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <Icon name="close" size={24} color={COLORS.gray[900]} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Édition Profil</Text>
                    <TouchableOpacity onPress={handleSave} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator size="small" color={COLORS.primary} />
                        ) : (
                            <Text style={styles.saveBtnText}>OK</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <ScrollView
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 60 }}
                >
                    <View style={styles.imageSection}>
                        <ProfileImagePicker
                            initialImage={user?.photo_url}
                            onImageSelected={setPhoto}
                            size={120}
                        />
                        <Text style={styles.imageHint}>Appuyez pour changer votre photo</Text>
                    </View>

                    <View style={styles.formCard}>
                        <Input
                            label="Nom complet"
                            value={formData.name}
                            onChangeText={(val) => setFormData({ ...formData, name: val })}
                            placeholder="Ex: Jean Dupont"
                            icon="account-outline"
                            style={styles.inputStyle}
                        />

                        <Input
                            label="Email"
                            value={formData.email}
                            onChangeText={(val) => setFormData({ ...formData, email: val })}
                            keyboardType="email-address"
                            placeholder="coach@club.com"
                            autoCapitalize="none"
                            icon="email-outline"
                            style={styles.inputStyle}
                        />

                        <Input
                            label="Téléphone"
                            value={formData.phone}
                            onChangeText={(val) => setFormData({ ...formData, phone: val })}
                            keyboardType="phone-pad"
                            placeholder="06 -- -- -- --"
                            icon="phone-outline"
                            style={styles.inputStyle}
                        />

                        <Input
                            label="Rôle / Titre"
                            value={formData.club_role}
                            onChangeText={(val) => setFormData({ ...formData, club_role: val })}
                            placeholder="Ex: Responsable technique"
                            icon="briefcase-outline"
                            style={styles.inputStyle}
                        />
                    </View>

                    <Button
                        title="Sauvegarder le profil"
                        onPress={handleSave}
                        loading={loading}
                        style={{ marginTop: 20 }}
                    />
                </ScrollView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        height: 60,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[50],
    },
    closeBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        marginLeft: -10,
    },
    title: {
        ...TYPOGRAPHY.h3,
        color: COLORS.gray[900],
    },
    saveBtnText: {
        ...TYPOGRAPHY.h4,
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        padding: SPACING.lg,
    },
    imageSection: {
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 10,
    },
    imageHint: {
        ...TYPOGRAPHY.bodySmall,
        color: COLORS.gray[400],
        marginTop: 12,
    },
    formCard: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 4,
    },
    inputStyle: {
        backgroundColor: COLORS.gray[50],
        borderWidth: 0,
        borderRadius: 12,
        marginBottom: 16,
    }
});

export default CoachProfileModal;
