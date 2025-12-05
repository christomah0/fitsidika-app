// ============================================
// TYPES ET INTERFACES
// ============================================

export interface Medication {
  id: string;
  name: string;
  dosage: string; // "500 mg", "10 mg"
  frequency: string; // "Quotidien", "2x par jour"
  timeSlots: string[]; // ["08:00", "20:00"]
  status: 'pending' | 'taken' | 'missed';
  renewalDate?: string;
  renewalDaysLeft?: number;
  notes?: string;
}

export interface DailyObservance {
  date: string;
  taken: number;
  total: number;
  percentage: number;
}

export interface WeeklyObservance {
  days: DailyObservance[];
  weekPercentage: number;
}