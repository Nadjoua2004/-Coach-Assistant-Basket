import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Platform
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import AttendanceService from '../../services/attendanceService';
import AthleteService from '../../services/athleteService';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../config/theme';
import Button from '../UI/Button';
import Card from '../UI/Card';

const AttendanceScreen = ({ session, onBack }) => {
    const [athletes, setAthletes] = useState([]);
    const [attendance, setAttendance] = useState({}); // athleteId -> { status, notes }
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (session && session.id) {
            fetchData();
        }
    }, [session?.id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const athletesResponse = await AthleteService.getAllAthletes({ groupe: session.groupe });
            const attendanceResponse = await AttendanceService.getAllAttendance({ planning_id: session.id });

            if (athletesResponse.success) {
                setAthletes(athletesResponse.data);
                const initialAttendance = {};
                athletesResponse.data.forEach(a => {
                    initialAttendance[a.id] = { status: 'absent', notes: '' };
                });

                if (attendanceResponse.success && attendanceResponse.data.length > 0) {
                    attendanceResponse.data.forEach(record => {
                        initialAttendance[record.athlete_id] = {
                            status: record.status,
                            notes: record.notes || ''
                        };
                    });
                }
                setAttendance(initialAttendance);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            Alert.alert('Erreur', 'Impossible de charger les données');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = (athleteId, status) => {
        setAttendance(prev => ({
            ...prev,
            [athleteId]: { ...prev[athleteId], status }
        }));
    };

    const handleMarkAllPresent = () => {
        const updated = { ...attendance };
        athletes.forEach(a => {
            updated[a.id] = { ...updated[a.id], status: 'present' };
        });
        setAttendance(updated);
    };

    const handleSaveAll = async () => {
        try {
            setSaving(true);
            const records = athletes.map(a => ({
                planning_id: session.id,
                session_id: session.session_id || session.id,
                athlete_id: a.id,
                status: attendance[a.id]?.status || 'absent',
                notes: attendance[a.id]?.notes || ''
            }));

            const validRecords = records.filter(r =>
                r.athlete_id && !r.athlete_id.toString().startsWith('temp_')
            );

            if (validRecords.length === 0) {
                Alert.alert('Information', 'Aucun athlète avec un profil complet à enregistrer.');
                setSaving(false);
                return;
            }

            for (const record of validRecords) {
                await AttendanceService.recordAttendance(record);
            }

            Alert.alert('Succès', 'Appel enregistré avec succès');
            onBack();
        } catch (error) {
            console.error('Error recording attendance:', error);
            Alert.alert('Erreur', 'Impossible d\'enregistrer l\'appel');
        } finally {
            setSaving(false);
        }
    };

    const renderAthleteItem = ({ item }) => {
        const currentStatus = attendance[item.id]?.status || 'absent';

        return (
            <Card style={styles.athleteCard} padding="sm">
                <View style={styles.athleteRow}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>{item.prenom[0]}{item.nom[0]}</Text>
                    </View>

                    <View style={styles.athleteMain}>
                        <Text style={styles.athleteName}>{item.prenom} {item.nom}</Text>
                        <Text style={styles.athletePoste}>{item.poste || 'Poste non défini'}</Text>
                    </View>

                    <View style={styles.statusSelectors}>
                        <TouchableOpacity
                            style={[styles.statusToggle, currentStatus === 'present' && styles.statusPresent]}
                            onPress={() => handleUpdateStatus(item.id, 'present')}
                        >
                            <Icon
                                name={currentStatus === 'present' ? "check-circle" : "check-circle-outline"}
                                size={22}
                                color={currentStatus === 'present' ? COLORS.white : COLORS.gray[200]}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.statusToggle, currentStatus === 'retard' && styles.statusLate]}
                            onPress={() => handleUpdateStatus(item.id, 'retard')}
                        >
                            <Icon
                                name={currentStatus === 'retard' ? "clock-check" : "clock-outline"}
                                size={22}
                                color={currentStatus === 'retard' ? COLORS.white : COLORS.gray[200]}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.statusToggle, currentStatus === 'absent' && styles.statusAbsent]}
                            onPress={() => handleUpdateStatus(item.id, 'absent')}
                        >
                            <Icon
                                name={currentStatus === 'absent' ? "close-circle" : "close-circle-outline"}
                                size={22}
                                color={currentStatus === 'absent' ? COLORS.white : COLORS.gray[200]}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </Card>
        );
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    const presentCount = Object.values(attendance).filter(a => a.status === 'present').length;
    const lateCount = Object.values(attendance).filter(a => a.status === 'retard').length;
    const absentCount = Object.values(attendance).filter(a => a.status === 'absent').length;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Icon name="chevron-left" size={28} color={COLORS.gray[900]} />
                </TouchableOpacity>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Appel</Text>
                    <Text style={styles.subtitle} numberOfLines={1}>{session?.theme || session?.title} • {session?.groupe}</Text>
                </View>
                <View style={{ width: 32 }} />
            </View>

            <FlatList
                data={athletes}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderAthleteItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <View style={styles.listHeader}>
                        <View style={styles.statsOverview}>
                            <View style={[styles.statBox, { borderColor: COLORS.success + '30' }]}>
                                <Text style={[styles.statVal, { color: COLORS.success }]}>{presentCount}</Text>
                                <Text style={styles.statLabel}>Présents</Text>
                            </View>
                            <View style={[styles.statBox, { borderColor: COLORS.warning + '30' }]}>
                                <Text style={[styles.statVal, { color: COLORS.warning }]}>{lateCount}</Text>
                                <Text style={styles.statLabel}>Retards</Text>
                            </View>
                            <View style={[styles.statBox, { borderColor: COLORS.error + '30' }]}>
                                <Text style={[styles.statVal, { color: COLORS.error }]}>{absentCount}</Text>
                                <Text style={styles.statLabel}>Absents</Text>
                            </View>
                        </View>

                        <Button
                            title="Tout le monde est présent"
                            onPress={handleMarkAllPresent}
                            variant="outline"
                            icon="check-all"
                            style={styles.markAllBtn}
                        />

                        <Text style={styles.listTitle}>Liste des joueurs ({athletes.length})</Text>
                    </View>
                }
            />

            <View style={styles.footer}>
                <Button
                    title="Enregistrer l'appel"
                    onPress={handleSaveAll}
                    loading={saving}
                    icon="cloud-upload-outline"
                    style={styles.saveButton}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.gray[50],
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        paddingTop: 60,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[100],
    },
    backButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    title: {
        ...TYPOGRAPHY.h3,
        color: COLORS.gray[900],
    },
    subtitle: {
        ...TYPOGRAPHY.bodySmall,
        color: COLORS.gray[400],
    },
    listHeader: {
        marginBottom: SPACING.lg,
    },
    statsOverview: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: SPACING.lg,
    },
    statBox: {
        flex: 1,
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.gray[100],
    },
    statVal: {
        ...TYPOGRAPHY.h2,
        fontSize: 24,
    },
    statLabel: {
        ...TYPOGRAPHY.label,
        fontSize: 10,
        color: COLORS.gray[400],
        marginTop: 2,
    },
    markAllBtn: {
        marginBottom: SPACING.xl,
    },
    listTitle: {
        ...TYPOGRAPHY.h3,
        fontSize: 16,
        color: COLORS.gray[900],
    },
    listContent: {
        padding: SPACING.lg,
        paddingBottom: 100,
    },
    athleteCard: {
        marginBottom: SPACING.sm,
    },
    athleteRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.gray[100],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    avatarText: {
        ...TYPOGRAPHY.label,
        color: COLORS.gray[500],
    },
    athleteMain: {
        flex: 1,
    },
    athleteName: {
        ...TYPOGRAPHY.h4,
        color: COLORS.gray[900],
    },
    athletePoste: {
        ...TYPOGRAPHY.bodySmall,
        fontSize: 11,
        color: COLORS.gray[400],
    },
    statusSelectors: {
        flexDirection: 'row',
        gap: 8,
    },
    statusToggle: {
        width: 38,
        height: 38,
        borderRadius: 19,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.gray[50],
    },
    statusPresent: {
        backgroundColor: COLORS.success,
    },
    statusLate: {
        backgroundColor: COLORS.warning,
    },
    statusAbsent: {
        backgroundColor: COLORS.error,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: SPACING.lg,
        paddingBottom: 30,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.gray[100],
        ...SHADOWS.md,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default AttendanceScreen;
