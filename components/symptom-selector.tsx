import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { ThemedText } from "@/components/themed-text";

interface SymptomSelectorProps {
    icon: string;
    label: string;
    isSelected?: boolean;
    onPress: () => void;
}

export const SymptomSelector = ({ icon, label, isSelected, onPress }: SymptomSelectorProps) => (
    <TouchableOpacity
        style={[styles.gridItem, isSelected && styles.gridItemSelected]}
        onPress={onPress}
    >
        <Text style={{ fontSize: 28 }}>{icon}</Text>
        <ThemedText style={[styles.gridText, isSelected && styles.gridTextSelected]}>{label}</ThemedText>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    gridItem: {
        width: '48%',
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#EEE',
        borderRadius: 16,
        padding: 16,
        gap: 8,
        alignItems: 'center',
        marginBottom: 12
    },
    gridItemSelected: {
        borderColor: '#00B341',
        backgroundColor: '#F0FFF4'
    },
    gridText: {
        fontSize: 14,
        color: '#444'
    },
    gridTextSelected: {
        color: '#00B341',
        fontWeight: 'bold'
    }
});