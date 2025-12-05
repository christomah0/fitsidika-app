// ============================================
// COMPOSANT CARTE MÉDICAMENT
// ============================================

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Medication } from '../../../constants/medicationTypes';

interface MedicationCardProps {
  medication: Medication;
  onMarkAsTaken: (id: string) => void;
  onCancel?: (id: string) => void;
}

export const MedicationCard: React.FC<MedicationCardProps> = ({
  medication,
  onMarkAsTaken,
  onCancel
}) => {
  const getStatusBadge = () => {
    if (medication.renewalDaysLeft !== undefined) {
      return (
        <View style={styles.badgeWarning}>
          <Text style={styles.badgeText}>En attente</Text>
        </View>
      );
    }
    if (medication.status === 'taken') {
      return (
        <View style={styles.badgeTaken}>
          <Text style={styles.badgeText}>Pris</Text>
        </View>
      );
    }
    return null;
  };

  const backgroundColor = medication.status === 'taken' 
    ? '#E8F5E9' 
    : medication.renewalDaysLeft 
    ? '#FFF3E0' 
    : '#FFFFFF';

  return (
    <View style={[styles.card, { backgroundColor }]}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name="medkit-outline" size={24} color="#4CAF50" />
        </View>
        <View style={styles.medicationInfo}>
          <Text style={styles.medicationName}>{medication.name}</Text>
          <Text style={styles.dosage}>{medication.dosage}</Text>
          <View style={styles.timeContainer}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.time}>{medication.timeSlots.join(', ')}</Text>
          </View>
        </View>
        {getStatusBadge()}
      </View>

      {medication.status !== 'taken' && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onMarkAsTaken(medication.id)}
        >
          <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
          <Text style={styles.actionButtonText}>Marquer comme pris</Text>
        </TouchableOpacity>
      )}

      {onCancel && medication.status === 'taken' && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => onCancel(medication.id)}
        >
          <Ionicons name="close" size={16} color="#666" />
          <Text style={styles.cancelButtonText}>Annuler</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  dosage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  badgeWarning: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFB74D',
  },
  badgeTaken: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  actionButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
    marginLeft: 4,
  },
});