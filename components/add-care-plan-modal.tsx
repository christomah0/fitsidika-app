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

interface AddCarePlanModalProps {
    visible: boolean;
    loading: boolean;
    onClose: () => void;
    onSubmit: (data: { title: string; description: string; endDate?: string }) => void;
}

export default function AddCarePlanModal({ visible, loading, onClose, onSubmit }: AddCarePlanModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleSubmit = () => {
        if (!title.trim() || !description.trim()) return;
        onSubmit({ title: title.trim(), description: description.trim(), endDate: endDate.trim() || undefined });
        setTitle('');
        setDescription('');
        setEndDate('');
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Nouveau Plan de Soins</Text>
                        <TouchableOpacity onPress={onClose}>
                            <IconSymbol name="xmark" size={20} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.form}>
                        <Text style={styles.label}>Titre *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ex: Suivi hypertension"
                            value={title}
                            onChangeText={setTitle}
                            placeholderTextColor="#9CA3AF"
                        />

                        <Text style={styles.label}>Description *</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Décrivez le plan de soins..."
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={4}
                            placeholderTextColor="#9CA3AF"
                        />

                        <Text style={styles.label}>Date de fin (optionnel)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="JJ/MM/AAAA"
                            value={endDate}
                            onChangeText={setEndDate}
                            placeholderTextColor="#9CA3AF"
                        />
                    </ScrollView>

                    <TouchableOpacity
                        style={[styles.submitBtn, (!title.trim() || !description.trim()) && styles.disabledBtn]}
                        onPress={handleSubmit}
                        disabled={!title.trim() || !description.trim() || loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.submitText}>Créer le plan</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modal: { backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%', padding: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
    form: { marginBottom: 20 },
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
    textArea: { height: 100, textAlignVertical: 'top' },
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
