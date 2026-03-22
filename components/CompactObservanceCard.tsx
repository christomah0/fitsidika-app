import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WeeklyObservance } from '../../constants/medicationTypes';

interface CompactObservanceCardProps {
  data: WeeklyObservance;
}

export const CompactObservanceCard: React.FC<CompactObservanceCardProps> = ({ data }) => {
  // Calcul du score total de la semaine
  const totalTaken = data.days.reduce((sum, day) => sum + day.taken, 0);
  const totalPossible = data.days.reduce((sum, day) => sum + day.total, 0);
  
  const scoreText = `${totalTaken}/${totalPossible}`;

  return (
    <View style={styles.container}>
      {/* Tuile 1 : Observance (Vert) */}
      <View style={[styles.card, styles.observanceCard]}>
        <Ionicons name="checkmark-circle-outline" size={30} color="#FFF" style={styles.icon} />
        <Text style={styles.percentageText}>{data.weekPercentage}%</Text>
        <Text style={styles.labelText}>Observance</Text>
      </View>

      {/* Tuile 2 : Score de la semaine (Violet) */}
      <View style={[styles.card, styles.scoreCard]}>
        <Ionicons name="time-outline" size={30} color="#FFF" style={styles.icon} />
        <Text style={styles.scoreText}>{scoreText}</Text>
        <Text style={styles.labelText}>Cette semaine</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24, // Marge sous les tuiles pour les séparer du reste
    marginTop: 8, // Marge optionnelle en haut
  },
  card: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    height: 120, // Hauteur fixe comme dans l'image
    justifyContent: 'center',
    alignItems: 'flex-start', // Tout aligné à gauche
    marginHorizontal: 4, // Petite marge entre les cartes
  },
  observanceCard: {
    backgroundColor: '#4CAF50', // Vert (couleur de l'image)
  },
  scoreCard: {
    backgroundColor: '#9C27B0', // Violet (couleur de l'image)
  },
  icon: {
    // L'icône est en haut à droite dans l'image, nous allons la placer en haut à gauche pour simplifier la structure de ce composant, mais je peux la mettre à droite si vous le souhaitez.
    position: 'absolute',
    top: 16,
    right: 16,
  },
  percentageText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
    // Pour compenser l'icône, on peut ajouter une petite marge
    marginTop: 20, 
  },
  scoreText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
    // Pour compenser l'icône, on peut ajouter une petite marge
    marginTop: 20,
  },
  labelText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '500',
  },
});