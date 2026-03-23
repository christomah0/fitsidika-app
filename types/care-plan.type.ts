import { FieldValue } from "firebase/firestore";

export type CarePlanStatus = 'active' | 'completed' | 'cancelled';

export interface CarePlan {
    id: string;
    patientId: string;
    doctorId: string;
    doctorName: string;
    title: string;
    description: string;
    status: CarePlanStatus;
    startDate: Date;
    endDate?: Date;
    createdAt?: FieldValue;
    updatedAt?: FieldValue;
}

export interface CarePlanCreate extends Omit<CarePlan, 'id' | 'createdAt' | 'updatedAt'> {}

export type GoalStatus = 'in_progress' | 'achieved' | 'abandoned';
export type GoalCategory = 'Tension' | 'Glycémie' | 'Poids' | 'Activité' | 'Autre';

export interface Goal {
    id: string;
    patientId: string;
    doctorId: string;
    doctorName: string;
    title: string;
    category: GoalCategory;
    targetValue: number;
    currentValue: number;
    unit: string;
    status: GoalStatus;
    deadline: Date;
    notes?: string;
    createdAt?: FieldValue;
    updatedAt?: FieldValue;
}

export interface GoalCreate extends Omit<Goal, 'id' | 'createdAt' | 'updatedAt'> {}
