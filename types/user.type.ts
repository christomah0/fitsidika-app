import { FieldValue } from "firebase/firestore";

export interface UserBase {
    id: string;
    name: string;
    email: string;
    role: 'patient' | 'doctor' | 'admin';
    hasAccess: boolean;
    createdByDoctorId?: string;
    createdAt?: FieldValue;
    updatedAt?: FieldValue;
}

export interface User extends Omit<UserBase, 'id'> { }