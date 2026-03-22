import { FieldValue } from "firebase/firestore";

/**
 * Represents the frequency options available in the dropdown
 */
export enum MedicationFrequency {
  ONCE_DAILY = "1 fois par jour",
  TWICE_DAILY = "2 fois par jour",
  THREE_TIMES_DAILY = "3 fois par jour",
  FOUR_TIMES_DAILY = "4 fois par jour",
  EVERY_6_HOURS = "Toutes les 6 heures",
  EVERY_8_HOURS = "Toutes les 8 heures",
  EVERY_12_HOURS = "Toutes les 12 heures",
  AS_NEEDED = "Au besoin"
}

/**
 * Represents the units for dosage (mg, ml, etc.)
 */
export type DosageUnit = 'mg' | 'mcg' | 'ml' | 'g';

/**
 * Represents the units for treatment duration
 */
export type DurationUnit = 'jours' | 'semaines' | 'mois';

export interface IMedicationForm {
  /** Nom du médicament: Text input */
  name: string;

  /** Dosage: Numeric value (e.g., 10) */
  dosageValue: number;

  /** Dosage unit: Dropdown (e.g., mg) */
  dosageUnit: DosageUnit;

  /** Fréquence: Dropdown selection */
  frequency: string;

  /** Heures de prise: Array of time strings (e.g., ["08:00 AM", "08:00 PM"]) */
  intakeTimes: string[];

  /** Rappel avant: Reminder offset in minutes (e.g., 15) */
  reminderMinutesBefore: number;

  /** Instructions: Optional text area (e.g., "À prendre avec un repas") */
  instructions?: string;

  /** Date de début: Date string in mm/dd/yyyy format or Date object */
  startDate: Date;

  /** Durée du traitement - value: Numeric input (e.g., 30) */
  durationValue: number;

  /** Durée du traitement - unit: Dropdown (e.g., "jours") */
  durationUnit: DurationUnit;
}

export interface Medication extends IMedicationForm {
  /** Unique identifier for the medication record */
  id: string;

  /** Timestamp when the medication was created */
  createdAt?: FieldValue;
}
