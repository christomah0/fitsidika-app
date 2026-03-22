// /app/(tabs)/(medocs)/MedicationsScreen.tsx

import { useFocusEffect, useRouter } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { CompactObservanceCard } from '../../../components/CompactObservanceCard';
import { MedicationCard } from '../../../components/MedicationCard';
import { RenewalAlert } from '../../../components/RenewalAlert';
import { WeeklyObservanceCard } from '../../../components/WeeklyObservance';
import { useMedications } from '../../../hooks/useMedications';

export default function MedicationsScreen() {
  const router = useRouter();
  const {
    medications,
    weeklyObservance,
    loading,
    error,
    markAsTaken,
    cancelTake,
    refresh,
  } = useMedications();

  useFocusEffect(
    React.useCallback(() => {
      refresh();
      return () => {};
    }, [refresh])
  );

  const handleMarkAsTaken = async (id: string) => {
    try {
      await markAsTaken(id);
    } catch (err) {
      console.error('Erreur prise médicament:', err);
    }
  };

  const handleCancelTake = async (id: string) => {
    try {
      await cancelTake(id);
    } catch (err) {
      console.error('Erreur annulation prise:', err);
    }
  };

  const handleContactDoctor = () => {
    console.log('Action contacter médecin déclenchée');
  };

  const handleAddMedication = () => {
    router.push('./ajouter');
  };

  const renewalMedications = medications.filter(
    med =>
      med.renewalDaysLeft !== undefined &&
      med.renewalDaysLeft! <= 14 &&
      med.renewalDaysLeft! >= 0
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* 1. Cards d'observance (en haut) */}
        {weeklyObservance && (
          <CompactObservanceCard data={weeklyObservance} />
        )}

        {/* 2. Bouton "Ajouter un Médicament" */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddMedication}>
          <Text style={styles.addButtonText}>+ Ajouter un Médicament</Text>
        </TouchableOpacity>

        {/* 3. Programme d'Aujourd'hui */}
        {medications.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Programme d'Aujourd'hui</Text>
            {medications.map(medication => (
              <MedicationCard
                key={medication.id}
                medication={medication}
                onMarkAsTaken={handleMarkAsTaken}
                onCancel={handleCancelTake}
                isCompact={false}
              />
            ))}
          </>
        )}

        {/* 4. Progrès Hebdomadaire (carte avec la barre + jours) */}
        {weeklyObservance && (
          <WeeklyObservanceCard data={weeklyObservance} />
        )}

        {/* 5. Renouvellements */}
        {renewalMedications.length > 0 && (
          <>
            {renewalMedications.map(med => (
              <RenewalAlert
                key={med.id}
                medicationName={med.name}
                daysLeft={med.renewalDaysLeft!}
                onContactDoctor={handleContactDoctor}
              />
            ))}
          </>
        )}

        {/* État vide si aucun médicament */}
        {medications.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Aucun médicament enregistré
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: { marginTop: 12, fontSize: 16, color: '#666' },
  content: { flex: 1, padding: 16 },
  addButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    marginTop: 16,
  },
  addButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F44336',
  },
  errorText: { color: '#F44336', fontSize: 14 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
});
