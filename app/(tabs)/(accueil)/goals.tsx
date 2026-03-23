import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { getGoals, updateGoalProgress } from '@/services/firebase/firestoreServices';
import { Goal } from '@/types/care-plan.type';
import Toast from 'react-native-toast-message';

export default function GoalsScreen() {
    const { user } = useAuth();
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);

    const loadGoals = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        const data = await getGoals(user.id);
        setGoals(data);
        setLoading(false);
    }, [user]);

    useFocusEffect(
        useCallback(() => {
            loadGoals();
        }, [loadGoals])
    );

    const activeGoals = goals.filter(g => g.status === 'in_progress');
    const achievedGoals = goals.filter(g => g.status === 'achieved');

    const getProgress = (goal: Goal) => Math.min(goal.currentValue / goal.targetValue, 1);

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'Tension': return 'heart.fill';
            case 'Glycémie': return 'drop.fill';
            case 'Poids': return 'figure.walk';
            case 'Activité': return 'figure.run';
            default: return 'star.fill';
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'Tension': return '#EF4444';
            case 'Glycémie': return '#3B82F6';
            case 'Poids': return '#F59E0B';
            case 'Activité': return '#10B981';
            default: return '#8B5CF6';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'in_progress': return 'En cours';
            case 'achieved': return 'Atteint';
            case 'abandoned': return 'Abandonné';
            default: return status;
        }
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const handleUpdateProgress = async (goal: Goal) => {
        const newValue = goal.currentValue + 1;
        try {
            await updateGoalProgress(user!.id, goal.id, newValue);
            await loadGoals();
            if (newValue >= goal.targetValue) {
                Toast.show({ type: 'success', text1: 'Bravo!', text2: 'Objectif atteint!', position: 'bottom' });
            }
        } catch {
            Toast.show({ type: 'error', text1: 'Erreur', text2: 'Échec de la mise à jour.', position: 'bottom' });
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.light.tint} />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Summary */}
            {goals.length > 0 && (
                <View style={styles.summaryRow}>
                    <View style={[styles.summaryCard, { backgroundColor: Colors.light.tint + '15' }]}>
                        <Text style={[styles.summaryNumber, { color: Colors.light.tint }]}>{activeGoals.length}</Text>
                        <Text style={styles.summaryLabel}>En cours</Text>
                    </View>
                    <View style={[styles.summaryCard, { backgroundColor: '#DBEAFE' }]}>
                        <Text style={[styles.summaryNumber, { color: '#3B82F6' }]}>{achievedGoals.length}</Text>
                        <Text style={styles.summaryLabel}>Atteints</Text>
                    </View>
                </View>
            )}

            {/* Active Goals */}
            {activeGoals.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Objectifs en cours</Text>
                    {activeGoals.map(goal => {
                        const progress = getProgress(goal);
                        const color = getCategoryColor(goal.category);
                        return (
                            <View key={goal.id} style={styles.goalCard}>
                                <View style={styles.goalHeader}>
                                    <View style={[styles.goalIcon, { backgroundColor: color + '15' }]}>
                                        <IconSymbol name={getCategoryIcon(goal.category) as any} size={18} color={color} />
                                    </View>
                                    <View style={styles.goalHeaderText}>
                                        <Text style={styles.goalTitle}>{goal.title}</Text>
                                        <Text style={styles.goalCategory}>{goal.category}</Text>
                                    </View>
                                    <View style={[styles.statusBadge, { backgroundColor: Colors.light.tint + '20' }]}>
                                        <Text style={[styles.statusText, { color: Colors.light.tint }]}>
                                            {getStatusLabel(goal.status)}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.progressSection}>
                                    <View style={styles.progressLabels}>
                                        <Text style={styles.progressLabel}>
                                            Actuel: {goal.currentValue} {goal.unit}
                                        </Text>
                                        <Text style={styles.progressLabel}>
                                            Objectif: {goal.targetValue} {goal.unit}
                                        </Text>
                                    </View>
                                    <View style={styles.progressBarBg}>
                                        <View style={[styles.progressBarFill, { width: `${progress * 100}%`, backgroundColor: color }]} />
                                    </View>
                                    <Text style={styles.progressPercent}>{Math.round(progress * 100)}%</Text>
                                </View>

                                <View style={styles.goalFooter}>
                                    <View style={styles.deadlineRow}>
                                        <IconSymbol name="calendar" size={14} color="#6B7280" />
                                        <Text style={styles.deadlineText}>Échéance: {formatDate(goal.deadline)}</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={[styles.updateBtn, { backgroundColor: color }]}
                                        onPress={() => handleUpdateProgress(goal)}
                                    >
                                        <Text style={styles.updateBtnText}>+1</Text>
                                    </TouchableOpacity>
                                </View>

                                {goal.notes && (
                                    <View style={styles.notesBox}>
                                        <Text style={styles.notesText}>{goal.notes}</Text>
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </View>
            )}

            {/* Achieved Goals */}
            {achievedGoals.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Objectifs atteints</Text>
                    {achievedGoals.map(goal => (
                        <View key={goal.id} style={[styles.goalCard, styles.achievedCard]}>
                            <View style={styles.goalHeader}>
                                <View style={[styles.goalIcon, { backgroundColor: '#D1FAE5' }]}>
                                    <IconSymbol name="checkmark.circle.fill" size={18} color="#10B981" />
                                </View>
                                <View style={styles.goalHeaderText}>
                                    <Text style={styles.goalTitle}>{goal.title}</Text>
                                    <Text style={styles.goalCategory}>{goal.category}</Text>
                                </View>
                            </View>
                            <Text style={styles.achievedText}>
                                {goal.currentValue}/{goal.targetValue} {goal.unit} - Objectif atteint!
                            </Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Empty State */}
            {goals.length === 0 && (
                <View style={styles.emptyContainer}>
                    <IconSymbol name="target" size={48} color="#D1D5DB" />
                    <Text style={styles.emptyTitle}>Aucun objectif</Text>
                    <Text style={styles.emptySubtitle}>
                        Votre médecin définira des objectifs de santé pour vous.
                    </Text>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    content: { padding: 16, paddingBottom: 40 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
    summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    summaryCard: { flex: 1, borderRadius: 16, padding: 16, alignItems: 'center' },
    summaryNumber: { fontSize: 28, fontWeight: '800' },
    summaryLabel: { fontSize: 13, color: '#6B7280', marginTop: 4 },
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 12 },
    goalCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 18,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    achievedCard: { opacity: 0.8 },
    goalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
    goalIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    goalHeaderText: { flex: 1 },
    goalTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
    goalCategory: { fontSize: 13, color: '#6B7280', marginTop: 2 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 12, fontWeight: '700' },
    progressSection: { marginBottom: 12 },
    progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    progressLabel: { fontSize: 13, color: '#6B7280' },
    progressBarBg: { height: 8, backgroundColor: '#F3F4F6', borderRadius: 4, overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 4 },
    progressPercent: { fontSize: 12, color: '#9CA3AF', textAlign: 'right', marginTop: 4 },
    goalFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    deadlineRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    deadlineText: { fontSize: 13, color: '#6B7280' },
    updateBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
    updateBtnText: { color: 'white', fontWeight: '700', fontSize: 14 },
    notesBox: { backgroundColor: '#F9FAFB', padding: 12, borderRadius: 12, marginTop: 12 },
    notesText: { fontSize: 13, color: '#4B5563', lineHeight: 18 },
    achievedText: { fontSize: 14, color: '#10B981', fontWeight: '600' },
    emptyContainer: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 32 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginTop: 16 },
    emptySubtitle: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', marginTop: 8 },
});
