import React, { useState } from 'react';
import {
    View,
    Image,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';

const ProfileImagePicker = ({ initialImage, onImageSelected, size = 120 }) => {
    const [image, setImage] = useState(initialImage);
    const [loading, setLoading] = useState(false);

    const handlePickImage = async () => {
        try {
            // Request permissions
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission requise', 'Nous avons besoin de votre permission pour accéder à vos photos.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const selectedImage = result.assets[0];
                setImage(selectedImage.uri);
                onImageSelected(selectedImage);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Erreur', 'Impossible de sélectionner l\'image');
        }
    };

    const handleTakePhoto = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission requise', 'Nous avons besoin de votre permission pour utiliser la caméra.');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const selectedImage = result.assets[0];
                setImage(selectedImage.uri);
                onImageSelected(selectedImage);
            }
        } catch (error) {
            console.error('Error taking photo:', error);
            Alert.alert('Erreur', 'Impossible de prendre la photo');
        }
    };

    const showOptions = () => {
        Alert.alert(
            'Photo de profil',
            'Choisissez une option',
            [
                { text: 'Prendre une photo', onPress: handleTakePhoto },
                { text: 'Choisir dans la galerie', onPress: handlePickImage },
                { text: 'Annuler', style: 'cancel' }
            ]
        );
    };

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <TouchableOpacity onPress={showOptions} style={styles.imageContainer}>
                {image ? (
                    <Image source={{ uri: image }} style={[styles.image, { width: size, height: size }]} />
                ) : (
                    <View style={[styles.placeholder, { width: size, height: size }]}>
                        <Icon name="account" size={size * 0.6} color="#cbd5e1" />
                    </View>
                )}
                <View style={styles.editBadge}>
                    <Icon name="camera" size={16} color="white" />
                </View>
            </TouchableOpacity>
            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator color="white" />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignSelf: 'center',
        marginVertical: 20,
    },
    imageContainer: {
        position: 'relative',
        borderRadius: 100,
        overflow: 'hidden',
        backgroundColor: '#f1f5f9',
        borderWidth: 3,
        borderColor: 'white',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    image: {
        borderRadius: 100,
    },
    placeholder: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
    },
    editBadge: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: '#f97316',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default ProfileImagePicker;
