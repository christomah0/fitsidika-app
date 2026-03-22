import { FieldValue } from "firebase/firestore";

export interface Symptom {
    id: string;
    title: string;
    date: Date;
    severity: number; // Severity on a scale from 1 to 10
    notes?: string;

    // Metadata
    createdAt?: FieldValue;
}

export interface SymptomCreate extends Omit<Symptom, 'id' | 'createdAt'> { }