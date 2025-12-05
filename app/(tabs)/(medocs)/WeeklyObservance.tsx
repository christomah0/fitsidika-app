// ============================================
// COMPOSANT SUIVI HEBDOMADAIRE
// ============================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WeeklyObservance } from '../../../constants/medicationTypes';

interface WeeklyObservanceProps {
  data: WeeklyObservance;
}

export const WeeklyObservanceCard: React.FC<WeeklyObservanceProps> = ({ data }) => {
  const getDayLabel = (index: number) => {
    const labels = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
    return labels[index];
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Progrès Hebdomadaire</Text>
      
      <View style={styles.observanceHeader}>
        <Text style={styles.observanceLabel}>Observance</Text>
        <Text style={styles.observancePercentage}>{data.weekPercentage}%</Text>
      </View>

      <View style={styles.progressBar}>
        <View 
          style={[styles.progressFill, { width: `${data.weekPercentage}%` }]} 
        />
      </View>

      <View style={styles.daysContainer}>
        {data.days.map((day, index) => (
          <View key={index} style={styles.dayColumn}>
            <Text style={styles.dayLabel}>{getDayLabel(index)}</Text>
            <Text style={[
              styles.dayValue,
              day.percentage < 100 && styles.dayValueWarning
            ]}>
              {day.taken}/{day.total}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 16,
  },
  observanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  observanceLabel: {
    fontSize: 14,
    color: '#666',
  },
  observancePercentage: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4CAF50',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressFill
  : {
height: '100%',
backgroundColor: '#4CAF50',
borderRadius: 4,
},
daysContainer: {
flexDirection: 'row',
justifyContent: 'space-between',
},
dayColumn: {
alignItems: 'center',
flex: 1,
},
dayLabel: {
fontSize: 12,
color: '#666',
marginBottom: 4,
},
dayValue: {
fontSize: 14,
fontWeight: '600',
color: '#4CAF50',
},
dayValueWarning: {
color: '#FF9800',
},
});