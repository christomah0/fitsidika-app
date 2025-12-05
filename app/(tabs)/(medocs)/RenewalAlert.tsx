// ============================================
// COMPOSANT ALERTE DE RENOUVELLEMENT
// ============================================

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RenewalAlertProps {
  medicationName: string;
  daysLeft: number;
  onContactDoctor: () => void;
}

export const RenewalAlert: React.FC<RenewalAlertProps> = ({
  medicationName,
  daysLeft,
  onContactDoctor
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="alert-circle-outline" size={24} color="#FF9800" />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Renouvellement</Text>
        <Text style={styles.message}>
          {medicationName} - Dans {daysLeft} jours
        </Text>
        <TouchableOpacity style={styles.button} onPress={onContactDoctor}>
          <Text style={styles.buttonText}>Contacter le médecin</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#FFB74D',
  },
  iconContainer: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  buttonText: {
    color: '#FF9800',
    fontSize: 14,
    fontWeight: '600',
  },
});