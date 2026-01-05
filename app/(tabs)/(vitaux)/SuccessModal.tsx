import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons'; 

/* ================= TYPES ================= */

interface SuccessModalProps {
    visible: boolean;
    onClose: () => void;
}

/* ================= COMPOSANT MODAL DE SUCCÈS ================= */

export const SuccessModal = ({ visible, onClose }: SuccessModalProps) => (
    <Modal
        animationType="fade"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
    >
        <View style={successModalStyles.centeredView}>
            <View style={successModalStyles.modalView}>
                {/* CORRECTION APPLIQUÉE ICI : "checkcircle" -> "check-circle" */}
                <AntDesign name="check-circle" size={48} color="#38A169" /> 
                <Text style={successModalStyles.modalText}>Enregistrement réussi !</Text>
                <Text style={successModalStyles.subText}>Vos signes vitaux ont été mis à jour.</Text>
                <TouchableOpacity
                    style={successModalStyles.buttonClose}
                    onPress={onClose}
                >
                    <Text style={successModalStyles.textStyle}>OK</Text>
                </TouchableOpacity>
            </View>
        </View>
    </Modal>
);

/* ================= STYLES DE LA MODAL DE SUCCÈS ================= */

const successModalStyles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '80%',
    },
    buttonClose: {
        backgroundColor: '#38A169',
        borderRadius: 10,
        padding: 10,
        elevation: 2,
        marginTop: 20,
        width: '100%',
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalText: {
        marginBottom: 10,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 15,
        color: '#38A169',
    },
    subText: {
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 14,
        color: '#666',
    }
});