// ============================================
// HOOK PERSONNALISÉ
// ============================================

import { useState, useEffect } from 'react';
import { Medication, WeeklyObservance } from '../constants/medicationTypes';
import { MedicationService } from '../services/medicationService'
import { NotificationService } from '../services/notificationService';

export const useMedications = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [weeklyObservance, setWeeklyObservance] = useState<WeeklyObservance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les médicaments
  const loadMedications = async () => {
    try {
      setLoading(true);
      const data = await MedicationService.getAllMedications();
      setMedications(data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des médicaments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Charger l'observance hebdomadaire
  const loadWeeklyObservance = async () => {
    try {
      const data = await MedicationService.getWeeklyObservance();
      setWeeklyObservance(data);
    } catch (err) {
      console.error('Erreur chargement observance:', err);
    }
  };

  // Ajouter un médicament
  const addMedication = async (medication: Omit<Medication, 'id'>) => {
    try {
      await MedicationService.addMedication(medication);
      await loadMedications();
    } catch (err) {
      setError('Erreur lors de l\'ajout du médicament');
      throw err;
    }
  };

  // Marquer comme pris
  const markAsTaken = async (id: string) => {
    try {
      await MedicationService.markAsTaken(id);
      await loadMedications();
      await loadWeeklyObservance();
    } catch (err) {
      setError('Erreur lors du marquage');
      throw err;
    }
  };

  // Supprimer un médicament
  const deleteMedication = async (id: string) => {
    try {
      await MedicationService.deleteMedication(id);
      await loadMedications();
    } catch (err) {
      setError('Erreur lors de la suppression');
      throw err;
    }
  };

  // Initialiser les permissions de notification
  const initializeNotifications = async () => {
    try {
      await NotificationService.requestPermissions();
    } catch (err) {
      console.error('Permissions notification refusées:', err);
    }
  };

  useEffect(() => {
    initializeNotifications();
    loadMedications();
    loadWeeklyObservance();
  }, []);

  return {
    medications,
    weeklyObservance,
    loading,
    error,
    addMedication,
    markAsTaken,
    deleteMedication,
    refresh: () => {
      loadMedications();
      loadWeeklyObservance();
    },
  };
};