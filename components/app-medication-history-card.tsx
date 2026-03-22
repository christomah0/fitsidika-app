import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';
import { Medication } from '@/types/medication.type';

interface Props {
  medication: Medication;
}

export const AppMedicationHistoryCard = ({ medication }: Props) => {
  const doseDisplay = `${medication.dosageValue} ${medication.dosageUnit} - ${medication.frequency}`;
  const durationDisplay = `${medication.durationValue} ${medication.durationUnit}`;
  
  // Logic to determine if medication is currently active based on start date
  const isActive = new Date(medication.startDate) <= new Date();

  return (
    <View style={styles.medCard}>
      <View style={styles.infoContainer}>
        <ThemedText type="defaultSemiBold" style={styles.medName}>
          {medication.name}
        </ThemedText>
        <ThemedText style={styles.medDose}>{doseDisplay}</ThemedText>
        
        {medication.instructions && (
          <ThemedText style={styles.medInstructions}>
            {medication.instructions}
          </ThemedText>
        )}
        
        <ThemedText style={styles.medDuration}>
          Durée: {durationDisplay}
        </ThemedText>
      </View>

      <View style={[styles.statusBadge, isActive ? styles.activeBadge : styles.inactiveBadge]}>
        <ThemedText style={[styles.statusText, isActive ? styles.activeText : styles.inactiveText]}>
          {isActive ? 'Actif' : 'Terminé'}
        </ThemedText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  medCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  infoContainer: {
    flex: 1,
    marginRight: 8,
  },
  medName: {
    fontSize: 16,
    color: '#111827',
  },
  medDose: {
    fontSize: 13,
    color: '#4B5563',
    marginTop: 2,
  },
  medInstructions: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 4,
  },
  medDuration: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeBadge: {
    backgroundColor: '#F0FDF4',
  },
  inactiveBadge: {
    backgroundColor: '#F3F4F6',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  activeText: {
    color: '#10B981',
  },
  inactiveText: {
    color: '#6B7280',
  },
});
