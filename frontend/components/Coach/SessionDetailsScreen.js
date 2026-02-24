import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    Linking,
    Platform
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import SessionService from '../../services/sessionService';
import ExerciseService from '../../services/exerciseService';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import API_URL from '../../config/api';

const SessionDetailsScreen = ({ session, onBack, onEdit }) => {
    const [loading, setLoading] = useState(true);
    const [exercises, setExercises] = useState([]);
    const [fullSession, setFullSession] = useState(session);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        if (session && (session.id || session.session_id)) {
            fetchDetails();
        }
    }, [session?.id, session?.session_id]);

    const fetchDetails = async () => {
        try {
            if (!session) return;
            setLoading(true);

            // Logic: 
            // 1. If we have a session_id, it's a link to a template. Fetch it.
            // 2. If no session_id, but the object itself has exercises, it might already be a template.
            // 3. Otherwise, it's a planning record without a template link. Skip fetch.

            let targetId = null;
            if (session.session_id) {
                targetId = session.session_id;
            } else if (session.exercises && Array.isArray(session.exercises)) {
                // It's probably already a template object
                targetId = session.id;
            } else {
                // It's a planning record without a linked template
                setFullSession(session);
                setLoading(false);
                return;
            }

            const response = await SessionService.getSessionById(targetId);
            if (response.success) {
                // Merge planning data (date, time, lieu) with template data (exercises, objective)
                setFullSession({
                    ...response.data,
                    ...session, // Keep planning specific data
                    id: response.data.id || session.id // Ensure we have an ID for PDF export
                });

                // Fetch exercise details
                if (response.data.exercises && response.data.exercises.length > 0) {
                    const exercisePromises = response.data.exercises.map(id =>
                        ExerciseService.getExerciseById(id)
                    );
                    const results = await Promise.all(exercisePromises);
                    setExercises(results.map(r => r.data).filter(Boolean));
                }
            } else {
                setFullSession(session);
            }
        } catch (error) {
            console.error('Error fetching session details:', error);
            setFullSession(session);
        } finally {
            setLoading(false);
        }
    };

    const handleExportPDF = async () => {
        if (!fullSession) return;

        try {
            setExporting(true);

            const html = `
                <html>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
                    <style>
                        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; }
                        .header { border-bottom: 2px solid #f97316; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
                        .club-name { font-size: 24px; font-weight: bold; color: #1e293b; }
                        .fiche-title { font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 2px; }
                        .session-title { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
                        .meta-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 30px; background: #f8fafc; padding: 15px; border-radius: 10px; }
                        .meta-item { display: flex; flex-direction: column; }
                        .meta-label { font-size: 10px; font-weight: bold; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }
                        .meta-value { font-size: 16px; font-weight: 600; }
                        .section { margin-bottom: 30px; }
                        .section-title { font-size: 18px; font-weight: bold; border-left: 4px solid #f97316; padding-left: 12px; margin-bottom: 15px; text-transform: uppercase; }
                        .objective-box { background: #fff; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; line-height: 1.6; }
                        .structure-table { width: 100%; border-collapse: collapse; }
                        .structure-row { border-bottom: 1px solid #e2e8f0; }
                        .structure-cell { padding: 12px 0; }
                        .structure-label { font-weight: bold; width: 150px; color: #f97316; font-size: 12px; }
                        .exercise-card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 20px; page-break-inside: avoid; }
                        .ex-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
                        .ex-title { font-size: 18px; font-weight: bold; margin: 0; }
                        .ex-meta { color: #64748b; font-size: 13px; }
                        .ex-desc { color: #334155; line-height: 1.5; font-size: 14px; }
                        .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; pt: 20px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="club-name">COACH ASSISTANT BASKET</div>
                        <div class="fiche-title">Fiche de Séance</div>
                    </div>

                    <h1 class="session-title">${fullSession.title || fullSession.theme}</h1>
                    
                    <div class="meta-grid">
                        <div class="meta-item">
                            <span class="meta-label">Date</span>
                            <span class="meta-value">${new Date(fullSession.date).toLocaleDateString()}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Horaire</span>
                            <span class="meta-value">${fullSession.heure || fullSession.time}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Durée Totale</span>
                            <span class="meta-value">${fullSession.total_duration || fullSession.duree || 0} min</span>
                        </div>
                    </div>

                    <div class="section">
                        <div class="section-title">Objectif de la séance</div>
                        <div class="objective-box">${fullSession.objective || 'Aucun objectif défini'}</div>
                    </div>

                    <div class="section">
                        <div class="section-title">Structure</div>
                        <table class="structure-table">
                            ${fullSession.warmup ? `
                            <tr class="structure-row">
                                <td class="structure-cell structure-label">ÉCHAUFFEMENT</td>
                                <td class="structure-cell">${fullSession.warmup}</td>
                            </tr>` : ''}
                            ${fullSession.main_content ? `
                            <tr class="structure-row">
                                <td class="structure-cell structure-label">FOND PRINCIPAL</td>
                                <td class="structure-cell">${fullSession.main_content}</td>
                            </tr>` : ''}
                            ${(fullSession.cooldown || fullSession.cool_down) ? `
                            <tr class="structure-row">
                                <td class="structure-cell structure-label">FIN DE SÉANCE</td>
                                <td class="structure-cell">${fullSession.cooldown || fullSession.cool_down}</td>
                            </tr>` : ''}
                        </table>
                    </div>

                    <div class="section">
                        <div class="section-title">Exercices (${exercises.length})</div>
                        ${exercises.map((ex, index) => `
                            <div class="exercise-card">
                                <div class="ex-header">
                                    <h3 class="ex-title">${index + 1}. ${ex.name}</h3>
                                    <span class="ex-meta">${ex.duration} min | ${ex.players_min}-${ex.players_max} joueurs</span>
                                </div>
                                <div class="ex-desc">${ex.description}</div>
                            </div>
                        `).join('')}
                    </div>

                    <div class="footer">
                        Généré le ${new Date().toLocaleString()} par Coach Assistant Basket
                    </div>
                </body>
                </html>
            `;

            const { uri } = await Print.printToFileAsync({ html });

            if (Platform.OS === 'ios') {
                await Sharing.shareAsync(uri);
            } else {
                // Sur Android, on partage directement aussi
                await Sharing.shareAsync(uri, {
                    mimeType: 'application/pdf',
                    dialogTitle: 'Exporter la fiche de séance',
                    UTI: 'com.adobe.pdf'
                });
            }
        } catch (error) {
            console.error('Export error:', error);
            Alert.alert('Erreur', 'Impossible de générer le PDF');
        } finally {
            setExporting(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#f97316" />
            </View>
        );
    }

    if (!fullSession) {
        return (
            <View style={styles.center}>
                <Text>Détails non disponibles</Text>
                <TouchableOpacity onPress={onBack} style={{ marginTop: 20 }}>
                    <Text style={{ color: '#f97316' }}>Retour</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Icon name="arrow-left" size={24} color="#1e293b" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Détails de la séance</Text>
                <TouchableOpacity style={styles.editButton} onPress={() => onEdit && onEdit(fullSession)}>
                    <Icon name="pencil-outline" size={22} color="#f97316" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Session Card */}
                <View style={styles.sessionOverview}>
                    <Text style={styles.title}>{fullSession.title || fullSession.theme}</Text>
                    <View style={styles.metaContainer}>
                        <View style={styles.metaItem}>
                            <Icon name="calendar" size={16} color="#64748b" />
                            <Text style={styles.metaText}>{new Date(fullSession.date).toLocaleDateString()}</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Icon name="clock-outline" size={16} color="#64748b" />
                            <Text style={styles.metaText}>{fullSession.heure || fullSession.time}</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Icon name="timer-outline" size={16} color="#64748b" />
                            <Text style={styles.metaText}>{fullSession.total_duration || fullSession.duree || 0} min</Text>
                        </View>
                    </View>
                </View>

                {/* Objective */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Objectif</Text>
                    <View style={styles.card}>
                        <Text style={styles.sectionContent}>{fullSession.objective || 'Aucun objectif défini'}</Text>
                    </View>
                </View>

                {/* Structure */}
                {(fullSession.warmup || fullSession.main_content || fullSession.cooldown || fullSession.cool_down) && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Structure de la séance</Text>
                        <View style={styles.card}>
                            {fullSession.warmup && (
                                <View style={styles.structureItem}>
                                    <Text style={styles.structureLabel}>ÉCHAUFFEMENT</Text>
                                    <Text style={styles.structureText}>{fullSession.warmup}</Text>
                                </View>
                            )}
                            {fullSession.main_content && (
                                <View style={styles.structureItem}>
                                    <Text style={styles.structureLabel}>FOND PRINCIPAL</Text>
                                    <Text style={styles.structureText}>{fullSession.main_content}</Text>
                                </View>
                            )}
                            {(fullSession.cooldown || fullSession.cool_down) && (
                                <View style={styles.structureItem}>
                                    <Text style={styles.structureLabel}>FIN DE SÉANCE</Text>
                                    <Text style={styles.structureText}>{fullSession.cooldown || fullSession.cool_down}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* Exercises */}
                {exercises.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Exercices ({exercises.length})</Text>
                        {exercises.map((ex, index) => (
                            <View key={ex.id} style={styles.exerciseCard}>
                                <View style={styles.exerciseHeader}>
                                    <Text style={styles.exerciseIndex}>{index + 1}</Text>
                                    <View style={styles.exerciseInfo}>
                                        <Text style={styles.exerciseName}>{ex.name}</Text>
                                        <Text style={styles.exerciseMeta}>
                                            {ex.duration} min • {ex.players_min}-{ex.players_max} joueurs
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.exerciseDescription} numberOfLines={3}>
                                    {ex.description}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Floating Action Button for Export */}
            <TouchableOpacity
                style={[styles.exportFab, exporting && { opacity: 0.7 }]}
                onPress={handleExportPDF}
                disabled={exporting}
            >
                {exporting ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Icon name="file-pdf-box" size={24} color="white" />
                )}
                <Text style={styles.exportText}>
                    {exporting ? 'GÉNÉRATION...' : 'EXPORTER PDF'}
                </Text>
            </TouchableOpacity>
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
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    editButton: {
        padding: 5,
    },
    content: {
        flex: 1,
    },
    sessionOverview: {
        backgroundColor: 'white',
        padding: 24,
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 12,
    },
    metaContainer: {
        flexDirection: 'row',
        gap: 20,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        fontSize: 14,
        color: '#64748b',
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    sectionContent: {
        fontSize: 15,
        color: '#334155',
        lineHeight: 22,
    },
    structureItem: {
        marginBottom: 16,
    },
    structureLabel: {
        fontSize: 11,
        fontWeight: '800',
        color: '#f97316',
        marginBottom: 4,
    },
    structureText: {
        fontSize: 14,
        color: '#334155',
        lineHeight: 20,
    },
    exerciseCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    exerciseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    exerciseIndex: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#f1f5f9',
        textAlign: 'center',
        lineHeight: 28,
        fontSize: 14,
        fontWeight: 'bold',
        color: '#64748b',
        marginRight: 12,
    },
    exerciseInfo: {
        flex: 1,
    },
    exerciseName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
    },
    exerciseMeta: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 2,
    },
    exerciseDescription: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
    },
    exportFab: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
        backgroundColor: '#3b82f6',
        borderRadius: 16,
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 10,
    },
    exportText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '800',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default SessionDetailsScreen;
