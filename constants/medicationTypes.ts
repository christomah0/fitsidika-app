// /constants/medicationTypes.ts

export type MedicationStatus = 'pending' | 'taken';

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  timeSlots: string[]; // Ex: ["08:00", "12:00"]
  renewalDate?: string; // Date ISO string (optionnel)
  notes?: string;
  status: MedicationStatus; // Statut d'aujourd'hui
  renewalDaysLeft?: number; // Calculé par le service pour l'UI
}

export interface DailyObservance {
  date: string; // Date ISO
  taken: number; // Nombre de prises effectuées ce jour
  total: number; // Nombre total de prises possibles ce jour (basé sur le nombre de médicaments)
  percentage: number;
}

export interface WeeklyObservance {
  days: DailyObservance[];
  weekPercentage: number; // Pourcentage moyen sur la semaine
}