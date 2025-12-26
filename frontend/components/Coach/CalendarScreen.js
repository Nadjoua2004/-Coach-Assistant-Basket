import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Modal,
    TextInput,
    ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import PlanningService from '../../services/planningService';
import SessionService from '../../services/sessionService';

const CalendarScreen = ({ onTakeAttendance }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [sessions, setSessions] = useState([]);

    // Form state
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [heure, setHeure] = useState('');
    const [lieu, setLieu] = useState('');
    const [type, setType] = useState('Entraînement');
    const [sessionId, setSessionId] = useState(null);
    const [groupe, setGroupe] = useState('U15');

    useEffect(() => {
        fetchPlanning();
        fetchSessions();
    }, []);

    const fetchPlanning = async () => {
        try {
            setLoading(true);
            const response = await PlanningService.getAllPlanning();
            if (response.success) {
                setEvents(response.data);
            }
        } catch (error) {
            console.error('Error fetching planning:', error);
            Alert.alert('Erreur', 'Impossible de charger le planning');
        } finally {
            setLoading(false);
        }
    };

    const fetchSessions = async () => {
        try {
            const response = await SessionService.getAllSessions();
            if (response.success) {
                setSessions(response.data);
            }
        } catch (error) {
            console.error('Error fetching sessions:', error);
        }
    };

    const handleCreateEvent = async () => {
        if (!title || !date || !heure) {
            Alert.alert('Erreur', 'Veuillez remplir les champs obligatoires');
            return;
        }

        try {
            const eventData = {
                title,
                date,
                heure,
                lieu,
                type,
                session_id: type === 'Entraînement' ? sessionId : null,
                groupe
            };

            const response = await PlanningService.createEvent(eventData);
            if (response.success) {
                Alert.alert('Succès', 'Événement ajouté au planning');
                setShowForm(false);
                fetchPlanning();
                // Reset form
                setTitle('');
                setDate('');
                setHeure('');
                setLieu('');
                setSessionId(null);
            }
        } catch (error) {
            Alert.alert('Erreur', 'Impossible de créer l\'événement');
        }
    };

    const handleDeleteEvent = (id) => {
        Alert.alert('Supprimer', 'Voulez-vous supprimer cet événement ?', [
            { text: 'Annuler', style: 'cancel' },
            {
                text: 'Supprimer',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await PlanningService.deleteEvent(id);
                        setEvents(events.filter(e => e.id !== id));
                    } catch (error) {
                        Alert.alert('Erreur', 'Impossible de supprimer l\'événement');
                    }
                }
            }
        ]);
    };

    const getEventIcon = (type) => {
        switch (type) {
            case 'Entraînement': return 'basketball';
            case 'Match': return 'trophy';
            case 'Réunion': return 'account-group';
            default: return 'calendar-star';
        }
    };

    const renderEventItem = ({ item }) => (
        <View style={styles.eventCard}>
            <View style={styles.eventTimeContainer}>
                <Text style={styles.eventTime}>{item.heure}</Text>
                <View style={styles.timeLine} />
            </View>
            <View style={styles.eventMain}>
                <View style={styles.eventHeader}>
                    <View style={[styles.typeBadge, { backgroundColor: item.type === 'Match' ? '#fee2e2' : '#fef3c7' }]}>
                        <Icon name={getEventIcon(item.type)} size={14} color={item.type === 'Match' ? '#ef4444' : '#f59e0b'} />
                        <Text style={[styles.typeText, { color: item.type === 'Match' ? '#b91c1c' : '#b45309' }]}>{item.type}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity style={{ marginRight: 12 }} onPress={() => onTakeAttendance(item)}>
                            <Icon name="clipboard-check-outline" size={20} color="#f97316" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteEvent(item.id)}>
                            <Icon name="dots-vertical" size={20} color="#94a3b8" />
                        </TouchableOpacity>
                    </View>
                </View>
                <Text style={styles.eventTitle}>{item.title}</Text>
                <View style={styles.eventFooter}>
                    <View style={styles.infoRow}>
                        <Icon name="map-marker" size={14} color="#64748b" />
                        <Text style={styles.infoText}>{item.lieu || 'Non spécifié'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Icon name="account-group" size={14} color="#64748b" />
                        <Text style={styles.infoText}>{item.groupe}</Text>
                    </View>
                </View>
            </View>
        </View>
    );

    // Group events by date
    const groupedEvents = events.reduce((groups, event) => {
        const date = event.date;
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(event);
        return groups; // Group sessions by date for display
    }, {});

    const sections = Object.keys(groupedEvents).map(date => ({
        date,
        data: groupedEvents[date]
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Planning</Text>
                <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(true)}>
                    <Icon name="calendar-plus" size={24} color="white" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color="#f97316" />
                </View>
            ) : (
                <FlatList
                    data={sections}
                    keyExtractor={(item) => item.date}
                    renderItem={({ item }) => (
                        <View style={styles.dateSection}>
                            <Text style={styles.dateHeader}>{new Date(item.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
                            {item.data.map(event => (
                                <View key={event.id}>
                                    {renderEventItem({ item: event })}
                                </View>
                            ))}
                        </View>
                    )}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Icon name="calendar-blank" size={64} color="#cbd5e1" />
                            <Text style={styles.emptyText}>Aucun événement programmé</Text>
                        </View>
                    }
                    onRefresh={fetchPlanning}
                    refreshing={loading}
                />
            )}

            {/* Quick Add Modal */}
            <Modal visible={showForm} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Programmer une séance</Text>
                            <TouchableOpacity onPress={() => setShowForm(false)}>
                                <Icon name="close" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalForm}>
                            <Text style={styles.label}>Titre *</Text>
                            <TextInput
                                style={styles.input}
                                value={title}
                                onChangeText={setTitle}
                                placeholder="Ex: Entraînement Tactique"
                            />

                            <View style={styles.row}>
                                <View style={{ flex: 1, marginRight: 8 }}>
                                    <Text style={styles.label}>Date (AAAA-MM-JJ) *</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={date}
                                        onChangeText={setDate}
                                        placeholder="2024-12-26"
                                    />
                                </View>
                                <View style={{ flex: 1, marginLeft: 8 }}>
                                    <Text style={styles.label}>Heure (HH:MM) *</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={heure}
                                        onChangeText={setHeure}
                                        placeholder="18:00"
                                    />
                                </View>
                            </View>

                            <Text style={styles.label}>Lieu</Text>
                            <TextInput
                                style={styles.input}
                                value={lieu}
                                onChangeText={setLieu}
                                placeholder="Salle des sports..."
                            />

                            <Text style={styles.label}>Type</Text>
                            <View style={styles.typeSelector}>
                                {['Entraînement', 'Match', 'Réunion'].map(t => (
                                    <TouchableOpacity
                                        key={t}
                                        style={[styles.typeBtn, type === t && styles.activeTypeBtn]}
                                        onPress={() => setType(t)}
                                    >
                                        <Text style={[styles.typeBtnText, type === t && styles.activeTypeBtnText]}>{t}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {type === 'Entraînement' && (
                                <>
                                    <Text style={styles.label}>Sélectionner un contenu de séance</Text>
                                    <View style={styles.sessionPicker}>
                                        {sessions.map(s => (
                                            <TouchableOpacity
                                                key={s.id}
                                                style={[styles.sessionOption, sessionId === s.id && styles.activeSessionOption]}
                                                onPress={() => setSessionId(s.id)}
                                            >
                                                <Text style={[styles.sessionOptionText, sessionId === s.id && styles.activeSessionOptionText]}>{s.title}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </>
                            )}

                            <TouchableOpacity style={styles.submitBtn} onPress={handleCreateEvent}>
                                <Text style={styles.submitBtnText}>Confirmer la programmation</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        paddingTop: 20,
        backgroundColor: 'white',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    addBtn: {
        backgroundColor: '#f97316',
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 20,
    },
    dateSection: {
        marginBottom: 24,
    },
    dateHeader: {
        fontSize: 14,
        fontWeight: '700',
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
        marginLeft: 4,
    },
    eventCard: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    eventTimeContainer: {
        width: 60,
        alignItems: 'center',
        paddingTop: 4,
    },
    eventTime: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1e293b',
    },
    timeLine: {
        width: 2,
        flex: 1,
        backgroundColor: '#e2e8f0',
        marginTop: 8,
        borderRadius: 1,
    },
    eventMain: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    eventHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    typeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 4,
    },
    typeText: {
        fontSize: 11,
        fontWeight: '700',
    },
    eventTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 12,
    },
    eventFooter: {
        flexDirection: 'row',
        gap: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    infoText: {
        fontSize: 12,
        color: '#64748b',
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: '#94a3b8',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        maxHeight: '90%',
        padding: 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    modalForm: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        color: '#1e293b',
    },
    row: {
        flexDirection: 'row',
    },
    typeSelector: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 8,
    },
    typeBtn: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: '#f1f5f9',
    },
    activeTypeBtn: {
        backgroundColor: '#f97316',
    },
    typeBtnText: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '600',
    },
    activeTypeBtnText: {
        color: 'white',
    },
    sessionPicker: {
        gap: 8,
    },
    sessionOption: {
        padding: 12,
        borderRadius: 10,
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    activeSessionOption: {
        borderColor: '#f97316',
        backgroundColor: '#fff7ed',
    },
    sessionOptionText: {
        fontSize: 14,
        color: '#334155',
    },
    activeSessionOptionText: {
        color: '#f97316',
        fontWeight: '600',
    },
    submitBtn: {
        backgroundColor: '#f97316',
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 32,
        marginBottom: 20,
    },
    submitBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default CalendarScreen;
