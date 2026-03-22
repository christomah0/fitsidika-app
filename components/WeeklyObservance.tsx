// /app/(tabs)/(medocs)/WeeklyObservance.tsx

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WeeklyObservance } from '../../constants/medicationTypes';

interface WeeklyObservanceProps {
  data: WeeklyObservance;
}

export const WeeklyObservanceCard: React.FC<WeeklyObservanceProps> = ({ data }) => {
  // Les étiquettes dans l'image sont 'L', 'M', 'M', 'J', 'V', 'S', 'D'
  const getDayLabel = (index: number) => {
    const labels = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
    return labels[index];
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Progrès Hebdomadaire</Text>
      
      <View style={styles.observanceHeader}>
        <Text style={styles.observanceLabel}>Observance</Text>
        {/* Le pourcentage est affiché séparément dans l'image */}
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
            {/* J'inverse l'ordre pour coller à l'image : Label au-dessus de la barre de progression/valeur */}
            <Text
              style={[
                styles.dayValue,
                // Utilisation du style vert pour 100% et orange pour le reste
                day.taken === day.total ? styles.dayValueSuccess : styles.dayValueWarning,
              ]}
            >
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
    borderWidth: 1, // Bordure légère comme dans l'image
    borderColor: '#E0E0E0',
    // Ajout d'une ombre pour cohérence
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
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
    alignItems: 'flex-end', // Aligner les deux textes
    marginBottom: 8,
  },
  observanceLabel: {
    fontSize: 16, // Plus grand pour coller à l'image
    fontWeight: '600',
    color: '#212121',
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
  progressFill: {
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
    fontSize: 14, // Taille légèrement augmentée pour l'étiquette
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  dayValue: {
    fontSize: 14,
    fontWeight: '600',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    textAlign: 'center',
  },
  dayValueSuccess: {
    color: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  dayValueWarning: {
    color: '#FF9800',
    backgroundColor: '#FFF3E0',
  },
});