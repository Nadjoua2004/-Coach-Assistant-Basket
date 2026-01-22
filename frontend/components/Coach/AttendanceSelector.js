import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import PlanningService from '../../services/planningService';

const AttendanceSelector = ({ onSelectSession }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const response = await PlanningService.getAllPlanning();
            if (response.success) {
                // Sort by date (descending) and take the last 20
                const sorted = response.data.sort((a, b) => new Date(b.date) - new Date(a.date));
                setEvents(sorted);
            }
        } catch (error) {
            console.error('Fetch planning events error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchEvents();
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#f97316" />
                <Text style={styles.loadingText}>Chargement des séances...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Faire l'appel</Text>
                <Text style={styles.subtitle}>Sélectionnez une séance dans le planning</Text>
            </View>

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} color="#f97316" />
                }
            >
                {events.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Icon name="calendar-blank" size={60} color="#cbd5e1" />
                        <Text style={styles.emptyText}>Aucune séance dans le planning</Text>
                        <Text style={styles.emptySubText}>Créez d'abord une séance dans l'onglet Planning.</Text>
                    </View>
                ) : (
                    events.map(event => (
                        <TouchableOpacity
                            key={event.id}
                            style={styles.eventCard}
                            onPress={() => onSelectSession(event)}
                        >
                            <View style={styles.eventInfo}>
                                <Text style={styles.eventTheme}>{event.theme || event.title || 'Séance sans titre'}</Text>
                                <View style={styles.eventMeta}>
                                    <View style={styles.metaItem}>
                                        <Icon name="calendar" size={14} color="#64748b" />
                                        <Text style={styles.metaText}>{event.date}</Text>
                                    </View>
                                    <View style={styles.metaItem}>
                                        <Icon name="clock-outline" size={14} color="#64748b" />
                                        <Text style={styles.metaText}>{event.heure}</Text>
                                    </View>
                                    <View style={styles.metaItem}>
                                        <Icon name="account-group" size={14} color="#64748b" />
                                        <Text style={styles.metaText}>{event.groupe}</Text>
                                    </View>
                                </View>
                            </View>
                            <Icon name="chevron-right" size={24} color="#cbd5e1" />
                        </TouchableOpacity>
                    ))
                )}
                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
};

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
    loadingText: {
        marginTop: 12,
        color: '#64748b',
        fontSize: 16,
    },
    header: {
        padding: 24,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    subtitle: {
        fontSize: 15,
        color: '#64748b',
        marginTop: 4,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    eventCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    eventInfo: {
        flex: 1,
    },
    eventTheme: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 8,
    },
    eventMeta: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 12,
        color: '#64748b',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#64748b',
        marginTop: 16,
    },
    emptySubText: {
        fontSize: 14,
        color: '#94a3b8',
        marginTop: 8,
        textAlign: 'center',
    }
});

export default AttendanceSelector;
