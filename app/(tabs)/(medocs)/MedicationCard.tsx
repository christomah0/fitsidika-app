// /app/(tabs)/(medocs)/MedicationCard.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Medication } from '../../../constants/medicationTypes';

interface MedicationCardProps {
  medication: Medication;
  onMarkAsTaken: (id: string) => void;
  onCancel?: (id: string) => void;
  isCompact?: boolean; // Ajout d'une prop pour le style de l'onglet Médocs
}

export const MedicationCard: React.FC<MedicationCardProps> = ({
  medication,
  onMarkAsTaken,
  onCancel,
  isCompact = false, // Valeur par défaut
}) => {
  const getStatusBadge = () => {
    if (medication.status === 'pending') {
      return (
        <View style={styles.badgeWarning}>
          <Text style={styles.badgeTextWarning}>En attente</Text>
        </View>
      );
    }
    if (medication.status === 'taken') {
      return (
        <View style={styles.badgeTaken}>
          <Text style={styles.badgeTextTaken}>Pris</Text>
        </View>
      );
    }
    return null;
  };

  const backgroundColor = '#FFFFFF'; // Les cartes sont blanches dans l'image.

  // On prend le premier horaire pour l'affichage compact
  const displayTime = medication.timeSlots.length > 0 ? medication.timeSlots[0] : '';
  const displayDosage = `${medication.dosage}`;


  return (
    <View style={[styles.card, { backgroundColor }]}>
      <View style={styles.cardHeader}>
        {/* Icône de pilule verte comme dans l'image */}
        <View style={styles.iconPillContainer}> 
          <Ionicons name="tablet-landscape-outline" size={20} color="#4CAF50" />
        </View>
        <View style={styles.medicationInfo}>
          <Text style={styles.medicationName}>{medication.name}</Text>
          <Text style={styles.dosage}>{displayDosage}</Text>
          {/* L'heure est affichée comme un élément séparé, pas avec une icône dans l'image */}
          <Text style={styles.time}>{displayTime}</Text>
        </View>
        {getStatusBadge()}
      </View>

      {medication.status === 'pending' && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onMarkAsTaken(medication.id)}
        >
          {/* L'icône dans l'image est un cercle avec un checkmark */}
          <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" /> 
          <Text style={styles.actionButtonText}>Marquer comme pris</Text>
        </TouchableOpacity>
      )}

      {onCancel && medication.status === 'taken' && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => onCancel(medication.id)}
        >
          {/* Le bouton d'annulation est stylisé comme dans l'image */}
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
    // Suppression des bordures pour coller à l'image
    // borderWidth: 1, 
    // borderColor: '#E0E0E0',
    // Ajout d'une ombre (optionnel, mais améliore le look)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center', // Centrer verticalement les éléments de l'en-tête
    // Suppression de marginBottom pour un look plus compact
  },
  // Nouvelle icône de pilule pour coller à l'image
  iconPillContainer: {
    width: 32, // Plus petit que l'original
    height: 32,
    // Suppression du fond vert clair pour coller à l'image
    // backgroundColor: '#E8F5E9', 
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  medicationInfo: {
    flex: 1,
    // Alignement vertical pour dosage et time
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 2, // Réduit la marge
  },
  dosage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2, // Réduit la marge
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    fontSize: 14,
    color: '#666',
    // Pas de marge à gauche dans la mise en page
  },
  // Badge 'En attente'
  badgeWarning: {
    backgroundColor: 'transparent', // Couleur de fond transparente
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF9800', // Bordure orange
  },
  badgeTextWarning: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FF9800', // Texte orange
  },
  // Badge 'Pris'
  badgeTaken: {
    backgroundColor: '#E8F5E9', // Couleur de fond vert clair
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4CAF50', // Bordure verte
  },
  badgeTextTaken: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4CAF50', // Texte vert
  },
  actionButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 12, // Ajout de marge supérieure pour séparer de l'info
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Bouton d'annulation stylisé comme dans l'image (centré, fond blanc)
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Centrer le contenu horizontalement
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF', // Fond blanc
    marginTop: 12, 
    borderWidth: 1, // Ajout d'une légère bordure
    borderColor: '#E0E0E0', 
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
    marginLeft: 4,
  },
});