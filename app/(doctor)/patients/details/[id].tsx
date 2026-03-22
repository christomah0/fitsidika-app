import { AppMedicationHistoryCard } from '@/components/app-medication-history-card';
import { AppSymptomHistoryCard } from '@/components/app-symptom-history-card';
import { GuideBox } from '@/components/guide-box';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { getLast2Medications, getLast2Symptoms } from '@/services/firebase/firestoreServices';
import { Medication } from '@/types/medication.type';
import { PatientOverview } from '@/types/patient-overview';
import { Symptom } from '@/types/symptom.type';
import { formatTime } from '@/utils/date-format';
import { HealthStatus } from '@/utils/patient-status';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

type TabType = 'vitals' | 'plan';

export default function PatientDetailScreen() {
    const { id, patient: patientString } = useLocalSearchParams();
    const [activeTab, setActiveTab] = useState<TabType>('vitals');
    const router = useRouter();
    const navigation = useNavigation();

    const patient = patientString ? JSON.parse(patientString as string) as PatientOverview : null;
    const [symptoms, setSymptoms] = useState<Symptom[]>([]);
    const [medications, setMedications] = useState<Medication[]>([]);

    useEffect(() => {
        if (!id) return;
        (async () => {
            try {
                const latest = await getLast2Symptoms(id as string);
                setSymptoms(latest);

                const meds = await getLast2Medications(id as string);
                setMedications(meds);
            } catch (err) {
                console.error('Failed to load symptoms and medications', err);
            }
        })();
    }, [id]);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity onPress={() => {
                    const sid = Array.isArray(id) ? id[0] : id;
                    router.push({ pathname: "/(doctor)/patients/history/[id]", params: { id: sid } });
                }}>
                    <IconSymbol name="clock.arrow.circlepath" size={20} color="#000" />
                </TouchableOpacity>
            ),
        });
    }, [navigation, id, router]);

    const descrHealtStatus = (st: HealthStatus) => {
        const descriptions = {
            'Normal': 'Le patient est en bonne santé avec des signes vitaux stables.',
            'Attention': 'Le patient présente des signes vitaux nécessitant une attention accrue.',
            'Critique': 'Le patient est dans un état critique et nécessite une intervention immédiate.'
        };
        return descriptions[st] || '';
    };

    const navigateToHistory = () => {
        const sid = Array.isArray(id) ? id[0] : id;
        router.push({ pathname: "/(doctor)/patients/history/[id]", params: { id: sid } });
    };

    return (
        <ThemedView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                
                {/* Header Profile */}
                <View style={styles.profileHeader}>
                    <Image source={{ uri: 'https://via.placeholder.com/100' }} style={styles.avatar} />
                    <ThemedText type="subtitle" style={styles.name}>{patient?.name}</ThemedText>
                    <ThemedText style={styles.subInfo}>{patient?.age} ans • {patient?.gender}</ThemedText>
                    <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.circleAction}>
                            <IconSymbol name="phone.fill" size={20} color={Colors.light.tint} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.circleAction}>
                            <IconSymbol name="bubble.left.fill" size={20} color={Colors.light.tint} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Tabs */}
                <View style={styles.tabContainer}>
                    <View style={styles.tabTrack}>
                        {(['vitals', 'plan'] as TabType[]).map((tab) => (
                            <TouchableOpacity
                                key={tab}
                                style={[styles.tab, activeTab === tab && styles.activeTab]}
                                onPress={() => setActiveTab(tab)}
                            >
                                <ThemedText style={[styles.tabLabel, activeTab === tab && styles.activeTabLabel]}>
                                    {tab === 'vitals' ? 'Vitaux & Symptômes' : 'Plan de Soins'}
                                </ThemedText>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {activeTab === 'vitals' ? (
                    <>
                        <View style={styles.section}>
                            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Derniers Vitaux</ThemedText>
                            <View style={styles.vitalsGrid}>
                                <VitalCard icon="heart.fill" label="Tension" value={patient?.bp} unit="mmHg" color="#EF4444" />
                                <VitalCard icon="drop.fill" label="Glycémie" value={patient?.sugar} unit="g/L" color="#3B82F6" />
                                <VitalCard icon="waveform.path.ecg" label="Rythme" value={patient?.heartRate} unit="bpm" color="#10B981" />
                            </View>
                        </View>

                        <View style={styles.section}>
                            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>État de Santé</ThemedText>
                            <GuideBox
                                variant={patient?.status === 'Critique' ? 'severe' : patient?.status === 'Attention' ? 'moderate' : 'light'}
                                range={`Statut: ${patient?.status}`}
                                desc={descrHealtStatus(patient?.status!)}
                            />
                        </View>

                        <View style={styles.section}>
                            <View style={styles.rowHeader}>
                                <ThemedText type="defaultSemiBold">Historique des Symptômes</ThemedText>
                                <TouchableOpacity onPress={navigateToHistory}>
                                    <ThemedText style={styles.seeAll}>Voir tout</ThemedText>
                                </TouchableOpacity>
                            </View>
                            {symptoms.length > 0 ? (
                                symptoms.map(s => (
                                    <AppSymptomHistoryCard key={s.id} title={s.title} date={formatTime(s.date)} severity={s.severity} note={s.notes ?? ''} />
                                ))
                            ) : (
                                <ThemedText style={styles.emptyState}>Aucun symptôme récent enregistré.</ThemedText>
                            )}
                        </View>
                    </>
                ) : (
                    <>
                        <View style={styles.planContainer}>
                            <ThemedText type="subtitle" style={styles.planTitle}>Gestion du Plan de Soins</ThemedText>
                            <ThemedText style={styles.planDesc}>Configurez le traitement et les objectifs pour votre patient.</ThemedText>
                            
                            <PlanButton icon="plus" label="Ajouter signe vitaux" color={Colors.light.tint} />
                            <PlanButton icon="plus" label="Prescrire un Médicament" color={Colors.light.tint} />
                            <PlanButton icon="target" label="Définir un Objectif" color="#A020F0" disabled />
                        </View>

                        <View style={styles.section}>
                            <View style={styles.rowHeader}>
                                <ThemedText type="defaultSemiBold">Historique des Médicaments</ThemedText>
                                <TouchableOpacity onPress={navigateToHistory}>
                                    <ThemedText style={styles.seeAll}>Voir tout</ThemedText>
                                </TouchableOpacity>
                            </View>

                            {medications.length > 0 ? (
                                medications.map(m => (
                                    <AppMedicationHistoryCard key={m.id} medication={m} />
                                ))
                            ) : (
                                <ThemedText style={styles.emptyState}>Aucun médicament récent enregistré.</ThemedText>
                            )}
                        </View>
                    </>
                )}
            </ScrollView>
        </ThemedView>
    );
}

const VitalCard = ({ icon, label, value, unit, color }: any) => (
    <View style={styles.vCard}>
        <View style={[styles.vIconCircle, { backgroundColor: color + '15' }]}>
            <IconSymbol name={icon} size={18} color={color} />
        </View>
        <ThemedText style={styles.vLabel}>{label}</ThemedText>
        <ThemedText style={styles.vValue}>{value}</ThemedText>
        <ThemedText style={styles.vUnit}>{unit}</ThemedText>
    </View>
);

const PlanButton = ({ icon, label, color, disabled }: any) => (
    <TouchableOpacity style={[styles.planBtn, { backgroundColor: color }, disabled && { opacity: 0.5 }]} disabled={disabled}>
        <IconSymbol name={icon} size={20} color="white" />
        <ThemedText style={styles.btnText}>{label}</ThemedText>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    content: { padding: 20, paddingBottom: 40 },
    profileHeader: {
        alignItems: 'center', backgroundColor: 'white', borderRadius: 20,
        padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#f2f2f2'
    },
    avatar: { width: 90, height: 90, borderRadius: 45, marginBottom: 16 },
    name: { fontSize: 22, fontWeight: '700', color: '#111827' },
    subInfo: { color: '#6B7280', marginTop: 4 },
    actionRow: { flexDirection: 'row', gap: 15, marginTop: 20 },
    circleAction: {
        width: 44, height: 44, borderRadius: 20, backgroundColor: '#F0FDF4',
        justifyContent: 'center', alignItems: 'center'
    },
    section: { marginBottom: 24, gap: 8 },
    sectionTitle: { marginBottom: 16, fontSize: 18 },
    rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    seeAll: { color: Colors.light.tint, fontWeight: '600', fontSize: 14 },
    emptyState: { textAlign: 'center', color: '#6B7280', marginTop: 20, fontSize: 14 },
    vitalsGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
    vCard: {
        flex: 1, backgroundColor: 'white', padding: 16, borderRadius: 20,
        alignItems: 'center', borderWidth: 1, borderColor: '#F3F4F6'
    },
    vIconCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    vLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
    vValue: { fontSize: 16, fontWeight: '700', color: '#111827' },
    vUnit: { fontSize: 10, color: '#9CA3AF' },
    tabContainer: { paddingVertical: 12 },
    tabTrack: { flexDirection: 'row', backgroundColor: '#E5E7EB', borderRadius: 12, padding: 2 },
    tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
    activeTab: { backgroundColor: 'white' },
    tabLabel: { fontSize: 13, color: '#4b5563', fontWeight: '500' },
    activeTabLabel: { color: '#111827', fontWeight: 'bold' },
    planContainer: { backgroundColor: 'white', padding: 20, borderRadius: 24, marginBottom: 24 },
    planTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
    planDesc: { color: '#6B7280', fontSize: 14, marginVertical: 12 },
    planBtn: {
        flexDirection: 'row', padding: 14, borderRadius: 14, gap: 8,
        justifyContent: 'center', alignItems: 'center', marginBottom: 12
    },
    btnText: { color: 'white', fontWeight: 'bold' },
});
