import React from 'react';

import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { lineDataItem } from 'react-native-gifted-charts';
import { Colors } from '@/constants/theme';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol, IconSymbolName } from '@/components/ui/icon-symbol';
import { Route, useRouter } from 'expo-router';
import VitalSignsGrid from '@/components/vital-signs-grid';
import BPChartCard from '@/components/bp-chart-card';
import ActivityList from '@/components/activity-list';

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

const vitalData: VitalItem[] = [
  { icon: 'waveform.path.ecg', label: 'Tension', value: '117/76', status: "Aujourd'hui", color: '#E91E63' },
  { icon: 'heart', label: 'Fréquence', value: '69 bpm', status: 'Repos', color: '#F44336' },
  { icon: 'drop', label: 'Glycémie', value: '94 mg/dL', status: 'À jeun', color: '#9C27B0' },
  { icon: 'wind', label: 'SpO2', value: '98%', status: 'Saturation', color: '#4CAF50' },
];

const activityData: ActivityItem[] = [
  { icon: 'waveform.path.ecg', label: '8,547 pas', status: '85% de l\'objectif', color: '#E8F5E9' },
  { icon: 'drop', label: '1.8 L / 2.0 L', status: 'Hydratation', color: '#E0F7FA' },
  { icon: 'heart', label: '3/3 médicaments', status: 'À jour', color: '#FCE4EC' },
];

const bpChartData: ChartData = [
  { value: 120, label: 'L' },
  { value: 125, label: 'M' },
  { value: 124, label: 'M' },
  { value: 130, label: 'J' },
  { value: 122, label: 'V' },
  { value: 125, label: 'S' },
  { value: 120, label: 'D' },
];

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

// Creation des series systolique (valeur) et diastolique (valeur - 40)
const bpChartDataSystolic: ChartData = bpChartData.map(item => ({ ...item, value: item.value }));
const bpChartDataDiastolic: ChartData = bpChartData.map(item => ({ ...item, value: item.value! - 40 }));

export default function AccueilScreen() {
  const router = useRouter();

  return (
    <ThemedView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>

        {/* --- Cartes des Signes Vitaux --- */}
        <VitalSignsGrid data={vitalData} />

        {/* --- Alerte Tension --- */}
        <View style={styles.alertBox}>
          <IconSymbol name='info.circle' color='#333' />
          <Text style={styles.alertText}>
            Tension légèrement élevée hier. Limitez le sel.
          </Text>
        </View>

        {/* --- Graphique Tension - 7 jours --- */}
        <BPChartCard
          dataSystolic={bpChartDataSystolic}
          dataDiastolic={bpChartDataDiastolic}
        />

        {/* --- Section Aujourd'hui / Activités --- */}
        <ActivityList
          data={activityData}
          iconColorOfActivity={iconColorOfActivity}
          iconBgColorOfActivity={iconBgColorOfActivity}
        />

        {/* --- Action Bar --- */}
        <View style={styles.actionBar}>
          <TouchableOpacity style={styles.buttonContent}>
            <IconSymbol name='waveform.path.ecg' color='#fff' size={20} />
            <Text style={styles.buttonText}>Ajouter Vitaux</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonContent} onPress={() => router.push('(tabs)/(accueil)/symptoms' as Route)}>
            <IconSymbol name='doc.text' color='#fff' size={20} />
            <Text style={styles.buttonText}>Symptôme</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
});
