// /services/medicationService.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Medication, DailyObservance, WeeklyObservance } from '../constants/medicationTypes';
import { NotificationService } from './notificationService';

const MEDICATIONS_KEY = '@medications';
const OBSERVANCE_KEY = '@observance';

export class MedicationService {
  // Récupérer tous les médicaments (avec statut quotidien et jours de renouvellement calculés)
  static async getAllMedications(): Promise<Medication[]> {
    try {
      const data = await AsyncStorage.getItem(MEDICATIONS_KEY);
      const medications: Medication[] = data ? (JSON.parse(data) as Medication[]) : [];
      
      const todayKey = this.getObservanceKey(new Date());
      const observanceData = await AsyncStorage.getItem(todayKey);
      const todayObservance: Record<string, boolean> = observanceData ? JSON.parse(observanceData) : {};
      
      // Calculer le statut quotidien et les jours restants pour le renouvellement
      return medications.map(med => {
          let currentStatus = 'pending';
          if (todayObservance[med.id] === true) {
              currentStatus = 'taken';
          }
          
          let renewalDaysLeft: number | undefined = undefined;
          if (med.renewalDate) {
              renewalDaysLeft = this.calculateRenewalDaysLeft(med.renewalDate);
          }
          
          return {
              ...med,
              status: currentStatus,
              renewalDaysLeft: renewalDaysLeft, 
          } as Medication;
      });

    } catch (error) {
      console.error('Erreur récupération médicaments:', error);
      return [];
    }
  }

  // Ajouter un médicament
  static async addMedication(medication: Omit<Medication, 'id' | 'status' | 'renewalDaysLeft'>): Promise<Medication> {
    try {
      const medications = await this.getAllMedications();
      const newMedication: Medication = {
        ...medication,
        id: Date.now().toString(),
        status: 'pending',
      };

      medications.push(newMedication);
      // Stocker la liste brute (sans les champs calculés comme status et renewalDaysLeft)
      const rawMedications = medications.map(({ status, renewalDaysLeft, ...rest }) => rest);
      await AsyncStorage.setItem(MEDICATIONS_KEY, JSON.stringify(rawMedications));

      // Planifier les notifications de prise
      for (const time of newMedication.timeSlots) {
        await NotificationService.scheduleMedicationReminder({
          id: newMedication.id,
          name: newMedication.name,
          dosage: newMedication.dosage,
          time,
        });
      }

      // Planifier éventuellement un rappel de renouvellement
      if (newMedication.renewalDate) {
        await NotificationService.scheduleRenewalReminder({
          id: newMedication.id,
          name: newMedication.name,
          renewalDate: new Date(newMedication.renewalDate),
        });
      }

      return newMedication;
    } catch (error) {
      console.error('Erreur ajout médicament:', error);
      throw error;
    }
  }

  // Mettre à jour un médicament
  static async updateMedication(id: string, updates: Partial<Medication>): Promise<void> {
    try {
      const medications = await this.getAllMedications();
      const index = medications.findIndex(m => m.id === id);

      if (index === -1) {
        throw new Error('Médicament non trouvé');
      }

      const updatedMedication: Medication = {
        ...medications[index],
        ...updates,
      };

      medications[index] = updatedMedication;
      
      // Mettre à jour la liste brute (sans les champs calculés)
      const rawMedications = medications.map(({ status, renewalDaysLeft, ...rest }) => rest);
      await AsyncStorage.setItem(MEDICATIONS_KEY, JSON.stringify(rawMedications));

      // Mettre à jour les notifications de prise si les horaires ont changé
      if (updates.timeSlots) {
        await NotificationService.updateMedicationReminders({
            id,
            name: updatedMedication.name,
            dosage: updatedMedication.dosage,
            timeSlots: updates.timeSlots,
        });
      }

      // Mettre à jour le rappel de renouvellement
      if (updates.renewalDate !== undefined) {
        if (updates.renewalDate) {
            await NotificationService.scheduleRenewalReminder({
                id,
                name: updatedMedication.name,
                renewalDate: new Date(updates.renewalDate),
            });
        } else {
            // Si la date est supprimée
            await NotificationService.cancelRenewalReminder(id);
        }
      }
    } catch (error) {
      console.error('Erreur mise à jour médicament:', error);
      throw error;
    }
  }

  // Supprimer un médicament
  static async deleteMedication(id: string): Promise<void> {
    try {
      const medications = await this.getAllMedications();
      const filtered = medications.filter(m => m.id !== id);
      
      // Supprimer les champs calculés avant sauvegarde
      const rawMedications = filtered.map(({ status, renewalDaysLeft, ...rest }) => rest);
      await AsyncStorage.setItem(MEDICATIONS_KEY, JSON.stringify(rawMedications));

      // Annuler les notifications de prise et de renouvellement
      await NotificationService.cancelMedicationReminder(id);
      await NotificationService.cancelRenewalReminder(id);
    } catch (error) {
      console.error('Erreur suppression médicament:', error);
      throw error;
    }
  }

  // Marquer comme pris
  static async markAsTaken(id: string, date: Date = new Date()): Promise<void> {
    try {
      await this.recordObservance(id, date, true);
    } catch (error) {
      console.error('Erreur marquage pris:', error);
      throw error;
    }
  }
  
  // Enregistrer ou annuler l'observance pour le jour
  static async recordObservance(medicationId: string, date: Date, taken: boolean): Promise<void> {
    try {
      const key = this.getObservanceKey(date);
      const data = await AsyncStorage.getItem(key);
      const observance: Record<string, boolean> = data ? JSON.parse(data) : {};

      observance[medicationId] = taken;
      await AsyncStorage.setItem(key, JSON.stringify(observance));
    } catch (error) {
      console.error('Erreur enregistrement observance:', error);
      throw error;
    }
  }

  // Obtenir l'observance hebdomadaire
  static async getWeeklyObservance(): Promise<WeeklyObservance> {
    try {
      const medications = await this.getAllMedications();
      const rawMedicationsCount = medications.length;
      const today = new Date();
      const days: DailyObservance[] = [];

      // Parcourir les 7 derniers jours
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        const key = this.getObservanceKey(date);
        const data = await AsyncStorage.getItem(key);
        const observance: Record<string, boolean> = data ? JSON.parse(data) : {};

        // Utiliser le nombre total de médicaments enregistrés
        const total = rawMedicationsCount;
        const taken = Object.values(observance).filter(v => v === true).length;
        const percentage = total > 0 ? Math.round((taken / total) * 100) : 0;

        days.push({
          date: date.toISOString(),
          taken,
          total,
          percentage,
        });
      }

      const totalTaken = days.reduce((sum, day) => sum + day.taken, 0);
      const totalPossible = days.reduce((sum, day) => sum + day.total, 0);
      const weekPercentage =
        totalPossible > 0 ? Math.round((totalTaken / totalPossible) * 100) : 0;

      return { days, weekPercentage };
    } catch (error) {
      console.error('Erreur récupération observance:', error);
      return { days: [], weekPercentage: 0 };
    }
  }

  // Calculer les jours restants avant renouvellement
  static calculateRenewalDaysLeft(renewalDate: string): number {
    const renewal = new Date(renewalDate);
    renewal.setHours(0, 0, 0, 0); // Important pour ne pas fausser le calcul par l'heure
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diff = renewal.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  private static getObservanceKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${OBSERVANCE_KEY}_${year}${month}${day}`;
  }
}