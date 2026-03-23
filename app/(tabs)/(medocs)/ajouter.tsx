

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MedicationValidator } from '../../../services/validation';
import { useMedications } from '../../../hooks/useMedications';
import { Medication } from '../../../constants/medicationTypes'; 

interface TimeSlot {
  id: string;
  time: string; // Format corrigé: 'HH:MM' (24 heures)
}

// -------------------------------------------------------------
// COMPOSANT PRINCIPAL
// -------------------------------------------------------------
export default function AddMedicationScreen() {
  const router = useRouter();
  const { addMedication } = useMedications(); 

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('Une fois par jour');
  

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    { id: '1', time: '08:00' }, // 
    { id: '2', time: '20:00' }  // 
  ]);
  
  const [renewalDate, setRenewalDate] = useState<Date | null>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const dosageUnits = ['mg', 'g', 'ml', 'μg', 'UI', '%'];
  const [selectedUnit, setSelectedUnit] = useState('mg');
  const [showUnitSelector, setShowUnitSelector] = useState(false); 

  const frequencies = [
    'Une fois par jour',
    'Deux fois par jour',
    'Trois fois par jour',
    'Toutes les 12h',
    'Toutes les 8h',
    'Au besoin',
  ];
  const reminderOptions = ['5 minutes', '10 minutes', '15 minutes', '30 minutes', '1 heure', 'Aucun'];
  const [reminderMinutes, setReminderMinutes] = useState('15 minutes'); 
  const [showFrequencyModal, setShowFrequencyModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  
  const addTimeSlot = () => {
    const newId = (Date.now()).toString(); 
    setTimeSlots([...timeSlots, { id: newId, time: '12:00' }]); // CORRECTION: 12:00
  };

  const removeTimeSlot = (id: string) => {
    if (timeSlots.length > 1) {
      setTimeSlots(timeSlots.filter(slot => slot.id !== id));
    } else {
      Alert.alert('Attention', 'Au moins un horaire est requis');
    }
  };

  const updateTimeSlot = (id: string, time: string) => {
    setTimeSlots(timeSlots.map(slot => 
      slot.id === id ? { ...slot, time } : slot
    ));
  };

  // Logique de la date corrigée
  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS !== 'ios') {
        setShowDatePicker(false);
    }
    if (event.type === 'set' || Platform.OS === 'ios') { 
        if (selectedDate) {
            setRenewalDate(selectedDate);
        }
    }
  };

  // CORRECTION: Génération d'horaires en format 24h
  const handleFrequencySelect = (newFrequency: string) => {
    setFrequency(newFrequency);
    setShowFrequencyModal(false); 
    
    let newSlots: TimeSlot[];
    switch (newFrequency) {
        case 'Une fois par jour':
            newSlots = [{ id: '1', time: '08:00' }]; 
            break;
        case 'Deux fois par jour':
            newSlots = [
                { id: '1', time: '08:00' }, 
                { id: '2', time: '20:00' }, 
            ];
            break;
        case 'Trois fois par jour':
            newSlots = [
                { id: '1', time: '08:00' }, 
                { id: '2', time: '14:00' }, 
                { id: '3', time: '20:00' }, 
            ];
            break;
        default:
            newSlots = [{ id: '1', time: '08:00' }]; 
    }
    setTimeSlots(newSlots);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setErrors({});

      const fullDosage = `${dosage.trim()} ${selectedUnit}`;

      const medicationData: Omit<Medication, 'id' | 'status' | 'renewalDaysLeft'> = {
        name: name.trim(),
        dosage: fullDosage,
        frequency,
        timeSlots: timeSlots.map(slot => slot.time),
        renewalDate: renewalDate?.toISOString(),
        notes: notes.trim(),
      };

      const validation = MedicationValidator.validateMedication(medicationData);
      
      if (!validation.valid) {
        setErrors(validation.errors);
        Alert.alert('Erreur', 'Veuillez corriger les erreurs dans le formulaire');
        return;
      }

      await addMedication(medicationData); 

      Alert.alert(
        'Succès',
        'Médicament ajouté avec succès',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Erreur ajout médicament:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter le médicament. Voir la console pour les détails.');
    } finally {
      setLoading(false);
    }
  };

// ----------------------------------------------------------------
// COMPOSANT MODAL DE SÉLECTION GÉNÉRIQUE
// ----------------------------------------------------------------
const SelectionModal = ({
    isVisible,
    onClose,
    options,
    selectedValue,
    onSelect,
    title,
}: {
    isVisible: boolean;
    onClose: () => void;
    options: string[];
    selectedValue: string;
    onSelect: (value: string) => void;
    title: string;
}) => (
    <Modal
        visible={isVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={onClose}
    >
        <TouchableOpacity style={styles.modalOverlay} onPress={onClose}>
            <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
                <Text style={styles.modalTitle}>{title}</Text>
                <ScrollView style={{ maxHeight: 200, width: '100%' }}>
                    {options.map((option) => (
                        <TouchableOpacity
                            key={option}
                            style={styles.modalOption}
                            onPress={() => onSelect(option)}
                        >
                            <Text style={styles.modalOptionText}>{option}</Text>
                            {selectedValue === option && (
                                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                            )}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
                <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
                    <Text style={styles.modalCloseText}>Fermer</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    </Modal>
);

// ----------------------------------------------------------------
// RENDER JSX
// ----------------------------------------------------------------
  return (
    <SafeAreaView style={styles.container}>
      
      {/* Modals de sélection */}
      <SelectionModal
          isVisible={showFrequencyModal}
          onClose={() => setShowFrequencyModal(false)}
          options={frequencies}
          selectedValue={frequency}
          onSelect={handleFrequencySelect}
          title="Sélectionner la Fréquence"
      />

      <SelectionModal
          isVisible={showReminderModal}
          onClose={() => setShowReminderModal(false)}
          options={reminderOptions}
          selectedValue={reminderMinutes}
          onSelect={(value) => {
              setReminderMinutes(value);
              setShowReminderModal(false);
          }}
          title="Rappel avant la prise"
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#FFFFFF" /> 
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ajouter un Médicament</Text>
        <View style={{ width: 24 }} /> 
      </View>

      <ScrollView style={styles.content}>
        
        {/* Nom du médicament */}
        <View style={styles.section}>
          <Text style={styles.label}>Nom du médicament</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            placeholder="Ex: Lisinopril" 
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
          {errors.name && (
            <Text style={styles.errorText}>{errors.name}</Text>
          )}
        </View>

        {/* Dosage */}
        <View style={styles.section}>
          <Text style={styles.label}>Dosage</Text>
          <View style={styles.dosageContainer}>
            <TextInput
              style={[styles.dosageInputNew, errors.dosage && styles.inputError]} 
              placeholder="10" 
              value={dosage}
              onChangeText={setDosage}
              keyboardType="numeric"
            />
            
            {/* SÉLECTEUR D'UNITÉ : Dropdown stylisé */}
            <TouchableOpacity
                style={styles.dosageUnitDropdown} 
                onPress={() => setShowUnitSelector(prev => !prev)}
            >
                <Text style={styles.dosageUnitText}>{selectedUnit}</Text>
                <Ionicons name={showUnitSelector ? "chevron-up" : "chevron-down"} size={18} color="#212121" />
            </TouchableOpacity>
          </View>
          {errors.dosage && (
            <Text style={styles.errorText}>{errors.dosage}</Text>
          )}

          {/* SÉLECTEUR D'UNITÉ : affiché conditionnellement */}
          {showUnitSelector && (
             <View style={styles.unitSelector}>
                {dosageUnits.map(unit => (
                    <TouchableOpacity
                      key={unit}
                      style={[
                        styles.unitButton,
                        selectedUnit === unit && styles.unitButtonActive,
                      ]}
                      onPress={() => {
                          setSelectedUnit(unit);
                          setShowUnitSelector(false); 
                      }}
                    >
                      <Text
                        style={[
                          styles.unitButtonText,
                          selectedUnit === unit && styles.unitButtonTextActive,
                        ]}
                      >
                        {unit}
                      </Text>
                    </TouchableOpacity>
                  ))}
             </View>
          )}
        </View>

        {/* Fréquence (Ouvre le Modal) */}
        <View style={styles.section}>
          <Text style={styles.label}>Fréquence</Text>
          <TouchableOpacity 
              style={styles.frequencyDropdown}
              onPress={() => setShowFrequencyModal(true)} 
          >
              <Text style={styles.frequencyText}>{frequency}</Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Horaires */}
        <View style={styles.section}>
          <Text style={styles.label}>Heures de prise</Text>
          
          {/* Les deux premiers slots (Mise en page à deux colonnes) */}
          <View style={styles.timeSlotsRow}>
            {timeSlots.slice(0, 2).map((slot) => (
                <View key={slot.id} style={styles.timeInputWrapper}>
                    {/* CORRECTION: Placeholder et keyboardType ajustés pour HH:MM */}
                    <TextInput
                        style={styles.timeInputNew}
                        placeholder="HH:MM (24h)" 
                        value={slot.time}
                        onChangeText={(text) => updateTimeSlot(slot.id, text)}
                        keyboardType="numeric"
                        maxLength={5} 
                    />
                    <TouchableOpacity style={styles.timeIcon} 
                        onPress={() => Alert.alert('Sélection d\'heure', `Sélecteur natif pour ${slot.time}`)}>
                        <Ionicons name="time-outline" size={24} color="#666" />
                    </TouchableOpacity>
                </View>
            ))}
            {/* Remplir l'espace s'il n'y a qu'un seul slot */}
            {timeSlots.length === 1 && <View style={{ flex: 1 }}/>}
          </View>

          {/* Slots additionnels (si plus de 2, en liste verticale) */}
          {timeSlots.length > 2 && (
              <View style={{ marginTop: 8 }}>
                  {timeSlots.slice(2).map((slot) => (
                      <View key={slot.id} style={styles.timeSlotContainer}>
                          <View style={styles.timeInputWrapper}>
                              <TextInput
                                  style={styles.timeInputNew}
                                  placeholder="HH:MM (24h)"
                                  value={slot.time}
                                  onChangeText={(text) => updateTimeSlot(slot.id, text)}
                                  keyboardType="numeric"
                                  maxLength={5}
                              />
                              <TouchableOpacity style={styles.timeIcon} 
                                  onPress={() => Alert.alert('Sélection d\'heure', `Sélecteur natif pour ${slot.time}`)}>
                                  <Ionicons name="time-outline" size={24} color="#666" />
                              </TouchableOpacity>
                          </View>
                          <TouchableOpacity
                              style={styles.removeButton}
                              onPress={() => removeTimeSlot(slot.id)}
                          >
                              <Ionicons name="close-circle" size={24} color="#F44336" />
                          </TouchableOpacity>
                      </View>
                  ))}
              </View>
          )}

          {/* Bouton Ajouter un horaire */}
          {timeSlots.length < 5 && ( 
              <TouchableOpacity style={styles.addTimeButton} onPress={addTimeSlot}>
                  <Ionicons name="add-circle-outline" size={20} color="#4CAF50" />
                  <Text style={styles.addTimeButtonText}>Ajouter un horaire</Text>
              </TouchableOpacity>
          )}
          
          {errors.timeSlots && (
            <Text style={styles.errorText}>{errors.timeSlots}</Text>
          )}
        </View>
        
        {/* Rappel avant (Ouvre le Modal) */}
        <View style={styles.section}>
            <Text style={styles.label}>Rappel avant</Text>
            <TouchableOpacity 
                style={styles.frequencyDropdown}
                onPress={() => setShowReminderModal(true)}
            >
                <Text style={styles.frequencyText}>{reminderMinutes}</Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
        </View>

        {/* Instructions / Notes */}
        <View style={styles.section}>
          <Text style={styles.label}>Instructions</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Ex: À prendre avec un repas" 
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
        
        {/* Date de renouvellement (Date Picker) */}
        <View style={styles.section}>
          <Text style={styles.label}>Date de renouvellement (optionnel)</Text>
          <TouchableOpacity
            style={styles.dateButtonNew} 
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonTextNew}>
              {renewalDate 
                ? renewalDate.toLocaleDateString('fr-FR')
                : 'Sélectionner une date'
              }
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#666" />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={renewalDate || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}
          
          {/* Option pour effacer la date */}
          {renewalDate && (
            <TouchableOpacity
              style={styles.clearDateButton}
              onPress={() => setRenewalDate(null)}
            >
              <Text style={styles.clearDateText}>Effacer la date</Text>
            </TouchableOpacity>
          )}
          {errors.renewalDate && (
            <Text style={styles.errorText}>{errors.renewalDate}</Text>
          )}
        </View>

        {/* Bouton d'ajout */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Enregistrement...' : 'Ajouter le médicament'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ----------------------------------------------------------------
// STYLES
// ----------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#4CAF50', // Vert Action / Santé
    borderBottomWidth: 0, 
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '400', 
    color: '#212121',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#212121',
  },
  inputError: {
    borderColor: '#F44336',
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 4,
  },

  // --- Dosage Styles ---
  dosageContainer: {
    flexDirection: 'row', 
    gap: 12, 
    alignItems: 'center',
  },
  dosageInputNew: { 
    flex: 1, 
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#212121',
    height: 48,
  },
  dosageUnitDropdown: { 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    width: 80, 
    height: 48,
  },
  dosageUnitText: {
    fontSize: 16,
    color: '#212121',
    fontWeight: '600',
  },
  unitSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16, 
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  unitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  unitButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  unitButtonText: {
    fontSize: 14,
    color: '#666',
  },
  unitButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // --- Fréquence/Rappel Styles ---
  frequencyDropdown: { 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    height: 48,
  },
  frequencyText: {
    fontSize: 16,
    color: '#212121',
  },

  // --- Horaires Styles ---
  timeSlotsRow: { 
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  timeSlotContainer: { 
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  timeInputWrapper: { 
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#E0E0E0',
      borderRadius: 8,
      paddingRight: 8, 
      height: 48,
  },
  timeInputNew: { 
    flex: 1,
    padding: 12,
    fontSize: 16,
    borderWidth: 0, 
  },
  timeIcon: {
    padding: 4,
  },
  removeButton: {
    padding: 4,
  },
  addTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderStyle: 'dashed',
    gap: 8,
    marginTop: 16,
  },
  addTimeButtonText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // --- Date Styles ---
  dateButtonNew: { 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    height: 48,
  },
  dateButtonTextNew: {
    fontSize: 16,
    color: '#212121', 
  },
  clearDateButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  clearDateText: {
    color: '#F44336',
    fontSize: 14,
  },
  
  // --- Autres ---
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  buttonContainer: {
    marginTop: 24,
    marginBottom: 32,
  },
  submitButton: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  // --- Styles Modal ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
    color: '#212121',
  },
  modalOption: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
  },
  modalCloseButton: {
    marginTop: 20,
    padding: 10,
  },
  modalCloseText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: '600',
  },
});