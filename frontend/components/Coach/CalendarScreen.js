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
    ScrollView,
    Platform
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import AthleteService from '../../services/athleteService';
import PlanningService from '../../services/planningService';
import SessionService from '../../services/sessionService';
import ExerciseSelectionModal from './ExerciseSelectionModal';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../config/theme';
import Button from '../UI/Button';
import Card from '../UI/Card';
import Input from '../UI/Input';

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

    // Exercise Selection State
    const [showExerciseModal, setShowExerciseModal] = useState(false);
    const [selectedExercises, setSelectedExercises] = useState([]);

    // Event Details Modal
    const [viewEvent, setViewEvent] = useState(null);
    const [viewEventDetails, setViewEventDetails] = useState(null); // Full details with exercises
    const [detailsLoading, setDetailsLoading] = useState(false);

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

    const handleAddExercise = (exercise) => {
        if (selectedExercises.find(e => e.id === exercise.id)) {
            Alert.alert('Info', 'Cet exercice est déjà sélectionné');
            return;
        }
        setSelectedExercises([...selectedExercises, exercise]);
        setShowExerciseModal(false);
    };

    const handleRemoveExercise = (exerciseId) => {
        setSelectedExercises(selectedExercises.filter(e => e.id !== exerciseId));
    };

    const handleEventPress = async (event) => {
        setViewEvent(event);
        setDetailsLoading(true);
        try {
            // Fetch session details if linked to a session
            let details = { ...event, exercises: [] };

            if (event.session_id) {
                const sessionRes = await SessionService.getSessionById(event.session_id);
                if (sessionRes.success) {
                    details.exercises = sessionRes.data.exercises || [];
                }
            } else if (event.exercises) {
                // If backend returns exercises directly
                details.exercises = event.exercises;
            }

            setViewEventDetails(details);
        } catch (error) {
            console.error('Error fetching event details:', error);
            Alert.alert('Erreur', 'Impossible de charger les détails');
        } finally {
            setDetailsLoading(false);
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
                type,
                session_id: type === 'Entraînement' ? sessionId : null,
                groupe,
                exercises: selectedExercises.map(e => e.id) // Send exercise IDs
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
                setSelectedExercises([]);
            }
        } catch (error) {
            console.error('Create event error:', error);
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
            <Card
                style={styles.eventMain}
                padding="md"
                shadow="sm"
                onPress={() => handleEventPress(item)}
            >
                <View style={styles.eventHeader}>
                    <View style={[styles.typeBadge, {
                        backgroundColor: item.type === 'Match' ? COLORS.error + '20' :
                            item.type === 'Entraînement' ? COLORS.primary + '20' : COLORS.info + '20'
                    }]}>
                        <Icon
                            name={getEventIcon(item.type)}
                            size={14}
                            color={item.type === 'Match' ? COLORS.error :
                                item.type === 'Entraînement' ? COLORS.primary : COLORS.info}
                        />
                        <Text style={[styles.typeText, {
                            color: item.type === 'Match' ? COLORS.error :
                                item.type === 'Entraînement' ? COLORS.primary : COLORS.info
                        }]}>{item.type}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <TouchableOpacity onPress={() => openParticipantsModal(item)}>
                            <Icon name="account-multiple-plus" size={20} color={COLORS.info} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onTakeAttendance(item)}>
                            <Icon name="clipboard-check-outline" size={20} color={COLORS.success} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteEvent(item.id)}>
                            <Icon name="trash-can-outline" size={20} color={COLORS.error} />
                        </TouchableOpacity>
                    </View>
                </View>
                <Text style={styles.eventTitle}>{item.title || item.theme}</Text>
                <View style={styles.eventFooter}>
                    <View style={styles.infoRow}>
                        <Icon name="map-marker" size={14} color={COLORS.gray[400]} />
                        <Text style={styles.infoText}>{item.lieu || 'Non spécifié'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Icon name="account-group" size={14} color={COLORS.gray[400]} />
                        <Text style={styles.infoText}>{item.groupe}</Text>
                    </View>
                </View>
            </Card>
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
                        <Icon name="content-copy" size={24} color={COLORS.gray[500]} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(true)}>
                        <Icon name="calendar-plus" size={24} color={COLORS.white} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Week Navigation Bar */}
            <View style={styles.weekNavBar}>
                <TouchableOpacity onPress={goToPreviousWeek} style={styles.navBtn}>
                    <Icon name="chevron-left" size={28} color={COLORS.gray[500]} />
                </TouchableOpacity>
                <Text style={styles.weekNavText}>Semaine {getWeekNumber(currentDate)}</Text>
                <TouchableOpacity onPress={goToNextWeek} style={styles.navBtn}>
                    <Icon name="chevron-right" size={28} color={COLORS.gray[500]} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
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
                            <Icon name="calendar-blank" size={64} color={COLORS.gray[200]} />
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
                            <Input
                                label="Titre *"
                                value={title}
                                onChangeText={setTitle}
                                placeholder="Ex: Entraînement Tactique"
                                icon="format-title"
                            />

                            <View style={styles.row}>
                                <View style={{ flex: 1, marginRight: SPACING.sm }}>
                                    <Input
                                        label="Date (AAAA-MM-JJ) *"
                                        value={date}
                                        onChangeText={setDate}
                                        placeholder="2024-12-26"
                                        icon="calendar"
                                    />
                                </View>
                                <View style={{ flex: 1, marginLeft: SPACING.sm }}>
                                    <Input
                                        label="Heure (HH:MM) *"
                                        value={heure}
                                        onChangeText={setHeure}
                                        placeholder="18:00"
                                        icon="clock-outline"
                                    />
                                </View>
                            </View>

                            <View style={styles.row}>
                                <View style={{ flex: 1, marginRight: SPACING.sm }}>
                                    <Input
                                        label="Durée (min)"
                                        value={duree}
                                        onChangeText={setDuree}
                                        keyboardType="numeric"
                                        placeholder="90"
                                        icon="timer-outline"
                                    />
                                </View>
                                <View style={{ flex: 1, marginLeft: SPACING.sm }} />
                            </View>

                            <Input
                                label="Lieu"
                                value={lieu}
                                onChangeText={setLieu}
                                placeholder="Salle des sports..."
                                icon="map-marker"
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
                                    {!sessionId && (
                                        <View style={{ marginBottom: 16 }}>
                                            <Text style={styles.label}>Exercices de la séance</Text>
                                            {selectedExercises.map(ex => (
                                                <View key={ex.id} style={styles.exerciseRow}>
                                                    <Text style={{ flex: 1 }}>{ex.name}</Text>
                                                    <TouchableOpacity onPress={() => handleRemoveExercise(ex.id)}>
                                                        <Icon name="close-circle" size={20} color="#ef4444" />
                                                    </TouchableOpacity>
                                                </View>
                                            ))}
                                            <TouchableOpacity
                                                style={styles.addExerciseBtn}
                                                onPress={() => setShowExerciseModal(true)}
                                            >
                                                <Icon name="plus" size={20} color="#f97316" />
                                                <Text style={styles.addExerciseBtnText}>Ajouter un exercice</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}

                                    <Text style={styles.label}>OU Sélectionner une séance type</Text>
                                    <View style={styles.sessionPicker}>
                                        {sessions.map(s => (
                                            <TouchableOpacity
                                                key={s.id}
                                                style={[styles.sessionOption, sessionId === s.id && styles.activeSessionOption]}
                                                onPress={() => {
                                                    setSessionId(s.id);
                                                    if (s.id) setSelectedExercises([]); // Clear manual exercises if session selected
                                                }}
                                            >
                                                <Text style={[styles.sessionOptionText, sessionId === s.id && styles.activeSessionOptionText]}>{s.title}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </>
                            )}

                            <Button
                                title="Confirmer la programmation"
                                onPress={handleCreateEvent}
                                style={styles.submitBtn}
                            />
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Event Details Modal */}
            <Modal visible={!!viewEvent} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { height: '80%' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Détails de la séance</Text>
                            <TouchableOpacity onPress={() => { setViewEvent(null); setViewEventDetails(null); }}>
                                <Icon name="close" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        {detailsLoading ? (
                            <ActivityIndicator size="large" color="#f97316" style={{ marginTop: 20 }} />
                        ) : viewEventDetails ? (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <Text style={styles.detailTheme}>{viewEventDetails.theme || viewEventDetails.title}</Text>

                                <View style={styles.detailRow}>
                                    <Icon name="calendar" size={20} color="#64748b" />
                                    <Text style={styles.detailText}>{new Date(viewEventDetails.date).toLocaleDateString()}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Icon name="clock-outline" size={20} color="#64748b" />
                                    <Text style={styles.detailText}>{viewEventDetails.heure} ({viewEventDetails.duree} min)</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Icon name="map-marker" size={20} color="#64748b" />
                                    <Text style={styles.detailText}>{viewEventDetails.lieu}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Icon name="account-group" size={20} color="#64748b" />
                                    <Text style={styles.detailText}>{viewEventDetails.groupe}</Text>
                                </View>

                                <Text style={styles.sectionTitle}>Contenu de la séance</Text>
                                {viewEventDetails.exercises && viewEventDetails.exercises.length > 0 ? (
                                    viewEventDetails.exercises.map((ex, index) => (
                                        <View key={index} style={styles.exerciseCard}>
                                            <View style={styles.exerciseHeader}>
                                                <Icon name="basketball" size={20} color="#f97316" />
                                                <Text style={styles.exerciseName}>{ex.name}</Text>
                                            </View>
                                            <Text style={styles.exerciseDesc} numberOfLines={2}>{ex.description}</Text>
                                            <View style={styles.exerciseMeta}>
                                                <Text style={styles.metaText}>{ex.duration} min</Text>
                                                <Text style={styles.metaText}>•</Text>
                                                <Text style={styles.metaText}>{ex.category}</Text>
                                            </View>
                                        </View>
                                    ))
                                ) : (
                                    <Text style={styles.emptyText}>Aucun exercice listé pour cette séance.</Text>
                                )}
                                <View style={{ height: 40 }} />
                            </ScrollView>
                        ) : null}
                    </View>
                </View>
            </Modal>

            <ExerciseSelectionModal
                visible={showExerciseModal}
                onClose={() => setShowExerciseModal(false)}
                onSelectExercise={handleAddExercise}
            />
        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background.main,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.lg,
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        backgroundColor: COLORS.white,
    },
    headerTitle: {
        ...TYPOGRAPHY.h1,
        color: COLORS.gray[900],
    },
    headerSubtitle: {
        ...TYPOGRAPHY.bodySmall,
        color: COLORS.gray[500],
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconBtn: {
        width: 44,
        height: 44,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: COLORS.gray[100],
        justifyContent: 'center',
        alignItems: 'center',
    },
    addBtn: {
        backgroundColor: COLORS.primary,
        width: 44,
        height: 44,
        borderRadius: BORDER_RADIUS.md,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.md,
    },
    weekNavBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[100],
    },
    weekNavText: {
        ...TYPOGRAPHY.h4,
        color: COLORS.gray[700],
    },
    navBtn: {
        padding: 8,
    },
    listContent: {
        padding: SPACING.lg,
    },
    dateSection: {
        marginBottom: SPACING.xl,
    },
    dateHeader: {
        ...TYPOGRAPHY.label,
        color: COLORS.gray[500],
        marginBottom: SPACING.md,
        marginLeft: 4,
    },
    eventCard: {
        flexDirection: 'row',
        marginBottom: SPACING.md,
    },
    eventTimeContainer: {
        width: 65,
        alignItems: 'center',
        paddingTop: 4,
    },
    eventTime: {
        ...TYPOGRAPHY.h4,
        color: COLORS.gray[900],
    },
    timeLine: {
        width: 2,
        flex: 1,
        backgroundColor: COLORS.gray[200],
        marginTop: 8,
        borderRadius: 1,
    },
    eventMain: {
        flex: 1,
    },
    eventHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    typeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.sm,
        gap: 4,
    },
    typeText: {
        fontSize: 11,
        fontWeight: '700',
    },
    eventTitle: {
        ...TYPOGRAPHY.h4,
        color: COLORS.gray[900],
        marginBottom: SPACING.sm,
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
        ...TYPOGRAPHY.bodySmall,
        color: COLORS.gray[500],
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        marginTop: SPACING.md,
        ...TYPOGRAPHY.h4,
        color: COLORS.gray[400],
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        maxHeight: '90%',
        padding: SPACING.xl,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    modalTitle: {
        ...TYPOGRAPHY.h2,
        color: COLORS.gray[900],
    },
    modalSubtitle: {
        ...TYPOGRAPHY.bodySmall,
        color: COLORS.gray[500],
    },
    modalForm: {
        marginBottom: 20,
    },
    label: {
        ...TYPOGRAPHY.label,
        color: COLORS.gray[600],
        marginBottom: SPACING.xs,
        marginTop: SPACING.md,
    },
    row: {
        flexDirection: 'row',
    },
    typeSelector: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: SPACING.md,
    },
    typeBtn: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: COLORS.gray[100],
    },
    activeTypeBtn: {
        backgroundColor: COLORS.primary,
    },
    typeBtnText: {
        fontSize: 13,
        color: COLORS.gray[600],
        fontWeight: '600',
    },
    activeTypeBtnText: {
        color: COLORS.white,
    },
    participantRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[100],
    },
    participantName: {
        ...TYPOGRAPHY.body,
        color: COLORS.gray[800],
        fontWeight: '600',
    },
    participantGroup: {
        ...TYPOGRAPHY.bodySmall,
        color: COLORS.gray[400],
    },
    submitBtn: {
        marginTop: SPACING.xl,
        marginBottom: 40,
    },
    detailTheme: {
        ...TYPOGRAPHY.h2,
        color: COLORS.gray[900],
        marginBottom: SPACING.xl,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: SPACING.md,
    },
    detailText: {
        ...TYPOGRAPHY.body,
        color: COLORS.gray[700],
    },
    sectionTitle: {
        ...TYPOGRAPHY.h4,
        color: COLORS.gray[900],
        marginTop: SPACING.xl,
        marginBottom: SPACING.md,
    },
    exerciseCard: {
        backgroundColor: COLORS.white,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.gray[100],
        ...SHADOWS.sm,
    },
    exerciseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: SPACING.xs,
    },
    exerciseName: {
        ...TYPOGRAPHY.h4,
        color: COLORS.gray[900],
    },
    exerciseDesc: {
        ...TYPOGRAPHY.bodySmall,
        color: COLORS.gray[500],
        marginBottom: SPACING.sm,
    },
    exerciseMeta: {
        flexDirection: 'row',
        gap: 8,
    },
    metaText: {
        ...TYPOGRAPHY.bodySmall,
        fontSize: 11,
        color: COLORS.gray[400],
    },
    addExerciseBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderRadius: BORDER_RADIUS.md,
        borderStyle: 'dashed',
        marginTop: 8,
    },
    addExerciseBtnText: {
        color: COLORS.primary,
        fontWeight: '600',
        marginLeft: 8,
    },
    exerciseRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: COLORS.gray[50],
        borderRadius: BORDER_RADIUS.md,
        marginBottom: 8,
    }
});

export default CalendarScreen;
