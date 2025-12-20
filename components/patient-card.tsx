import React from 'react';
import { View, Text, StyleSheet, Image, Switch, TouchableOpacity } from 'react-native';
import { IconSymbol } from './ui/icon-symbol';

interface PatientProps {
    name: string;
    age: number;
    status: 'Critique' | 'Attention' | 'Normal';
    bp: string;
    sugar: number;
    heartRate: number;
    accessActive: boolean;
    lastUpdate: string;
}

const PatientCard = ({ name, age, status, bp, sugar, heartRate, accessActive, lastUpdate }: PatientProps) => {
    const statusColor = status === 'Critique' ? '#FFEDED' : status === 'Attention' ? '#FFF9E6' : '#FFFFFF';
    const tagColor = status === 'Critique' ? '#FEE2E2' : status === 'Attention' ? '#FEF3C7' : '#DCFCE7';
    const textColor = status === 'Critique' ? '#991B1B' : status === 'Attention' ? '#92400E' : '#166534';

    return (
        <View style={[styles.card, { backgroundColor: statusColor, borderColor: tagColor, borderWidth: 1 }]}>
            <View style={styles.cardHeader}>
                <Image source={{ uri: 'https://via.placeholder.com/50' }} style={styles.avatar} />
                <View style={styles.infoContainer}>
                    <View style={styles.nameRow}>
                        <Text style={styles.patientName}>{name}</Text>
                        <View style={[styles.tag, { backgroundColor: tagColor }]}>
                            <Text style={[styles.tagText, { color: textColor }]}>{status}</Text>
                        </View>
                    </View>
                    <Text style={styles.ageText}>{age} ans</Text>

                    <View style={styles.vitalsRow}>
                        <View style={styles.vitalItem}>
                            <IconSymbol name="heart" size={16} color="#666" />
                            <Text style={styles.vitalText}>{bp}</Text>
                        </View>
                        <View style={styles.vitalItem}>
                            <IconSymbol name="drop" size={16} color="#666" />
                            <Text style={styles.vitalText}>{sugar}</Text>
                        </View>
                        <View style={styles.vitalItem}>
                            <IconSymbol name="waveform.path.ecg" size={16} color="#666" />
                            <Text style={styles.vitalText}>{heartRate}</Text>
                        </View>
                    </View>

                    <View style={styles.footer}>
                        <View style={styles.switchRow}>
                            <Switch value={accessActive} trackColor={{ true: '#10B981' }} />
                            <Text style={styles.accessText}>Accès actif</Text>
                        </View>
                        <TouchableOpacity style={styles.detailsBtn}>
                            <Text style={styles.detailsText}>Voir détails</Text>
                            <IconSymbol name="chevron.right" size={20} color="#10B981" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.timeText}>Il y a {lastUpdate}</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
    },
    cardHeader: {
        flexDirection: 'row'
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 12
    },
    infoContainer: {
        flex: 1
    },
    nameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    patientName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937'
    },
    tag: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6
    },
    tagText: {
        fontSize: 12,
        fontWeight: '600'
    },
    ageText: {
        color: '#6B7280',
        marginVertical: 4
    },
    vitalsRow: {
        flexDirection: 'row',
        gap: 15,
        marginVertical: 8
    },
    vitalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4
    },
    vitalText: {
        color: '#374151',
        fontWeight: '500'
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    accessText: {
        fontSize: 14,
        color: '#374151'
    },
    detailsBtn: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    detailsText: {
        color: '#10B981',
        fontWeight: '600'
    },
    timeText: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 8
    }
});

export default PatientCard;
