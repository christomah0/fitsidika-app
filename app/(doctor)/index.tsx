import React, { useState, useMemo, useEffect } from 'react';

import AddPatientModal from '@/components/add-patient-modal';
import { AlertItem, AlertsBox } from '@/components/alerts-box';
import DoctorSummaryCard from '@/components/doctor-summary-card';
import PatientCard from '@/components/patient-card';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { countPatientsByDoctorId, createPatient, getDoctorById, getPatientsOverviewState, getPatientStatusCounts, updateUserAccessStatus } from '@/services/firebase/firestoreServices';
import { PatientFormData } from '@/types/patient.type';
import { useRouter } from 'expo-router';
import { FlatList } from 'react-native';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useAuth } from '@/hooks/use-auth';
import { DoctorBase } from '@/types/doctor.type';
import { PatientOverview } from '@/types/patient-overview';

export default function HomeScreen() {
    const [modalVisible, setModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user } = useAuth();
    const [doctor, setDoctor] = useState<DoctorBase | null>(null);
    const [patientCount, setPatientCount] = useState<number>(0);
    const [patients, setPatients] = useState<PatientOverview[]>([]);
    const [stats, setStats] = useState({ Critique: 0, Attention: 0, Normal: 0 });

    // Filter patients based on search query
    const filteredPatients = useMemo(() => {
        return patients.filter((p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, patients]);

    const activeAlerts: AlertItem[] = useMemo(() => {
        const alerts: AlertItem[] = [];

        if (stats.Critique > 0) {
            alerts.push({
                id: 'crit-count',
                count: stats.Critique,
                label: stats.Critique > 1 ? 'Patients avec vitaux critiques' : 'Patient avec vitaux critiques',
                type: 'critical',
            });
        }

        if (stats.Attention > 0) {
            alerts.push({
                id: 'warn-count',
                count: stats.Attention,
                label: stats.Attention > 1 ? 'Patients à surveiller' : 'Patient à surveiller',
                type: 'warning',
            });
        }

        return alerts;
    }, [stats]);

    // Header component for the patient list
    const ListHeader = () => (
        <>
            {activeAlerts.length > 0 && <AlertsBox alerts={activeAlerts} />}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Mes Patients</Text>
            </View>
        </>
    );

    // Render function for each patient item
    const renderItem = ({ item }: { item: PatientOverview }) => (
        <PatientCard
            {...item}
            onAccessChange={(newValue) => toggleAccess(item.id, newValue)}
            onDetailsPress={() => router.push(`/patients/details/${item.id}`)}
        />
    );

    // Handle adding a new patient
    async function handleAddPatient(formData: PatientFormData) {
        setIsSubmitting(true);
        try {
            if (!user?.id) {
                Toast.show({
                    type: 'error',
                    text1: 'Erreur',
                    text2: 'Utilisateur non authentifié.',
                    position: 'bottom'
                });
                return;
            }

            await createPatient(user.id, formData);

            Toast.show({
                type: 'success',
                text1: 'Succès',
                text2: 'Patient ajouté avec succès !',
                position: 'bottom'
            });

            setModalVisible(false);
        } catch (err) {
            Toast.show({
                type: 'error',
                text1: 'Erreur',
                text2: 'Échec de la création du patient.',
                position: 'bottom'
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    // Handle the switch toggle
    const toggleAccess = async (id: string, newValue: boolean) => {
        setPatients(prevPatients =>
            prevPatients.map(p =>
                p.id === id ? { ...p, accessStatus: newValue } : p
            )
        );

        await updateUserAccessStatus(id, newValue); // Update in Firestore
        console.log(`Patient ${id} access updated to: ${newValue}`);
    };

    useEffect(() => {
        const load = async () => {
            try {
                const doctor = user;
                if (doctor) {
                    const d = await getDoctorById(doctor.id);
                    setDoctor(d);

                    // Counts patients
                    const patientCount = await countPatientsByDoctorId(doctor.id);
                    setPatientCount(patientCount);

                    const patientsData = await getPatientsOverviewState(doctor.id);
                    setPatients(patientsData);
                }
            } catch (error: any) {
                console.error("Error loading doctor data: ", error);
                Toast.show({
                    type: 'error',
                    text1: 'Erreur',
                    text2: 'Échec du chargement des données du médecin.',
                    position: 'bottom'
                });
            }
        }

        load();
    }, [user]);

    useEffect(() => {
        if (user?.id) {
            getPatientStatusCounts(user.id).then(setStats);
        }
    }, [user?.id]);

    return (
        <ThemedView style={styles.container}>
            <DoctorSummaryCard
                name={user?.name || 'Nom du médecin'}
                specialty={doctor?.specialty || 'Spécialité'}
                patientCount={doctor ? patientCount : 0}
            />

            <View style={styles.searchBar}>
                <IconSymbol name="magnifyingglass" size={20} color="#6B7280" />
                <TextInput
                    placeholder="Rechercher un patient..."
                    placeholderTextColor="#9CA3AF"
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <FlatList
                data={filteredPatients}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                ListHeaderComponent={ListHeader}
                ListEmptyComponent={<Text style={styles.emptyState}>Aucun patient trouvé</Text>}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                removeClippedSubviews={true}
            />

            <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
                <IconSymbol name="plus" size={28} color="white" />
            </TouchableOpacity>

            <AddPatientModal
                visible={modalVisible}
                loading={isSubmitting}
                onClose={() => setModalVisible(false)}
                onSubmit={handleAddPatient}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        paddingTop: 10,
        paddingHorizontal: 20,
    },
    scrollContent: {
        paddingBottom: 100
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 52,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: 24,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: '#1F2937'
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827'
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.light.tint,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: Colors.light.tint,
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    emptyState: {
        textAlign: 'center',
        color: '#6B7280',
        marginTop: 40,
        fontSize: 16
    },
});
