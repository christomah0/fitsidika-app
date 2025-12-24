export interface DoctorBase {
    id: string;
    specialty: string;
    phoneNumber: string;
    hospital: string;
}

export interface Doctor extends Omit<DoctorBase, 'id'> { }