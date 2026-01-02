import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as DocumentPicker from 'expo-document-picker';
import VideoService from '../../services/videoService';
import { Video } from 'expo-av';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const ITEM_WIDTH = (width - 60) / COLUMN_COUNT;

const VideoManagerScreen = ({ onBack }) => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        loadVideos();
    }, []);

    const loadVideos = async () => {
        try {
            setLoading(true);
            const response = await VideoService.getAllVideos();
            if (response.success) {
                setVideos(response.data || []);
            }
        } catch (error) {
            console.error('Error loading videos:', error);
            Alert.alert('Erreur', 'Impossible de charger la bibliothèque vidéo');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadVideos();
        setRefreshing(false);
    };

    const handleUploadVideo = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'video/*',
                copyToCacheDirectory: true
            });

            if (result.canceled || !result.assets || result.assets.length === 0) {
                return;
            }

            const asset = result.assets[0];
            
            // Validate size (100MB max)
            if (asset.size > 100 * 1024 * 1024) {
                Alert.alert('Erreur', 'La vidéo est trop volumineuse (max 100 Mo)');
                return;
            }

            setUploading(true);
            const formData = new FormData();
            formData.append('video', {
                uri: asset.uri,
                name: asset.name,
                type: asset.mimeType || 'video/mp4'
            });
            formData.append('title', asset.name.split('.')[0]);

            const response = await VideoService.uploadVideo(formData);
            
            if (response.success) {
                Alert.alert('Succès', 'Vidéo ajoutée à la bibliothèque');
                loadVideos();
            }
        } catch (error) {
            console.error('Upload error:', error);
            Alert.alert('Erreur', 'Échec de l\'upload de la vidéo');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteVideo = (video) => {
        Alert.alert(
            'Supprimer la vidéo',
            `Voulez-vous vraiment supprimer "${video.title}" ? Cette action est irréversible.`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await VideoService.deleteVideo(video.id);
                            if (response.success) {
                                Alert.alert('Succès', 'Vidéo supprimée');
                                loadVideos();
                            }
                        } catch (error) {
                            Alert.alert('Erreur', 'Impossible de supprimer la vidéo');
                        }
                    }
                }
            ]
        );
    };

    const renderVideoItem = ({ item }) => (
        <View style={styles.videoCard}>
            <View style={styles.videoPreview}>
                <Icon name="video" size={48} color="#CCC" />
                <View style={[StyleSheet.absoluteFill, styles.previewOverlay]}>
                    <Icon name="play-circle" size={32} color="#FFF" />
                </View>
            </View>
            <View style={styles.videoInfo}>
                <Text style={styles.videoTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.videoMeta}>
                    {(item.size / (1024 * 1024)).toFixed(1)} MB
                </Text>
            </View>
            <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => handleDeleteVideo(item)}
            >
                <Icon name="trash-can-outline" size={20} color="#FF6B35" />
            </TouchableOpacity>
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Icon name="video-off-outline" size={64} color="#CCC" />
            <Text style={styles.emptyStateText}>Aucune vidéo</Text>
            <Text style={styles.emptyStateSubtext}>Ajoutez des vidéos pour les coachs</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Vidéothèque</Text>
                    <Text style={styles.headerSubtitle}>{videos.length} vidéos disponibles</Text>
                </View>
            </View>

            {loading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FF6B35" />
                </View>
            ) : (
                <FlatList
                    data={videos}
                    renderItem={renderVideoItem}
                    keyExtractor={item => item.id}
                    numColumns={COLUMN_COUNT}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={renderEmptyState}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF6B35']} />
                    }
                />
            )}

            {uploading && (
                <View style={styles.uploadOverlay}>
                    <ActivityIndicator size="large" color="#FFF" />
                    <Text style={styles.uploadText}>Upload en cours...</Text>
                </View>
            )}

            <TouchableOpacity 
                style={styles.fab}
                onPress={handleUploadVideo}
                disabled={uploading}
            >
                <Icon name="plus" size={32} color="#FFF" />
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAF9'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#EEE'
    },
    backButton: {
        marginRight: 16,
        padding: 4
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1A1A1A'
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#666'
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    listContent: {
        padding: 20,
        paddingBottom: 100
    },
    videoCard: {
        width: ITEM_WIDTH,
        backgroundColor: '#FFF',
        borderRadius: 12,
        marginBottom: 20,
        marginRight: (COLUMN_COUNT === 2) ? 20 : 0,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
    },
    videoPreview: {
        height: 100,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative'
    },
    previewOverlay: {
        backgroundColor: 'rgba(0,0,0,0.1)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    videoInfo: {
        padding: 10
    },
    videoTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A'
    },
    videoMeta: {
        fontSize: 12,
        color: '#999',
        marginTop: 2
    },
    deleteButton: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center'
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FF6B35',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#FF6B35',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 100
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#666',
        marginTop: 16
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#999',
        marginTop: 8
    },
    uploadOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
    },
    uploadText: {
        color: '#FFF',
        marginTop: 16,
        fontSize: 16,
        fontWeight: 'bold'
    }
});

export default VideoManagerScreen;
