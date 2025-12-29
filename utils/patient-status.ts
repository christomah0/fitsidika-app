export type HealthStatus = 'Normal' | 'Attention' | 'Critique';

interface Vitals {
  systolic: number;
  diastolic: number;
  spo2: number;
}

export function getPatientStatus(vitals: Vitals): HealthStatus {
  const { systolic, diastolic, spo2 } = vitals;

  // Check for Critical conditions first
  if (systolic >= 180 || diastolic >= 120 || spo2 <= 90) {
    return 'Critique';
  }

  // Check for Attention / Warning signs
  if ((systolic >= 130 && systolic < 180) || (spo2 > 90 && spo2 < 95)) {
    return 'Attention';
  }

  // Otherwise, it's Normal
  return 'Normal';
}
