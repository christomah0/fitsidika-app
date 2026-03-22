import { HealthStatus } from "@/utils/patient-status";

export interface PatientOverview {
  id: string;
  name: string;
  age: number;
  gender: string;
  status: HealthStatus;

  /** Blood Pressure is represented as a string (e.g., "142/95"). */
  bp: string; 
  
  /** Blood sugar level in mg/dL */
  sugar: number;
  
  /** Heart rate in beats per minute (bpm) */
  heartRate: number;
  
  /** Whether the user/provider has current access to this record */
  accessStatus: boolean;
  
  /** Relative time string (e.g., "15 min") */
  lastUpdate: string;
}
