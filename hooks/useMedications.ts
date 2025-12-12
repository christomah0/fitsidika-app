import { useState, useEffect, useCallback } from 'react';
import { Medication, WeeklyObservance } from '../constants/medicationTypes';
import { MedicationService } from '../services/medicationService';
import { NotificationService } from '../services/notificationService';

export const useMedications = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [weeklyObservance, setWeeklyObservance] = useState<WeeklyObservance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---- Functions stabilisées ----

  const loadMedications = useCallback(async () => {
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
  }, []);

  const loadWeeklyObservance = useCallback(async () => {
    try {
      const data = await MedicationService.getWeeklyObservance();
      setWeeklyObservance(data);
    } catch (err) {
      console.error('Erreur chargement observance:', err);
    }
  }, []);

  const refresh = useCallback(async () => {
    await loadMedications();
    await loadWeeklyObservance();
  }, [loadMedications, loadWeeklyObservance]);

  // ---- Actions ----

  const addMedication = async (medication: Omit<Medication, 'id' | 'status' | 'renewalDaysLeft'>) => {
    try {
      await MedicationService.addMedication(medication);
      await refresh();
    } catch (err) {
      setError("Erreur lors de l'ajout du médicament");
      throw err;
    }
  };

  const markAsTaken = async (id: string) => {
    try {
      await MedicationService.markAsTaken(id);
      await refresh();
    } catch (err) {
      setError('Erreur lors du marquage');
      throw err;
    }
  };

  const cancelTake = async (id: string) => {
    try {
      await MedicationService.recordObservance(id, new Date(), false);
      await refresh();
    } catch (err) {
      setError("Erreur lors de l'annulation");
      throw err;
    }
  };

  const deleteMedication = async (id: string) => {
    try {
      await MedicationService.deleteMedication(id);
      await refresh();
    } catch (err) {
      setError('Erreur lors de la suppression');
      throw err;
    }
  };

  // ---- Init ----

  useEffect(() => {
    (async () => {
      await NotificationService.requestPermissions();
      await refresh();
    })();
  }, [refresh]);

  return {
    medications,
    weeklyObservance,
    loading,
    error,
    addMedication,
    markAsTaken,
    cancelTake,
    deleteMedication,
    refresh,
  };
};
