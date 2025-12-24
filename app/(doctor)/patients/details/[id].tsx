import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Image, Platform } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { GuideBox } from '@/components/guide-box';
import { HistoryCard } from '@/components/history-card';
import { Colors } from '@/constants/theme';

type TabType = 'vitals' | 'plan';

export default function PatientDetailScreen() {
    const { id } = useLocalSearchParams();
    const [activeTab, setActiveTab] = useState<TabType>('vitals');
    const router = useRouter();

    // In a real app, fetch data based on ID. Using Mock data for now.
    const patient = {
        name: "Marie Dubois",
        age: 68,
        gender: "Femme",
        phone: "06 12 34 56 78",
        status: "Critique",
        bp: "142/95",
        sugar: 1.58,
        heartRate: 88,
    };

    return (
        <ThemedView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                {/* Patient profile header */}
                <View style={styles.profileHeader}>
                    <Image source={{ uri: 'https://via.placeholder.com/100' }} style={styles.avatar} />
                    <ThemedText type="subtitle" style={styles.name}>{patient.name}</ThemedText>
                    <ThemedText style={styles.subInfo}>{patient.age} ans • {patient.gender}</ThemedText>

                    <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.circleAction}>
                            <IconSymbol name="phone.fill" size={20} color={Colors.light.tint} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.circleAction}>
                            <IconSymbol name="bubble.left.fill" size={20} color={Colors.light.tint} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Segmented tabs */}
                <View style={styles.tabContainer}>
                    <View style={styles.tabTrack}>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'vitals' && styles.activeTab]}
                            onPress={() => setActiveTab('vitals')}
                        >
                            <ThemedText style={[styles.tabLabel, activeTab === 'vitals' && styles.activeTabLabel]}>
                                Vitaux & Symptômes
                            </ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'plan' && styles.activeTab]}
                            onPress={() => setActiveTab('plan')}
                        >
                            <ThemedText style={[styles.tabLabel, activeTab === 'plan' && styles.activeTabLabel]}>
                                Plan de Soins
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>

                {activeTab === 'vitals' ? (
                    <>
                        {/* Vitals grid */}
                        <View style={styles.section}>
                            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Derniers Vitaux</ThemedText>
                            <View style={styles.vitalsGrid}>
                                <VitalCard icon="heart.fill" label="Tension" value={patient.bp} unit="mmHg" color="#EF4444" />
                                <VitalCard icon="drop.fill" label="Glycémie" value={patient.sugar} unit="g/L" color="#3B82F6" />
                                <VitalCard icon="waveform.path.ecg" label="Rythme" value={patient.heartRate} unit="bpm" color="#10B981" />
                            </View>
                        </View>

                        {/* Trends / Guide */}
                        <View style={styles.section}>
                            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>État de Santé</ThemedText>
                            <GuideBox
                                variant={patient.status === 'Critique' ? 'severe' : 'light'}
                                range={`Statut: ${patient.status}`}
                                desc="Dernière mise à jour il y a 15 minutes via l'appareil connecté."
                            />
                        </View>

                        {/* Recent symptoms history */}
                        <View style={styles.section}>
                            <View style={styles.rowHeader}>
                                <ThemedText type="defaultSemiBold">Historique des Symptômes</ThemedText>
                                <TouchableOpacity onPress={() => router.push('/(doctor)/patients/history')}>
                                    <ThemedText style={styles.seeAll}>Voir tout</ThemedText>
                                </TouchableOpacity>
                            </View>
                            <HistoryCard
                                title="Maux de tête"
                                date="Aujourd'hui, 14:30"
                                severity={6}
                                note="Douleur pulsatile signalée après le déjeuner."
                            />
                            <HistoryCard
                                title="Fatigue intense"
                                date="Hier, 10:15"
                                severity={4}
                                note="Le patient se sent faible depuis le réveil."
                            />
                        </View>
                    </>
                ) : (
                    <>
                        <View style={styles.planContainer}>
                            <ThemedText type="subtitle" style={styles.planTitle}>Gestion du Plan de Soins</ThemedText>
                            <ThemedText style={styles.planDesc}>Configurez le traitement et les objectifs pour votre patient.</ThemedText>

                            <TouchableOpacity style={styles.prescribeBtn}>
                                <IconSymbol name="plus" size={20} color="white" />
                                <ThemedText style={styles.btnText}>Prescrire un Médicament</ThemedText>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.objectiveBtn} disabled>
                                <IconSymbol name="target" size={20} color="white" />
                                <ThemedText style={styles.btnText}>Définir un Objectif</ThemedText>
                            </TouchableOpacity>
                        </View>

                        {/* Recent medicaments history */}
                        <View style={styles.section}>
                            <View style={styles.rowHeader}>
                                <ThemedText type="defaultSemiBold">Historique des Médicaments</ThemedText>
                                <TouchableOpacity onPress={() => router.push('/(doctor)/patients/history')}>
                                    <ThemedText style={styles.seeAll}>Voir tout</ThemedText>
                                </TouchableOpacity>
                            </View>
                            <MedicationCard name="Lisinopril" dose="10 mg - 1x/jour" status="Actif" />
                            <MedicationCard name="Metformine" dose="500 mg - 2x/jour" status="Actif" />
                        </View>
                    </>
                )}
            </ScrollView>
        </ThemedView>
    );
}

const VitalCard = ({ icon, label, value, unit, color }: any) => (
    <View style={styles.vCard}>
        <View style={[styles.vIconCircle, { backgroundColor: color + '15' }]}>
            <IconSymbol name={icon} size={18} color={color} />
        </View>
        <ThemedText style={styles.vLabel}>{label}</ThemedText>
        <ThemedText style={styles.vValue}>{value}</ThemedText>
        <ThemedText style={styles.vUnit}>{unit}</ThemedText>
    </View>
);

const MedicationCard = ({ name, dose, status }: any) => (
    <View style={[styles.medCard, { backgroundColor: '#fff' }]}>
        <View>
            <ThemedText style={styles.medName}>{name}</ThemedText>
            <ThemedText style={styles.medDose}>{dose}</ThemedText>
        </View>
        <View style={styles.statusBadge}><ThemedText style={styles.statusText}>{status}</ThemedText></View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB'
    },
    content: {
        padding: 20,
        paddingBottom: 40
    },
    profileHeader: {
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#f2f2f2'
    },
    avatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        marginBottom: 16
    },
    name: {
        fontSize: 22,
        fontWeight: '700',
        color: '#111827'
    },
    subInfo: {
        color: '#6B7280',
        marginTop: 4
    },
    actionRow: {
        flexDirection: 'row',
        gap: 15,
        marginTop: 20
    },
    circleAction: {
        width: 44,
        height: 44,
        borderRadius: 20,
        backgroundColor: '#F0FDF4',
        justifyContent: 'center',
        alignItems: 'center'
    },
    section: {
        marginBottom: 24,
        gap: 8,
    },
    sectionTitle: {
        marginBottom: 16,
        fontSize: 18
    },
    rowHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12
    },
    seeAll: {
        color: '#10B981',
        fontWeight: '600',
        fontSize: 14
    },
    vitalsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12
    },
    vCard: {
        flex: 1,
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F3F4F6'
    },
    vIconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8
    },
    vLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4
    },
    vValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827'
    },
    vUnit: {
        fontSize: 10,
        color: '#9CA3AF'
    },
    tabContainer: {
        paddingVertical: 12,
    },
    tabTrack: {
        flexDirection: 'row',
        backgroundColor: '#E5E7EB',
        borderRadius: 12,
        padding: 2
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10
    },
    activeTab: {
        backgroundColor: 'white'
    },
    tabLabel: {
        fontSize: 13,
        color: '#4b5563',
        fontWeight: '500'
    },
    activeTabLabel: {
        color: '#111827',
        fontWeight: 'bold'
    },
    planContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 24,
        marginBottom: 24,
    },
    planTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827'
    },
    planDesc: {
        color: '#6B7280',
        fontSize: 14,
        marginVertical: 12
    },
    prescribeBtn: {
        backgroundColor: Colors.light.tint,
        flexDirection: 'row',
        padding: 14,
        borderRadius: 14,
        gap: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12
    },
    objectiveBtn: {
        backgroundColor: '#A020F0',
        flexDirection: 'row',
        padding: 14,
        borderRadius: 14,
        gap: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24
    },
    btnText: {
        color: 'white',
        fontWeight: 'bold'
    },
    medCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12
    },
    medName: {
        fontWeight: 'bold',
        color: '#111827'
    },
    medDose: {
        fontSize: 12,
        color: '#4b5563'
    },
    statusBadge: {
        backgroundColor: 'rgba(255,255,255,0.5)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8
    },
    statusText: {
        fontSize: 11,
        fontWeight: 'bold'
    }
});