import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AttendanceService from '../../services/attendanceService';
import AthleteService from '../../services/athleteService';

const AttendanceScreen = ({ session, onBack }) => {
    const [athletes, setAthletes] = useState([]);
    const [attendance, setAttendance] = useState({}); // athleteId -> { status, notes }
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, [session.id]);

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
                session_id: session.session_id,
                athlete_id: a.id,
                status: attendance[a.id].status,
                notes: attendance[a.id].notes
            }));

            for (const record of records) {
                await AttendanceService.recordAttendance(record);
            }

            Alert.alert('Succès', 'Appel enregistré avec succès');
            onBack();
        } catch (error) {
            console.error('Error recording attendance:', error);
            Alert.alert('Erreur', 'Une erreur est survenue lors de l\'enregistrement');
        } finally {
            setSaving(false);
        }
    };

    const renderAthleteItem = ({ item }) => {
        const currentStatus = attendance[item.id]?.status || 'absent';

        return (
            <View style={styles.athleteCard}>
                <TouchableOpacity
                    style={styles.athleteInfo}
                    onPress={() => {
                        const newStatus = currentStatus === 'present' ? 'absent' : 'present';
                        handleUpdateStatus(item.id, newStatus);
                    }}
                >
                    <Text style={styles.athleteName}>{item.prenom} {item.nom}</Text>
                    <Text style={styles.athletePoste}>{item.poste}</Text>
                </TouchableOpacity>

                <View style={styles.statusContainer}>
                    <View style={styles.statusGroup}>
                        <TouchableOpacity
                            style={[styles.statusBtn, currentStatus === 'present' && styles.presentActive]}
                            onPress={() => handleUpdateStatus(item.id, 'present')}
                        >
                            <Icon name="check" size={18} color={currentStatus === 'present' ? 'white' : '#10b981'} />
                        </TouchableOpacity>
                        <Text style={styles.statusLabel}>P</Text>
                    </View>

                    <View style={styles.statusGroup}>
                        <TouchableOpacity
                            style={[styles.statusBtn, currentStatus === 'retard' && styles.retardActive]}
                            onPress={() => handleUpdateStatus(item.id, 'retard')}
                        >
                            <Icon name="clock-outline" size={18} color={currentStatus === 'retard' ? 'white' : '#f59e0b'} />
                        </TouchableOpacity>
                        <Text style={styles.statusLabel}>R</Text>
                    </View>

                    <View style={styles.statusGroup}>
                        <TouchableOpacity
                            style={[styles.statusBtn, currentStatus === 'absent' && styles.absentActive]}
                            onPress={() => handleUpdateStatus(item.id, 'absent')}
                        >
                            <Icon name="close" size={18} color={currentStatus === 'absent' ? 'white' : '#ef4444'} />
                        </TouchableOpacity>
                        <Text style={styles.statusLabel}>A</Text>
                    </View>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#f97316" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Icon name="arrow-left" size={24} color="#1e293b" />
                </TouchableOpacity>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Faire l'appel</Text>
                    <Text style={styles.subtitle}>{session.theme || session.title} • {session.groupe}</Text>
                </View>
                <View style={{ width: 44 }} />
            </View>

            <FlatList
                data={athletes}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderAthleteItem}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={
                    <View>
                        <TouchableOpacity
                            style={styles.bigMarkAllBtn}
                            onPress={handleMarkAllPresent}
                        >
                            <Icon name="check-all" size={28} color="white" />
                            <Text style={styles.bigMarkAllText}>MARQUER TOUT LE MONDE PRÉSENT</Text>
                        </TouchableOpacity>

                        <View style={styles.summaryCard}>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryVal}>{Object.values(attendance).filter(a => a.status === 'present').length}</Text>
                                <Text style={styles.summaryLabel}>P</Text>
                            </View>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryVal}>{Object.values(attendance).filter(a => a.status === 'retard').length}</Text>
                                <Text style={styles.summaryLabel}>R</Text>
                            </View>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryVal}>{Object.values(attendance).filter(a => a.status === 'absent').length}</Text>
                                <Text style={styles.summaryLabel}>A</Text>
                            </View>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryVal}>{athletes.length}</Text>
                                <Text style={styles.summaryLabel}>Total</Text>
                            </View>
                        </View>
                    </View>
                }
            />

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.saveButton, saving && styles.disabledButton]}
                    onPress={handleSaveAll}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <Icon name="check-all" size={20} color="white" style={{ marginRight: 8 }} />
                            <Text style={styles.saveButtonText}>Valider l'appel</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
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
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
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
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    subtitle: {
        fontSize: 13,
        color: '#64748b',
    },
    listContent: {
        padding: 20,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    summaryCard: {
        flexDirection: 'row',
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        justifyContent: 'space-around',
    },
    summaryItem: {
        alignItems: 'center',
    },
    summaryVal: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    summaryLabel: {
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 4,
    },
    athleteCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    athleteInfo: {
        flex: 1,
    },
    athleteName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
    },
    athletePoste: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 2,
    },
    statusContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    statusGroup: {
        alignItems: 'center',
        gap: 4,
    },
    statusLabel: {
        fontSize: 10,
        color: '#64748b',
        fontWeight: '700',
    },
    statusBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bigMarkAllBtn: {
        backgroundColor: '#10b981',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 20,
    },
    bigMarkAllText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '800',
    },
    presentActive: { backgroundColor: '#10b981', borderColor: '#10b981' },
    absentActive: { backgroundColor: '#ef4444', borderColor: '#ef4444' },
    retardActive: { backgroundColor: '#f59e0b', borderColor: '#f59e0b' },
    excuseActive: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
    footer: {
        padding: 20,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    saveButton: {
        backgroundColor: '#f97316',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    disabledButton: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    }
});

export default AttendanceScreen;
