import React, { useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { GoalCategory } from '@/types/care-plan.type';

interface AddGoalModalProps {
    visible: boolean;
    loading: boolean;
    onClose: () => void;
    onSubmit: (data: {
        title: string;
        category: GoalCategory;
        targetValue: number;
        unit: string;
        deadline: string;
        notes?: string;
    }) => void;
}

const CATEGORIES: GoalCategory[] = ['Tension', 'Glycémie', 'Poids', 'Activité', 'Autre'];

export default function AddGoalModal({ visible, loading, onClose, onSubmit }: AddGoalModalProps) {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState<GoalCategory>('Tension');
    const [targetValue, setTargetValue] = useState('');
    const [unit, setUnit] = useState('');
    const [deadline, setDeadline] = useState('');
    const [notes, setNotes] = useState('');

    const isValid = title.trim() && targetValue && unit.trim() && deadline.trim();

    const handleSubmit = () => {
        if (!isValid) return;
        onSubmit({
            title: title.trim(),
            category,
            targetValue: parseFloat(targetValue),
            unit: unit.trim(),
            deadline: deadline.trim(),
            notes: notes.trim() || undefined,
        });
        setTitle('');
        setTargetValue('');
        setUnit('');
        setDeadline('');
        setNotes('');
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Nouvel Objectif</Text>
                        <TouchableOpacity onPress={onClose}>
                            <IconSymbol name="xmark" size={20} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
                        <Text style={styles.label}>Titre *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ex: Tension < 120/80"
                            value={title}
                            onChangeText={setTitle}
                            placeholderTextColor="#9CA3AF"
                        />

                        <Text style={styles.label}>Catégorie</Text>
                        <View style={styles.categoryRow}>
                            {CATEGORIES.map(cat => (
                                <TouchableOpacity
                                    key={cat}
                                    style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
                                    onPress={() => setCategory(cat)}
                                >
                                    <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>
                                        {cat}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.row}>
                            <View style={styles.halfField}>
                                <Text style={styles.label}>Valeur cible *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="120"
                                    value={targetValue}
                                    onChangeText={setTargetValue}
                                    keyboardType="numeric"
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>
                            <View style={styles.halfField}>
                                <Text style={styles.label}>Unité *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="mmHg"
                                    value={unit}
                                    onChangeText={setUnit}
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>
                        </View>

                        <Text style={styles.label}>Échéance *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="JJ/MM/AAAA"
                            value={deadline}
                            onChangeText={setDeadline}
                            placeholderTextColor="#9CA3AF"
                        />

                        <Text style={styles.label}>Notes (optionnel)</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Instructions supplémentaires..."
                            value={notes}
                            onChangeText={setNotes}
                            multiline
                            numberOfLines={3}
                            placeholderTextColor="#9CA3AF"
                        />
                    </ScrollView>

                    <TouchableOpacity
                        style={[styles.submitBtn, !isValid && styles.disabledBtn]}
                        onPress={handleSubmit}
                        disabled={!isValid || loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.submitText}>Créer l'objectif</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modal: { backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%', padding: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
    form: { marginBottom: 16 },
    label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 12 },
    input: {
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 14,
        fontSize: 15,
        color: '#111827',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    textArea: { height: 80, textAlignVertical: 'top' },
    categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
    categoryChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    categoryChipActive: { backgroundColor: Colors.light.tint + '20', borderColor: Colors.light.tint },
    categoryText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
    categoryTextActive: { color: Colors.light.tint, fontWeight: '700' },
    row: { flexDirection: 'row', gap: 12 },
    halfField: { flex: 1 },
    submitBtn: {
        backgroundColor: '#8B5CF6',
        padding: 16,
        borderRadius: 14,
        alignItems: 'center',
        marginBottom: 20,
    },
    disabledBtn: { opacity: 0.5 },
    submitText: { color: 'white', fontSize: 16, fontWeight: '700' },
});
