import AddPatientModal from '@/components/add-patient-modal';
import { AlertItem, AlertsBox } from '@/components/alerts-box';
import DoctorSummaryCard from '@/components/doctor-summary-card';
import PatientCard from '@/components/patient-card';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import React, { useState, useMemo } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity
} from 'react-native';

interface Patient {
    id: string;
    name: string;
    age: number;
    status: 'Critique' | 'Attention' | 'Normal';
    bp: string;
    sugar: number;
    heartRate: number;
    accessActive: boolean;
    lastUpdate: string;
}

export default function HomeScreen() {
    const [modalVisible, setModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [patients] = useState<Patient[]>([
        {
            id: '1',
            name: "Marie Dubois",
            age: 68,
            status: "Critique",
            bp: "142/95",
            sugar: 158,
            heartRate: 88,
            accessActive: false,
            lastUpdate: "15 min"
        },
        {
            id: '2',
            name: "Jean Martin",
            age: 55,
            status: "Attention",
            bp: "135/88",
            sugar: 110,
            heartRate: 76,
            accessActive: true,
            lastUpdate: "1 h"
        },
        {
            id: '3',
            name: "Sophie Laurent",
            age: 42,
            status: "Normal",
            bp: "118/76",
            sugar: 92,
            heartRate: 68,
            accessActive: true,
            lastUpdate: "2 h"
        },
        {
            id: '4',
            name: "Pierre Lefebvre",
            age: 71,
            status: "Normal",
            bp: "125/82",
            sugar: 98,
            heartRate: 72,
            accessActive: false,
            lastUpdate: "5 h"
        }
    ]);

    const MOCK_ALERTS: AlertItem[] = [
        { id: 'crit-1', count: 1, label: 'Patient avec vitaux critiques', type: 'critical' },
        { id: 'warn-1', count: 1, label: 'Patient à surveiller', type: 'warning' },
    ];

    const filteredPatients = useMemo(() => {
        return patients.filter((p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, patients]);

    return (
        <ThemedView style={styles.container}>
            <DoctorSummaryCard
                name="Dr. Claire Rousseau"
                specialty="Cardiologue"
                patientCount={patients.length}
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

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <AlertsBox alerts={MOCK_ALERTS} />

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Mes Patients</Text>
                </View>

                {filteredPatients.map((p) => <PatientCard key={p.id} {...p} />)}

                {filteredPatients.length === 0 && (
                    <Text style={styles.emptyState}>Aucun patient trouvé</Text>
                )}
            </ScrollView>

            <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
                <IconSymbol name="plus" size={28} color="white" />
            </TouchableOpacity>

            <AddPatientModal visible={modalVisible} onClose={() => setModalVisible(false)} />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        paddingTop: 10,
        paddingHorizontal: 16,
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
