import React from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { IconSymbol } from './ui/icon-symbol';
import { ThemedText } from './themed-text';

interface ModalProps {
    visible: boolean;
    onClose: () => void;
}

export const AddPatientModal = ({ visible, onClose }: ModalProps) => {
    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <TouchableOpacity style={styles.dismissArea} onPress={onClose} />
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.sheet}>
                    <View style={styles.header}>
                        <ThemedText style={styles.title} type='subtitle'>Ajouter un Patient</ThemedText>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <IconSymbol name="xmark" size={18} color="#000" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.form}>
                        <Text style={styles.label}>Nom complet</Text>
                        <TextInput style={styles.input} placeholder="Ex: Marie Dubois" />

                        <Text style={styles.label}>Adresse e-mail</Text>
                        <TextInput style={styles.input} placeholder="patient@email.com" keyboardType="email-address" />


                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Âge</Text>
                            <TextInput style={styles.input} placeholder="65" keyboardType="numeric" />
                        </View>

                        <Text style={styles.label}>Notes initiales (optionnel)</Text>
                        <TextInput style={[styles.input, styles.textArea]} multiline placeholder="Antécédents médicaux..." />

                        <View style={styles.infoBox}>
                            <IconSymbol name="info" size={20} color="#3B82F6" />
                            <Text style={styles.infoText}>
                                Le patient recevra une invitation par e-mail pour créer son compte...
                            </Text>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end'
    },
    dismissArea: {
        flex: 1
    },
    sheet: {
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        minHeight: '70%'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    title: {
        fontSize: 18,
        fontWeight: '700'
    },
    closeBtn: {
        backgroundColor: '#F0F0F0',
        padding: 8,
        borderRadius: 20
    },
    form: {
        gap: 12
    },
    label: {
        fontWeight: '600',
        color: '#374151',
        marginBottom: 4
    },
    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 12,
        fontSize: 16
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top'
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#EFF6FF',
        padding: 12,
        borderRadius: 12,
        gap: 10,
        marginTop: 10
    },
    infoText: {
        flex: 1,
        color: '#1E40AF',
        fontSize: 13,
        lineHeight: 18
    }
});

export default AddPatientModal;
