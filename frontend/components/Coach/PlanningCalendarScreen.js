import React, { useState, useEffect, useMemo } from 'react';
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
    Platform,
    KeyboardAvoidingView,
    FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import PlanningService from '../../services/planningService';
import AthleteService from '../../services/athleteService';
import SessionService from '../../services/sessionService';
import ExerciseService from '../../services/exerciseService';
import ExerciseSelectionModal from './ExerciseSelectionModal';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../config/theme';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Card from '../UI/Card';

const PlanningCalendarScreen = ({ onBack, onTakeAttendance }) => {
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState([]);
    const [selectedWeek, setSelectedWeek] = useState(new Date());
    const [showEventModal, setShowEventModal] = useState(false);
    const [showAthleteModal, setShowAthleteModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [athletes, setAthletes] = useState([]);
    const [groups] = useState(['U13', 'U15', 'U17', 'Seniors']);
    const [savedSessions, setSavedSessions] = useState([]);
    const [showSessionPicker, setShowSessionPicker] = useState(false);
    const [loadingSessions, setLoadingSessions] = useState(false);
    const [showExerciseModal, setShowExerciseModal] = useState(false);

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
        d.setHours(0, 0, 0, 0);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        d.setDate(diff);
        return d;
    };

    const getWeekDays = useMemo(() => {
        const start = getWeekStart(selectedWeek);
        const days = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(start);
            day.setDate(start.getDate() + i);
            days.push(day);
        }
        return days;
    }, [selectedWeek]);

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

    const handleDuplicateWeek = () => {
        Alert.alert(
            'Dupliquer la semaine',
            'Voulez-vous dupliquer cette semaine vers la semaine suivante ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Dupliquer',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            const startOfThisWeek = getWeekStart(selectedWeek);
                            const sourceDate = startOfThisWeek.toISOString().split('T')[0];

                            const nextWeekDate = new Date(startOfThisWeek);
                            nextWeekDate.setDate(nextWeekDate.getDate() + 7);
                            const targetDate = nextWeekDate.toISOString().split('T')[0];

                            const res = await PlanningService.duplicateWeek(sourceDate, targetDate);
                            if (res.success) {
                                Alert.alert('Succès', res.message || 'Planning dupliqué');
                                handleNextWeek(); // Navigate to the new week
                            } else {
                                Alert.alert('Info', res.message || 'Erreur lors de la duplication');
                            }
                        } catch (err) {
                            Alert.alert('Erreur', 'Impossible de dupliquer le planning');
                        } finally {
                            fetchData();
                        }
                    }
                }
            ]
        );
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
            Alert.alert('Champs requis', 'Veuillez renseigner au moins le thème et la durée.');
            return;
        }

        try {
            setLoading(true);
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
                Alert.alert('Succès', editingEvent ? 'Planning mis à jour' : 'Nouvelle séance planifiée');
                setShowEventModal(false);
                resetForm();
                fetchData();
            }
        } catch (error) {
            Alert.alert('Erreur', 'Impossible de sauvegarder le planning.');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setEventForm({
            date: new Date().toISOString().split('T')[0],
            heure: '18:00',
            duree: 90,
            lieu: 'Gymnase Club',
            theme: '',
            groupe: 'U17',
            session_id: null,
            athletes_assignes: []
        });
        setEditingEvent(null);
    };

    const handleEditEvent = (event) => {
        setEditingEvent(event);
        setEventForm({
            date: event.date,
            heure: event.heure,
            duree: event.duree.toString(),
            lieu: event.lieu,
            theme: event.theme,
            groupe: event.groupe || 'U17',
            session_id: event.session_id,
            athletes_assignes: event.athletes_assignes || []
        });
        setShowEventModal(true);
    };

    const handleDeleteEvent = (id) => {
        Alert.alert(
            'Supprimer la séance',
            'Voulez-vous vraiment retirer cette séance du planning ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const res = await PlanningService.deletePlanning(id);
                            if (res.success) {
                                fetchData();
                            }
                        } catch (err) {
                            Alert.alert('Erreur', 'Impossible de supprimer la séance');
                        }
                    }
                }
            ]
        );
    };

    const selectSession = (session) => {
        setEventForm({
            ...eventForm,
            theme: session.titre || session.title,
            session_id: session.id,
            duree: session.duree_totale?.toString() || session.total_duration?.toString() || eventForm.duree
        });
        setShowSessionPicker(false);
    };

    const toggleAthleteAssignment = (athleteId) => {
        const current = [...(eventForm.athletes_assignes || [])];
        const index = current.indexOf(athleteId);
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(athleteId);
        }
        setEventForm({ ...eventForm, athletes_assignes: current });
    };

    const renderDayColumn = (day) => {
        const dateStr = day.toISOString().split('T')[0];
        const dayEvents = events.filter(e => e.date === dateStr);
        const isToday = new Date().toISOString().split('T')[0] === dateStr;

        return (
            <View key={dateStr} style={[styles.dayColumn, isToday && styles.todayColumn]}>
                <View style={[styles.dayHeader, isToday && styles.todayHeader]}>
                    <Text style={[styles.dayName, isToday && styles.todayDayText]}>
                        {day.toLocaleDateString('fr-FR', { weekday: 'short' }).toUpperCase()}
                    </Text>
                    <Text style={[styles.dayNumber, isToday && styles.todayNumberText]}>
                        {day.getDate()}
                    </Text>
                    {isToday && <View style={styles.todayIndicator} />}
                </View>

                <View style={styles.eventsList}>
                    {dayEvents.map(event => (
                        <TouchableOpacity
                            key={event.id}
                            style={styles.eventCard}
                            onPress={() => handleEditEvent(event)}
                        >
                            <View style={[styles.eventAccent, { backgroundColor: event.color || COLORS.primary }]} />
                            <View style={styles.eventContent}>
                                <View style={styles.eventTimeRow}>
                                    <View style={styles.timeTag}>
                                        <Icon name="clock-outline" size={10} color={COLORS.primary} />
                                        <Text style={styles.timeText}>{event.heure}</Text>
                                    </View>
                                    <View style={styles.groupTag}>
                                        <Text style={styles.groupTagText}>{event.groupe}</Text>
                                    </View>
                                </View>
                                <Text style={styles.eventThemeText} numberOfLines={2}>{event.theme}</Text>
                                <View style={styles.eventActions}>
                                    <TouchableOpacity style={styles.attendanceBtn} onPress={() => onTakeAttendance(event)}>
                                        <Icon name="clipboard-check-outline" size={16} color={COLORS.white} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                        style={styles.addDayEventBtn}
                        onPress={() => {
                            resetForm();
                            setEventForm({ ...eventForm, date: dateStr });
                            setShowEventModal(true);
                        }}
                    >
                        <Icon name="plus" size={18} color={COLORS.gray[300]} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header / Week Navigation */}
            <View style={styles.mainHeader}>
                <View style={styles.headerTopRow}>
                    <TouchableOpacity style={styles.backBtn} onPress={onBack}>
                        <Icon name="chevron-left" size={28} color={COLORS.gray[900]} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Planning hebdo</Text>
                    <TouchableOpacity style={styles.copyBtn} onPress={handleDuplicateWeek}>
                        <Icon name="calendar-multiple" size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.weekSwitcher}>
                    <TouchableOpacity style={styles.navBtn} onPress={handlePreviousWeek}>
                        <Icon name="chevron-left" size={24} color={COLORS.gray[600]} />
                    </TouchableOpacity>
                    <View style={styles.weekLabelBox}>
                        <Icon name="calendar-range" size={18} color={COLORS.primary} style={{ marginRight: 8 }} />
                        <Text style={styles.weekLabel}>
                            {getWeekDays[0].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - {getWeekDays[6].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.navBtn} onPress={handleNextWeek}>
                        <Icon name="chevron-right" size={24} color={COLORS.gray[600]} />
                    </TouchableOpacity>
                </View>
            </View>

            {loading ? (
                <View style={styles.loaderBox}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.calendarScroll}
                >
                    {getWeekDays.map(day => renderDayColumn(day))}
                </ScrollView>
            )}

            {/* Event Form Modal */}
            <Modal visible={showEventModal} animationType="slide" transparent={false}>
                <SafeAreaView style={styles.modalBg}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setShowEventModal(false)}>
                            <Icon name="close" size={24} color={COLORS.gray[900]} />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>{editingEvent ? 'Modifier la séance' : 'Nouvelle séance'}</Text>
                        <TouchableOpacity onPress={handleSaveEvent}>
                            <Text style={styles.saveBtnText}>OK</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                        <Card style={styles.formSection} padding="lg">
                            <Text style={styles.formSectionTitle}>GÉNÉRAL</Text>

                            <Input
                                label="Thème / Titre"
                                value={eventForm.theme}
                                onChangeText={(t) => setEventForm({ ...eventForm, theme: t })}
                                placeholder="Ex: Fondamentaux individuels"
                                style={styles.formInput}
                            />

                            <View style={styles.dualField}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.inputLabel}>Date</Text>
                                    <TouchableOpacity style={styles.pickerTrigger} onPress={() => setShowDatePicker(true)}>
                                        <Text style={styles.pickerText}>{eventForm.date}</Text>
                                        <Icon name="calendar" size={18} color={COLORS.primary} />
                                    </TouchableOpacity>
                                </View>
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Input
                                        label="Heure"
                                        value={eventForm.heure}
                                        onChangeText={(t) => setEventForm({ ...eventForm, heure: t })}
                                        placeholder="18:00"
                                        style={styles.formInput}
                                    />
                                </View>
                            </View>

                            <View style={styles.dualField}>
                                <View style={{ flex: 1 }}>
                                    <Input
                                        label="Durée (min)"
                                        value={eventForm.duree.toString()}
                                        onChangeText={(t) => setEventForm({ ...eventForm, duree: t })}
                                        keyboardType="numeric"
                                        placeholder="90"
                                        style={styles.formInput}
                                    />
                                </View>
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Input
                                        label="Lieu"
                                        value={eventForm.lieu}
                                        onChangeText={(t) => setEventForm({ ...eventForm, lieu: t })}
                                        placeholder="Gymnase A"
                                        style={styles.formInput}
                                    />
                                </View>
                            </View>

                            <Text style={styles.inputLabel}>Catégorie</Text>
                            <View style={styles.groupGrid}>
                                {groups.map(g => (
                                    <TouchableOpacity
                                        key={g}
                                        style={[styles.groupChip, eventForm.groupe === g && styles.groupChipActive]}
                                        onPress={() => setEventForm({ ...eventForm, groupe: g })}
                                    >
                                        <Text style={[styles.groupChipTxt, eventForm.groupe === g && styles.groupChipTxtOn]}>{g}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </Card>

                        <Text style={styles.sectionDivider}>CONTENU & EFFECTIF</Text>

                        <TouchableOpacity style={styles.actionCard} onPress={() => setShowSessionPicker(true)}>
                            <View style={styles.actionCardIcon}>
                                <Icon name="notebook-outline" size={24} color={COLORS.primary} />
                            </View>
                            <View style={styles.actionCardBody}>
                                <Text style={styles.actionCardTitle}>Assigner une séance préparée</Text>
                                <Text style={styles.actionCardSub}>
                                    {eventForm.session_id ? 'Séance liée avec succès' : 'Choisissez parmi vos modèles'}
                                </Text>
                            </View>
                            <Icon name="chevron-right" size={20} color={COLORS.gray[300]} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionCard} onPress={() => setShowAthleteModal(true)}>
                            <View style={[styles.actionCardIcon, { backgroundColor: COLORS.secondary + '10' }]}>
                                <Icon name="account-group-outline" size={24} color={COLORS.secondary} />
                            </View>
                            <View style={styles.actionCardBody}>
                                <Text style={styles.actionCardTitle}>Gérer l'effectif convoqué</Text>
                                <Text style={styles.actionCardSub}>
                                    {eventForm.athletes_assignes?.length || 0} joueurs assignés
                                </Text>
                            </View>
                            <Icon name="chevron-right" size={20} color={COLORS.gray[300]} />
                        </TouchableOpacity>

                        {editingEvent && (
                            <TouchableOpacity
                                style={styles.deleteLink}
                                onPress={() => {
                                    handleDeleteEvent(editingEvent.id);
                                    setShowEventModal(false);
                                }}
                            >
                                <Icon name="trash-can-outline" size={18} color={COLORS.error} />
                                <Text style={styles.deleteLinkTxt}>Supprimer cette séance du planning</Text>
                            </TouchableOpacity>
                        )}

                        <View style={{ height: 100 }} />
                    </ScrollView>
                </SafeAreaView>

                {showDatePicker && (
                    <DateTimePicker
                        value={selectedDate}
                        mode="date"
                        display="default"
                        onChange={handleDateChange}
                    />
                )}
            </Modal>

            {/* Session Picker Modal */}
            <Modal visible={showSessionPicker} animationType="slide">
                <SafeAreaView style={styles.modalBg}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setShowSessionPicker(false)}>
                            <Icon name="arrow-left" size={24} color={COLORS.gray[900]} />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Mes Séances</Text>
                        <View style={{ width: 24 }} />
                    </View>
                    <FlatList
                        data={savedSessions}
                        keyExtractor={item => item.id.toString()}
                        contentContainerStyle={{ padding: SPACING.lg }}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.sessionPickItem} onPress={() => selectSession(item)}>
                                <Card padding="md" style={styles.pickCard}>
                                    <Text style={styles.pickTitle}>{item.titre || item.title}</Text>
                                    <Text style={styles.pickSub}>{item.objectif}</Text>
                                </Card>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={
                            <View style={styles.emptyBox}>
                                <Text style={styles.emptyTxt}>Aucun modèle trouvé</Text>
                            </View>
                        }
                    />
                </SafeAreaView>
            </Modal>

            {/* Athlete Multi-Picker Modal */}
            <Modal visible={showAthleteModal} animationType="slide">
                <SafeAreaView style={styles.modalBg}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setShowAthleteModal(false)}>
                            <Icon name="arrow-left" size={24} color={COLORS.gray[900]} />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Convocations</Text>
                        <TouchableOpacity onPress={() => setShowAthleteModal(false)}>
                            <Text style={styles.saveBtnText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={athletes}
                        keyExtractor={item => item.id.toString()}
                        contentContainerStyle={{ padding: SPACING.lg }}
                        renderItem={({ item }) => {
                            const selected = (eventForm.athletes_assignes || []).includes(item.id);
                            return (
                                <TouchableOpacity
                                    style={[styles.athletePickItem, selected && styles.athletePickOn]}
                                    onPress={() => toggleAthleteAssignment(item.id)}
                                >
                                    <View style={styles.athleteRow}>
                                        <Text style={[styles.athleteName, selected && styles.athleteNameOn]}>
                                            {item.prenom} {item.nom}
                                        </Text>
                                        <Text style={styles.athleteInfo}>{item.groupe} • {item.poste || '-'}</Text>
                                    </View>
                                    <Icon
                                        name={selected ? "check-circle" : "plus-circle-outline"}
                                        size={24}
                                        color={selected ? COLORS.success : COLORS.gray[300]}
                                    />
                                </TouchableOpacity>
                            );
                        }}
                    />
                </SafeAreaView>
            </Modal>

            <ExerciseSelectionModal
                visible={showExerciseModal}
                onClose={() => setShowExerciseModal(false)}
                onSelectExercise={(exercise) => {
                    setEventForm(prev => ({
                        ...prev,
                        theme: prev.theme ? `${prev.theme}, ${exercise.name}` : exercise.name
                    }));
                    setShowExerciseModal(false);
                    Alert.alert('Exercice ajouté', `L'exercice "${exercise.name}" a été ajouté au thème de la séance.`);
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.gray[50],
    },
    mainHeader: {
        backgroundColor: COLORS.white,
        paddingTop: Platform.OS === 'ios' ? 50 : 10,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[100],
        ...SHADOWS.sm,
    },
    headerTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        marginBottom: 16,
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        marginLeft: -10,
    },
    headerTitle: {
        ...TYPOGRAPHY.h2,
        color: COLORS.gray[900],
    },
    copyBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.primary + '10',
        justifyContent: 'center',
        alignItems: 'center',
    },
    weekSwitcher: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
    },
    navBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    weekLabelBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.gray[50],
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginHorizontal: 10,
    },
    weekLabel: {
        ...TYPOGRAPHY.label,
        color: COLORS.gray[900],
        fontSize: 14,
    },
    loaderBox: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    calendarScroll: {
        paddingHorizontal: 10,
        paddingTop: 16,
    },
    dayColumn: {
        width: 140,
        marginHorizontal: 6,
    },
    todayColumn: {
        backgroundColor: COLORS.primary + '03',
        borderRadius: 16,
    },
    dayHeader: {
        alignItems: 'center',
        paddingVertical: 12,
        marginBottom: 12,
    },
    todayHeader: {
        backgroundColor: COLORS.primary + '10',
        borderRadius: 12,
    },
    dayName: {
        ...TYPOGRAPHY.label,
        fontSize: 11,
        color: COLORS.gray[400],
    },
    todayDayText: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    dayNumber: {
        ...TYPOGRAPHY.h3,
        fontSize: 18,
        color: COLORS.gray[900],
        marginTop: 2,
    },
    todayNumberText: {
        color: COLORS.primary,
    },
    todayIndicator: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: COLORS.primary,
        marginTop: 4,
    },
    eventsList: {
        flex: 1,
    },
    eventCard: {
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: 10,
        ...SHADOWS.xs,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.gray[50],
    },
    eventAccent: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
    },
    eventContent: {
        padding: 10,
        paddingLeft: 12,
    },
    eventTimeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    timeTag: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeText: {
        ...TYPOGRAPHY.label,
        fontSize: 9,
        color: COLORS.primary,
        marginLeft: 4,
    },
    groupTag: {
        backgroundColor: COLORS.gray[50],
        paddingHorizontal: 4,
        paddingVertical: 1,
        borderRadius: 4,
    },
    groupTagText: {
        fontSize: 8,
        fontWeight: 'bold',
        color: COLORS.gray[400],
    },
    eventThemeText: {
        ...TYPOGRAPHY.bodySmall,
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.gray[900],
        lineHeight: 16,
    },
    eventActions: {
        marginTop: 8,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    attendanceBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.sm,
    },
    addDayEventBtn: {
        height: 40,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.gray[100],
        borderStyle: 'dashed',
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 4,
    },
    modalBg: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        height: 60,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[50],
    },
    modalTitle: {
        ...TYPOGRAPHY.h3,
        color: COLORS.gray[900],
    },
    saveBtnText: {
        ...TYPOGRAPHY.h4,
        color: COLORS.primary,
        fontWeight: '700',
    },
    modalScroll: {
        padding: SPACING.lg,
    },
    formSection: {
        marginBottom: 24,
    },
    formSectionTitle: {
        ...TYPOGRAPHY.label,
        fontSize: 10,
        color: COLORS.gray[400],
        letterSpacing: 1,
        marginBottom: 16,
    },
    formInput: {
        backgroundColor: COLORS.gray[50],
        borderWidth: 0,
        borderRadius: 12,
        marginBottom: 12,
    },
    dualField: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    inputLabel: {
        ...TYPOGRAPHY.label,
        color: COLORS.gray[600],
        fontSize: 12,
        marginBottom: 8,
    },
    pickerTrigger: {
        height: 52,
        backgroundColor: COLORS.gray[50],
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    pickerText: {
        ...TYPOGRAPHY.body,
        fontSize: 14,
        color: COLORS.gray[900],
    },
    groupGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 4,
    },
    groupChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: COLORS.gray[50],
        borderWidth: 1,
        borderColor: COLORS.gray[100],
        minWidth: 70,
        alignItems: 'center',
    },
    groupChipActive: {
        backgroundColor: COLORS.gray[900],
        borderColor: COLORS.gray[900],
    },
    groupChipTxt: {
        ...TYPOGRAPHY.label,
        fontSize: 12,
        color: COLORS.gray[600],
    },
    groupChipTxtOn: {
        color: COLORS.white,
    },
    sectionDivider: {
        ...TYPOGRAPHY.label,
        fontSize: 10,
        color: COLORS.gray[400],
        letterSpacing: 2,
        marginBottom: 16,
        marginTop: 8,
        textAlign: 'center',
    },
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.gray[50],
        ...SHADOWS.xs,
    },
    actionCardIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: COLORS.primary + '10',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    actionCardBody: {
        flex: 1,
    },
    actionCardTitle: {
        ...TYPOGRAPHY.h4,
        fontSize: 14,
        color: COLORS.gray[900],
    },
    actionCardSub: {
        ...TYPOGRAPHY.bodySmall,
        fontSize: 11,
        color: COLORS.gray[400],
    },
    deleteLink: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        gap: 8,
    },
    deleteLinkTxt: {
        ...TYPOGRAPHY.label,
        color: COLORS.error,
        fontSize: 13,
    },
    sessionPickItem: {
        marginBottom: 12,
    },
    pickCard: {
        ...SHADOWS.xs,
        borderWidth: 1,
        borderColor: COLORS.gray[50],
    },
    pickTitle: {
        ...TYPOGRAPHY.h4,
        color: COLORS.gray[900],
    },
    pickSub: {
        ...TYPOGRAPHY.bodySmall,
        color: COLORS.gray[400],
        marginTop: 4,
    },
    emptyBox: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyTxt: {
        ...TYPOGRAPHY.body,
        color: COLORS.gray[400],
    },
    athletePickItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: COLORS.white,
        borderRadius: 16,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: COLORS.gray[50],
        ...SHADOWS.xs,
    },
    athletePickOn: {
        borderColor: COLORS.success + '40',
        backgroundColor: COLORS.success + '05',
    },
    athleteRow: {
        flex: 1,
    },
    athleteName: {
        ...TYPOGRAPHY.h4,
        color: COLORS.gray[900],
    },
    athleteNameOn: {
        color: COLORS.success,
    },
    athleteInfo: {
        ...TYPOGRAPHY.bodySmall,
        color: COLORS.gray[400],
        marginTop: 2,
    }
});

export default PlanningCalendarScreen;
