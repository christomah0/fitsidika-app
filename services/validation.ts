// /services/validation.ts

import { Medication } from '../constants/medicationTypes';

export class MedicationValidator {
  // Valider le nom du médicament
  static validateName(name: string): { valid: boolean; error?: string } {
    if (!name || name.trim().length === 0) {
      return { valid: false, error: 'Le nom est requis' };
    }
    if (name.length < 2) {
      return { valid: false, error: 'Le nom doit contenir au moins 2 caractères' };
    }
    if (name.length > 100) {
      return { valid: false, error: 'Le nom ne peut pas dépasser 100 caractères' };
    }
    return { valid: true };
  }

  // Valider le dosage
  static validateDosage(dosage: string): { valid: boolean; error?: string } {
    if (!dosage || dosage.trim().length === 0) {
      return { valid: false, error: 'Le dosage est requis' };
    }

    // Pattern : Numérique (avec points/virgules) suivi d'une unité
    const pattern = /^[\d.,]+\s*(mg|g|ml|μg|mcg|UI|%)\s*$/i;
    if (!pattern.test(dosage)) {
      return {
        valid: false,
        error: 'Format invalide (ex: 500 mg, 10 ml)',
      };
    }

    return { valid: true };
  }

  // Valider les horaires
  static validateTimeSlots(timeSlots: string[]): { valid: boolean; error?: string } {
    if (!timeSlots || timeSlots.length === 0) {
      return { valid: false, error: 'Au moins un horaire est requis' };
    }

    const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

    for (const time of timeSlots) {
      if (!timePattern.test(time)) {
        return {
          valid: false,
          error: `Horaire invalide: ${time} (format: HH:MM)`,
        };
      }
    }

    const uniqueTimes = new Set(timeSlots);
    if (uniqueTimes.size !== timeSlots.length) {
      return { valid: false, error: 'Horaires en double détectés' };
    }

    return { valid: true };
  }

  // Valider la date de renouvellement
  static validateRenewalDate(date?: string): { valid: boolean; error?: string } {
    if (!date) {
      return { valid: true };
    }

    const renewalDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(renewalDate.getTime())) {
      return { valid: false, error: 'Date invalide' };
    }

    if (renewalDate < today) {
      return { valid: false, error: 'La date doit être dans le futur' };
    }

    return { valid: true };
  }

  // Validation complète d'un médicament
  static validateMedication(medication: Partial<Medication>): {
    valid: boolean;
    errors: Record<string, string>;
  } {
    const errors: Record<string, string> = {};

    const nameValidation = this.validateName(medication.name || '');
    if (!nameValidation.valid && nameValidation.error) {
      errors.name = nameValidation.error;
    }

    const dosageValidation = this.validateDosage(medication.dosage || '');
    if (!dosageValidation.valid && dosageValidation.error) {
      errors.dosage = dosageValidation.error;
    }

    const timeSlotsValidation = this.validateTimeSlots(medication.timeSlots || []);
    if (!timeSlotsValidation.valid && timeSlotsValidation.error) {
      errors.timeSlots = timeSlotsValidation.error;
    }

    const renewalValidation = this.validateRenewalDate(medication.renewalDate);
    if (!renewalValidation.valid && renewalValidation.error) {
      errors.renewalDate = renewalValidation.error;
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  }
}