import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { ThemedText } from "@/components/themed-text";

interface AppSymptomHistoryCardProps {
    title: string;
    date: string;
    severity: number;
    note: string;
}

export const AppSymptomHistoryCard = ({ title, date, severity, note }: AppSymptomHistoryCardProps) => {
    const isSevere = severity > 6;

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <ThemedText type="defaultSemiBold">{title}</ThemedText>
                <View style={[styles.severityBadge, { backgroundColor: isSevere ? '#FFF5F5' : '#FFF4E5' }]}>
                    <ThemedText style={[styles.severityBadgeText, { color: isSevere ? '#C53030' : '#B7791F' }]}>
                        {isSevere ? 'Sévère' : 'Modéré'} {severity}/10
                    </ThemedText>
                </View>
            </View>
            <ThemedText style={styles.cardDate}>{date}</ThemedText>
            <View style={styles.noteBox}>
                <ThemedText style={styles.noteText}>{note}</ThemedText>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    severityBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8
    },
    severityBadgeText: {
        fontSize: 12,
        fontWeight: '600'
    },
    cardDate: {
        color: '#999',
        fontSize: 13,
        marginVertical: 6
    },
    noteBox: {
        backgroundColor: '#F8F9FA',
        padding: 12,
        borderRadius: 10,
        marginTop: 4
    },
    noteText: {
        color: '#444',
        fontSize: 14
    },
});