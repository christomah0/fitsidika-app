import { DoctorBase } from '@/types/doctor.type';
import { PatientOverview } from '@/types/patient-overview';
import { Patient, PatientBase, PatientFormData } from '@/types/patient.type';
import { Symptom, SymptomCreate } from '@/types/symptom.type';
import { User, UserBase } from '@/types/user.type';
import { VitalSignsCreate } from '@/types/vital-signs.type';
import { formatTime } from '@/utils/date-format';
import { getPatientStatus } from '@/utils/patient-status';
import {
    addDoc,
    collection,
    doc,
    getCountFromServer,
    getDoc,
    getDocs,
    increment,
    limit,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    Timestamp,
    updateDoc,
    where
} from 'firebase/firestore';
import { Conversation, ConversationCreate, Message, MessageCreate } from '@/types/message.type';
import { CarePlan, CarePlanCreate, Goal, GoalCreate } from '@/types/care-plan.type';
import { db } from './firebaseConfig';
import { Medication } from '@/types/medication.type';

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
        const usersRef = collection(db, 'users');
        const q = query(
            usersRef,
            where('createdByDoctorId', '==', doctorId),
            where('role', '==', 'patient')
        );
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

export const createPatientSymptom = async (patientId: string, symptomData: SymptomCreate) => {
    try {
        // Reference to the sub-collection: patients -> [ID] -> symptoms
        const symptomsSubCollectionRef = collection(db, 'patients', patientId, 'symptoms');

        await addDoc(symptomsSubCollectionRef, {
            ...symptomData,
            date: symptomData.date instanceof Date ? symptomData.date : new Date(symptomData.date),
            createdAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error creating patient symptom: ", error);
        throw error;
    }
}

export const getLast2Symptoms = async (patientId: string): Promise<Symptom[]> => {
    try {
        const symptomsRef = collection(db, 'patients', patientId, 'symptoms');
        const q = query(symptomsRef, orderBy('date', 'desc'), limit(2));
        const snap = await getDocs(q);

        return snap.docs.map(d => {
            const data: any = d.data();
            const rawDate = data.date;
            const date = rawDate?.toDate ? rawDate.toDate() : (rawDate instanceof Date ? rawDate : new Date(rawDate));

            return {
                id: d.id,
                ...data,
                date
            } as Symptom;
        });
    } catch (error) {
        console.error("Error fetching last symptoms: ", error);
        throw error;
    }
}

export const getLast2Medications = async (patientId: string): Promise<Medication[]> => {
    try {
        const medicationsRef = collection(db, 'patients', patientId, 'medications');
        const q = query(medicationsRef, orderBy('startDate', 'desc'), limit(2));
        const snap = await getDocs(q);

        return snap.docs.map(d => {
            const data: any = d.data();
            const rawDate = data.startDate;
            const startDate = rawDate?.toDate ? rawDate.toDate() : (rawDate instanceof Date ? rawDate : new Date(rawDate));

            return {
                id: d.id,
                ...data,
                startDate
            } as Medication;
        });
    } catch (error) {
        console.error("Error fetching last medications: ", error);
        throw error;
    }
}

export const getPatientsOverviewState = async (doctorId: string): Promise<PatientOverview[]> => {
    try {
        // Get all User records assigned to this Doctor
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('createdByDoctorId', '==', doctorId), where('role', '==', 'patient'));
        const userSnap = await getDocs(q);

        const overviewData = await Promise.all(
            userSnap.docs.map(async (userDoc) => {
                const userId = userDoc.id;
                const userData = userDoc.data();

                // Fetch Patient data from 'patients' collection
                const patientRef = doc(db, 'patients', userId);
                const patientSnap = await getDoc(patientRef);
                const patientData = patientSnap.exists() ? patientSnap.data() : {};

                // Fetch the most recent Vital Signs from sub-collection
                const vitalsRef = collection(db, 'patients', userId, 'vitalSigns');
                const latestVitalsQuery = query(vitalsRef, orderBy('createdAt', 'desc'), limit(1));
                const vitalsSnap = await getDocs(latestVitalsQuery);

                const latestVitals = vitalsSnap.docs.length > 0
                    ? vitalsSnap.docs[0].data()
                    : null;

                const bp = latestVitals?.bp
                    ? `${latestVitals.bp.systolic}/${latestVitals.bp.diastolic}`
                    : "N/A";

                const calculateAge = (birthDate: any): number => {
                    if (!birthDate) return 0;
                    const birth = birthDate instanceof Date ? birthDate : new Date(birthDate);
                    const today = new Date();
                    let age = today.getFullYear() - birth.getFullYear();
                    const monthDiff = today.getMonth() - birth.getMonth();
                    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
                        age--;
                    }
                    return age;
                };

                const validateGender = (gender: string): string => {
                    switch (gender) {
                        case 'M':
                            return 'Homme';
                        case 'F':
                            return 'Femme';
                        case 'O':
                            return 'Autre';
                        default:
                            return 'N/A';
                    }
                };

                return {
                    id: userId,
                    name: userData.name || "Unknown Patient",
                    age: calculateAge(patientData.birthDate.toDate()),
                    gender: validateGender(patientData.gender),
                    status: getPatientStatus({
                        systolic: latestVitals?.bp?.systolic || 0,
                        diastolic: latestVitals?.bp?.diastolic || 0,
                        spo2: latestVitals?.spo2 || 100
                    }),
                    accessStatus: userData.hasAccess || false,
                    bp,
                    sugar: latestVitals?.sugar || 0,
                    heartRate: latestVitals?.heartRate || 0,
                    lastUpdate: formatTime(userData.updatedAt ?? userData.createdAt)
                } as PatientOverview;
            })
        );

        return overviewData;
    } catch (error) {
        console.error("Error fetching overview: ", error);
        throw error;
    }
}

/**
 * Count patients by their status for a specific doctor
 *  */
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

// ==================== DOCTOR/PATIENT LOOKUP ====================

export const getDoctorPatientIds = async (doctorId: string): Promise<{ id: string; name: string }[]> => {
    try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('createdByDoctorId', '==', doctorId), where('role', '==', 'patient'));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, name: d.data().name || 'Patient' }));
    } catch (error) {
        console.error("Error fetching doctor patient IDs: ", error);
        return [];
    }
}

export const getDoctorForPatient = async (patientUserId: string): Promise<UserBase | null> => {
    try {
        const userDocRef = doc(db, 'users', patientUserId);
        const userSnap = await getDoc(userDocRef);
        if (!userSnap.exists()) return null;

        const userData = userSnap.data();
        const doctorId = userData.createdByDoctorId;
        if (!doctorId) return null;

        const doctorDocRef = doc(db, 'users', doctorId);
        const doctorSnap = await getDoc(doctorDocRef);
        if (!doctorSnap.exists()) return null;

        return { id: doctorSnap.id, ...doctorSnap.data() } as UserBase;
    } catch (error) {
        console.error("Error fetching doctor for patient: ", error);
        return null;
    }
}

// ==================== MESSAGING ====================

export const getOrCreateConversation = async (
    patientId: string,
    doctorId: string,
    patientName: string,
    doctorName: string
): Promise<string> => {
    try {
        const convRef = collection(db, 'conversations');
        const q = query(
            convRef,
            where('patientId', '==', patientId),
            where('doctorId', '==', doctorId),
            limit(1)
        );
        const snap = await getDocs(q);

        if (!snap.empty) {
            return snap.docs[0].id;
        }

        const newConv: ConversationCreate = {
            patientId,
            doctorId,
            patientName,
            doctorName,
            lastMessage: '',
            lastMessageAt: serverTimestamp(),
            lastMessageBy: '',
            unreadByPatient: 0,
            unreadByDoctor: 0,
        };

        const docRef = await addDoc(convRef, {
            ...newConv,
            createdAt: serverTimestamp(),
        });

        return docRef.id;
    } catch (error) {
        console.error("Error creating conversation: ", error);
        throw error;
    }
}

export const getConversationsForUser = async (userId: string, role: 'patient' | 'doctor'): Promise<Conversation[]> => {
    try {
        const convRef = collection(db, 'conversations');
        const field = role === 'patient' ? 'patientId' : 'doctorId';
        const q = query(convRef, where(field, '==', userId), orderBy('lastMessageAt', 'desc'));
        const snap = await getDocs(q);

        return snap.docs.map(d => {
            const data = d.data();
            return {
                id: d.id,
                ...data,
                lastMessageAt: data.lastMessageAt?.toDate ? data.lastMessageAt.toDate() : new Date(),
            } as Conversation;
        });
    } catch (error) {
        console.error("Error fetching conversations: ", error);
        return [];
    }
}

export const subscribeToUnreadCount = (
    userId: string,
    role: 'patient' | 'doctor',
    callback: (count: number) => void
) => {
    const convRef = collection(db, 'conversations');
    const field = role === 'patient' ? 'patientId' : 'doctorId';
    const q = query(convRef, where(field, '==', userId));
    const unreadField = role === 'patient' ? 'unreadByPatient' : 'unreadByDoctor';

    return onSnapshot(q, (snap) => {
        let total = 0;
        snap.docs.forEach(d => {
            total += d.data()[unreadField] || 0;
        });
        callback(total);
    }, (error) => {
        console.error("Error in unread count listener: ", error);
        callback(0);
    });
}

// Count new events for a PATIENT since a given date
// (care plans, goals, medications prescribed by their doctor)
export const countNewEventsForPatient = async (patientId: string, since: Date): Promise<number> => {
    try {
        const sinceTs = Timestamp.fromDate(since);
        const [plansSnap, goalsSnap, medsSnap] = await Promise.all([
            getCountFromServer(query(
                collection(db, 'patients', patientId, 'carePlans'),
                where('createdAt', '>', sinceTs)
            )),
            getCountFromServer(query(
                collection(db, 'patients', patientId, 'goals'),
                where('createdAt', '>', sinceTs)
            )),
            getCountFromServer(query(
                collection(db, 'patients', patientId, 'medications'),
                where('createdAt', '>', sinceTs)
            )),
        ]);
        return plansSnap.data().count + goalsSnap.data().count + medsSnap.data().count;
    } catch (error) {
        console.error("Error counting patient events: ", error);
        return 0;
    }
}

// Count new events for a DOCTOR since a given date
// (vitals, symptoms from all their patients)
export const countNewEventsForDoctor = async (patientIds: string[], since: Date): Promise<number> => {
    if (patientIds.length === 0) return 0;
    try {
        const sinceTs = Timestamp.fromDate(since);
        let total = 0;

        const promises = patientIds.map(async (pid) => {
            const [vitalsSnap, symptomsSnap] = await Promise.all([
                getCountFromServer(query(
                    collection(db, 'patients', pid, 'vitalSigns'),
                    where('createdAt', '>', sinceTs)
                )),
                getCountFromServer(query(
                    collection(db, 'patients', pid, 'symptoms'),
                    where('date', '>', sinceTs)
                )),
            ]);
            return vitalsSnap.data().count + symptomsSnap.data().count;
        });

        const counts = await Promise.all(promises);
        total = counts.reduce((sum, c) => sum + c, 0);
        return total;
    } catch (error) {
        console.error("Error counting doctor events: ", error);
        return 0;
    }
}

export const sendMessage = async (
    conversationId: string,
    senderId: string,
    senderRole: 'patient' | 'doctor',
    text: string
): Promise<void> => {
    try {
        const messagesRef = collection(db, 'conversations', conversationId, 'messages');
        await addDoc(messagesRef, {
            conversationId,
            senderId,
            senderRole,
            text,
            createdAt: serverTimestamp(),
        });

        const unreadField = senderRole === 'patient' ? 'unreadByDoctor' : 'unreadByPatient';
        const convRef = doc(db, 'conversations', conversationId);
        await updateDoc(convRef, {
            lastMessage: text,
            lastMessageAt: serverTimestamp(),
            lastMessageBy: senderId,
            [unreadField]: increment(1),
        });
    } catch (error) {
        console.error("Error sending message: ", error);
        throw error;
    }
}

export const markConversationAsRead = async (conversationId: string, role: 'patient' | 'doctor'): Promise<void> => {
    try {
        const field = role === 'patient' ? 'unreadByPatient' : 'unreadByDoctor';
        const convRef = doc(db, 'conversations', conversationId);
        await updateDoc(convRef, { [field]: 0 });
    } catch (error) {
        console.error("Error marking as read: ", error);
    }
}

export const subscribeToMessages = (
    conversationId: string,
    callback: (messages: Message[]) => void
) => {
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    return onSnapshot(q, (snap) => {
        const messages = snap.docs.map(d => {
            const data = d.data();
            return {
                id: d.id,
                ...data,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
            } as Message;
        });
        callback(messages);
    });
}

// ==================== CARE PLANS ====================

export const createCarePlan = async (carePlan: CarePlanCreate): Promise<string> => {
    try {
        const ref = collection(db, 'patients', carePlan.patientId, 'carePlans');
        const docRef = await addDoc(ref, {
            ...carePlan,
            startDate: carePlan.startDate instanceof Date ? carePlan.startDate : new Date(carePlan.startDate),
            endDate: carePlan.endDate instanceof Date ? carePlan.endDate : carePlan.endDate ? new Date(carePlan.endDate) : null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (error) {
        console.error("Error creating care plan: ", error);
        throw error;
    }
}

export const getCarePlans = async (patientId: string): Promise<CarePlan[]> => {
    try {
        const ref = collection(db, 'patients', patientId, 'carePlans');
        const q = query(ref, orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);

        return snap.docs.map(d => {
            const data: any = d.data();
            return {
                id: d.id,
                ...data,
                startDate: data.startDate?.toDate ? data.startDate.toDate() : new Date(data.startDate),
                endDate: data.endDate?.toDate ? data.endDate.toDate() : data.endDate ? new Date(data.endDate) : undefined,
            } as CarePlan;
        });
    } catch (error) {
        console.error("Error fetching care plans: ", error);
        return [];
    }
}

export const updateCarePlanStatus = async (patientId: string, carePlanId: string, status: string): Promise<void> => {
    try {
        const ref = doc(db, 'patients', patientId, 'carePlans', carePlanId);
        await updateDoc(ref, { status, updatedAt: serverTimestamp() });
    } catch (error) {
        console.error("Error updating care plan: ", error);
        throw error;
    }
}

// ==================== GOALS ====================

export const createGoal = async (goal: GoalCreate): Promise<string> => {
    try {
        const ref = collection(db, 'patients', goal.patientId, 'goals');
        const docRef = await addDoc(ref, {
            ...goal,
            deadline: goal.deadline instanceof Date ? goal.deadline : new Date(goal.deadline),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (error) {
        console.error("Error creating goal: ", error);
        throw error;
    }
}

export const getGoals = async (patientId: string): Promise<Goal[]> => {
    try {
        const ref = collection(db, 'patients', patientId, 'goals');
        const q = query(ref, orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);

        return snap.docs.map(d => {
            const data: any = d.data();
            return {
                id: d.id,
                ...data,
                deadline: data.deadline?.toDate ? data.deadline.toDate() : new Date(data.deadline),
            } as Goal;
        });
    } catch (error) {
        console.error("Error fetching goals: ", error);
        return [];
    }
}

export const updateGoalProgress = async (patientId: string, goalId: string, currentValue: number): Promise<void> => {
    try {
        const ref = doc(db, 'patients', patientId, 'goals', goalId);
        await updateDoc(ref, { currentValue, updatedAt: serverTimestamp() });
    } catch (error) {
        console.error("Error updating goal: ", error);
        throw error;
    }
}

export const updateGoalStatus = async (patientId: string, goalId: string, status: string): Promise<void> => {
    try {
        const ref = doc(db, 'patients', patientId, 'goals', goalId);
        await updateDoc(ref, { status, updatedAt: serverTimestamp() });
    } catch (error) {
        console.error("Error updating goal status: ", error);
        throw error;
    }
}

// ==================== MEDICATIONS (Firestore) ====================

export const createPatientMedication = async (patientId: string, medication: Omit<Medication, 'id' | 'createdAt'>): Promise<string> => {
    try {
        const ref = collection(db, 'patients', patientId, 'medications');
        const docRef = await addDoc(ref, {
            ...medication,
            startDate: medication.startDate instanceof Date ? medication.startDate : new Date(medication.startDate),
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (error) {
        console.error("Error creating medication: ", error);
        throw error;
    }
}

export const getPatientMedications = async (patientId: string): Promise<Medication[]> => {
    try {
        const ref = collection(db, 'patients', patientId, 'medications');
        const q = query(ref, orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);

        return snap.docs.map(d => {
            const data: any = d.data();
            return {
                id: d.id,
                ...data,
                startDate: data.startDate?.toDate ? data.startDate.toDate() : new Date(data.startDate),
            } as Medication;
        });
    } catch (error) {
        console.error("Error fetching medications: ", error);
        return [];
    }
}

// ==================== VITAL SIGNS (fetch) ====================

export const getPatientVitalSigns = async (patientId: string, limitCount: number = 20) => {
    try {
        const ref = collection(db, 'patients', patientId, 'vitalSigns');
        const q = query(ref, orderBy('createdAt', 'desc'), limit(limitCount));
        const snap = await getDocs(q);

        return snap.docs.map(d => {
            const data: any = d.data();
            return {
                id: d.id,
                ...data,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
            };
        });
    } catch (error) {
        console.error("Error fetching vital signs: ", error);
        return [];
    }
}

export const getPatientSymptoms = async (patientId: string, limitCount: number = 20) => {
    try {
        const ref = collection(db, 'patients', patientId, 'symptoms');
        const q = query(ref, orderBy('date', 'desc'), limit(limitCount));
        const snap = await getDocs(q);

        return snap.docs.map(d => {
            const data: any = d.data();
            return {
                id: d.id,
                ...data,
                date: data.date?.toDate ? data.date.toDate() : new Date(data.date),
            } as Symptom;
        });
    } catch (error) {
        console.error("Error fetching symptoms: ", error);
        return [];
    }
}
