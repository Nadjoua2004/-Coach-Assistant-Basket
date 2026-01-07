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
import AthleteService from '../../services/athleteService';
import PlanningService from '../../services/planningService';
import SessionService from '../../services/sessionService';

// ... getWeekNumber helper ...

// Helper to get week number
const getWeekNumber = (d) => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo;
};

const CalendarScreen = ({ onTakeAttendance }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [sessions, setSessions] = useState([]);

    // Form state
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [heure, setHeure] = useState('');
    const [duree, setDuree] = useState('90');
    const [lieu, setLieu] = useState('');
    const [type, setType] = useState('Entraînement');
    const [sessionId, setSessionId] = useState(null);
    const [groupe, setGroupe] = useState('U15');

    // Participants Modal State
    const [showParticipantsModal, setShowParticipantsModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [availableAthletes, setAvailableAthletes] = useState([]);
    const [participantsLoading, setParticipantsLoading] = useState(false);

    // Week Navigation
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        fetchPlanning();
        fetchSessions();
    }, [currentDate]);

    const getWeekRange = (date) => {
        const start = new Date(date);
        start.setDate(start.getDate() - start.getDay() + 1); // Monday
        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setDate(end.getDate() + 6); // Sunday
        end.setHours(23, 59, 59, 999);

        return { start, end };
    };

    const fetchPlanning = async () => {
        try {
            setLoading(true);
            const { start, end } = getWeekRange(currentDate);

            // Fetch slightly more to ensure coverage, or just the week
            const response = await PlanningService.getAllPlanning({
                start_date: start.toISOString(),
                end_date: end.toISOString()
            });

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

    const duplicateWeek = async () => {
        Alert.alert(
            'Dupliquer la semaine type',
            'Voulez-vous copier les événements de cette semaine sur la semaine suivante ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Dupliquer',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            const { start, end } = getWeekRange(currentDate);

                            // 1. Get current week events
                            // (We use existing events state, assuming it matches current view)
                            const eventsToCopy = events;

                            if (eventsToCopy.length === 0) {
                                Alert.alert('Info', 'Aucun événement à dupliquer');
                                setLoading(false);
                                return;
                            }

                            // 2. Calculate offsets and create new events
                            const promises = eventsToCopy.map(event => {
                                const oldDate = new Date(event.date);
                                const newDate = new Date(oldDate);
                                newDate.setDate(newDate.getDate() + 7); // Add 7 days

                                const newEvent = {
                                    theme: event.theme || event.title, // Handle potential field mismatch
                                    date: newDate.toISOString().split('T')[0],
                                    heure: event.heure,
                                    duree: event.duree || 90,
                                    lieu: event.lieu,
                                    type: event.type,
                                    session_id: event.session_id,
                                    groupe: event.groupe
                                };
                                return PlanningService.createEvent(newEvent);
                            });

                            await Promise.all(promises);

                            Alert.alert('Succès', 'Semaine dupliquée avec succès');
                            // Navigate to next week
                            const nextWeek = new Date(currentDate);
                            nextWeek.setDate(nextWeek.getDate() + 7);
                            setCurrentDate(nextWeek);

                        } catch (error) {
                            console.error('Error duplicating week:', error);
                            Alert.alert('Erreur', 'Impossible de dupliquer la semaine');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const goToPreviousWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() - 7);
        setCurrentDate(newDate);
    };

    const goToNextWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + 7);
        setCurrentDate(newDate);
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

    const openParticipantsModal = async (event) => {
        setSelectedEvent(event);
        setShowParticipantsModal(true);
        fetchParticipantsAndAthletes(event);
    };

    const fetchParticipantsAndAthletes = async (event) => {
        try {
            setParticipantsLoading(true);
            const [participantsRes, athletesRes] = await Promise.all([
                PlanningService.getParticipants(event.id),
                AthleteService.getAllAthletes(event.groupe ? { groupe: event.groupe } : {})
            ]);

            if (participantsRes.success) {
                setParticipants(participantsRes.data);
            }
            if (athletesRes.success) {
                setAvailableAthletes(athletesRes.data);
            }
        } catch (error) {
            console.error('Error fetching participants:', error);
            Alert.alert('Erreur', 'Impossible de charger les participants');
        } finally {
            setParticipantsLoading(false);
        }
    };

    const handleAddParticipant = async (athleteId) => {
        try {
            const response = await PlanningService.addParticipant(selectedEvent.id, athleteId);
            if (response.success) {
                // Refresh list
                const athlete = availableAthletes.find(a => a.id === athleteId);
                setParticipants([...participants, athlete]);
            }
        } catch (error) {
            console.error('Add participant error:', error);
            Alert.alert('Erreur', 'Impossible d\'ajouter le participant');
        }
    };

    const handleRemoveParticipant = async (athleteId) => {
        try {
            const response = await PlanningService.removeParticipant(selectedEvent.id, athleteId);
            if (response.success) {
                setParticipants(participants.filter(p => p.id !== athleteId));
            }
        } catch (error) {
            console.error('Remove participant error:', error);
            Alert.alert('Erreur', 'Impossible de retirer le participant');
        }
    };

    const handleCreateEvent = async () => {
        if (!title || !date || !heure) {
            Alert.alert('Erreur', 'Veuillez remplir les champs obligatoires');
            return;
        }

        try {
            const eventData = {
                theme: title, // Map title to theme
                date,
                heure,
                duree: parseInt(duree) || 90,
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
                setDuree('90');
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
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <TouchableOpacity onPress={() => openParticipantsModal(item)}>
                        <Icon name="account-multiple-plus" size={20} color="#0ea5e9" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onTakeAttendance(item)}>
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
                <View>
                    <Text style={styles.headerTitle}>Planning</Text>
                    <Text style={styles.headerSubtitle}>
                        {getWeekRange(currentDate).start.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - {getWeekRange(currentDate).end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Text>
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.iconBtn} onPress={duplicateWeek}>
                        <Icon name="content-copy" size={24} color="#64748b" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(true)}>
                        <Icon name="calendar-plus" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Week Navigation Bar */}
            <View style={styles.weekNavBar}>
                <TouchableOpacity onPress={goToPreviousWeek} style={styles.navBtn}>
                    <Icon name="chevron-left" size={28} color="#64748b" />
                </TouchableOpacity>
                <Text style={styles.weekNavText}>Semaine {getWeekNumber(currentDate)}</Text>
                <TouchableOpacity onPress={goToNextWeek} style={styles.navBtn}>
                    <Icon name="chevron-right" size={28} color="#64748b" />
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

            {/* Participants Management Modal */}
            <Modal visible={showParticipantsModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>Participants</Text>
                                <Text style={styles.modalSubtitle}>{selectedEvent?.theme}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setShowParticipantsModal(false)}>
                                <Icon name="close" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        {participantsLoading ? (
                            <ActivityIndicator size="large" color="#f97316" style={{ marginVertical: 20 }} />
                        ) : (
                            <ScrollView style={styles.participantsList}>
                                <Text style={styles.sectionTitle}>Assignés ({participants.length})</Text>
                                {participants.length === 0 ? (
                                    <Text style={styles.emptyText}>Aucun participant assigné</Text>
                                ) : (
                                    participants.map(p => (
                                        <View key={p.id} style={styles.participantRow}>
                                            <Text style={styles.participantName}>{p.prenom} {p.nom}</Text>
                                            <TouchableOpacity onPress={() => handleRemoveParticipant(p.id)}>
                                                <Icon name="minus-circle-outline" size={24} color="#ef4444" />
                                            </TouchableOpacity>
                                        </View>
                                    ))
                                )}

                                <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Disponibles</Text>
                                {availableAthletes.filter(a => !participants.find(p => p.id === a.id)).map(a => (
                                    <View key={a.id} style={styles.participantRow}>
                                        <View>
                                            <Text style={styles.participantName}>{a.prenom} {a.nom}</Text>
                                            <Text style={styles.participantGroup}>{a.groupe}</Text>
                                        </View>
                                        <TouchableOpacity onPress={() => handleAddParticipant(a.id)}>
                                            <Icon name="plus-circle-outline" size={24} color="#22c55e" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>

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

                            <View style={styles.row}>
                                <View style={{ flex: 1, marginRight: 8 }}>
                                    <Text style={styles.label}>Durée (min)</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={duree}
                                        onChangeText={setDuree}
                                        keyboardType="numeric"
                                        placeholder="90"
                                    />
                                </View>
                                <View style={{ flex: 1, marginLeft: 8 }}>
                                    {/* Spacer/Placeholder if needed or another field */}
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
        headerSubtitle: {
            fontSize: 14,
            color: '#64748b',
            marginTop: 4,
        },
        headerActions: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
        },
        iconBtn: {
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: '#f1f5f9',
            justifyContent: 'center',
            alignItems: 'center',
        },
        addBtn: {
            backgroundColor: '#f97316',
            width: 44,
            height: 44,
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
        },
        weekNavBar: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: 'white',
            borderBottomWidth: 1,
            borderBottomColor: '#f1f5f9',
        },
        weekNavText: {
            fontSize: 16,
            fontWeight: '600',
            color: '#334155',
        },
        navBtn: {
            padding: 8,
        },
        // ... rest of styles
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
