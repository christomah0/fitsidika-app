// ============================================
// FORMULAIRE D'AJOUT DE MÉDICAMENT
// ============================================

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MedicationValidator } from '../../../services/validation'
import { MedicationService } from '../../../services/medicationService';

interface TimeSlot {
  id: string;
  time: string;
}

export default function AddMedicationScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('Quotidien');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    { id: '1', time: '08:00' }
  ]);
  const [renewalDate, setRenewalDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Unités de dosage communes
  const dosageUnits = ['mg', 'g', 'ml', 'μg', 'UI', '%'];
  const [selectedUnit, setSelectedUnit] = useState('mg');

  // Fréquences communes
  const frequencies = [
    'Une fois par jour',
    'Deux fois par jour',
    'Trois fois par jour',
    'Toutes les 12h',
    'Toutes les 8h',
    'Au besoin',
  ];

  // Ajouter un créneau horaire
  const addTimeSlot = () => {
    const newId = (timeSlots.length + 1).toString();
    setTimeSlots([...timeSlots, { id: newId, time: '12:00' }]);
  };

  // Supprimer un créneau horaire
  const removeTimeSlot = (id: string) => {
    if (timeSlots.length > 1) {
      setTimeSlots(timeSlots.filter(slot => slot.id !== id));
    } else {
      Alert.alert('Attention', 'Au moins un horaire est requis');
    }
  };

  // Mettre à jour un créneau horaire
  const updateTimeSlot = (id: string, time: string) => {
    setTimeSlots(timeSlots.map(slot => 
      slot.id === id ? { ...slot, time } : slot
    ));
  };

  // Valider et soumettre le formulaire
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setErrors({});

      // Construire le dosage complet
      const fullDosage = `${dosage} ${selectedUnit}`;

      // Préparer les données
      const medicationData = {
        name: name.trim(),
        dosage: fullDosage,
        frequency,
        timeSlots: timeSlots.map(slot => slot.time),
        renewalDate: renewalDate?.toISOString(),
        notes: notes.trim(),
        status: 'pending' as const,
      };

      // Valider
      const validation = MedicationValidator.validateMedication(medicationData);
      
      if (!validation.valid) {
        setErrors(validation.errors);
        Alert.alert('Erreur', 'Veuillez corriger les erreurs dans le formulaire');
        return;
      }

      // Sauvegarder
      await MedicationService.addMedication(medicationData);

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
      Alert.alert('Erreur', 'Impossible d\'ajouter le médicament');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#212121" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ajouter un Médicament</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Nom du médicament */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Nom du médicament <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            placeholder="Ex: Aspirine, Metformine"
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
          <Text style={styles.label}>
            Dosage <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.dosageContainer}>
            <TextInput
              style={[styles.dosageInput, errors.dosage && styles.inputError]}
              placeholder="500"
              value={dosage}
              onChangeText={setDosage}
              keyboardType="numeric"
            />
            <View style={styles.unitSelector}>
              {dosageUnits.map(unit => (
                <TouchableOpacity
                  key={unit}
                  style={[
                    styles.unitButton,
                    selectedUnit === unit && styles.unitButtonActive,
                  ]}
                  onPress={() => setSelectedUnit(unit)}
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
          </View>
          {errors.dosage && (
            <Text style={styles.errorText}>{errors.dosage}</Text>
          )}
        </View>

        {/* Fréquence */}
        <View style={styles.section}>
          <Text style={styles.label}>Fréquence</Text>
          <View style={styles.frequencyContainer}>
            {frequencies.map(freq => (
              <TouchableOpacity
                key={freq}
                style={[
                  styles.frequencyButton,
                  frequency === freq && styles.frequencyButtonActive,
                ]}
                onPress={() => setFrequency(freq)}
              >
                <Text
                  style={[
                    styles.frequencyButtonText,
                    frequency === freq && styles.frequencyButtonTextActive,
                  ]}
                >
                  {freq}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Horaires */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Horaires de prise <Text style={styles.required}>*</Text>
          </Text>
          {timeSlots.map((slot, index) => (
            <View key={slot.id} style={styles.timeSlotContainer}>
              <View style={styles.timeSlotNumber}>
                <Text style={styles.timeSlotNumberText}>{index + 1}</Text>
              </View>
              <TextInput
                style={styles.timeInput}
                placeholder="HH:MM"
                value={slot.time}
                onChangeText={(text) => updateTimeSlot(slot.id, text)}
                keyboardType="numbers-and-punctuation"
                maxLength={5}
              />
              {timeSlots.length > 1 && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeTimeSlot(slot.id)}
                >
                  <Ionicons name="close-circle" size={24} color="#F44336" />
                </TouchableOpacity>
              )}
            </View>
          ))}
          <TouchableOpacity style={styles.addTimeButton} onPress={addTimeSlot}>
            <Ionicons name="add-circle-outline" size={20} color="#4CAF50" />
            <Text style={styles.addTimeButtonText}>Ajouter un horaire</Text>
          </TouchableOpacity>
          {errors.timeSlots && (
            <Text style={styles.errorText}>{errors.timeSlots}</Text>
          )}
        </View>

        {/* Date de renouvellement */}
        <View style={styles.section}>
          <Text style={styles.label}>Date de renouvellement (optionnel)</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color="#666" />
            <Text style={styles.dateButtonText}>
              {renewalDate 
                ? renewalDate.toLocaleDateString('fr-FR')
                : 'Sélectionner une date'
              }
            </Text>
          </TouchableOpacity>
          {renewalDate && (
            <TouchableOpacity
              style={styles.clearDateButton}
              onPress={() => setRenewalDate(null)}
            >
              <Text style={styles.clearDateText}>Effacer la date</Text>
            </TouchableOpacity>
          )}
          {showDatePicker && (
            <DateTimePicker
              value={renewalDate || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (selectedDate) {
                  setRenewalDate(selectedDate);
                }
              }}
              minimumDate={new Date()}
            />
          )}
          {errors.renewalDate && (
            <Text style={styles.errorText}>{errors.renewalDate}</Text>
          )}
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.label}>Notes (optionnel)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Instructions spéciales, contre-indications..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Boutons d'action */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Enregistrement...' : 'Ajouter'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
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
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  required: {
    color: '#F44336',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#F44336',
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 4,
  },
  dosageContainer: {
    gap: 12,
  },
  dosageInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  unitSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
  frequencyContainer: {
    gap: 8,
  },
  frequencyButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  frequencyButtonActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  frequencyButtonText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  frequencyButtonTextActive: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  timeSlotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  timeSlotNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeSlotNumberText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  timeInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
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
  },
  addTimeButtonText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#666',
  },
  clearDateButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  clearDateText: {
    color: '#F44336',
    fontSize: 14,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 32,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  submitButton: {
    flex: 1,
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
});