import React, { useCallback, useState } from 'react';

import { ActivityIndicator, ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { lineDataItem } from 'react-native-gifted-charts';
import { Colors } from '@/constants/theme';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol, IconSymbolName } from '@/components/ui/icon-symbol';
import { Route, useFocusEffect, useRouter } from 'expo-router';
import VitalSignsGrid from '@/components/vital-signs-grid';
import BPChartCard from '@/components/bp-chart-card';
import ActivityList from '@/components/activity-list';
import { useAuth } from '@/hooks/use-auth';
import { getPatientVitalSigns, getGoals, getCarePlans } from '@/services/firebase/firestoreServices';
import { useMedications } from '@/hooks/useMedications';
import { VitalInputModal } from '@/components/VitalInputModal';
import { createPatientVitalSigns } from '@/services/firebase/firestoreServices';
import { SuccessModal } from '@/components/SuccessModal';

interface VitalItem {
  icon: IconSymbolName;
  label: string;
  value: string;
  status: string;
  color: string;
}

interface ActivityItem {
  icon: IconSymbolName;
  label: string;
  status: string;
  color: string;
}

type ChartData = lineDataItem[];

const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

const iconColorOfActivity = (key: number) => {
  switch (key) {
    case 0: return '#4CAF50';
    case 1: return '#03A9F4';
    case 2: return '#E91E63';
    default: return '#333';
  }
}

const iconBgColorOfActivity = (key: number) => {
  switch (key) {
    case 0: return 'rgba(76, 175, 80, 0.2)';
    case 1: return 'rgba(3, 169, 244, 0.2)';
    case 2: return 'rgba(233, 30, 99, 0.2)';
    default: return '#333';
  }
}

export default function AccueilScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { medications } = useMedications();

  const [vitalData, setVitalData] = useState<VitalItem[]>([]);
  const [bpSystolic, setBpSystolic] = useState<ChartData>([]);
  const [bpDiastolic, setBpDiastolic] = useState<ChartData>([]);
  const [activityData, setActivityData] = useState<ActivityItem[]>([]);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showVitalModal, setShowVitalModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Fetch latest vital signs
      const vitals = await getPatientVitalSigns(user.id, 30);

      // Build vital cards from latest entry
      const latest = vitals.length > 0 ? vitals[0] : null;
      const vitalCards: VitalItem[] = [
        {
          icon: 'waveform.path.ecg',
          label: 'Tension',
          value: latest ? `${latest.systolic}/${latest.diastolic}` : '--/--',
          status: latest ? "Aujourd'hui" : 'Aucune donnée',
          color: '#E91E63',
        },
        {
          icon: 'heart',
          label: 'Fréquence',
          value: latest ? `${latest.heartRate} bpm` : '-- bpm',
          status: latest ? 'Repos' : 'Aucune donnée',
          color: '#F44336',
        },
        {
          icon: 'drop',
          label: 'Glycémie',
          value: latest ? `${latest.bloodSugar} mg/dL` : '-- mg/dL',
          status: latest ? 'À jeun' : 'Aucune donnée',
          color: '#9C27B0',
        },
        {
          icon: 'wind',
          label: 'SpO2',
          value: latest ? `${latest.oxygenSaturation}%` : '--%',
          status: 'Saturation',
          color: '#4CAF50',
        },
      ];
      setVitalData(vitalCards);

      // Build BP chart data (last 7 days)
      const now = new Date();
      const systolicByDay: number[] = new Array(7).fill(0);
      const diastolicByDay: number[] = new Array(7).fill(0);
      const countByDay: number[] = new Array(7).fill(0);

      vitals.forEach((v: any) => {
        const date = v.createdAt instanceof Date ? v.createdAt : new Date(v.createdAt);
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays < 7) {
          const idx = 6 - diffDays; // 0=oldest, 6=today
          systolicByDay[idx] += v.systolic || 0;
          diastolicByDay[idx] += v.diastolic || 0;
          countByDay[idx] += 1;
        }
      });

      const sysList: ChartData = DAY_LABELS.map((label, i) => ({
        value: countByDay[i] > 0 ? Math.round(systolicByDay[i] / countByDay[i]) : 0,
        label,
      }));
      const diaList: ChartData = DAY_LABELS.map((label, i) => ({
        value: countByDay[i] > 0 ? Math.round(diastolicByDay[i] / countByDay[i]) : 0,
        label,
      }));

      setBpSystolic(sysList);
      setBpDiastolic(diaList);

      // Alert based on latest vitals
      if (latest) {
        if (latest.systolic > 140 || latest.diastolic > 90) {
          setAlertMessage('Tension élevée détectée. Consultez votre médecin.');
        } else if (latest.systolic > 130 || latest.diastolic > 85) {
          setAlertMessage('Tension légèrement élevée. Limitez le sel.');
        } else {
          setAlertMessage(null);
        }
      }

      // Build activity summary
      const [goalsData, carePlansData] = await Promise.all([
        getGoals(user.id),
        getCarePlans(user.id),
      ]);

      const activeGoals = goalsData.filter(g => g.status === 'in_progress');
      const achievedGoals = goalsData.filter(g => g.status === 'achieved');
      const takenMeds = medications.filter((m: any) => m.status === 'taken');

      const activities: ActivityItem[] = [
        {
          icon: 'target' as IconSymbolName,
          label: `${achievedGoals.length}/${activeGoals.length + achievedGoals.length} objectifs`,
          status: activeGoals.length > 0 ? 'En cours' : 'Aucun objectif',
          color: '#E8F5E9',
        },
        {
          icon: 'heart.text.square' as IconSymbolName,
          label: `${carePlansData.filter(p => p.status === 'active').length} plan(s) actif(s)`,
          status: 'Plan de Soins',
          color: '#E0F7FA',
        },
        {
          icon: 'heart',
          label: `${takenMeds.length}/${medications.length} médicaments`,
          status: medications.length > 0 ? 'À jour' : 'Aucun',
          color: '#FCE4EC',
        },
      ];
      setActivityData(activities);

    } catch (err) {
      console.error('Error loading accueil data:', err);
    } finally {
      setLoading(false);
    }
  }, [user, medications]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleSaveVitals = async (data: any) => {
    if (!user) return;
    try {
      await createPatientVitalSigns(user.id, {
        systolic: parseFloat(data.systolic) || 0,
        diastolic: parseFloat(data.diastolic) || 0,
        heartRate: parseFloat(data.heartRate) || 0,
        bloodSugar: parseFloat(data.glucose) || 0,
        temperature: parseFloat(data.temperature) || 0,
        oxygenSaturation: parseFloat(data.spo2) || 0,
      });
      setShowVitalModal(false);
      setShowSuccessModal(true);
      loadData();
    } catch (err) {
      console.error('Error saving vitals:', err);
    }
  };

  if (loading && vitalData.length === 0) {
    return (
      <ThemedView style={styles.safeArea}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>

        {/* --- Cartes des Signes Vitaux --- */}
        <VitalSignsGrid data={vitalData} />

        {/* --- Alerte Tension --- */}
        {alertMessage && (
          <View style={styles.alertBox}>
            <IconSymbol name='info.circle' color='#333' />
            <Text style={styles.alertText}>{alertMessage}</Text>
          </View>
        )}

        {/* --- Graphique Tension - 7 jours --- */}
        {bpSystolic.some(d => d.value! > 0) && (
          <BPChartCard
            dataSystolic={bpSystolic}
            dataDiastolic={bpDiastolic}
          />
        )}

        {/* --- Section Aujourd'hui / Activités --- */}
        <ActivityList
          data={activityData}
          iconColorOfActivity={iconColorOfActivity}
          iconBgColorOfActivity={iconBgColorOfActivity}
        />

        {/* --- Quick Actions --- */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionCard} onPress={() => router.push('(tabs)/(accueil)/plan' as Route)}>
            <IconSymbol name='heart.text.square' color={Colors.light.tint} size={24} />
            <Text style={styles.quickActionText}>Plan de Soins</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionCard} onPress={() => router.push('(tabs)/(accueil)/goals' as Route)}>
            <IconSymbol name='target' color='#8B5CF6' size={24} />
            <Text style={styles.quickActionText}>Objectifs</Text>
          </TouchableOpacity>
        </View>

        {/* --- Action Bar --- */}
        <View style={styles.actionBar}>
          <TouchableOpacity style={styles.buttonContent} onPress={() => setShowVitalModal(true)}>
            <IconSymbol name='waveform.path.ecg' color='#fff' size={20} />
            <Text style={styles.buttonText}>Ajouter Vitaux</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonContent} onPress={() => router.push('(tabs)/(accueil)/symptoms' as Route)}>
            <IconSymbol name='doc.text' color='#fff' size={20} />
            <Text style={styles.buttonText}>Symptôme</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <VitalInputModal visible={showVitalModal} onClose={() => setShowVitalModal(false)} onSave={handleSaveVitals} />
      <SuccessModal visible={showSuccessModal} onClose={() => setShowSuccessModal(false)} />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    padding: 16,
    paddingTop: 10,
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFDE7',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFD700',
    marginBottom: 20,
  },
  alertText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    bottom: 0,
  },
  buttonContent: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.tint,
    marginLeft: 8,
    borderRadius: 10,
    paddingVertical: 18,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
});
