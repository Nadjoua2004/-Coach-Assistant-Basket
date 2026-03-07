import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    Platform
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import PlanningService from '../../services/planningService';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../config/theme';
import Card from '../UI/Card';

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
                <ActivityIndicator size="large" color={COLORS.primary} />
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
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
                }
            >
                {events.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Icon name="calendar-blank" size={60} color={COLORS.gray[200]} />
                        <Text style={styles.emptyText}>Aucune séance dans le planning</Text>
                        <Text style={styles.emptySubText}>Créez d'abord une séance dans l'onglet Planning.</Text>
                    </View>
                ) : (
                    events.map(event => (
                        <Card
                            key={event.id}
                            style={styles.eventCard}
                            padding="lg"
                            shadow="sm"
                            onPress={() => onSelectSession(event)}
                        >
                            <View style={styles.eventInfo}>
                                <Text style={styles.eventTheme}>{event.theme || event.title || 'Séance sans titre'}</Text>
                                <View style={styles.eventMeta}>
                                    <View style={styles.metaItem}>
                                        <Icon name="calendar" size={14} color={COLORS.gray[400]} />
                                        <Text style={styles.metaText}>{event.date}</Text>
                                    </View>
                                    <View style={styles.metaItem}>
                                        <Icon name="clock-outline" size={14} color={COLORS.gray[400]} />
                                        <Text style={styles.metaText}>{event.heure}</Text>
                                    </View>
                                    <View style={styles.metaItem}>
                                        <Icon name="account-group" size={14} color={COLORS.gray[400]} />
                                        <Text style={styles.metaText}>{event.groupe}</Text>
                                    </View>
                                </View>
                            </View>
                            <Icon name="chevron-right" size={24} color={COLORS.primary} />
                        </Card>
                    ))
                )}
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.gray[50],
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.gray[50],
    },
    loadingText: {
        marginTop: 16,
        color: COLORS.gray[400],
        ...TYPOGRAPHY.bodySmall,
    },
    header: {
        paddingHorizontal: SPACING.lg,
        paddingTop: Platform.OS === 'ios' ? 60 : 30,
        paddingBottom: 24,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[100],
        ...SHADOWS.sm,
    },
    title: {
        ...TYPOGRAPHY.h1,
        fontSize: 28,
        color: COLORS.gray[900],
    },
    subtitle: {
        ...TYPOGRAPHY.bodySmall,
        color: COLORS.gray[400],
        marginTop: 4,
    },
    content: {
        flex: 1,
        padding: SPACING.lg,
    },
    eventCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        borderRadius: 20,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.gray[50],
        ...SHADOWS.sm,
    },
    eventInfo: {
        flex: 1,
    },
    eventTheme: {
        ...TYPOGRAPHY.h4,
        fontSize: 16,
        color: COLORS.gray[900],
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
        gap: 6,
        backgroundColor: COLORS.gray[50],
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.gray[100],
    },
    metaText: {
        ...TYPOGRAPHY.label,
        fontSize: 10,
        color: COLORS.gray[600],
        fontWeight: '700',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 80,
    },
    emptyText: {
        ...TYPOGRAPHY.h3,
        color: COLORS.gray[900],
        marginTop: 24,
    },
    emptySubText: {
        ...TYPOGRAPHY.bodySmall,
        color: COLORS.gray[400],
        marginTop: 8,
        textAlign: 'center',
        paddingHorizontal: 40,
        lineHeight: 20,
    }
});

export default AttendanceSelector;
