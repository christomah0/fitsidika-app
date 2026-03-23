import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { useLocalSearchParams } from 'expo-router';
import {
    getPatientMedications,
    getGoals,
    getPatientVitalSigns,
    getPatientSymptoms,
} from '@/services/firebase/firestoreServices';
import { Medication } from '@/types/medication.type';
import { Goal } from '@/types/care-plan.type';
import { Symptom } from '@/types/symptom.type';
import { getPatientStatus } from '@/utils/patient-status';

type TabType = 'meds' | 'obj' | 'vitals' | 'symp';

export default function MedicalHistoryScreen() {
    const [activeTab, setActiveTab] = useState<TabType>('meds');
    const [startDate, setStartDate] = useState<Date>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    const [endDate, setEndDate] = useState<Date>(new Date());
    const [showStart, setShowStart] = useState<boolean>(false);
    const [showEnd, setShowEnd] = useState<boolean>(false);
    const { id } = useLocalSearchParams();
    const patientId = Array.isArray(id) ? id[0] : id as string;

    const [medications, setMedications] = useState<Medication[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [vitalSigns, setVitalSigns] = useState<any[]>([]);
    const [symptoms, setSymptoms] = useState<Symptom[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!patientId) return;

        const load = async () => {
            setLoading(true);
            try {
                const [meds, goalsData, vitals, symps] = await Promise.all([
                    getPatientMedications(patientId),
                    getGoals(patientId),
                    getPatientVitalSigns(patientId),
                    getPatientSymptoms(patientId),
                ]);
                setMedications(meds);
                setGoals(goalsData);
                setVitalSigns(vitals);
                setSymptoms(symps);
            } catch (err) {
                console.error('Error loading history:', err);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [patientId]);

    const onDateChange = (
        event: DateTimePickerEvent,
        selectedDate: Date | undefined,
        type: 'start' | 'end'
    ) => {
        if (type === 'start') {
            setShowStart(Platform.OS === 'ios');
            if (selectedDate) setStartDate(selectedDate);
        } else {
            setShowEnd(Platform.OS === 'ios');
            if (selectedDate) setEndDate(selectedDate);
        }
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const getMedStatus = (med: Medication): 'Actif' | 'Terminé' => {
        const start = med.startDate instanceof Date ? med.startDate : new Date(med.startDate);
        const durationMs = med.durationUnit === 'jours' ? med.durationValue * 86400000
            : med.durationUnit === 'semaines' ? med.durationValue * 7 * 86400000
            : med.durationValue * 30 * 86400000;
        const end = new Date(start.getTime() + durationMs);
        return new Date() <= end ? 'Actif' : 'Terminé';
    };

    const getSeverityLabel = (severity: number): 'Léger' | 'Modéré' | 'Sévère' => {
        if (severity <= 3) return 'Léger';
        if (severity <= 6) return 'Modéré';
        return 'Sévère';
    };

    return (
        <ThemedView style={styles.container}>
            {/* Filters */}
            <View style={styles.filterSection}>
                <View style={styles.filterHeader}>
                    <Ionicons name="filter" size={20} color={Colors.light.tint} />
                    <Text style={styles.filterTitle}>Filtres</Text>
                </View>

                <View style={styles.dateRow}>
                    <View style={styles.dateInputWrapper}>
                        <Text style={styles.dateLabel}>Date de début</Text>
                        <TouchableOpacity style={styles.dateInput} onPress={() => setShowStart(true)}>
                            <DateTimePicker
                                value={startDate}
                                mode="date"
                                display="default"
                                onChange={(e, d) => onDateChange(e, d, 'start')}
                                locale="fr-FR"
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.dateInputWrapper}>
                        <Text style={styles.dateLabel}>Date de fin</Text>
                        <TouchableOpacity style={styles.dateInput} onPress={() => setShowEnd(true)}>
                            <DateTimePicker
                                value={endDate}
                                mode="date"
                                display='default'
                                onChange={(e, d) => onDateChange(e, d, 'end')}
                                locale='fr-FR'
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Tabs */}
                <View style={styles.tabs}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'meds' && styles.tabActive]}
                        onPress={() => setActiveTab('meds')}
                    >
                        <MaterialCommunityIcons name="pill" size={24} color={activeTab === 'meds' ? Colors.light.tint : '#4b5563'} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'obj' && styles.tabActive]}
                        onPress={() => setActiveTab('obj')}
                    >
                        <Ionicons name="radio-button-on" size={24} color={activeTab === 'obj' ? Colors.light.tint : '#4b5563'} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'vitals' && styles.tabActive]}
                        onPress={() => setActiveTab('vitals')}
                    >
                        <Ionicons name="heart" size={24} color={activeTab === 'vitals' ? Colors.light.tint : '#4b5563'} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'symp' && styles.tabActive]}
                        onPress={() => setActiveTab('symp')}
                    >
                        <Ionicons name="document-text" size={24} color={activeTab === 'symp' ? Colors.light.tint : '#4b5563'} />
                    </TouchableOpacity>
                </View>

                <ThemedText type='subtitle' style={styles.listTitle}>
                    {activeTab === 'meds' && "Historique des Médicaments"}
                    {activeTab === 'obj' && "Historique des Objectifs"}
                    {activeTab === 'vitals' && "Historique des Signes Vitaux"}
                    {activeTab === 'symp' && "Historique des Symptômes"}
                </ThemedText>

                {loading ? (
                    <ActivityIndicator size="large" color={Colors.light.tint} style={{ marginTop: 40 }} />
                ) : (
                    <View style={{ paddingBottom: 30 }}>
                        {activeTab === 'meds' && (
                            medications.length > 0 ? (
                                medications.map(med => (
                                    <View key={med.id} style={styles.card}>
                                        <View style={styles.cardHeader}>
                                            <View style={styles.row}>
                                                <MaterialCommunityIcons name="pill" size={20} color="#27ae60" />
                                                <Text style={styles.cardTitle}>{med.name}</Text>
                                            </View>
                                            <View style={[styles.badge, getMedStatus(med) === 'Actif' ? styles.badgeGreen : styles.badgeGray]}>
                                                <Text style={[styles.badgeText, getMedStatus(med) === 'Actif' ? styles.textGreen : styles.textGray]}>
                                                    {getMedStatus(med)}
                                                </Text>
                                            </View>
                                        </View>
                                        <Text style={styles.cardSubtext}>
                                            {med.dosageValue} {med.dosageUnit} - {med.frequency}
                                        </Text>
                                        <View style={styles.infoRow}>
                                            <Ionicons name="calendar-outline" size={16} color="#666" />
                                            <Text style={styles.infoText}>
                                                Prescrit le {formatDate(med.startDate instanceof Date ? med.startDate : new Date(med.startDate))}
                                            </Text>
                                        </View>
                                        <Text style={styles.doctorText}>
                                            Durée: {med.durationValue} {med.durationUnit}
                                        </Text>
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.emptyText}>Aucun médicament enregistré.</Text>
                            )
                        )}

                        {activeTab === 'obj' && (
                            goals.length > 0 ? (
                                goals.map(goal => {
                                    const progress = Math.min(goal.currentValue / goal.targetValue, 1);
                                    const statusLabel = goal.status === 'achieved' ? 'Atteint' : goal.status === 'in_progress' ? 'En cours' : 'Abandonné';
                                    return (
                                        <View key={goal.id} style={styles.card}>
                                            <View style={styles.cardHeader}>
                                                <View style={styles.row}>
                                                    <Ionicons name="radio-button-on" size={20} color="#a29bfe" />
                                                    <Text style={styles.cardTitle}>{goal.title}</Text>
                                                </View>
                                                <View style={[styles.badge, goal.status === 'achieved' ? styles.badgeBlue : styles.badgeGreenLight]}>
                                                    <Text style={[styles.badgeText, goal.status === 'achieved' ? styles.textBlue : styles.textGreen]}>
                                                        {statusLabel}
                                                    </Text>
                                                </View>
                                            </View>
                                            <Text style={styles.cardSubtext}>{goal.category}</Text>
                                            <View style={styles.progressLabelRow}>
                                                <Text style={styles.progressLabel}>Objectif: {goal.targetValue} {goal.unit}</Text>
                                                <Text style={styles.progressLabel}>Actuel: {goal.currentValue} {goal.unit}</Text>
                                            </View>
                                            <View style={styles.progressBarBg}>
                                                <View style={[styles.progressBarFill, { width: `${progress * 100}%`, backgroundColor: '#a29bfe' }]} />
                                            </View>
                                            <View style={styles.infoRow}>
                                                <Ionicons name="time-outline" size={16} color="#666" />
                                                <Text style={styles.infoText}>
                                                    Échéance: {formatDate(goal.deadline instanceof Date ? goal.deadline : new Date(goal.deadline))}
                                                </Text>
                                            </View>
                                        </View>
                                    );
                                })
                            ) : (
                                <Text style={styles.emptyText}>Aucun objectif enregistré.</Text>
                            )
                        )}

                        {activeTab === 'vitals' && (
                            vitalSigns.length > 0 ? (
                                vitalSigns.map(vital => {
                                    const statusType = getPatientStatus({
                                        systolic: vital.systolic || 0,
                                        diastolic: vital.diastolic || 0,
                                        spo2: vital.oxygenSaturation || 100,
                                    });
                                    return (
                                        <View key={vital.id} style={[styles.card, statusType === 'Critique' && styles.cardCritique]}>
                                            <View style={styles.cardHeader}>
                                                <View style={styles.row}>
                                                    <Ionicons name="time-outline" size={20} color="#666" />
                                                    <Text style={styles.cardTitle}>
                                                        {vital.createdAt ? formatDate(vital.createdAt) : 'N/A'}
                                                    </Text>
                                                </View>
                                                <View style={[styles.badge, statusType === 'Critique' ? styles.badgeRed : statusType === 'Attention' ? styles.badgeOrange : styles.badgeGreenLight]}>
                                                    <Text style={[styles.badgeText, statusType === 'Critique' ? styles.textRed : statusType === 'Attention' ? styles.textOrange : styles.textGreen]}>
                                                        {statusType}
                                                    </Text>
                                                </View>
                                            </View>
                                            <View style={styles.vitalGrid}>
                                                {vital.systolic > 0 && (
                                                    <View style={styles.vitalItem}>
                                                        <Ionicons name="heart" size={18} color="#e74c3c" />
                                                        <View style={{ marginLeft: 8 }}>
                                                            <Text style={styles.vitalLabel}>Tension</Text>
                                                            <Text style={styles.vitalValue}>{vital.systolic}/{vital.diastolic}</Text>
                                                        </View>
                                                    </View>
                                                )}
                                                {vital.bloodSugar > 0 && (
                                                    <View style={styles.vitalItem}>
                                                        <Ionicons name="water" size={18} color="#3498db" />
                                                        <View style={{ marginLeft: 8 }}>
                                                            <Text style={styles.vitalLabel}>Glycémie</Text>
                                                            <Text style={styles.vitalValue}>{vital.bloodSugar} mg/dL</Text>
                                                        </View>
                                                    </View>
                                                )}
                                                {vital.heartRate > 0 && (
                                                    <View style={styles.vitalItem}>
                                                        <Ionicons name="pulse" size={18} color="#27ae60" />
                                                        <View style={{ marginLeft: 8 }}>
                                                            <Text style={styles.vitalLabel}>FC</Text>
                                                            <Text style={styles.vitalValue}>{vital.heartRate} bpm</Text>
                                                        </View>
                                                    </View>
                                                )}
                                                {vital.temperature > 0 && (
                                                    <View style={styles.vitalItem}>
                                                        <Ionicons name="thermometer" size={18} color="#e67e22" />
                                                        <View style={{ marginLeft: 8 }}>
                                                            <Text style={styles.vitalLabel}>Temp.</Text>
                                                            <Text style={styles.vitalValue}>{vital.temperature}°C</Text>
                                                        </View>
                                                    </View>
                                                )}
                                                {vital.oxygenSaturation > 0 && (
                                                    <View style={styles.vitalItem}>
                                                        <Ionicons name="fitness" size={18} color="#9b59b6" />
                                                        <View style={{ marginLeft: 8 }}>
                                                            <Text style={styles.vitalLabel}>SpO2</Text>
                                                            <Text style={styles.vitalValue}>{vital.oxygenSaturation}%</Text>
                                                        </View>
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                    );
                                })
                            ) : (
                                <Text style={styles.emptyText}>Aucun signe vital enregistré.</Text>
                            )
                        )}

                        {activeTab === 'symp' && (
                            symptoms.length > 0 ? (
                                symptoms.map(symptom => {
                                    const severity = getSeverityLabel(symptom.severity);
                                    return (
                                        <View key={symptom.id} style={styles.card}>
                                            <View style={styles.cardHeader}>
                                                <View style={styles.row}>
                                                    <Ionicons name="document-text-outline" size={20} color="#3498db" />
                                                    <Text style={styles.cardTitle}>{symptom.title}</Text>
                                                </View>
                                                <View style={[styles.badge, severity === 'Sévère' ? styles.badgeRed : severity === 'Modéré' ? styles.badgeOrange : styles.badgeGreenLight]}>
                                                    <Text style={[styles.badgeText, severity === 'Sévère' ? styles.textRed : severity === 'Modéré' ? styles.textOrange : styles.textGreen]}>
                                                        {severity}
                                                    </Text>
                                                </View>
                                            </View>
                                            <View style={styles.infoRow}>
                                                <Ionicons name="time-outline" size={16} color="#666" />
                                                <Text style={styles.infoText}>
                                                    {formatDate(symptom.date instanceof Date ? symptom.date : new Date(symptom.date))}
                                                </Text>
                                            </View>
                                            {symptom.notes && (
                                                <View style={styles.descriptionBox}>
                                                    <Text style={styles.descriptionText}>{symptom.notes}</Text>
                                                </View>
                                            )}
                                        </View>
                                    );
                                })
                            ) : (
                                <Text style={styles.emptyText}>Aucun symptôme enregistré.</Text>
                            )
                        )}
                    </View>
                )}
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    content: { padding: 20, paddingBottom: 40 },
    filterSection: {
        backgroundColor: 'white', borderRadius: 20, padding: 16,
        margin: 20, borderWidth: 1, borderColor: '#f2f2f2'
    },
    filterHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    filterTitle: { flex: 1, fontSize: 18, fontWeight: '700', marginLeft: 10, color: '#2d3436' },
    dateRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    dateInputWrapper: { width: '48%' },
    dateLabel: { fontSize: 13, color: '#7f8c8d', marginBottom: 6 },
    dateInput: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 8, backgroundColor: '#fff' },
    tabs: {
        flexDirection: 'row', justifyContent: 'space-between',
        backgroundColor: '#E5E7EB', borderRadius: 12, padding: 2,
    },
    tab: { flex: 1, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    tabActive: { backgroundColor: '#fff' },
    listTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginVertical: 12 },
    card: {
        backgroundColor: 'white', borderRadius: 22, padding: 18,
        marginBottom: 14, borderWidth: 1, borderColor: '#f0f0f0'
    },
    cardCritique: { borderColor: '#fab1a0', backgroundColor: '#fff9f9' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    row: { flexDirection: 'row', alignItems: 'center' },
    cardTitle: { fontSize: 16, fontWeight: '700', marginLeft: 8, color: '#2d3436' },
    cardSubtext: { color: '#636e72', fontSize: 14, marginTop: 4, marginBottom: 12 },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
    infoText: { color: '#636e72', fontSize: 13, marginLeft: 6 },
    doctorText: { color: '#b2bec3', fontSize: 12, marginTop: 6 },
    badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
    badgeGreen: { backgroundColor: '#e6f7ee' },
    badgeGreenLight: { backgroundColor: '#f0fff4' },
    badgeGray: { backgroundColor: '#f5f6f7' },
    badgeBlue: { backgroundColor: '#eef2ff' },
    badgeRed: { backgroundColor: '#fff0f0' },
    badgeOrange: { backgroundColor: '#fff9db' },
    badgeText: { fontSize: 12, fontWeight: '800' },
    textGreen: { color: '#00b85c' },
    textGray: { color: '#95a5a6' },
    textBlue: { color: '#3498db' },
    textRed: { color: '#e74c3c' },
    textOrange: { color: '#f39c12' },
    progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    progressLabel: { fontSize: 13, color: '#636e72' },
    progressBarBg: { height: 8, backgroundColor: '#f1f2f6', borderRadius: 4, overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 4 },
    vitalGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
    vitalItem: { width: '50%', flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
    vitalLabel: { fontSize: 12, color: '#95a5a6' },
    vitalValue: { fontSize: 15, fontWeight: '700', color: '#2d3436' },
    descriptionBox: { backgroundColor: '#f8f9fa', padding: 14, borderRadius: 12, marginTop: 14 },
    descriptionText: { color: '#2d3436', fontSize: 14, lineHeight: 20 },
    emptyText: { textAlign: 'center', color: '#9CA3AF', marginTop: 40, fontSize: 16 },
});
