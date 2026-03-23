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
import { getCarePlans } from '@/services/firebase/firestoreServices';
import { CarePlan } from '@/types/care-plan.type';

export default function PlanScreen() {
    const { user } = useAuth();
    const [carePlans, setCarePlans] = useState<CarePlan[]>([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            if (!user) return;
            let cancelled = false;

            const load = async () => {
                setLoading(true);
                const plans = await getCarePlans(user.id);
                if (!cancelled) {
                    setCarePlans(plans);
                    setLoading(false);
                }
            };

            load();
            return () => { cancelled = true; };
        }, [user])
    );

    const activePlans = carePlans.filter(p => p.status === 'active');
    const completedPlans = carePlans.filter(p => p.status === 'completed');

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return Colors.light.tint;
            case 'completed': return '#3B82F6';
            case 'cancelled': return '#EF4444';
            default: return '#6B7280';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'active': return 'Actif';
            case 'completed': return 'Terminé';
            case 'cancelled': return 'Annulé';
            default: return status;
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
            {/* Active Plans */}
            {activePlans.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Plans de Soins Actifs</Text>
                    {activePlans.map(plan => (
                        <View key={plan.id} style={styles.planCard}>
                            <View style={styles.planHeader}>
                                <View style={styles.planIconContainer}>
                                    <IconSymbol name="heart.text.square" size={22} color={Colors.light.tint} />
                                </View>
                                <View style={styles.planHeaderText}>
                                    <Text style={styles.planTitle}>{plan.title}</Text>
                                    <Text style={styles.planDoctor}>Dr. {plan.doctorName}</Text>
                                </View>
                                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(plan.status) + '20' }]}>
                                    <Text style={[styles.statusText, { color: getStatusColor(plan.status) }]}>
                                        {getStatusLabel(plan.status)}
                                    </Text>
                                </View>
                            </View>
                            <Text style={styles.planDescription}>{plan.description}</Text>
                            <View style={styles.planDates}>
                                <View style={styles.dateItem}>
                                    <IconSymbol name="calendar" size={14} color="#6B7280" />
                                    <Text style={styles.dateText}>Début: {formatDate(plan.startDate)}</Text>
                                </View>
                                {plan.endDate && (
                                    <View style={styles.dateItem}>
                                        <IconSymbol name="calendar" size={14} color="#6B7280" />
                                        <Text style={styles.dateText}>Fin: {formatDate(plan.endDate)}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    ))}
                </View>
            )}

            {/* Completed Plans */}
            {completedPlans.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Plans Terminés</Text>
                    {completedPlans.map(plan => (
                        <View key={plan.id} style={[styles.planCard, styles.completedCard]}>
                            <View style={styles.planHeader}>
                                <View style={[styles.planIconContainer, { backgroundColor: '#DBEAFE' }]}>
                                    <IconSymbol name="checkmark.circle" size={22} color="#3B82F6" />
                                </View>
                                <View style={styles.planHeaderText}>
                                    <Text style={styles.planTitle}>{plan.title}</Text>
                                    <Text style={styles.planDoctor}>Dr. {plan.doctorName}</Text>
                                </View>
                                <View style={[styles.statusBadge, { backgroundColor: '#DBEAFE' }]}>
                                    <Text style={[styles.statusText, { color: '#3B82F6' }]}>Terminé</Text>
                                </View>
                            </View>
                            <Text style={styles.planDescription}>{plan.description}</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Empty State */}
            {carePlans.length === 0 && (
                <View style={styles.emptyContainer}>
                    <IconSymbol name="heart.text.square" size={48} color="#D1D5DB" />
                    <Text style={styles.emptyTitle}>Aucun plan de soins</Text>
                    <Text style={styles.emptySubtitle}>
                        Votre médecin vous attribuera un plan de soins personnalisé.
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
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 12 },
    planCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 18,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    completedCard: { opacity: 0.8 },
    planHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    planIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: Colors.light.tint + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    planHeaderText: { flex: 1 },
    planTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
    planDoctor: { fontSize: 13, color: '#6B7280', marginTop: 2 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 12, fontWeight: '700' },
    planDescription: { fontSize: 14, color: '#4B5563', lineHeight: 20, marginBottom: 12 },
    planDates: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
    dateItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    dateText: { fontSize: 13, color: '#6B7280' },
    emptyContainer: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 32 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginTop: 16 },
    emptySubtitle: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', marginTop: 8 },
});
