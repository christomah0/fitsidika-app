import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions, ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';

// --- MODIFICATION ICI : Ajout de addDoc ---
import { db } from '@/services/firebase/firebaseConfig';
import { addDoc, collection, onSnapshot, orderBy, query, where } from "firebase/firestore";

import { SuccessModal } from '../../../components/SuccessModal';
import { NewVitalRecordData, VitalInputModal } from '../../../components/VitalInputModal';

/* ================= CONFIGURATION ================= */
type MetricType = 'Tension' | 'Cœur' | 'Glycémie' | 'SpO2' | 'Température';
type PeriodType = 'Jour' | 'Mois' | 'Année';

const METRICS: MetricType[] = ['Tension', 'Cœur', 'Glycémie', 'SpO2', 'Température'];
const PERIODS: PeriodType[] = ['Jour', 'Mois', 'Année']; 
const WEEK_DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const PATIENT_ID = 'patient_#8';
const CHART_WIDTH = Dimensions.get('window').width - 120; 

const metricValueMap: Record<MetricType, (r: any) => number> = {
  Tension: r => r.systolic_bp || 0,
  Cœur: r => r.heart_rate || 0,
  Glycémie: r => r.glucose || 0,
  SpO2: r => r.spo2 || 0,
  Température: r => r.temperature || 0,
};

export default function VitauxScreen() {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('Tension');
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('Jour'); 
  const [referenceDate, setReferenceDate] = useState(new Date());
  const [records, setRecords] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);

  /* --- LOGIQUE DE SAUVEGARDE AJOUTÉE --- */
  const handleSaveRecord = async (data: NewVitalRecordData) => {
    try {
      await addDoc(collection(db, "patients", PATIENT_ID, "vitals"), {
        timestamp: Date.now(), // Enregistre l'heure actuelle
        systolic_bp: parseFloat(data.systolic),
        diastolic_bp: parseFloat(data.diastolic),
        heart_rate: parseFloat(data.heartRate),
        glucose: parseFloat(data.glucose),
        spo2: parseFloat(data.spo2),
        temperature: parseFloat(data.temperature),
      });

      setModalVisible(false); // Ferme la saisie
      setSuccessModalVisible(true); // Affiche le succès
    } catch (error) {
      console.error("Erreur Firebase:", error);
      Alert.alert("Erreur", "Impossible d'enregistrer les données.");
    }
  };

  /* ================= NAVIGATION ET DATES ================= */
  const dateRange = useMemo(() => {
    const start = new Date(referenceDate);
    const end = new Date(referenceDate);
    if (selectedPeriod === 'Jour') {
      const day = start.getDay();
      const diff = start.getDate() - (day === 0 ? 6 : day - 1);
      start.setDate(diff); start.setHours(0,0,0,0);
      end.setDate(start.getDate() + 6); end.setHours(23,59,59,999);
    } else if (selectedPeriod === 'Mois') {
      start.setDate(1); start.setHours(0,0,0,0);
      end.setMonth(start.getMonth() + 1); end.setDate(0); end.setHours(23,59,59,999);
    } else {
      start.setMonth(0); start.setDate(1); start.setHours(0,0,0,0);
      end.setMonth(11); end.setDate(31); end.setHours(23,59,59,999);
    }
    return { start, end };
  }, [referenceDate, selectedPeriod]);

  const navigate = (direction: 'prev' | 'next') => {
    const newDate = new Date(referenceDate);
    if (selectedPeriod === 'Jour') newDate.setDate(referenceDate.getDate() + (direction === 'prev' ? -7 : 7));
    else if (selectedPeriod === 'Mois') newDate.setMonth(referenceDate.getMonth() + (direction === 'prev' ? -1 : 1));
    else newDate.setFullYear(referenceDate.getFullYear() + (direction === 'prev' ? -1 : 1));
    setReferenceDate(newDate);
  };

  /* ================= FIREBASE (LECTURE) ================= */
  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, "patients", PATIENT_ID, "vitals"),
      where("timestamp", ">=", dateRange.start.getTime()),
      where("timestamp", "<=", dateRange.end.getTime()),
      orderBy("timestamp", "asc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRecords(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [dateRange]);

  /* ================= CALCULS GRAPHIQUE & STATS ================= */
  const chartData = useMemo(() => {
    let labels = selectedPeriod === 'Jour' ? WEEK_DAYS : 
                 selectedPeriod === 'Mois' ? ['S1', 'S2', 'S3', 'S4'] :
                 ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
    let values = new Array(labels.length).fill(0);
    let counts = new Array(labels.length).fill(0);

    records.forEach(r => {
      const d = new Date(r.timestamp);
      let idx = 0;
      if (selectedPeriod === 'Jour') {
        idx = d.getDay() - 1; if (idx === -1) idx = 6;
      } else if (selectedPeriod === 'Mois') {
        idx = Math.min(Math.floor((d.getDate() - 1) / 7), 3);
      } else {
        idx = d.getMonth();
      }
      const val = metricValueMap[selectedMetric](r);
      if (val > 0) { values[idx] += val; counts[idx] += 1; }
    });
    const averagedValues = values.map((v, i) => counts[i] > 0 ? Math.round(v / counts[i]) : 0);
    return { labels, datasets: [{ data: averagedValues }] };
  }, [records, selectedMetric, selectedPeriod]);

  const stats = useMemo(() => {
    const cleanValues = chartData.datasets[0].data.filter(v => v > 0);
    if (!cleanValues.length) return { avg: '—', min: '—', max: '—' };
    return {
      avg: Math.round(cleanValues.reduce((a, b) => a + b, 0) / cleanValues.length).toString(),
      min: Math.min(...cleanValues).toString(),
      max: Math.max(...cleanValues).toString(),
    };
  }, [chartData]);

  return (
    <ThemedView style={styles.screen}>
      <TouchableOpacity style={styles.newEntryButton} onPress={() => setModalVisible(true)}>
        <Ionicons name="add-circle" size={24} color="white" />
        <Text style={styles.newEntryText}>Nouvelle Saisie</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <View style={styles.periodTabs}>
          {PERIODS.map(p => (
            <TouchableOpacity key={p} onPress={() => setSelectedPeriod(p)} style={[styles.periodTab, selectedPeriod === p && styles.periodTabActive]}>
              <Text style={[styles.periodTabText, selectedPeriod === p && styles.periodTabTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.navigationHeader}>
          <TouchableOpacity onPress={() => navigate('prev')}><Ionicons name="chevron-back" size={28} color="#4A90E2" /></TouchableOpacity>
          <TouchableOpacity style={styles.dateSelector} onPress={() => setShowDatePicker(true)}>
            <Ionicons name="calendar-outline" size={18} color="#4A90E2" style={{ marginRight: 8 }} />
            <Text style={styles.dateRangeText}>
              {selectedPeriod === 'Jour' ? `Sem. du ${dateRange.start.getDate()} ${dateRange.start.toLocaleString('fr-FR', { month: 'short' })}` :
               selectedPeriod === 'Mois' ? dateRange.start.toLocaleString('fr-FR', { month: 'long', year: 'numeric' }) : dateRange.start.getFullYear()}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigate('next')}><Ionicons name="chevron-forward" size={28} color="#4A90E2" /></TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker value={referenceDate} mode="date" onChange={(e, date) => { setShowDatePicker(false); if(date) setReferenceDate(date); }} />
        )}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
          {METRICS.map(m => (
            <TouchableOpacity key={m} onPress={() => setSelectedMetric(m)} style={[styles.tab, selectedMetric === m && styles.tabActive]}>
              <Text style={[styles.tabText, selectedMetric === m && styles.tabTextActive]}>{m}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.chartWrapper}>
          {loading ? <ActivityIndicator size="large" color="#4A90E2" /> : (
            <BarChart
              data={chartData} width={CHART_WIDTH} height={200} fromZero showValuesOnTopOfBars
              chartConfig={{ backgroundColor: '#fff', backgroundGradientFrom: '#fff', backgroundGradientTo: '#fff', color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`, labelColor: () => '#94a3b8', barPercentage: 0.5, propsForLabels: { fontSize: 9 } }}
              style={{ borderRadius: 16, paddingRight: 45, marginTop: 10 }}
              yAxisLabel="" 
              yAxisSuffix=""
            />
          )}
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}><Text style={styles.statLabel}>Moy</Text><Text style={styles.statValue}>{stats.avg}</Text></View>
          <View style={[styles.statBox, styles.statDivider]}><Text style={styles.statLabel}>Min</Text><Text style={styles.statValue}>{stats.min}</Text></View>
          <View style={styles.statBox}><Text style={styles.statLabel}>Max</Text><Text style={styles.statValue}>{stats.max}</Text></View>
        </View>
      </View>

      {/* --- MODIFICATION ICI : onSave={handleSaveRecord} --- */}
      <VitalInputModal visible={isModalVisible} onClose={() => setModalVisible(false)} onSave={handleSaveRecord} />
      <SuccessModal visible={isSuccessModalVisible} onClose={() => setSuccessModalVisible(false)} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 16, backgroundColor: '#F8F9FA' },
  newEntryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#38A169', borderRadius: 15, paddingVertical: 14, marginBottom: 20 },
  newEntryText: { color: 'white', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  card: { backgroundColor: '#FFF', borderRadius: 24, padding: 16, elevation: 4, alignItems: 'center' },
  periodTabs: { flexDirection: 'row', backgroundColor: '#EDF2F7', borderRadius: 12, padding: 4, marginBottom: 15, width: '100%' },
  periodTab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  periodTabActive: { backgroundColor: '#FFF', elevation: 2 },
  periodTabText: { fontSize: 12, color: '#718096' },
  periodTabTextActive: { color: '#2D3748', fontWeight: 'bold' },
  navigationHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15, width: '100%' },
  dateSelector: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7FAFC', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  dateRangeText: { fontSize: 14, fontWeight: 'bold', color: '#2D3748' },
  tabsContainer: { paddingHorizontal: 5, marginBottom: 10 },
  tab: { paddingVertical: 6, paddingHorizontal: 12, marginRight: 8, borderRadius: 8, backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#E2E8F0' },
  tabActive: { backgroundColor: '#FF0000', borderColor: '#FF0000' },
  tabText: { fontSize: 12, color: '#4A5568' },
  tabTextActive: { color: '#FFF', fontWeight: 'bold' },
  chartWrapper: { alignItems: 'center', justifyContent: 'center', minHeight: 210, width: '100%' },
  statsContainer: { flexDirection: 'row', width: '100%', marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#F7FAFC' },
  statBox: { flex: 1, alignItems: 'center' },
  statDivider: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#EDF2F7' },
  statLabel: { fontSize: 11, color: '#A0AEC0' },
  statValue: { fontSize: 17, fontWeight: 'bold', color: '#2D3748' },
});