import { User } from "./user.type";

export interface PatientBase {
    id: string;
    birthDate: Date;
    gender: string;
    phoneNumber: string;
    address: string;
}

export interface Patient extends Omit<PatientBase, 'id'> { }

export interface PatientFormData extends User, Patient { }
