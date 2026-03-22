import React, { useState, useImperativeHandle } from 'react';
import {
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    View,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Text,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { PatientFormData } from '@/types/patient.type';
import { dateOnly } from '@/utils/date-format';
import { Gender } from '@/types/gender.type';

export interface AddPatientModalRef {
    submit: () => void;
}

interface ModalProps {
    visible: boolean;
    loading: boolean;
    onClose: () => void;
    onSubmit: (data: PatientFormData) => void;
    ref?: React.Ref<AddPatientModalRef>;
}

export const AddPatientModal = ({ visible, loading, onClose, onSubmit, ref }: ModalProps) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState('');
    const [gender, setGender] = useState<Gender>('M');
    const [birthDate, setBirthDate] = useState(new Date());
    const [showAndroidPicker, setShowAndroidPicker] = useState(false);

    const isEmailValid = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    const isFormValid = name.trim().length > 0 && isEmailValid(email) && phoneNumber.trim().length >= 8 && address.trim().length > 0;

    const handleInternalSave = () => {
        if (!isFormValid) return;

        onSubmit?.({
            name,
            email,
            phoneNumber,
            address,
            gender,
            birthDate: dateOnly(birthDate),
            role: 'patient',
            hasAccess: true
        });

        // Reset and close
        setName('');
        setEmail('');
        setPhoneNumber('');
        setAddress('');
        setGender('M');
        setBirthDate(new Date());
        onClose();
    };

    useImperativeHandle(ref, () => ({
        submit: handleInternalSave
    }));

    const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        if (Platform.OS === 'android') setShowAndroidPicker(false);
        if (selectedDate) setBirthDate(selectedDate);
    };

    return (
        <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
            <View style={styles.overlay}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalContentWrapper}
                >
                    <View style={styles.modalBody}>
                        <View style={styles.modalHeader}>
                            <ThemedText type="subtitle" style={styles.headerTitle}>Nouveau Patient</ThemedText>
                            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                <IconSymbol name='xmark' color="#000" size={18} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                            contentContainerStyle={styles.scrollContainer}
                        >
                            <View style={styles.inputGroup}>
                                <ThemedText style={styles.label}>Nom complet</ThemedText>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ex: Marie Dubois"
                                    placeholderTextColor="#A0AEC0"
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <ThemedText style={styles.label}>Adresse e-mail</ThemedText>
                                <TextInput
                                    style={styles.input}
                                    placeholder="marie@exemple.com"
                                    placeholderTextColor="#A0AEC0"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={setEmail}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <ThemedText style={styles.label}>Numéro de téléphone</ThemedText>
                                <TextInput
                                    style={styles.input}
                                    placeholder="032 00 000 00"
                                    placeholderTextColor="#A0AEC0"
                                    keyboardType="phone-pad"
                                    value={phoneNumber}
                                    onChangeText={setPhoneNumber}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <ThemedText style={styles.label}>Genre</ThemedText>
                                <View style={styles.radioGroup}>
                                    {[
                                        { label: 'Homme', value: 'M' },
                                        { label: 'Femme', value: 'F' },
                                        { label: 'Autre', value: 'O' }
                                    ].map((item) => (
                                        <TouchableOpacity
                                            key={item.value}
                                            style={styles.radioItem}
                                            onPress={() => setGender(item.value as Gender)}
                                            activeOpacity={0.7}
                                        >
                                            <View style={[
                                                styles.radioCircle,
                                                gender === item.value && styles.radioCircleSelected
                                            ]}>
                                                {gender === item.value && <View style={styles.radioInnerCircle} />}
                                            </View>
                                            <ThemedText style={[
                                                styles.radioLabel,
                                                gender === item.value && styles.radioLabelSelected
                                            ]}>
                                                {item.label}
                                            </ThemedText>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <ThemedText style={styles.label}>Date de naissance</ThemedText>
                                {Platform.OS !== 'ios' ? (
                                    <TouchableOpacity
                                        style={styles.androidPickerTrigger}
                                        onPress={() => setShowAndroidPicker(true)}
                                    >
                                        {showAndroidPicker ? (
                                            <DateTimePicker
                                                value={birthDate}
                                                mode="date"
                                                display="default"
                                                onChange={onDateChange}
                                                maximumDate={new Date()}
                                            />
                                        ) : (
                                            <>
                                                <Text style={styles.dateText}>
                                                    -- Sélectionner une date --
                                                </Text>
                                                <IconSymbol name="calendar" size={20} color="#718096" />
                                            </>
                                        )}
                                    </TouchableOpacity>
                                ) : (
                                    <View style={styles.iosPickerWrapper}>
                                        <DateTimePicker
                                            value={birthDate}
                                            mode="date"
                                            display="compact"
                                            onChange={onDateChange}
                                            maximumDate={new Date()}
                                            locale="fr-FR"
                                        />
                                    </View>
                                )}
                            </View>

                            <View style={styles.inputGroup}>
                                <ThemedText style={styles.label}>Adresse physique</ThemedText>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Lot 123 Rue de la Santé"
                                    placeholderTextColor="#A0AEC0"
                                    multiline
                                    numberOfLines={3}
                                    textAlignVertical="top"
                                    value={address}
                                    onChangeText={setAddress}
                                />
                            </View>
                        </ScrollView>

                        <View style={styles.footer}>
                            <TouchableOpacity
                                style={[styles.saveBtn, (!isFormValid || loading) && styles.disabledBtn]}
                                onPress={handleInternalSave}
                                disabled={!isFormValid || loading}
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
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end'
    },
    modalContentWrapper: {
        width: '100%',
        height: '85%',
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
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 15,
        color: '#4A5568',
        marginBottom: 12,
        fontWeight: '600',
    },
    radioGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    radioItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    radioCircle: {
        height: 22,
        width: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    radioCircleSelected: {
        borderColor: Colors.light.tint,
    },
    radioInnerCircle: {
        height: 12,
        width: 12,
        borderRadius: 6,
        backgroundColor: Colors.light.tint,
    },
    radioLabel: {
        fontSize: 15,
        color: '#718096',
    },
    radioLabelSelected: {
        color: '#1e293b',
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        padding: 14,
        fontSize: 15,
        backgroundColor: '#FFFFFF',
        color: '#1A1A1A'
    },
    textArea: {
        height: 80,
        paddingTop: 12,
    },
    iosPickerWrapper: {
        alignItems: 'flex-start',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        padding: 8,
        backgroundColor: '#FFFFFF',
    },
    androidPickerTrigger: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        padding: 14,
        backgroundColor: '#FFFFFF',
    },
    dateText: {
        fontSize: 15,
        color: '#1A1A1A',
    },
    footer: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        backgroundColor: 'white',
        paddingBottom: Platform.OS === 'ios' ? 34 : 15
    },
    saveBtn: {
        backgroundColor: Colors.light.tint,
        padding: 14,
        borderRadius: 14,
        alignItems: 'center',
    },
    disabledBtn: {
        opacity: 0.5,
    },
    saveBtnText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16
    }
});

export default AddPatientModal;
