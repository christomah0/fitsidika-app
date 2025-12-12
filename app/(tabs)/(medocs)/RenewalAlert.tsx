// /app/(tabs)/(medocs)/RenewalAlert.tsx

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
  onContactDoctor,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {/* L'icône dans l'image est plus une alerte discrète */}
        <Ionicons name="alert-triangle-outline" size={20} color="#FF9800" />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Renouvellement</Text>
        <Text style={styles.message}>
          {medicationName} - Dans {daysLeft} jours
        </Text>
      </View>
      {/* Le bouton est à droite et non centré en dessous */}
      <TouchableOpacity style={styles.button} onPress={onContactDoctor}>
        <Text style={styles.buttonText}>Contacter le médecin</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF3E0', // Fond jaune pâle
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center', // Alignement vertical au centre
    borderWidth: 1,
    borderColor: '#FFB74D',
  },
  iconContainer: {
    marginRight: 12,
    // La couleur du fond est la même que le conteneur
  },
  content: {
    flex: 1,
    marginRight: 12, // Marge entre le texte et le bouton
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9800', // Titre en orange
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#666',
    // Suppression de la marge inférieure
  },
  button: {
    backgroundColor: 'transparent', // Bouton sans fond
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1, // Bordure autour du bouton
    borderColor: '#FF9800',
  },
  buttonText: {
    color: '#FF9800',
    fontSize: 12, // Texte plus petit pour le bouton
    fontWeight: '600',
    textAlign: 'center',
  },
});