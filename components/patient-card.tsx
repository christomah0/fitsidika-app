import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Platform } from 'react-native';
import { IconSymbol } from './ui/icon-symbol';
import { Colors } from '@/constants/theme';

interface PatientProps {
    name: string;
    age: number;
    status: 'Critique' | 'Attention' | 'Normal';
    bp: string;
    sugar: number;
    heartRate: number;
    accessStatus: boolean;
    lastUpdate: string;
    onAccessChange?: (value: boolean) => void;
    onDetailsPress?: () => void;
}

const PatientCard = ({
    name,
    age,
    status,
    bp,
    sugar,
    heartRate,
    accessStatus,
    lastUpdate,
    onAccessChange,
    onDetailsPress
}: PatientProps) => {
    const tagColor = status === 'Critique' ? '#FEE2E2' : status === 'Attention' ? '#FEF3C7' : '#DCFCE7';
    const textColor = status === 'Critique' ? '#991B1B' : status === 'Attention' ? '#92400E' : '#166534';

    const initials = name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <View style={[styles.card, { backgroundColor: '#FFFFFF' }]}>
            <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initials}</Text>
                </View>

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
                            <IconSymbol name="heart.fill" size={14} color="#6B7280" />
                            <Text style={styles.vitalText}>{bp}</Text>
                        </View>
                        <View style={styles.vitalItem}>
                            <IconSymbol name="drop.fill" size={14} color="#6B7280" />
                            <Text style={styles.vitalText}>{sugar} g/L</Text>
                        </View>
                        <View style={styles.vitalItem}>
                            <IconSymbol name="waveform.path.ecg" size={14} color="#6B7280" />
                            <Text style={styles.vitalText}>{heartRate} bpm</Text>
                        </View>
                    </View>

                    <View style={styles.footer}>
                        {/* ACCESS STATUS SECTION */}
                        <View style={styles.switchRow}>
                            <Switch
                                value={accessStatus}
                                onValueChange={onAccessChange}
                                trackColor={{ false: '#D1D5DB', true: '#10B981' }}
                                thumbColor={Platform.OS === 'ios' ? undefined : '#FFFFFF'}
                                ios_backgroundColor="#D1D5DB"
                                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                            />
                            <Text style={[
                                styles.accessText,
                                { color: accessStatus ? '#059669' : '#6B7280', fontWeight: accessStatus ? '600' : '400' }
                            ]}>
                                {accessStatus ? 'Accès actif' : 'Accès coupé'}
                            </Text>
                        </View>

                        <TouchableOpacity style={styles.detailsBtn} onPress={onDetailsPress}>
                            <Text style={styles.detailsText}>Détails</Text>
                            <IconSymbol name="chevron.right" size={16} color="#10B981" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.timeRow}>
                        <IconSymbol name="clock" size={12} color="#9CA3AF" />
                        <Text style={styles.timeText}>Mise à jour il y a {lastUpdate}</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#f2f2f2'
    },
    cardHeader: {
        flexDirection: 'row'
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        marginRight: 14,
        backgroundColor: Colors.light.tint + '20',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.light.tint,
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
        fontSize: 17,
        fontWeight: '700',
        color: '#111827'
    },
    tag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8
    },
    tagText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase'
    },
    ageText: {
        color: '#6B7280',
        fontSize: 14,
        marginTop: 2
    },
    vitalsRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 12,
        marginBottom: 8
    },
    vitalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(255,255,255,0.5)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6
    },
    vitalText: {
        color: '#374151',
        fontWeight: '600',
        fontSize: 13
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)'
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: -8 // Compensate for switch margin
    },
    accessText: {
        fontSize: 13,
        marginLeft: 4
    },
    detailsBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2
    },
    detailsText: {
        color: '#10B981',
        fontWeight: '700',
        fontSize: 14
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 10
    },
    timeText: {
        fontSize: 11,
        color: '#9CA3AF',
    }
});

export default PatientCard;
