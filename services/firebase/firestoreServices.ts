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
    limit,
    getCountFromServer,
    orderBy
} from 'firebase/firestore';
import { Patient, PatientBase, PatientFormData } from '@/types/patient.type';
import { User, UserBase } from '@/types/user.type';
import { VitalSignsCreate } from '@/types/vital-signs.type';
import { formatTime } from '@/utils/date-format';
import { getPatientStatus } from '@/utils/patient-status';
import { PatientOverview } from '@/types/patient-overview';

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

// Count patients associated with a specific doctor ID from Firestore
export const countPatientsByDoctorId = async (doctorId: string) => {
    try {
        const patientsRef = collection(db, 'patients');
        const q = query(patientsRef, where('createdByDoctorId', '==', doctorId));
        const snapshot = await getCountFromServer(q);
        return snapshot.data().count;
    } catch (error) {
        console.error("Error counting patients: ", error);
        return 0;
    }
}

// Fetch a single patient by ID from Firestore
export const getPatientById = async (patientId: string) => {
    try {
        const docRef = doc(db, 'patients', patientId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as PatientBase;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching patient by ID: ", error);
        return null;
    }
}

// Create a new patient and associated user in Firestore
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

// Fetch a user by ID or email from Firestore
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

// Update user's access status in Firestore
export const updateUserAccessStatus = async (userId: string, hasAccess: boolean) => {
    try {
        const userDocRef = doc(db, 'users', userId);
        await setDoc(userDocRef, { hasAccess, updatedAt: serverTimestamp() }, { merge: true });
    } catch (error) {
        console.error("Error updating user access status: ", error);
        throw error;
    }
}

export const createPatientVitalSigns = async (patientId: string, vitalsData: VitalSignsCreate) => {
    try {
        // Reference to the sub-collection: patients -> [ID] -> vitalSigns
        const vitalsSubCollectionRef = collection(db, 'patients', patientId, 'vitalSigns');

        await addDoc(vitalsSubCollectionRef, {
            ...vitalsData,
            createdAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error creating patient vital signs: ", error);
        throw error;
    }
}

export const getPatientsOverviewState = async (doctorId: string) => {
    try {
        // Get all Patient records assigned to this Doctor
        const patientsRef = collection(db, 'patients');
        const q = query(patientsRef, where('createdByDoctorId', '==', doctorId));
        const patientSnap = await getDocs(q);

        const overviewData = await Promise.all(
            patientSnap.docs.map(async (patientDoc) => {
                const patientData = patientDoc.data();
                const patientId = patientDoc.id;

                // Fetch User Profile (for Name, Avatar, etc.) from 'users' collection
                const userRef = doc(db, 'users', patientId);
                const userSnap = await getDoc(userRef);
                const userData = userSnap.exists() ? userSnap.data() : {};

                // Fetch the most recent Vital Signs from sub-collection
                const vitalsRef = collection(db, 'patients', patientId, 'vitalSigns');
                const latestVitalsQuery = query(vitalsRef, orderBy('createdAt', 'desc'), limit(1));
                const vitalsSnap = await getDocs(latestVitalsQuery);

                const latestVitals = vitalsSnap.docs.length > 0
                    ? vitalsSnap.docs[0].data()
                    : null;

                return {
                    id: patientId,
                    name: userData.name || "Unknown Patient", // From 'users'
                    age: patientData.age,                    // From 'patients'
                    status: getPatientStatus({
                        systolic: latestVitals?.bp?.systolic || 0,
                        diastolic: latestVitals?.bp?.diastolic || 0,
                        spo2: latestVitals?.spo2 || 100
                    }),
                    accessStatus: patientData.accessStatus,
                    bp: latestVitals?.bp || "N/A",
                    sugar: latestVitals?.sugar || 0,
                    heartRate: latestVitals?.heartRate || 0,
                    lastUpdate: latestVitals?.createdAt
                        ? formatTime(latestVitals.createdAt)
                        : "N/A"
                } as PatientOverview;
            })
        );

        return overviewData;
    } catch (error) {
        console.error("Error fetching overview: ", error);
        throw error;
    }
}

export const getPatientStatusCounts = async (doctorId: string) => {
    try {
        const patients = await getPatientsOverviewState(doctorId);

        const counts = patients.reduce((acc, patient) => {
            const status = patient.status;
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {
            Critique: 0,
            Attention: 0,
            Normal: 0
        });

        return counts;
    } catch (error) {
        console.error("Error counting patient statuses: ", error);
        return { Critique: 0, Attention: 0, Normal: 0 };
    }
}
