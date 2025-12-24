import { DoctorBase } from '@/types/doctor.type';
import { db } from './firebaseConfig';
import {
    collection,
    getDocs,
    query,
    where,
    addDoc,
    doc,
    getDoc,
    setDoc,
    serverTimestamp,
    limit
} from 'firebase/firestore';
import { Patient, PatientFormData } from '@/types/patient.type';
import { User, UserBase } from '@/types/user.type';

// Fetch all doctors from Firestore
export const getDoctors = async () => {
    try {
        const qSnapshot = await getDocs(collection(db, 'doctors'));
        return qSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as DoctorBase[];
    } catch (error) {
        console.error("Error fetching doctors: ", error);
        return []
    }
}

// Fetch a single doctor by ID from Firestore
export const getDoctorById = async (doctorId: string) => {
    try {
        const docRef = doc(db, 'doctors', doctorId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as DoctorBase;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching doctor by ID: ", error);
        return null;
    }
}

export const createPatient = async (doctorId: string, patientData: PatientFormData) => {
    try {
        const { name, email, role, hasAccess, createdByDoctorId, createdAt, updatedAt, ...rest } = patientData;

        const uData: User = {
            name, email, role,
            hasAccess,
            createdByDoctorId: doctorId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };
        const pData: Patient = { ...rest };

        // First, create the user document
        const userDoc = await addDoc(collection(db, 'users'), uData);

        const patientRef = doc(db, 'patients', userDoc.id); // Create a patient ref
        await setDoc(patientRef, pData);

        return userDoc.id;
    } catch (error) {
        console.error("Error creating patient: ", error);
        throw error;
    }
}

export const getUserByIdOrEmail = async (identifier: string) => {
    try {
        const userDocRef = doc(db, 'users', identifier);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
            return { id: userSnap.id, ...userSnap.data() } as UserBase;
        }

        const usersRef = collection(db, 'users');
        const emailQuery = query(
            usersRef,
            where('email', '==', identifier),
            limit(1)
        );

        const querySnapshot = await getDocs(emailQuery);

        if (!querySnapshot.empty) {
            const foundDoc = querySnapshot.docs[0];
            return { id: foundDoc.id, ...foundDoc.data() } as UserBase;
        }

        return null;
    } catch (error) {
        console.error("Error in getUserByIdOrEmail:", error);
        throw error;
    }
}
