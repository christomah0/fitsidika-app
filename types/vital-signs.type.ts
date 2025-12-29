import { FieldValue } from "firebase/firestore";

export interface VitalSignsBase {
    id: string;

    // Tension Artérielle: Usually two separate numbers or a combined string
    systolic: number;
    diastolic: number;

    // Fréquence Cardiaque: Whole numbers only (BPM)
    heartRate: number;

    // Glycémie: Can be decimal depending on region, but usually number (mg/dL)
    bloodSugar: number;

    // Température: Floating point number (e.g., 36.6 °C)
    temperature: number;

    // SpO2: Percentage (0-100)
    oxygenSaturation: number;

    // Metadata
    createdAt?: FieldValue;
}

export interface VitalSignsCreate extends Omit<VitalSignsBase, 'id' | 'createdAt'> { }
