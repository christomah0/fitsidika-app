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
import { DosageUnit, DurationUnit, MedicationFrequency } from '@/types/medication.type';

interface PrescribeMedicationModalProps {
    visible: boolean;
    loading: boolean;
    onClose: () => void;
    onSubmit: (data: {
        name: string;
        dosageValue: number;
        dosageUnit: DosageUnit;
        frequency: string;
        intakeTimes: string[];
        durationValue: number;
        durationUnit: DurationUnit;
        instructions?: string;
    }) => void;
}

const FREQUENCIES = Object.values(MedicationFrequency);
const DOSAGE_UNITS: DosageUnit[] = ['mg', 'mcg', 'ml', 'g'];
const DURATION_UNITS: DurationUnit[] = ['jours', 'semaines', 'mois'];

export default function PrescribeMedicationModal({ visible, loading, onClose, onSubmit }: PrescribeMedicationModalProps) {
    const [name, setName] = useState('');
    const [dosageValue, setDosageValue] = useState('');
    const [dosageUnit, setDosageUnit] = useState<DosageUnit>('mg');
    const [frequency, setFrequency] = useState(FREQUENCIES[0]);
    const [intakeTime, setIntakeTime] = useState('08:00');
    const [durationValue, setDurationValue] = useState('');
    const [durationUnit, setDurationUnit] = useState<DurationUnit>('jours');
    const [instructions, setInstructions] = useState('');

    const isValid = name.trim() && dosageValue && durationValue;

    const handleSubmit = () => {
        if (!isValid) return;
        onSubmit({
            name: name.trim(),
            dosageValue: parseFloat(dosageValue),
            dosageUnit,
            frequency,
            intakeTimes: [intakeTime],
            durationValue: parseInt(durationValue),
            durationUnit,
            instructions: instructions.trim() || undefined,
        });
        setName('');
        setDosageValue('');
        setDurationValue('');
        setInstructions('');
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Prescrire un Médicament</Text>
                        <TouchableOpacity onPress={onClose}>
                            <IconSymbol name="xmark" size={20} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
                        <Text style={styles.label}>Nom du médicament *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ex: Lisinopril"
                            value={name}
                            onChangeText={setName}
                            placeholderTextColor="#9CA3AF"
                        />

                        <View style={styles.row}>
                            <View style={styles.flex2}>
                                <Text style={styles.label}>Dosage *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="10"
                                    value={dosageValue}
                                    onChangeText={setDosageValue}
                                    keyboardType="numeric"
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>
                            <View style={styles.flex1}>
                                <Text style={styles.label}>Unité</Text>
                                <View style={styles.chipRow}>
                                    {DOSAGE_UNITS.map(u => (
                                        <TouchableOpacity
                                            key={u}
                                            style={[styles.chip, dosageUnit === u && styles.chipActive]}
                                            onPress={() => setDosageUnit(u)}
                                        >
                                            <Text style={[styles.chipText, dosageUnit === u && styles.chipTextActive]}>{u}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </View>

                        <Text style={styles.label}>Fréquence</Text>
                        <View style={styles.frequencyList}>
                            {FREQUENCIES.slice(0, 4).map(f => (
                                <TouchableOpacity
                                    key={f}
                                    style={[styles.frequencyChip, frequency === f && styles.frequencyChipActive]}
                                    onPress={() => setFrequency(f)}
                                >
                                    <Text style={[styles.frequencyText, frequency === f && styles.frequencyTextActive]}>{f}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.label}>Heure de prise</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="08:00"
                            value={intakeTime}
                            onChangeText={setIntakeTime}
                            placeholderTextColor="#9CA3AF"
                        />

                        <View style={styles.row}>
                            <View style={styles.flex2}>
                                <Text style={styles.label}>Durée *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="30"
                                    value={durationValue}
                                    onChangeText={setDurationValue}
                                    keyboardType="numeric"
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>
                            <View style={styles.flex1}>
                                <Text style={styles.label}>Unité</Text>
                                <View style={styles.chipRow}>
                                    {DURATION_UNITS.map(u => (
                                        <TouchableOpacity
                                            key={u}
                                            style={[styles.chip, durationUnit === u && styles.chipActive]}
                                            onPress={() => setDurationUnit(u)}
                                        >
                                            <Text style={[styles.chipText, durationUnit === u && styles.chipTextActive]}>{u}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </View>

                        <Text style={styles.label}>Instructions (optionnel)</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Ex: À prendre avec un repas"
                            value={instructions}
                            onChangeText={setInstructions}
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
                            <Text style={styles.submitText}>Prescrire</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modal: { backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%', padding: 20 },
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
    row: { flexDirection: 'row', gap: 12 },
    flex1: { flex: 1 },
    flex2: { flex: 2 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
    chip: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    chipActive: { backgroundColor: Colors.light.tint + '20', borderColor: Colors.light.tint },
    chipText: { fontSize: 12, color: '#6B7280' },
    chipTextActive: { color: Colors.light.tint, fontWeight: '700' },
    frequencyList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
    frequencyChip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    frequencyChipActive: { backgroundColor: Colors.light.tint + '20', borderColor: Colors.light.tint },
    frequencyText: { fontSize: 13, color: '#6B7280' },
    frequencyTextActive: { color: Colors.light.tint, fontWeight: '700' },
    submitBtn: {
        backgroundColor: Colors.light.tint,
        padding: 16,
        borderRadius: 14,
        alignItems: 'center',
        marginBottom: 20,
    },
    disabledBtn: { opacity: 0.5 },
    submitText: { color: 'white', fontSize: 16, fontWeight: '700' },
});
