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
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../config/theme';
import Button from '../UI/Button';
import Card from '../UI/Card';

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

            let targetId = null;
            if (session.session_id) {
                targetId = session.session_id;
            } else if (session.exercises && Array.isArray(session.exercises)) {
                targetId = session.id;
            } else {
                setFullSession(session);
                setLoading(false);
                return;
            }

            const response = await SessionService.getSessionById(targetId);
            if (response.success) {
                setFullSession({
                    ...response.data,
                    ...session,
                    id: response.data.id || session.id
                });

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
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
                        body { 
                            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
                            padding: 40px; 
                            color: #1F2937; 
                            line-height: 1.5;
                        }
                        .header { 
                            border-bottom: 3px solid #E35412; 
                            padding-bottom: 24px; 
                            margin-bottom: 32px; 
                            display: flex; 
                            justify-content: space-between; 
                            align-items: flex-end; 
                        }
                        .brand {
                            display: flex;
                            flex-direction: column;
                        }
                        .club-name { 
                            font-size: 24px; 
                            font-weight: 800; 
                            color: #111827;
                            letter-spacing: -0.5px;
                        }
                        .fiche-title { 
                            font-size: 12px; 
                            color: #6B7280; 
                            text-transform: uppercase; 
                            letter-spacing: 3px;
                            font-weight: 600;
                        }
                        .session-title { 
                            font-size: 32px; 
                            font-weight: 800; 
                            margin-bottom: 8px; 
                            color: #111827;
                            letter-spacing: -1px;
                        }
                        .meta-grid { 
                            display: grid; 
                            grid-template-columns: repeat(3, 1fr); 
                            gap: 1px; 
                            margin-bottom: 32px; 
                            background: #E5E7EB; 
                            border: 1px solid #E5E7EB;
                            border-radius: 12px;
                            overflow: hidden;
                        }
                        .meta-item { 
                            display: flex; 
                            flex-direction: column; 
                            background: #F9FAFB;
                            padding: 16px;
                        }
                        .meta-label { 
                            font-size: 10px; 
                            font-weight: 700; 
                            color: #9CA3AF; 
                            text-transform: uppercase; 
                            margin-bottom: 4px; 
                            letter-spacing: 1px;
                        }
                        .meta-value { 
                            font-size: 16px; 
                            font-weight: 600; 
                            color: #1F2937;
                        }
                        .section { margin-bottom: 40px; }
                        .section-title { 
                            font-size: 14px; 
                            font-weight: 700; 
                            color: #E35412;
                            margin-bottom: 16px; 
                            text-transform: uppercase; 
                            letter-spacing: 2px;
                            display: flex;
                            align-items: center;
                        }
                        .section-title::after {
                            content: '';
                            flex: 1;
                            height: 1px;
                            background: #F3F4F6;
                            margin-left: 16px;
                        }
                        .objective-box { 
                            background: #F3F4F6; 
                            padding: 20px; 
                            border-radius: 12px; 
                            font-size: 15px;
                            color: #374151;
                            font-style: italic;
                            border-left: 4px solid #E35412;
                        }
                        .structure-card {
                            border: 1px solid #F3F4F6;
                            border-radius: 12px;
                            overflow: hidden;
                        }
                        .structure-item {
                            padding: 20px;
                            border-bottom: 1px solid #F3F4F6;
                        }
                        .structure-item:last-child { border-bottom: 0; }
                        .structure-label { 
                            font-weight: 700; 
                            color: #111827; 
                            font-size: 12px; 
                            margin-bottom: 8px;
                            display: block;
                        }
                        .structure-text {
                            font-size: 14px;
                            color: #4B5563;
                        }
                        .exercise-card { 
                            border: 1px solid #E5E7EB; 
                            border-radius: 16px; 
                            padding: 24px; 
                            margin-bottom: 24px; 
                            page-break-inside: avoid;
                            background: #fff;
                        }
                        .ex-header { 
                            display: flex; 
                            justify-content: space-between; 
                            align-items: flex-start; 
                            margin-bottom: 12px; 
                            border-bottom: 1px solid #F3F4F6;
                            padding-bottom: 12px;
                        }
                        .ex-title { font-size: 20px; font-weight: 800; margin: 0; color: #111827; }
                        .ex-meta { 
                            color: #E35412; 
                            font-size: 12px; 
                            font-weight: 700;
                            background: #FFF7ED;
                            padding: 4px 12px;
                            border-radius: 20px;
                        }
                        .ex-desc { color: #4B5563; line-height: 1.6; font-size: 14px; }
                        .footer { 
                            margin-top: 60px; 
                            text-align: center; 
                            font-size: 11px; 
                            color: #9CA3AF; 
                            border-top: 1px solid #F3F4F6; 
                            padding-top: 24px; 
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="brand">
                            <div class="club-name">CABASKET</div>
                            <div class="fiche-title">Feuille de Route</div>
                        </div>
                        <div style="font-weight: 700; font-size: 14px;">${new Date(fullSession.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    </div>

                    <h1 class="session-title">${fullSession.title || fullSession.theme}</h1>
                    
                    <div class="meta-grid">
                        <div class="meta-item">
                            <span class="meta-label">Horaire</span>
                            <span class="meta-value">${fullSession.heure || fullSession.time}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Durée</span>
                            <span class="meta-value">${fullSession.total_duration || fullSession.duree || 0} min</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Lieu</span>
                            <span class="meta-value">${fullSession.lieu || 'Non spécifié'}</span>
                        </div>
                    </div>

                    <div class="section">
                        <div class="section-title">Objectif de la séance</div>
                        <div class="objective-box">${fullSession.objective || 'Aucun objectif défini'}</div>
                    </div>

                    <div class="section">
                        <div class="section-title">Déroulement</div>
                        <div class="structure-card">
                            ${fullSession.warmup ? `
                            <div class="structure-item">
                                <span class="structure-label">01. ÉCHAUFFEMENT</span>
                                <div class="structure-text">${fullSession.warmup}</div>
                            </div>` : ''}
                            ${fullSession.main_content ? `
                            <div class="structure-item">
                                <span class="structure-label">02. CORPS DE SÉANCE</span>
                                <div class="structure-text">${fullSession.main_content}</div>
                            </div>` : ''}
                            ${(fullSession.cooldown || fullSession.cool_down) ? `
                            <div class="structure-item">
                                <span class="structure-label">03. RETOUR AU CALME</span>
                                <div class="structure-text">${fullSession.cooldown || fullSession.cool_down}</div>
                            </div>` : ''}
                        </div>
                    </div>

                    ${exercises.length > 0 ? `
                    <div class="section">
                        <div class="section-title">Exercices Spécifiques</div>
                        ${exercises.map((ex, index) => `
                            <div class="exercise-card">
                                <div class="ex-header">
                                    <h3 class="ex-title">${index + 1}. ${ex.name}</h3>
                                    <span class="ex-meta">${ex.duration} MIN</span>
                                </div>
                                <div class="ex-desc">${ex.description}</div>
                            </div>
                        `).join('')}
                    </div>` : ''}

                    <div class="footer">
                        Généré par Coach Assistant Basket &copy; ${new Date().getFullYear()}
                    </div>
                </body>
                </html>
            `;

            const { uri } = await Print.printToFileAsync({ html });

            if (Platform.OS === 'ios') {
                await Sharing.shareAsync(uri);
            } else {
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
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Chargement de la séance...</Text>
            </View>
        );
    }

    if (!fullSession) {
        return (
            <View style={styles.center}>
                <Icon name="alert-circle-outline" size={64} color={COLORS.gray[200]} />
                <Text style={styles.emptyText}>Séance introuvable</Text>
                <Button title="Retour" onPress={onBack} variant="secondary" style={{ marginTop: 20 }} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity style={styles.backBtn} onPress={onBack}>
                        <Icon name="chevron-left" size={32} color={COLORS.gray[900]} />
                    </TouchableOpacity>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.headerTitle} numberOfLines={1}>Détails Séance</Text>
                        <Text style={styles.headerSubtitle}>{new Date(fullSession.date).toLocaleDateString()}</Text>
                    </View>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => onEdit && onEdit(fullSession)}>
                        <View style={styles.editBtnContainer}>
                            <Icon name="pencil-outline" size={20} color={COLORS.primary} />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.scrollPadding}>
                    <Card style={styles.mainCard} padding="lg">
                        <Text style={styles.sessionTitle}>{fullSession.title || fullSession.theme}</Text>
                        <View style={styles.badgesRow}>
                            <View style={styles.badge}>
                                <Icon name="clock-outline" size={14} color={COLORS.primary} />
                                <Text style={styles.badgeText}>{fullSession.heure || fullSession.time}</Text>
                            </View>
                            <View style={styles.badge}>
                                <Icon name="timer-outline" size={14} color={COLORS.primary} />
                                <Text style={styles.badgeText}>{fullSession.total_duration || fullSession.duree || 0} min</Text>
                            </View>
                            <View style={styles.badge}>
                                <Icon name="map-marker-outline" size={14} color={COLORS.primary} />
                                <Text style={styles.badgeText}>{fullSession.lieu || 'Salle'}</Text>
                            </View>
                        </View>
                    </Card>

                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>OBJECTIF</Text>
                        <Card style={styles.objectiveCard} padding="lg">
                            <Icon name="format-quote-open" size={24} color={COLORS.primary + '30'} style={styles.quoteIcon} />
                            <Text style={styles.objectiveText}>{fullSession.objective || 'Aucun objectif défini'}</Text>
                        </Card>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>DÉROULEMENT</Text>
                        <Card padding="none" style={styles.structureCard}>
                            {Boolean(fullSession.warmup) && (
                                <View style={styles.stepItem}>
                                    <View style={[styles.stepDot, { backgroundColor: '#FCD34D' }]} />
                                    <View style={styles.stepContent}>
                                        <Text style={styles.stepTitle}>Échauffement</Text>
                                        <Text style={styles.stepDescription}>{fullSession.warmup}</Text>
                                    </View>
                                </View>
                            )}
                            {Boolean(fullSession.main_content) && (
                                <View style={styles.stepItem}>
                                    <View style={[styles.stepDot, { backgroundColor: COLORS.primary }]} />
                                    <View style={styles.stepContent}>
                                        <Text style={styles.stepTitle}>Corps de séance</Text>
                                        <Text style={styles.stepDescription}>{fullSession.main_content}</Text>
                                    </View>
                                </View>
                            )}
                            {Boolean(fullSession.cooldown || fullSession.cool_down) && (
                                <View style={styles.stepItem}>
                                    <View style={[styles.stepDot, { backgroundColor: '#60A5FA' }]} />
                                    <View style={styles.stepContent}>
                                        <Text style={styles.stepTitle}>Retour au calme</Text>
                                        <Text style={styles.stepDescription}>{fullSession.cooldown || fullSession.cool_down}</Text>
                                    </View>
                                </View>
                            )}
                        </Card>
                    </View>

                    {exercises.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>EXERCICES ({exercises.length})</Text>
                            {exercises.map((ex, index) => (
                                <Card key={ex.id} style={styles.exerciseCard} padding="lg">
                                    <View style={styles.exerciseHeader}>
                                        <View style={styles.exerciseIndexContainer}>
                                            <Text style={styles.exerciseIndex}>{index + 1}</Text>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.exerciseName}>{ex.name}</Text>
                                            <Text style={styles.exerciseSub}>{ex.duration} min • {ex.players_min}-{ex.players_max} joueurs</Text>
                                        </View>
                                    </View>
                                    <View style={styles.exerciseDivider} />
                                    <Text style={styles.exerciseDesc}>{ex.description}</Text>
                                </Card>
                            ))}
                        </View>
                    )}
                </View>
                <View style={{ height: 120 }} />
            </ScrollView>

            <View style={styles.footer}>
                <Button
                    title={exporting ? "Génération..." : "Exporter en PDF"}
                    onPress={handleExportPDF}
                    loading={exporting}
                    variant="primary"
                    leftIcon="file-pdf-box"
                    style={styles.exportButton}
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
        backgroundColor: COLORS.white,
        paddingHorizontal: SPACING.lg,
        paddingTop: Platform.OS === 'ios' ? 60 : 30,
        paddingBottom: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[100],
        ...SHADOWS.sm,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        marginLeft: -10,
    },
    headerTitle: {
        ...TYPOGRAPHY.h3,
        color: COLORS.gray[900],
    },
    headerSubtitle: {
        ...TYPOGRAPHY.bodySmall,
        color: COLORS.gray[400],
        marginTop: 2,
    },
    actionBtn: {
        padding: 4,
    },
    editBtnContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: COLORS.gray[50],
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.gray[100],
    },
    content: {
        flex: 1,
    },
    scrollPadding: {
        padding: SPACING.lg,
    },
    mainCard: {
        borderRadius: 24,
        marginBottom: 24,
        ...SHADOWS.md,
    },
    sessionTitle: {
        ...TYPOGRAPHY.h2,
        fontSize: 24,
        color: COLORS.gray[900],
        marginBottom: 16,
    },
    badgesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.gray[50],
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.gray[100],
    },
    badgeText: {
        ...TYPOGRAPHY.label,
        fontSize: 11,
        color: COLORS.gray[600],
        marginLeft: 6,
    },
    section: {
        marginBottom: 32,
    },
    sectionLabel: {
        ...TYPOGRAPHY.label,
        fontSize: 11,
        color: COLORS.gray[400],
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: 12,
        marginLeft: 4,
    },
    objectiveCard: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.primary,
    },
    quoteIcon: {
        position: 'absolute',
        top: 12,
        right: 16,
        opacity: 0.1,
    },
    objectiveText: {
        ...TYPOGRAPHY.body,
        fontSize: 15,
        color: COLORS.gray[700],
        lineHeight: 24,
    },
    structureCard: {
        borderRadius: 20,
        overflow: 'hidden',
    },
    stepItem: {
        flexDirection: 'row',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[50],
    },
    stepDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginTop: 6,
        marginRight: 16,
    },
    stepContent: {
        flex: 1,
    },
    stepTitle: {
        ...TYPOGRAPHY.label,
        fontSize: 12,
        color: COLORS.gray[900],
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 6,
    },
    stepDescription: {
        ...TYPOGRAPHY.bodySmall,
        fontSize: 14,
        color: COLORS.gray[600],
        lineHeight: 20,
    },
    exerciseCard: {
        marginBottom: 16,
        borderRadius: 20,
        ...SHADOWS.sm,
    },
    exerciseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    exerciseIndexContainer: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: COLORS.gray[900],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    exerciseIndex: {
        color: COLORS.white,
        fontSize: 15,
        fontWeight: 'bold',
    },
    exerciseName: {
        ...TYPOGRAPHY.h4,
        fontSize: 16,
        color: COLORS.gray[900],
    },
    exerciseSub: {
        ...TYPOGRAPHY.bodySmall,
        fontSize: 12,
        color: COLORS.primary,
        fontWeight: '700',
        marginTop: 2,
    },
    exerciseDivider: {
        height: 1,
        backgroundColor: COLORS.gray[50],
        marginVertical: 16,
    },
    exerciseDesc: {
        ...TYPOGRAPHY.bodySmall,
        fontSize: 14,
        color: COLORS.gray[500],
        lineHeight: 22,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.white,
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 44 : 24,
        borderTopWidth: 1,
        borderTopColor: COLORS.gray[100],
        ...SHADOWS.lg,
    },
    exportButton: {
        height: 56,
        borderRadius: 16,
        ...SHADOWS.md,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.white,
    },
    loadingText: {
        marginTop: 16,
        ...TYPOGRAPHY.bodySmall,
        color: COLORS.gray[400],
    },
    emptyText: {
        ...TYPOGRAPHY.h3,
        color: COLORS.gray[300],
        marginTop: 16,
    }
});

export default SessionDetailsScreen;
