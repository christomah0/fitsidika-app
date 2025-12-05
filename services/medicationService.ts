// ============================================
// SERVICE DE DONNÉES MÉDICAMENTS
// ============================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Medication, DailyObservance, WeeklyObservance } from '../constants/medicationTypes';
import { NotificationService } from './notificationService';

const MEDICATIONS_KEY = '@medications';
const OBSERVANCE_KEY = '@observance';

export class MedicationService {
  // Récupérer tous les médicaments
  static async getAllMedications(): Promise<Medication[]> {
    try {
      const data = await AsyncStorage.getItem(MEDICATIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erreur récupération médicaments:', error);
      return [];
    }
  }

  // Ajouter un médicament
  static async addMedication(medication: Omit<Medication, 'id'>): Promise<Medication> {
    try {
      const medications = await this.getAllMedications();
      const newMedication: Medication = {
        ...medication,
        id: Date.now().toString(),
        status: 'pending',
      };
      
      medications.push(newMedication);
      await AsyncStorage.setItem(MEDICATIONS_KEY, JSON.stringify(medications));
      
      // Planifier les notifications
      for (const time of newMedication.timeSlots) {
        await NotificationService.scheduleMedicationReminder({
          id: newMedication.id,
          name: newMedication.name,
          dosage: newMedication.dosage,
          time,
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

      medications[index] = { ...medications[index], ...updates };
      await AsyncStorage.setItem(MEDICATIONS_KEY, JSON.stringify(medications));

      // Mettre à jour les notifications si les horaires ont changé
      if (updates.timeSlots) {
        await NotificationService.cancelMedicationReminder(id);
        for (const time of updates.timeSlots) {
          await NotificationService.scheduleMedicationReminder({
            id,
            name: medications[index].name,
            dosage: medications[index].dosage,
            time,
          });
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
      await AsyncStorage.setItem(MEDICATIONS_KEY, JSON.stringify(filtered));
      
      // Annuler les notifications
      await NotificationService.cancelMedicationReminder(id);
    } catch (error) {
      console.error('Erreur suppression médicament:', error);
      throw error;
    }
  }

  // Marquer comme pris
  static async markAsTaken(id: string, date: Date = new Date()): Promise<void> {
    try {
      await this.updateMedication(id, { status: 'taken' });
      await this.recordObservance(id, date, true);
    } catch (error) {
      console.error('Erreur marquage pris:', error);
      throw error;
    }
  }

  // Enregistrer l'observance
  static async recordObservance(medicationId: string, date: Date, taken: boolean): Promise<void> {
    try {
      const key = this.getObservanceKey(date);
      const data = await AsyncStorage.getItem(key);
      const observance = data ? JSON.parse(data) : {};
      
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
      const today = new Date();
      const days: DailyObservance[] = [];

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        const key = this.getObservanceKey(date);
        const data = await AsyncStorage.getItem(key);
        const observance = data ? JSON.parse(data) : {};
        
        const total = medications.length;
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
      const weekPercentage = totalPossible > 0 
        ? Math.round((totalTaken / totalPossible) * 100) 
        : 0;

      return { days, weekPercentage };
    } catch (error) {
      console.error('Erreur récupération observance:', error);
      return { days: [], weekPercentage: 0 };
    }
  }

  // Calculer les jours restants avant renouvellement
  static calculateRenewalDaysLeft(renewalDate: string): number {
    const renewal = new Date(renewalDate);
    const today = new Date();
    const diff = renewal.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  // Obtenir les médicaments nécessitant un renouvellement
  static async getMedicationsNeedingRenewal(): Promise<Medication[]> {
    const medications = await this.getAllMedications();
    return medications.filter(med => {
      if (!med.renewalDate) return false;
      const daysLeft = this.calculateRenewalDaysLeft(med.renewalDate);
      return daysLeft <= 14 && daysLeft >= 0;
    });
  }

  private static getObservanceKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${OBSERVANCE_KEY}_${year}${month}${day}`;
  }
}