import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    Alert,
    ScrollView,
    TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AthleteService from '../../services/athleteService';
import AthleteFormScreen from '../Coach/AthleteFormScreen';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const PlayerProfileScreen = () => {
    const [loading, setLoading] = useState(true);
    const [athlete, setAthlete] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await AthleteService.getMyProfile();
            if (response.success) {
                setAthlete(response.data);
            } else {
                Alert.alert('Erreur', 'Impossible de charger votre profil');
            }
        } catch (error) {
            console.error('Fetch profile error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#f97316" />
            </View>
        );
    }

    if (isEditing || !athlete) {
        return (
            <AthleteFormScreen
                athlete={athlete}
                onBack={() => {
                    if (!athlete) {
                        // If they don't have a profile yet and cancel editing
                        // they stay in "profile missing" state which is handled by dashboard
                        setIsEditing(false);
                    } else {
                        setIsEditing(false);
                    }
                }}
                onSave={(updatedAthlete) => {
                    setAthlete(updatedAthlete);
                    setIsEditing(false);
                }}
            />
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.title}>Mon Profil Athlète</Text>
                <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editBtn}>
                    <Icon name="pencil" size={20} color="white" />
                    <Text style={styles.editBtnText}>Modifier</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Photo & Basic Info */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        <Icon name="account" size={60} color="#94a3b8" />
                    </View>
                    <Text style={styles.name}>{athlete.prenom} {athlete.nom}</Text>
                    <Text style={styles.role}>Athlète • {athlete.groupe}</Text>
                </View>

                {/* Details Section */}
                <View style={styles.detailsGroup}>
                    <DetailRow icon="basketball" label="Poste" value={athlete.poste} />
                    <DetailRow icon="human-male-height" label="Taille" value={`${athlete.taille} cm`} />
                    <DetailRow icon="weight-kilogram" label="Poids" value={`${athlete.poids} kg`} />
                    <DetailRow icon="card-account-details-outline" label="N° Licence" value={athlete.numero_licence} />
                    <DetailRow icon="phone" label="Contact Parent" value={athlete.contact_parent || athlete.telephone} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const DetailRow = ({ icon, label, value }) => (
    <View style={styles.detailRow}>
        <View style={styles.detailIcon}>
            <Icon name={icon} size={20} color="#64748b" />
        </View>
        <View style={styles.detailText}>
            <Text style={styles.detailLabel}>{label}</Text>
            <Text style={styles.detailValue}>{value || 'Non renseigné'}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    editBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f97316',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    editBtnText: {
        color: 'white',
        fontWeight: 'bold',
        marginLeft: 4,
    },
    content: {
        padding: 20,
    },
    profileCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    role: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 4,
    },
    detailsGroup: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    detailRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    detailIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    detailText: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1e293b',
    },
});

export default PlayerProfileScreen;
