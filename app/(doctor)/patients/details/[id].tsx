import { AppMedicationHistoryCard } from '@/components/app-medication-history-card';
import { AppSymptomHistoryCard } from '@/components/app-symptom-history-card';
import { GuideBox } from '@/components/guide-box';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { getLast2Medications, getLast2Symptoms, createCarePlan, createGoal, createPatientMedication, createPatientVitalSigns, getPatientVitalSigns, getCarePlans, getGoals, getPatientById } from '@/services/firebase/firestoreServices';
import { Medication } from '@/types/medication.type';
import { PatientOverview } from '@/types/patient-overview';
import { Symptom } from '@/types/symptom.type';
import { formatTime } from '@/utils/date-format';
import { HealthStatus } from '@/utils/patient-status';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useAuth } from '@/hooks/use-auth';
import AddCarePlanModal from '@/components/add-care-plan-modal';
import AddGoalModal from '@/components/add-goal-modal';
import PrescribeMedicationModal from '@/components/prescribe-medication-modal';
import { VitalInputModal } from '@/components/VitalInputModal';
import Toast from 'react-native-toast-message';

type TabType = 'vitals' | 'plan';

export default function PatientDetailScreen() {
    const { id, patient: patientString } = useLocalSearchParams();
    const [activeTab, setActiveTab] = useState<TabType>('vitals');
    const router = useRouter();
    const navigation = useNavigation();
    const { user } = useAuth();

    const patient = patientString ? JSON.parse(patientString as string) as PatientOverview : null;
    const [symptoms, setSymptoms] = useState<Symptom[]>([]);
    const [medications, setMedications] = useState<Medication[]>([]);
    const [freshVitals, setFreshVitals] = useState<any>(null);
    const [carePlanCount, setCarePlanCount] = useState(0);
    const [goalCount, setGoalCount] = useState(0);

    const [phoneNumber, setPhoneNumber] = useState<string | null>(null);

    // Modal states
    const [showCarePlanModal, setShowCarePlanModal] = useState(false);
    const [showGoalModal, setShowGoalModal] = useState(false);
    const [showMedicationModal, setShowMedicationModal] = useState(false);
    const [showVitalModal, setShowVitalModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const patientId = Array.isArray(id) ? id[0] : id as string;

    const loadPatientData = async () => {
        if (!patientId) return;
        try {
            const [latestSymptoms, meds, vitals, plans, goals, patientDoc] = await Promise.all([
                getLast2Symptoms(patientId),
                getLast2Medications(patientId),
                getPatientVitalSigns(patientId, 1),
                getCarePlans(patientId),
                getGoals(patientId),
                getPatientById(patientId),
            ]);
            setSymptoms(latestSymptoms);
            setMedications(meds);
            if (vitals.length > 0) setFreshVitals(vitals[0]);
            setCarePlanCount(plans.filter(p => p.status === 'active').length);
            setGoalCount(goals.filter(g => g.status === 'in_progress').length);
            if (patientDoc?.phoneNumber) setPhoneNumber(patientDoc.phoneNumber);
        } catch (err) {
            console.error('Failed to load patient data', err);
        }
    };

    useEffect(() => {
        loadPatientData();
    }, [patientId]);

    const patientInitials = (patient?.name || '')
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    // Use fresh vitals if available, otherwise fall back to overview data
    const displayBp = freshVitals
        ? `${freshVitals.systolic}/${freshVitals.diastolic}`
        : patient?.bp;
    const displaySugar = freshVitals?.bloodSugar ?? patient?.sugar;
    const displayHr = freshVitals?.heartRate ?? patient?.heartRate;
    const displaySpO2 = freshVitals?.oxygenSaturation;
    const displayTemp = freshVitals?.temperature;

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity onPress={() => {
                    router.push({ pathname: "/(doctor)/patients/history/[id]", params: { id: patientId } });
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
        router.push({ pathname: "/(doctor)/patients/history/[id]", params: { id: patientId } });
    };

    const handleCallPatient = () => {
        if (phoneNumber) {
            Linking.openURL(`tel:${phoneNumber}`);
        }
    };

    const navigateToChat = () => {
        router.push({
            pathname: "/(doctor)/patients/chat/[id]",
            params: { id: patientId, patientName: patient?.name || 'Patient' }
        } as any);
    };

    // Handle Care Plan creation
    const handleCreateCarePlan = async (data: { title: string; description: string; endDate?: string }) => {
        if (!user) return;
        setSubmitting(true);
        try {
            let endDate: Date | undefined;
            if (data.endDate) {
                const parts = data.endDate.split('/');
                if (parts.length === 3) {
                    endDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                }
            }

            await createCarePlan({
                patientId,
                doctorId: user.id,
                doctorName: user.name,
                title: data.title,
                description: data.description,
                status: 'active',
                startDate: new Date(),
                endDate,
            });

            Toast.show({ type: 'success', text1: 'Succès', text2: 'Plan de soins créé.', position: 'bottom' });
            setShowCarePlanModal(false);
            loadPatientData();
        } catch {
            Toast.show({ type: 'error', text1: 'Erreur', text2: 'Échec de la création du plan.', position: 'bottom' });
        } finally {
            setSubmitting(false);
        }
    };

    // Handle Goal creation
    const handleCreateGoal = async (data: {
        title: string; category: any; targetValue: number; unit: string; deadline: string; notes?: string;
    }) => {
        if (!user) return;
        setSubmitting(true);
        try {
            const parts = data.deadline.split('/');
            const deadlineDate = parts.length === 3
                ? new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]))
                : new Date(data.deadline);

            await createGoal({
                patientId,
                doctorId: user.id,
                doctorName: user.name,
                title: data.title,
                category: data.category,
                targetValue: data.targetValue,
                currentValue: 0,
                unit: data.unit,
                status: 'in_progress',
                deadline: deadlineDate,
                notes: data.notes,
            });

            Toast.show({ type: 'success', text1: 'Succès', text2: 'Objectif créé.', position: 'bottom' });
            setShowGoalModal(false);
            loadPatientData();
        } catch {
            Toast.show({ type: 'error', text1: 'Erreur', text2: 'Échec de la création de l\'objectif.', position: 'bottom' });
        } finally {
            setSubmitting(false);
        }
    };

    // Handle Medication prescription
    const handlePrescribeMedication = async (data: {
        name: string; dosageValue: number; dosageUnit: any; frequency: string;
        intakeTimes: string[]; durationValue: number; durationUnit: any; instructions?: string;
    }) => {
        if (!user) return;
        setSubmitting(true);
        try {
            await createPatientMedication(patientId, {
                name: data.name,
                dosageValue: data.dosageValue,
                dosageUnit: data.dosageUnit,
                frequency: data.frequency,
                intakeTimes: data.intakeTimes,
                reminderMinutesBefore: 15,
                instructions: data.instructions,
                startDate: new Date(),
                durationValue: data.durationValue,
                durationUnit: data.durationUnit,
            });

            const meds = await getLast2Medications(patientId);
            setMedications(meds);

            Toast.show({ type: 'success', text1: 'Succès', text2: 'Médicament prescrit.', position: 'bottom' });
            setShowMedicationModal(false);
        } catch {
            Toast.show({ type: 'error', text1: 'Erreur', text2: 'Échec de la prescription.', position: 'bottom' });
        } finally {
            setSubmitting(false);
        }
    };

    // Handle Vital Signs
    const handleSaveVitals = async (vitals: any) => {
        try {
            await createPatientVitalSigns(patientId, vitals);
            Toast.show({ type: 'success', text1: 'Succès', text2: 'Signes vitaux enregistrés.', position: 'bottom' });
            setShowVitalModal(false);
            loadPatientData();
        } catch {
            Toast.show({ type: 'error', text1: 'Erreur', text2: 'Échec de l\'enregistrement.', position: 'bottom' });
        }
    };

    return (
        <ThemedView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

                {/* Header Profile */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatarCircle}>
                        <ThemedText style={styles.avatarInitials}>{patientInitials || '??'}</ThemedText>
                    </View>
                    <ThemedText type="subtitle" style={styles.name}>{patient?.name}</ThemedText>
                    <ThemedText style={styles.subInfo}>{patient?.age} ans • {patient?.gender}</ThemedText>
                    <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.circleAction} onPress={handleCallPatient}>
                            <IconSymbol name="phone.fill" size={20} color={Colors.light.tint} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.circleAction} onPress={navigateToChat}>
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
                                <VitalCard icon="heart.fill" label="Tension" value={displayBp || 'N/A'} unit="mmHg" color="#EF4444" />
                                <VitalCard icon="drop.fill" label="Glycémie" value={displaySugar ?? 'N/A'} unit="g/L" color="#3B82F6" />
                                <VitalCard icon="waveform.path.ecg" label="Rythme" value={displayHr ?? 'N/A'} unit="bpm" color="#10B981" />
                            </View>
                            {(displaySpO2 || displayTemp) && (
                                <View style={[styles.vitalsGrid, { marginTop: 12 }]}>
                                    {displaySpO2 != null && <VitalCard icon="wind" label="SpO2" value={`${displaySpO2}%`} unit="" color="#8B5CF6" />}
                                    {displayTemp != null && displayTemp > 0 && <VitalCard icon="thermometer" label="Temp." value={displayTemp} unit="°C" color="#F59E0B" />}
                                </View>
                            )}
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

                            {/* Summary counters */}
                            <View style={styles.planSummaryRow}>
                                <View style={styles.planSummaryItem}>
                                    <ThemedText style={styles.planSummaryNumber}>{carePlanCount}</ThemedText>
                                    <ThemedText style={styles.planSummaryLabel}>Plan(s) actif(s)</ThemedText>
                                </View>
                                <View style={styles.planSummaryItem}>
                                    <ThemedText style={styles.planSummaryNumber}>{goalCount}</ThemedText>
                                    <ThemedText style={styles.planSummaryLabel}>Objectif(s)</ThemedText>
                                </View>
                                <View style={styles.planSummaryItem}>
                                    <ThemedText style={styles.planSummaryNumber}>{medications.length}</ThemedText>
                                    <ThemedText style={styles.planSummaryLabel}>Médicament(s)</ThemedText>
                                </View>
                            </View>

                            <PlanButton icon="plus" label="Ajouter signe vitaux" color={Colors.light.tint} onPress={() => setShowVitalModal(true)} />
                            <PlanButton icon="plus" label="Prescrire un Médicament" color={Colors.light.tint} onPress={() => setShowMedicationModal(true)} />
                            <PlanButton icon="heart.text.square" label="Créer un Plan de Soins" color="#3B82F6" onPress={() => setShowCarePlanModal(true)} />
                            <PlanButton icon="target" label="Définir un Objectif" color="#8B5CF6" onPress={() => setShowGoalModal(true)} />
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

            {/* Modals */}
            <AddCarePlanModal
                visible={showCarePlanModal}
                loading={submitting}
                onClose={() => setShowCarePlanModal(false)}
                onSubmit={handleCreateCarePlan}
            />

            <AddGoalModal
                visible={showGoalModal}
                loading={submitting}
                onClose={() => setShowGoalModal(false)}
                onSubmit={handleCreateGoal}
            />

            <PrescribeMedicationModal
                visible={showMedicationModal}
                loading={submitting}
                onClose={() => setShowMedicationModal(false)}
                onSubmit={handlePrescribeMedication}
            />

            <VitalInputModal
                visible={showVitalModal}
                onClose={() => setShowVitalModal(false)}
                onSave={handleSaveVitals}
            />
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

const PlanButton = ({ icon, label, color, disabled, onPress }: any) => (
    <TouchableOpacity
        style={[styles.planBtn, { backgroundColor: color }, disabled && { opacity: 0.5 }]}
        disabled={disabled}
        onPress={onPress}
    >
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
    avatarCircle: {
        width: 90, height: 90, borderRadius: 45, marginBottom: 16,
        backgroundColor: Colors.light.tint + '20',
        justifyContent: 'center', alignItems: 'center',
    },
    avatarInitials: { fontSize: 32, fontWeight: '800', color: Colors.light.tint },
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
    planSummaryRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    planSummaryItem: {
        flex: 1, backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12,
        alignItems: 'center', borderWidth: 1, borderColor: '#F3F4F6',
    },
    planSummaryNumber: { fontSize: 22, fontWeight: '800', color: '#111827' },
    planSummaryLabel: { fontSize: 11, color: '#6B7280', marginTop: 2 },
    planBtn: {
        flexDirection: 'row', padding: 14, borderRadius: 14, gap: 8,
        justifyContent: 'center', alignItems: 'center', marginBottom: 12
    },
    btnText: { color: 'white', fontWeight: 'bold' },
});
