import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Platform,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { useLocalSearchParams } from 'expo-router';

type TabType = 'meds' | 'obj' | 'vitals' | 'symp';

interface MedicationProps {
    name: string;
    dose: string;
    frequency: string;
    date: string;
    status: 'Actif' | 'Terminé' | 'Arrêté';
    doctor: string;
}

interface ObjectiveProps {
    title: string;
    category: string;
    target: number;
    current: number;
    status: 'En cours' | 'Atteint' | 'Abandonné';
    deadline: string;
    color: string;
}

interface VitalMetric {
    label: string;
    value: string;
    icon: keyof typeof Ionicons.glyphMap;
    color?: string;
}

interface VitalSignProps {
    time: string;
    metrics: VitalMetric[];
    statusType: 'Normal' | 'Attention' | 'Critique';
}

interface SymptomProps {
    title: string;
    time: string;
    severity: 'Léger' | 'Modéré' | 'Sévère';
    description?: string;
}

const MedicationCard: React.FC<MedicationProps> = ({ name, dose, frequency, date, status, doctor }) => (
    <View style={styles.card}>
        <View style={styles.cardHeader}>
            <View style={styles.row}>
                <MaterialCommunityIcons name="pill" size={20} color="#27ae60" />
                <Text style={styles.cardTitle}>{name}</Text>
            </View>
            <View style={[styles.badge, status === 'Actif' ? styles.badgeGreen : styles.badgeGray]}>
                <Text style={[styles.badgeText, status === 'Actif' ? styles.textGreen : styles.textGray]}>{status}</Text>
            </View>
        </View>
        <Text style={styles.cardSubtext}>{dose} - {frequency}</Text>
        <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.infoText}>Prescrit le {date}</Text>
        </View>
        <Text style={styles.doctorText}>Par {doctor}</Text>
    </View>
);

const ObjectiveCard: React.FC<ObjectiveProps> = ({ title, category, target, current, status, deadline, color }) => {
    const progress = Math.min(current / target, 1);
    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.row}>
                    <Ionicons name="radio-button-on" size={20} color="#a29bfe" />
                    <Text style={styles.cardTitle}>{title}</Text>
                </View>
                <View style={[styles.badge, status === 'Atteint' ? styles.badgeBlue : styles.badgeGreenLight]}>
                    <Text style={[styles.badgeText, status === 'Atteint' ? styles.textBlue : styles.textGreen]}>{status}</Text>
                </View>
            </View>
            <Text style={styles.cardSubtext}>{category}</Text>
            <View style={styles.progressLabelRow}>
                <Text style={styles.progressLabel}>Objectif: {target}</Text>
                <Text style={styles.progressLabel}>Actuel: {current}</Text>
            </View>
            <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${progress * 100}%`, backgroundColor: color }]} />
            </View>
            <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={16} color="#666" />
                <Text style={styles.infoText}>Échéance: {deadline}</Text>
            </View>
        </View>
    );
};

const VitalSignCard: React.FC<VitalSignProps> = ({ time, metrics, statusType }) => (
    <View style={[styles.card, statusType === 'Critique' && styles.cardCritique]}>
        <View style={styles.cardHeader}>
            <View style={styles.row}>
                <Ionicons name="time-outline" size={20} color="#666" />
                <Text style={styles.cardTitle}>{time}</Text>
            </View>
            <View style={[styles.badge, statusType === 'Critique' ? styles.badgeRed : styles.badgeOrange]}>
                <Text style={[styles.badgeText, statusType === 'Critique' ? styles.textRed : styles.textOrange]}>{statusType}</Text>
            </View>
        </View>
        <View style={styles.vitalGrid}>
            {metrics.map((m, i) => (
                <View key={i} style={styles.vitalItem}>
                    <Ionicons name={m.icon} size={18} color={m.color || "#666"} />
                    <View style={{ marginLeft: 8 }}>
                        <Text style={styles.vitalLabel}>{m.label}</Text>
                        <Text style={styles.vitalValue}>{m.value}</Text>
                    </View>
                </View>
            ))}
        </View>
    </View>
);

const SymptomCard: React.FC<SymptomProps> = ({ title, time, severity, description }) => (
    <View style={styles.card}>
        <View style={styles.cardHeader}>
            <View style={styles.row}>
                <Ionicons name="document-text-outline" size={20} color="#3498db" />
                <Text style={styles.cardTitle}>{title}</Text>
            </View>
            <View style={[styles.badge, severity === 'Sévère' ? styles.badgeRed : severity === 'Modéré' ? styles.badgeOrange : styles.badgeGreenLight]}>
                <Text style={[styles.badgeText, severity === 'Sévère' ? styles.textRed : severity === 'Modéré' ? styles.textOrange : styles.textGreen]}>{severity}</Text>
            </View>
        </View>
        <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.infoText}>{time}</Text>
        </View>
        {description && (
            <View style={styles.descriptionBox}>
                <Text style={styles.descriptionText}>{description}</Text>
            </View>
        )}
    </View>
);

export default function MedicalHistoryScreen() {
    const [activeTab, setActiveTab] = useState<TabType>('meds');
    const [startDate, setStartDate] = useState<Date>(new Date());
    const [endDate, setEndDate] = useState<Date>(new Date());
    const [showStart, setShowStart] = useState<boolean>(false);
    const [showEnd, setShowEnd] = useState<boolean>(false);
    const { id } = useLocalSearchParams();

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

                <TouchableOpacity style={styles.applyBtn} activeOpacity={0.8}>
                    <Ionicons name="filter" size={18} color="white" />
                    <Text style={styles.applyBtnText}>Appliquer les filtres</Text>
                </TouchableOpacity>
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

                {/* Content Render */}
                <View style={{ paddingBottom: 30 }}>
                    {activeTab === 'meds' && (
                        <>
                            <MedicationCard name="Lisinopril" dose="10 mg" frequency="1x/jour" date="15 Nov 2024" status="Actif" doctor="Dr. Rousseau" />
                            <MedicationCard name="Metformine" dose="500 mg" frequency="2x/jour" date="12 Oct 2024" status="Actif" doctor="Dr. Rousseau" />
                        </>
                    )}

                    {activeTab === 'obj' && (
                        <>
                            <ObjectiveCard title="Tension < 120/80" category="Cardio" target={120} current={142} status="En cours" deadline="31 Déc 2024" color="#a29bfe" />
                            <ObjectiveCard title="Glycémie < 100" category="Diabète" target={100} current={95} status="Atteint" deadline="31 Déc 2024" color="#2ecc71" />
                        </>
                    )}

                    {activeTab === 'vitals' && (
                        <>
                            <VitalSignCard
                                time="19 Déc 2024 à 14:30"
                                statusType="Critique"
                                metrics={[
                                    { label: 'Tension', value: '142/95', icon: 'heart', color: '#e74c3c' },
                                    { label: 'Glycémie', value: '158 mg/dL', icon: 'water', color: '#3498db' },
                                    { label: 'FC', value: '88 bpm', icon: 'pulse', color: '#27ae60' },
                                    { label: 'Température', value: '37.2°C', icon: 'thermometer', color: '#e67e22' },
                                ]}
                            />
                            <VitalSignCard
                                time="18 Déc 2024 à 20:00"
                                statusType="Attention"
                                metrics={[
                                    { label: 'Tension', value: '145/93', icon: 'heart', color: '#e74c3c' },
                                    { label: 'Glycémie', value: '155 mg/dL', icon: 'water', color: '#3498db' },
                                ]}
                            />
                        </>
                    )}

                    {activeTab === 'symp' && (
                        <>
                            <SymptomCard
                                title="Douleur thoracique persistante"
                                time="19 Déc 2024 à 14:30"
                                severity="Sévère"
                                description="Douleur qui irradie vers le bras gauche"
                            />
                            <SymptomCard
                                title="Essoufflement lors de la marche"
                                time="19 Déc 2024 à 08:15"
                                severity="Modéré"
                            />
                        </>
                    )}
                </View>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB'
    },
    content: {
        padding: 20,
        paddingBottom: 40
    },
    filterSection: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 16,
        margin: 20,
        borderWidth: 1,
        borderColor: '#f2f2f2'
    },
    filterHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20
    },
    filterTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '700',
        marginLeft: 10,
        color: '#2d3436'
    },
    dateRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20
    },
    dateInputWrapper: { width: '48%' },
    dateLabel: {
        fontSize: 13,
        color: '#7f8c8d',
        marginBottom: 6
    },
    dateInput: {
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        padding: 8,
        backgroundColor: '#fff'
    },
    dateText: {
        fontSize: 14,
        color: '#2d3436'
    },
    applyBtn: {
        backgroundColor: Colors.light.tint,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 14,
        borderRadius: 14
    },
    applyBtnText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 15,
        marginLeft: 8
    },
    tabs: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#E5E7EB',
        borderRadius: 12,
        padding: 2,
    },
    tab: {
        flex: 1,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabActive: {
        backgroundColor: '#fff'
    },
    listTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginVertical: 12,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 22,
        padding: 18,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#f0f0f0'
    },
    cardCritique: {
        borderColor: '#fab1a0',
        backgroundColor: '#fff9f9'
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginLeft: 8,
        color: '#2d3436'
    },
    cardSubtext: {
        color: '#636e72',
        fontSize: 14,
        marginTop: 4,
        marginBottom: 12
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10
    },
    infoText: {
        color: '#636e72',
        fontSize: 13,
        marginLeft: 6
    },
    doctorText: {
        color: '#b2bec3',
        fontSize: 12,
        marginTop: 6
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8
    },
    badgeGreen: { backgroundColor: '#e6f7ee' },
    badgeGreenLight: { backgroundColor: '#f0fff4' },
    badgeGray: { backgroundColor: '#f5f6f7' },
    badgeBlue: { backgroundColor: '#eef2ff' },
    badgeRed: { backgroundColor: '#fff0f0' },
    badgeOrange: { backgroundColor: '#fff9db' },
    badgeText: {
        fontSize: 12,
        fontWeight: '800'
    },
    textGreen: { color: '#00b85c' },
    textGray: { color: '#95a5a6' },
    textBlue: { color: '#3498db' },
    textRed: { color: '#e74c3c' },
    textOrange: { color: '#f39c12' },
    progressLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8
    },
    progressLabel: {
        fontSize: 13,
        color: '#636e72'
    },
    progressBarBg: {
        height: 8,
        backgroundColor: '#f1f2f6',
        borderRadius: 4,
        overflow: 'hidden'
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4
    },
    vitalGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 12
    },
    vitalItem: {
        width: '50%',
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8
    },
    vitalLabel: {
        fontSize: 12,
        color: '#95a5a6'
    },
    vitalValue: {
        fontSize: 15,
        fontWeight: '700',
        color: '#2d3436'
    },
    descriptionBox: {
        backgroundColor: '#f8f9fa',
        padding: 14,
        borderRadius: 12,
        marginTop: 14
    },
    descriptionText: {
        color: '#2d3436',
        fontSize: 14,
        lineHeight: 20
    }
});