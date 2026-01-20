import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    TextInput,
    Modal,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import PlanningService from '../../services/planningService';
import AthleteService from '../../services/athleteService';
import SessionService from '../../services/sessionService';
import ExerciseService from '../../services/exerciseService';
import ExerciseSelectionModal from './ExerciseSelectionModal';

const PlanningCalendarScreen = ({ onBack, onTakeAttendance }) => {
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState([]);
    const [selectedWeek, setSelectedWeek] = useState(new Date());
    const [showEventModal, setShowEventModal] = useState(false);
    const [showAthleteModal, setShowAthleteModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [athletes, setAthletes] = useState([]);
    const [groups, setGroups] = useState(['U13', 'U15', 'U17', 'Seniors']);
    const [savedSessions, setSavedSessions] = useState([]);
    const [showSessionPicker, setShowSessionPicker] = useState(false);
    const [loadingSessions, setLoadingSessions] = useState(false);
    const [showExerciseModal, setShowExerciseModal] = useState(false);
    const [selectedExercises, setSelectedExercises] = useState([]);

    const [eventForm, setEventForm] = useState({
        date: new Date().toISOString().split('T')[0],
        heure: '18:00',
        duree: 90,
        lieu: 'Salle Principale',
        theme: '',
        groupe: 'U17',
        session_id: null,
        athletes_assignes: []
    });

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        fetchData();
        fetchSavedSessions();
    }, [selectedWeek]);

    const fetchSavedSessions = async () => {
        try {
            setLoadingSessions(true);
            const response = await SessionService.getAllSessions();
            if (response.success) {
                setSavedSessions(response.data || []);
            }
        } catch (error) {
            console.error('Error fetching sessions:', error);
        } finally {
            setLoadingSessions(false);
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const startDate = getWeekStart(selectedWeek);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 7);

            const [planningRes, athletesRes] = await Promise.all([
                PlanningService.getAllPlanning({
                    start_date: startDate.toISOString().split('T')[0],
                    end_date: endDate.toISOString().split('T')[0]
                }),
                AthleteService.getAllAthletes()
            ]);

            if (planningRes.success) {
                setEvents(planningRes.data || []);
            }
            if (athletesRes.success) {
                setAthletes(athletesRes.data || []);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getWeekStart = (date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    };

    const getWeekDays = () => {
        const start = getWeekStart(selectedWeek);
        const days = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(start);
            day.setDate(start.getDate() + i);
            days.push(day);
        }
        return days;
    };

    const handlePreviousWeek = () => {
        const newDate = new Date(selectedWeek);
        newDate.setDate(newDate.getDate() - 7);
        setSelectedWeek(newDate);
    };

    const handleNextWeek = () => {
        const newDate = new Date(selectedWeek);
        newDate.setDate(newDate.getDate() + 7);
        setSelectedWeek(newDate);
    };

    const handleDateChange = (event, date) => {
        setShowDatePicker(false);
        if (date) {
            setSelectedDate(date);
            const formattedDate = date.toISOString().split('T')[0];
            setEventForm({ ...eventForm, date: formattedDate });
        }
    };

    const handleSaveEvent = async () => {
        if (!eventForm.theme || !eventForm.duree) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
            return;
        }

        try {
            const payload = {
                ...eventForm,
                duree: parseInt(eventForm.duree)
            };

            let response;
            if (editingEvent) {
                response = await PlanningService.updatePlanning(editingEvent.id, payload);
            } else {
                response = await PlanningService.createPlanning(payload);
            }

            if (response.success) {
                Alert.alert('Succès', editingEvent ? 'Séance modifiée' : 'Séance créée');
                setShowEventModal(false);
                resetForm();
                fetchData();
            } else {
                Alert.alert('Erreur', (response.message || 'Échec de l\'enregistrement') + (response.error ? '\n\n' + response.error : ''));
            }
        } catch (error) {
            console.error('Save error:', error);
            Alert.alert('Erreur', 'Une erreur est survenue');
        }
    };

    const handleDuplicateWeek = async () => {
        Alert.alert(
            'Dupliquer la semaine',
            'Voulez-vous dupliquer cette semaine pour la semaine suivante ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Dupliquer',
                    onPress: async () => {
                        try {
                            const nextWeekStart = new Date(selectedWeek);
                            nextWeekStart.setDate(nextWeekStart.getDate() + 7);

                            for (const event of events) {
                                const eventDate = new Date(event.date);
                                const newDate = new Date(eventDate);
                                newDate.setDate(eventDate.getDate() + 7);

                                await PlanningService.createPlanning({
                                    ...event,
                                    id: undefined,
                                    date: newDate.toISOString().split('T')[0]
                                });
                            }

                            Alert.alert('Succès', 'Semaine dupliquée avec succès');
                            setSelectedWeek(nextWeekStart);
                        } catch (error) {
                            console.error('Duplicate error:', error);
                            Alert.alert('Erreur', 'Impossible de dupliquer la semaine');
                        }
                    }
                }
            ]
        );
    };

    const handleDeleteEvent = async (eventId) => {
        Alert.alert(
            'Supprimer',
            'Voulez-vous vraiment supprimer cette séance ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await PlanningService.deletePlanning(eventId);
                            if (response.success) {
                                Alert.alert('Succès', 'Séance supprimée');
                                fetchData();
                            }
                        } catch (error) {
                            console.error('Delete error:', error);
                            Alert.alert('Erreur', 'Impossible de supprimer');
                        }
                    }
                }
            ]
        );
    };

    const openEventModal = (event = null) => {
        if (event) {
            setEditingEvent(event);
            setEventForm({
                date: event.date,
                heure: event.heure,
                duree: event.duree.toString(),
                lieu: event.lieu,
                theme: event.theme,
                groupe: event.groupe || 'U17',
                session_id: event.session_id || null,
                athletes_assignes: event.athletes_assignes || []
            });
            setSelectedDate(new Date(event.date));
        }
        fetchSavedSessions(); // Ensure sessions are fresh when opening
        setShowEventModal(true);
    };

    const resetForm = () => {
        setEditingEvent(null);
        setEventForm({
            date: new Date().toISOString().split('T')[0],
            heure: '18:00',
            duree: 90,
            lieu: 'Salle Principale',
            theme: '',
            groupe: 'U17',
            session_id: null,
            athletes_assignes: []
        });
        setSelectedDate(new Date());
    };

    const toggleAthleteAssignment = (athleteId) => {
        const current = eventForm.athletes_assignes || [];
        if (current.includes(athleteId)) {
            setEventForm({
                ...eventForm,
                athletes_assignes: current.filter(id => id !== athleteId)
            });
        } else {
            setEventForm({
                ...eventForm,
                athletes_assignes: [...current, athleteId]
            });
        }
    };

    const getEventsForDay = (day) => {
        const dateStr = day.toISOString().split('T')[0];
        return events.filter(e => e.date === dateStr);
    };

    const getAthleteCountForGroup = (groupe) => {
        return athletes.filter(a => a.groupe === groupe).length;
    };

    const weekDays = getWeekDays();
    const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#f97316" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                    <Icon name="arrow-left" size={24} color="#1e293b" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Planning</Text>
                <TouchableOpacity onPress={handleDuplicateWeek} style={styles.duplicateBtn}>
                    <Icon name="content-copy" size={20} color="#f97316" />
                </TouchableOpacity>
            </View>

            {/* Week Navigation */}
            <View style={styles.weekNav}>
                <TouchableOpacity onPress={handlePreviousWeek}>
                    <Icon name="chevron-left" size={28} color="#64748b" />
                </TouchableOpacity>
                <Text style={styles.weekLabel}>
                    Semaine du {weekDays[0].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                </Text>
                <TouchableOpacity onPress={handleNextWeek}>
                    <Icon name="chevron-right" size={28} color="#64748b" />
                </TouchableOpacity>
            </View>

            {/* Calendar Grid */}
            <ScrollView style={styles.calendarContainer}>
                {weekDays.map((day, index) => {
                    const dayEvents = getEventsForDay(day);
                    const isToday = day.toDateString() === new Date().toDateString();

                    return (
                        <View key={index} style={styles.dayRow}>
                            <View style={[styles.dayHeader, isToday && styles.todayHeader]}>
                                <Text style={[styles.dayName, isToday && styles.todayText]}>
                                    {dayNames[index]}
                                </Text>
                                <Text style={[styles.dayNumber, isToday && styles.todayText]}>
                                    {day.getDate()}
                                </Text>
                            </View>

                            <View style={styles.eventsColumn}>
                                {dayEvents.length === 0 ? (
                                    <TouchableOpacity
                                        style={styles.addEventBtn}
                                        onPress={() => {
                                            setEventForm({ ...eventForm, date: day.toISOString().split('T')[0] });
                                            openEventModal();
                                        }}
                                    >
                                        <Icon name="plus" size={20} color="#94a3b8" />
                                        <Text style={styles.addEventText}>Ajouter</Text>
                                    </TouchableOpacity>
                                ) : (
                                    dayEvents.map(event => (
                                        <TouchableOpacity
                                            key={event.id}
                                            style={styles.eventCard}
                                            onPress={() => openEventModal(event)}
                                            onLongPress={() => handleDeleteEvent(event.id)}
                                        >
                                            <View style={styles.eventTime}>
                                                <Icon name="clock-outline" size={14} color="#64748b" />
                                                <Text style={styles.eventTimeText}>{event.heure}</Text>
                                            </View>
                                            <Text style={styles.eventTheme} numberOfLines={2}>{event.theme}</Text>
                                            <View style={styles.eventMeta}>
                                                <View style={styles.eventMetaItem}>
                                                    <Icon name="map-marker" size={12} color="#94a3b8" />
                                                    <Text style={styles.eventMetaText}>{event.lieu}</Text>
                                                </View>
                                                <View style={styles.eventMetaItem}>
                                                    <Icon name="account-group" size={12} color="#94a3b8" />
                                                    <Text style={styles.eventMetaText}>{event.groupe}</Text>
                                                </View>
                                            </View>

                                            {/* Attendance Shortcut */}
                                            <TouchableOpacity
                                                style={styles.attendanceShortcut}
                                                onPress={(e) => {
                                                    e.stopPropagation();
                                                    if (onTakeAttendance) onTakeAttendance(event);
                                                }}
                                            >
                                                <Icon name="account-check" size={20} color="#f97316" />
                                            </TouchableOpacity>
                                        </TouchableOpacity>
                                    ))
                                )}
                            </View>
                        </View>
                    );
                })}
            </ScrollView>

            {/* FAB */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => openEventModal()}
            >
                <Icon name="plus" size={28} color="white" />
            </TouchableOpacity>

            {/* Event Modal */}
            <Modal visible={showEventModal} animationType="slide" presentationStyle="pageSheet">
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>
                            {editingEvent ? 'Modifier la séance' : 'Nouvelle séance'}
                        </Text>
                        <TouchableOpacity onPress={() => { setShowEventModal(false); resetForm(); }}>
                            <Icon name="close" size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        <Text style={styles.inputLabel}>Thème *</Text>
                        <TextInput
                            style={styles.input}
                            value={eventForm.theme}
                            onChangeText={(t) => setEventForm({ ...eventForm, theme: t })}
                            placeholder="Ex: Entraînement offensif"
                        />

                        <Text style={styles.inputLabel}>Date *</Text>
                        <TouchableOpacity
                            style={styles.dateInput}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text>{eventForm.date}</Text>
                            <Icon name="calendar" size={20} color="#64748b" />
                        </TouchableOpacity>

                        {showDatePicker && (
                            <DateTimePicker
                                value={selectedDate}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={handleDateChange}
                            />
                        )}

                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: 10 }}>
                                <Text style={styles.inputLabel}>Heure *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={eventForm.heure}
                                    onChangeText={(t) => setEventForm({ ...eventForm, heure: t })}
                                    placeholder="18:00"
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.inputLabel}>Durée (min) *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={eventForm.duree.toString()}
                                    onChangeText={(t) => setEventForm({ ...eventForm, duree: t })}
                                    keyboardType="numeric"
                                    placeholder="90"
                                />
                            </View>
                        </View>

                        <Text style={styles.inputLabel}>Lieu *</Text>
                        <TextInput
                            style={styles.input}
                            value={eventForm.lieu}
                            onChangeText={(t) => setEventForm({ ...eventForm, lieu: t })}
                            placeholder="Salle Principale"
                        />

                        <Text style={styles.inputLabel}>Groupe</Text>
                        <View style={styles.groupButtons}>
                            {groups.map(g => (
                                <TouchableOpacity
                                    key={g}
                                    style={[
                                        styles.groupBtn,
                                        eventForm.groupe === g && styles.groupBtnActive
                                    ]}
                                    onPress={() => setEventForm({ ...eventForm, groupe: g })}
                                >
                                    <Text style={[
                                        styles.groupBtnText,
                                        eventForm.groupe === g && styles.groupBtnTextActive
                                    ]}>
                                        {g} ({getAthleteCountForGroup(g)})
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.assignmentSection}>
                            <Text style={styles.inputLabel}>Session de la bibliothèque</Text>
                            <TouchableOpacity
                                style={styles.sessionPickerBtn}
                                onPress={() => {
                                    fetchSavedSessions();
                                    setShowSessionPicker(true);
                                }}
                            >
                                <Icon name="clipboard-text-outline" size={20} color="#3b82f6" />
                                <Text style={styles.sessionPickerBtnText}>Choisir une séance complète</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.assignmentSection}>
                            <Text style={styles.inputLabel}>Bibliothèque d'exercices</Text>
                            <TouchableOpacity
                                style={[styles.sessionPickerBtn, { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }]}
                                onPress={() => setShowExerciseModal(true)}
                            >
                                <Icon name="basketball" size={20} color="#10b981" />
                                <Text style={[styles.sessionPickerBtnText, { color: '#10b981' }]}>Choisir des exercices</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.assignmentSection}>
                            <Text style={styles.inputLabel}>Assignation manuelle ({eventForm.athletes_assignes?.length || 0} joueurs)</Text>
                            <TouchableOpacity
                                style={styles.manageAthletesBtn}
                                onPress={() => setShowAthleteModal(true)}
                            >
                                <Icon name="account-multiple" size={20} color="#f97316" />
                                <Text style={styles.manageAthletesBtnText}>Gérer les participants</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveEvent}>
                            <Text style={styles.saveBtnText}>
                                {editingEvent ? 'Mettre à jour' : 'Créer la séance'}
                            </Text>
                        </TouchableOpacity>
                        <View style={{ height: 40 }} />
                    </ScrollView>
                </SafeAreaView>
            </Modal>

            {/* Session Picker Modal */}
            <Modal visible={showSessionPicker} animationType="slide" presentationStyle="pageSheet">
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Sélectionner une séance</Text>
                        <TouchableOpacity onPress={() => setShowSessionPicker(false)}>
                            <Icon name="close" size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        {loadingSessions ? (
                            <ActivityIndicator size="small" color="#f97316" />
                        ) : savedSessions.length === 0 ? (
                            <Text style={styles.emptyText}>Aucune séance enregistrée</Text>
                        ) : (
                            savedSessions.map(session => (
                                <TouchableOpacity
                                    key={session.id}
                                    style={styles.sessionPickItem}
                                    onPress={() => {
                                        setEventForm({
                                            ...eventForm,
                                            theme: session.title,
                                            duree: session.total_duration?.toString() || '90',
                                            session_id: session.id
                                        });
                                        setShowSessionPicker(false);
                                    }}
                                >
                                    <View>
                                        <Text style={styles.sessionPickTitle}>{session.title}</Text>
                                        <Text style={styles.sessionPickMeta}>{session.objective}</Text>
                                    </View>
                                    <Icon name="chevron-right" size={20} color="#cbd5e1" />
                                </TouchableOpacity>
                            ))
                        )}
                    </ScrollView>
                </SafeAreaView>
            </Modal>

            {/* Athlete Assignment Modal */}
            <Modal visible={showAthleteModal} animationType="slide" presentationStyle="pageSheet">
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Sélectionner les joueurs</Text>
                        <TouchableOpacity onPress={() => setShowAthleteModal(false)}>
                            <Icon name="check" size={24} color="#10b981" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        {athletes
                            .filter(a => a.groupe === eventForm.groupe)
                            .map(athlete => {
                                const isSelected = (eventForm.athletes_assignes || []).includes(athlete.id);
                                return (
                                    <TouchableOpacity
                                        key={athlete.id}
                                        style={[styles.athleteItem, isSelected && styles.athleteItemSelected]}
                                        onPress={() => toggleAthleteAssignment(athlete.id)}
                                    >
                                        <View style={styles.athleteInfo}>
                                            <Text style={styles.athleteName}>
                                                {athlete.prenom} {athlete.nom}
                                            </Text>
                                            <Text style={styles.athleteMeta}>
                                                {athlete.poste ? `Poste ${athlete.poste}` : 'Non défini'}
                                            </Text>
                                        </View>
                                        {isSelected && <Icon name="check-circle" size={24} color="#10b981" />}
                                    </TouchableOpacity>
                                );
                            })}
                    </ScrollView>
                </SafeAreaView>
            </Modal>

            <ExerciseSelectionModal
                visible={showExerciseModal}
                onClose={() => setShowExerciseModal(false)}
                onSelectExercise={(exercise) => {
                    // When an exercise is selected, we can add it to the theme or just update the theme
                    setEventForm(prev => ({
                        ...prev,
                        theme: prev.theme ? `${prev.theme}, ${exercise.name}` : exercise.name
                    }));
                    setShowExerciseModal(false);
                    Alert.alert('Exercice ajouté', `L'exercice "${exercise.name}" a été ajouté au thème de la séance.`);
                }}
            />
        </SafeAreaView>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    backBtn: {
        width: 40,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    duplicateBtn: {
        width: 40,
        alignItems: 'flex-end',
    },
    weekNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'white',
    },
    weekLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
    },
    calendarContainer: {
        flex: 1,
    },
    dayRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        minHeight: 100,
    },
    dayHeader: {
        width: 70,
        padding: 12,
        backgroundColor: '#f8fafc',
        alignItems: 'center',
        justifyContent: 'center',
        borderRightWidth: 1,
        borderRightColor: '#e2e8f0',
    },
    todayHeader: {
        backgroundColor: '#fff7ed',
    },
    dayName: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748b',
        textTransform: 'uppercase',
    },
    dayNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
        marginTop: 4,
    },
    todayText: {
        color: '#f97316',
    },
    eventsColumn: {
        flex: 1,
        padding: 8,
    },
    addEventBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        borderStyle: 'dashed',
        minHeight: 80,
    },
    addEventText: {
        marginLeft: 8,
        color: '#94a3b8',
        fontSize: 14,
    },
    eventCard: {
        backgroundColor: '#fff7ed',
        borderLeftWidth: 3,
        borderLeftColor: '#f97316',
        borderRadius: 8,
        padding: 10,
        marginBottom: 8,
    },
    eventTime: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    eventTimeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748b',
        marginLeft: 4,
    },
    eventTheme: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 6,
    },
    eventMeta: {
        flexDirection: 'row',
        gap: 12,
    },
    eventMetaItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    eventMetaText: {
        fontSize: 11,
        color: '#64748b',
        marginLeft: 4,
    },
    attendanceShortcut: {
        position: 'absolute',
        right: 10,
        top: 10,
        padding: 5,
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        borderRadius: 8,
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#f97316',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    modalContent: {
        padding: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
        marginBottom: 8,
    },
    input: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        marginBottom: 16,
    },
    dateInput: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
    },
    groupButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 16,
        backgroundColor: '#e2e8f0',
        borderRadius: 12,
        padding: 4,
    },
    groupBtn: {
        flex: 1,
        minWidth: '23%',
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
        margin: 2,
    },
    groupBtnActive: {
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    groupBtnText: {
        fontWeight: '600',
        color: '#64748b',
        fontSize: 13,
    },
    groupBtnTextActive: {
        color: '#f97316',
    },
    assignmentSection: {
        marginBottom: 16,
    },
    manageAthletesBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff7ed',
        borderWidth: 1,
        borderColor: '#fed7aa',
        borderRadius: 12,
        padding: 14,
    },
    manageAthletesBtnText: {
        marginLeft: 8,
        color: '#f97316',
        fontWeight: '600',
    },
    sessionPickerBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#eff6ff',
        borderWidth: 1,
        borderColor: '#bfdbfe',
        borderRadius: 12,
        padding: 14,
    },
    sessionPickerBtnText: {
        marginLeft: 8,
        color: '#3b82f6',
        fontWeight: '600',
    },
    sessionPickItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    sessionPickTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
    },
    sessionPickMeta: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 4,
    },
    emptyText: {
        textAlign: 'center',
        color: '#94a3b8',
        marginTop: 40,
    },
    saveBtn: {
        backgroundColor: '#f97316',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    saveBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    athleteItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 14,
        marginBottom: 8,
    },
    athleteItemSelected: {
        backgroundColor: '#f0fdf4',
        borderColor: '#10b981',
    },
    athleteInfo: {
        flex: 1,
    },
    athleteName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1e293b',
    },
    athleteMeta: {
        fontSize: 13,
        color: '#64748b',
        marginTop: 2,
    },
});

export default PlanningCalendarScreen;
