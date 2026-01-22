import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import AttendanceService from '../../services/attendanceService';

const { width } = Dimensions.get('window');

const ReportsScreen = () => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState(null);
    const [records, setRecords] = useState([]);
    const [filter, setFilter] = useState('all'); // all, present, absent, retard, excuse

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [statsRes, recordsRes] = await Promise.all([
                AttendanceService.getStats(),
                AttendanceService.getAllAttendance()
            ]);

            if (statsRes.success) setStats(statsRes.data);
            if (recordsRes.success) setRecords(recordsRes.data);
        } catch (error) {
            console.error('Error fetching report data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const filteredRecords = records.filter(record => {
        if (filter === 'all') return true;
        return record.status === filter;
    });

    const getStatusStyle = (status) => {
        switch (status) {
            case 'present': return { bg: '#dcfce7', text: '#166534', label: 'Présent' };
            case 'absent': return { bg: '#fee2e2', text: '#991b1b', label: 'Absent' };
            case 'retard': return { bg: '#fef9c3', text: '#854d0e', label: 'Retard' };
            case 'excuse': return { bg: '#e0f2fe', text: '#075985', label: 'Excusé' };
            default: return { bg: '#f1f5f9', text: '#475569', label: status };
        }
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#f97316" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Rapports d'assiduité</Text>
                <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
                    <Icon name="refresh" size={24} color="#f97316" />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                showsVerticalScrollIndicator={false}
            >
                {/* Stats Summary */}
                <View style={styles.statsContainer}>
                    <View style={styles.mainStat}>
                        <Text style={styles.mainStatValue}>{stats?.attendanceRate || 0}%</Text>
                        <Text style={styles.mainStatLabel}>Taux de présence global</Text>
                    </View>
                    <View style={styles.statsGrid}>
                        <View style={[styles.statBox, { borderLeftColor: '#10b981' }]}>
                            <Text style={styles.statValue}>{stats?.present || 0}</Text>
                            <Text style={styles.statLabel}>Présents</Text>
                        </View>
                        <View style={[styles.statBox, { borderLeftColor: '#ef4444' }]}>
                            <Text style={styles.statValue}>{stats?.absent || 0}</Text>
                            <Text style={styles.statLabel}>Absents</Text>
                        </View>
                        <View style={[styles.statBox, { borderLeftColor: '#f59e0b' }]}>
                            <Text style={styles.statValue}>{stats?.retard || 0}</Text>
                            <Text style={styles.statLabel}>Retards</Text>
                        </View>
                        <View style={[styles.statBox, { borderLeftColor: '#3b82f6' }]}>
                            <Text style={styles.statValue}>{stats?.excuse || 0}</Text>
                            <Text style={styles.statLabel}>Excusés</Text>
                        </View>
                    </View>
                </View>

                {/* Filters */}
                <View style={styles.filtersContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersWrapper}>
                        {['all', 'present', 'absent', 'retard', 'excuse'].map((f) => (
                            <TouchableOpacity
                                key={f}
                                style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
                                onPress={() => setFilter(f)}
                            >
                                <Text style={[styles.filterBtnText, filter === f && styles.filterBtnTextActive]}>
                                    {f === 'all' ? 'Tous' : getStatusStyle(f).label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Records List */}
                <View style={styles.listContainer}>
                    <Text style={styles.listTitle}>Détails des présences</Text>
                    {filteredRecords.length > 0 ? (
                        filteredRecords.map((record) => {
                            const statusStyle = getStatusStyle(record.status);
                            return (
                                <View key={record.id} style={styles.recordItem}>
                                    <View style={styles.recordInfo}>
                                        <Text style={styles.athleteName}>
                                            {record.athletes?.prenom} {record.athletes?.nom}
                                        </Text>
                                        <Text style={styles.sessionInfo}>
                                            {record.planning?.theme} • {new Date(record.planning?.date).toLocaleDateString()}
                                        </Text>
                                    </View>
                                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                                        <Text style={[styles.statusText, { color: statusStyle.text }]}>
                                            {statusStyle.label}
                                        </Text>
                                    </View>
                                </View>
                            );
                        })
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Icon name="clipboard-text-outline" size={48} color="#cbd5e1" />
                            <Text style={styles.emptyText}>Aucun enregistrement trouvé</Text>
                        </View>
                    )}
                </View>
                <View style={{ height: 40 }} />
            </ScrollView>
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
        padding: 24,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    refreshBtn: {
        padding: 4,
    },
    content: {
        flex: 1,
    },
    statsContainer: {
        padding: 24,
        backgroundColor: 'white',
        marginBottom: 12,
    },
    mainStat: {
        alignItems: 'center',
        marginBottom: 24,
        padding: 20,
        backgroundColor: '#fff7ed',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ffedd5',
    },
    mainStatValue: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#f97316',
    },
    mainStatLabel: {
        fontSize: 16,
        color: '#9a3412',
        marginTop: 4,
        fontWeight: '500',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    statBox: {
        width: (width - 60) / 2,
        backgroundColor: '#f8fafc',
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    statLabel: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 2,
    },
    filtersContainer: {
        backgroundColor: 'white',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    filtersWrapper: {
        paddingHorizontal: 20,
        gap: 8,
    },
    filterBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    filterBtnActive: {
        backgroundColor: '#f97316',
        borderColor: '#f97316',
    },
    filterBtnText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748b',
    },
    filterBtnTextActive: {
        color: 'white',
    },
    listContainer: {
        padding: 24,
    },
    listTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 16,
    },
    recordItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: 'white',
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    recordInfo: {
        flex: 1,
        marginRight: 12,
    },
    athleteName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
    },
    sessionInfo: {
        fontSize: 13,
        color: '#64748b',
        marginTop: 4,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 15,
        color: '#94a3b8',
    },
});

export default ReportsScreen;
