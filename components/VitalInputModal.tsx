import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';

/* ================= TYPES (Définis ici pour l'autonomie du composant) ================= */

// Définir la structure des données qui seront envoyées au composant parent
export interface NewVitalRecordData {
    systolic: string;
    diastolic: string;
    heartRate: string;
    glucose: string;
    spo2: string;
    temperature: string;
}

interface VitalInputModalProps {
    visible: boolean;
    onClose: () => void;
    // AJOUT NÉCESSAIRE : La fonction qui reçoit les données et les enregistre
    onSave: (data: NewVitalRecordData) => void; 
}

/* ================= COMPOSANT MODAL DE SAISIE ================= */

// Déstructuration des props : { visible, onClose, onSave }
export const VitalInputModal = ({ visible, onClose, onSave }: VitalInputModalProps) => {
    // États pour gérer les valeurs des inputs
    const [systolic, setSystolic] = useState('120');
    const [diastolic, setDiastolic] = useState('80');
    const [heartRate, setHeartRate] = useState('72');
    const [glucose, setGlucose] = useState('95');
    const [temperature, setTemperature] = useState('36.6');
    const [spo2, setSpo2] = useState('98');

    const handleSave = () => {
        const dataToSave: NewVitalRecordData = {
            systolic,
            diastolic,
            heartRate,
            glucose,
            spo2,
            temperature,
        };
        
        // 1. Appel de la fonction onSave du parent pour mettre à jour l'état `records`
        onSave(dataToSave); 
        
        // La fermeture du modal est gérée par le composant parent après l'appel à onSave
        // (voir `handleSaveRecord` dans VitauxScreen)
    };
    
    // Fonction de fermeture (généralement appelée pour annuler ou après la sauvegarde)
    const handleClose = () => {
        onClose();
        // Optionnel : réinitialiser les champs ici si on le souhaite
    }

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={modalStyles.modalOverlay}
            >
                <View style={modalStyles.modalContent}>
                    <View style={modalStyles.modalHeader}>
                        <Text style={modalStyles.modalTitle}>Saisir les Signes Vitaux</Text>
                        
                        {/* Bouton de Fermeture (Croix) */}
                        <TouchableOpacity 
                            style={modalStyles.closeButton} 
                            onPress={handleClose} // Utiliser handleClose
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <AntDesign name="close" size={24} color="#333" />
                        </TouchableOpacity>

                    </View>
                    
                    <ScrollView contentContainerStyle={modalStyles.modalBody} keyboardShouldPersistTaps="handled">
                        
                        {/* Tension Artérielle */}
                        <Text style={modalStyles.inputLabel}>Tension Artérielle (mmHg)</Text>
                        <View style={modalStyles.bpInputContainer}>
                            <TextInput
                                style={[modalStyles.input, { flex: 1, marginRight: 8 }]}
                                placeholder="Systolique"
                                keyboardType="numeric"
                                value={systolic}
                                onChangeText={setSystolic}
                            />
                            <Text style={{ fontSize: 16, color: '#333' }}>/</Text>
                            <TextInput
                                style={[modalStyles.input, { flex: 1, marginLeft: 8 }]}
                                placeholder="Diastolique"
                                keyboardType="numeric"
                                value={diastolic}
                                onChangeText={setDiastolic}
                            />
                        </View>

                        {/* Fréquence Cardiaque */}
                        <Text style={modalStyles.inputLabel}>Fréquence Cardiaque (bpm)</Text>
                        <TextInput
                            style={modalStyles.input}
                            placeholder="Fréquence"
                            keyboardType="numeric"
                            value={heartRate}
                            onChangeText={setHeartRate}
                        />

                        {/* Glycémie */}
                        <Text style={modalStyles.inputLabel}>Glycémie (mg/dL)</Text>
                        <TextInput
                            style={modalStyles.input}
                            placeholder="Glycémie"
                            keyboardType="numeric"
                            value={glucose}
                            onChangeText={setGlucose}
                        />

                        {/* Température */}
                        <Text style={modalStyles.inputLabel}>Température (°C)</Text>
                        <TextInput
                            style={modalStyles.input}
                            placeholder="Température"
                            keyboardType="numeric"
                            value={temperature}
                            onChangeText={setTemperature}
                        />
                        
                        {/* SpO2 */}
                        <Text style={modalStyles.inputLabel}>SpO2 (%)</Text>
                        <TextInput
                            style={modalStyles.input}
                            placeholder="SpO2"
                            keyboardType="numeric"
                            value={spo2}
                            onChangeText={setSpo2}
                        />

                        <TouchableOpacity style={modalStyles.saveButton} onPress={handleSave}>
                            <Text style={modalStyles.saveButtonText}>Enregistrer</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

/* ================= STYLES DU MODAL (EXPORTÉ) ================= */

// ... (Les styles restent inchangés) ...
const modalStyles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '85%', 
        paddingBottom: Platform.OS === 'ios' ? 20 : 0, 
    },
    modalHeader: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
        alignItems: 'center',
        flexDirection: 'row', 
        justifyContent: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    closeButton: {
        position: 'absolute',
        right: 16,
        top: 14,
    },
    modalBody: {
        padding: 16,
    },
    inputLabel: {
        fontSize: 14,
        color: '#666',
        marginTop: 15,
        marginBottom: 5,
        fontWeight: '500',
    },
    input: {
        height: 40,
        borderColor: '#CCC',
        borderBottomWidth: 1,
        paddingHorizontal: 0,
        fontSize: 16,
        color: '#333',
    },
    bpInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    saveButton: {
        backgroundColor: '#38A169',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        marginTop: 30,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});