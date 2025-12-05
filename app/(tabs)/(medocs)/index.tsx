// ============================================
// ÉCRAN PRINCIPAL MÉDICAMENTS
// ============================================

import React from 'react';
import { 
  View, 
  ScrollView, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMedications } from '../../../hooks/useMedications';
import { MedicationCard } from '../../(tabs)/(medocs)/MedicationCard';
import { WeeklyObservanceCard } from '../../(tabs)/(medocs)/WeeklyObservance';
import { RenewalAlert } from '../../(tabs)/(medocs)/RenewalAlert';

export default function MedicationsScreen() {
  const router = useRouter();
  const {
    medications,
    weeklyObservance,
    loading,
    error,
    markAsTaken,
    refresh,
  } = useMedications();

  const handleMarkAsTaken = async (id: string) => {
    try {
      await markAsTaken(id);
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  const handleContactDoctor = () => {
    // Navigation vers écran de contact ou ouverture du téléphone
    console.log('Contacter le médecin');
  };

  const handleAddMedication = () => {
    router.push('./ajouter');
  };

  const renewalMedications = medications.filter(
    med => med.renewalDaysLeft !== undefined && med.renewalDaysLeft <= 14
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="menu" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Ionicons name="heart" size={20} color="#FFFFFF" />
          <Text style={styles.headerTitle}>HealthTracker</Text>
        </View>
        <TouchableOpacity>
          <View style={styles.notificationBadge}>
            <Ionicons name="notifications" size={24} color="#FFFFFF" />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* User Greeting */}
        <View style={styles.greetingContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>MD</Text>
          </View>
          <View>
            <Text style={styles.greeting}>Bonjour,</Text>
            <Text style={styles.userName}>Marie Dubois</Text>
          </View>
        </View>

        {/* Add Medication Button */}
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddMedication}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Ajouter un Médicament</Text>
        </TouchableOpacity>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color="#F44336" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Today's Program */}
        <Text style={styles.sectionTitle}>Programme d'Aujourd'hui</Text>

        {medications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="medkit-outline" size={64} color="#E0E0E0" />
            <Text style={styles.emptyStateText}>
              Aucun médicament enregistré
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Appuyez sur "Ajouter un Médicament" pour commencer
            </Text>
          </View>
        ) : (
          medications.map(medication => (
            <MedicationCard
              key={medication.id}
              medication={medication}
              onMarkAsTaken={handleMarkAsTaken}
            />
          ))
        )}

        {/* Weekly Observance */}
        {weeklyObservance && medications.length > 0 && (
          <WeeklyObservanceCard data={weeklyObservance} />
        )}

        {/* Renewal Alerts */}
        {renewalMedications.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Renouvellements</Text>
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  notificationBadge: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#F44336',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  greetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  greeting: {
    fontSize: 14,
    color: '#666',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F44336',
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});