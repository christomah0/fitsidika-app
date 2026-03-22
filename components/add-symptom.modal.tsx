import React, { useState, useImperativeHandle, forwardRef } from 'react';
import {
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    View,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SymptomSelector } from '@/components/symptom-selector';
import { Colors } from '@/constants/theme';

const SYMPTOMS = [
    { id: '1', label: 'Maux de tête', icon: '🤕' },
    { id: '2', label: 'Fatigue', icon: '😴' },
    { id: '3', label: 'Nausée', icon: '🤢' },
    { id: '4', label: 'Vertiges', icon: '😵‍💫' },
    { id: '5', label: 'Douleur', icon: '😣' },
    { id: '6', label: 'Fièvre', icon: '🌡️' },
    { id: '7', label: 'Toux', icon: '🤧' },
    { id: '8', label: 'Essoufflement', icon: '😮‍💨' },
];

export interface AddSymptomModalRef {
    submit: () => void;
}

interface SymptomData {
    symptomId: string;
    severity: number;
    notes: string;
}

interface ModalProps {
    visible: boolean;
    loading?: boolean;
    onClose: () => void;
    onSubmit: (data: SymptomData) => void;
}

const getSeverityColor = (value: number) => {
    if (value <= 3) return '#00B341';
    if (value <= 6) return '#FF9500';
    return '#FF3B30';
};

export const AddSymptomModal = forwardRef<AddSymptomModalRef, ModalProps>(
    ({ visible, loading, onClose, onSubmit }, ref) => {
        const [selectedSymptom, setSelectedSymptom] = useState('');
        const [severity, setSeverity] = useState(5);
        const [notes, setNotes] = useState('');

        const handleInternalSave = () => {
            if (!selectedSymptom) return;

            onSubmit({
                symptomId: selectedSymptom,
                severity,
                notes,
            });

            // Reset
            setSelectedSymptom('');
            setSeverity(5);
            setNotes('');
            onClose();
        };

        useImperativeHandle(ref, () => ({
            submit: handleInternalSave
        }));

        return (
            <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
                <View style={styles.overlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.modalContentWrapper}
                    >
                        <View style={styles.modalBody}>
                            <View style={styles.modalHeader}>
                                <ThemedText type="subtitle" style={styles.headerTitle}>Enregistrer un Symptôme</ThemedText>
                                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                    <IconSymbol name='xmark' color="#000" size={18} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                keyboardShouldPersistTaps="handled"
                                contentContainerStyle={styles.scrollContainer}
                            >
                                <ThemedText style={styles.label}>Sélectionner un Symptôme</ThemedText>
                                <View style={styles.grid}>
                                    {SYMPTOMS.map(item => (
                                        <SymptomSelector
                                            key={item.id}
                                            icon={item.icon}
                                            label={item.label}
                                            isSelected={selectedSymptom === item.id}
                                            onPress={() => setSelectedSymptom(item.id)}
                                        />
                                    ))}
                                </View>

                                <ThemedText style={styles.label}>Gravité: {severity}/10</ThemedText>
                                <Slider
                                    style={styles.slider}
                                    minimumValue={1}
                                    maximumValue={10}
                                    step={1}
                                    value={severity}
                                    onValueChange={setSeverity}
                                    minimumTrackTintColor="#1A1A1A"
                                    maximumTrackTintColor="#E2E8F0"
                                    thumbTintColor="#FFFFFF"
                                />

                                <View style={styles.severityStatusRow}>
                                    <ThemedText style={[styles.statusText, { color: '#00B341' }]}>Léger</ThemedText>
                                    <ThemedText style={[styles.statusText, { color: '#FF9500' }]}>Modéré</ThemedText>
                                    <ThemedText style={[styles.statusText, { color: '#FF3B30' }]}>Sévère</ThemedText>
                                </View>

                                <View style={styles.numberRow}>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                        <View
                                            key={num}
                                            style={[
                                                styles.numBox,
                                                severity === num && { backgroundColor: getSeverityColor(num) }
                                            ]}
                                        >
                                            <ThemedText style={[styles.numLabel, severity === num && { color: 'white' }]}>
                                                {num}
                                            </ThemedText>
                                        </View>
                                    ))}
                                </View>

                                <ThemedText style={[styles.label, { marginTop: 24 }]}>Notes</ThemedText>
                                <TextInput
                                    style={styles.textArea}
                                    placeholder="Décrivez le symptôme..."
                                    placeholderTextColor="#A0AEC0"
                                    multiline
                                    value={notes}
                                    onChangeText={setNotes}
                                />
                            </ScrollView>

                            <View style={styles.footer}>
                                <TouchableOpacity
                                    style={[styles.saveBtn, (!selectedSymptom || loading) && styles.disabledBtn]}
                                    onPress={handleInternalSave}
                                    disabled={!selectedSymptom || loading}
                                >
                                    <ThemedText style={styles.saveBtnText}>
                                        {loading ? "Chargement..." : "Enregistrer"}
                                    </ThemedText>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        );
    }
);

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end'
    },
    modalContentWrapper: {
        width: '100%',
        height: '88%',
    },
    modalBody: {
        flex: 1,
        backgroundColor: 'white',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerTitle: {
        fontWeight: '700',
        fontSize: 20,
        color: '#1e293b'
    },
    closeBtn: {
        backgroundColor: '#F0F0F0',
        padding: 8,
        borderRadius: 20
    },
    scrollContainer: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 20
    },
    label: {
        fontSize: 15,
        color: '#4A5568',
        marginBottom: 12,
        fontWeight: '600'
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 10
    },
    slider: {
        width: '100%',
        height: 40
    },
    severityStatusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8
    },
    statusText: {
        fontSize: 14,
        fontWeight: '600'
    },
    numberRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 5
    },
    numBox: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#F0F4F8',
        justifyContent: 'center',
        alignItems: 'center'
    },
    numLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#718096'
    },
    textArea: {
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        padding: 12,
        minHeight: 100,
        textAlignVertical: 'top',
        fontSize: 15,
        backgroundColor: '#FFFFFF',
        color: '#1A1A1A',
        marginBottom: 10
    },
    footer: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingBottom: Platform.OS === 'ios' ? 34 : 15
    },
    saveBtn: {
        backgroundColor: Colors.light.tint,
        padding: 16,
        borderRadius: 14,
        alignItems: 'center'
    },
    disabledBtn: {
        opacity: 0.5
    },
    saveBtnText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16
    }
});
