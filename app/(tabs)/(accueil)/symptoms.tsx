import React, { useState } from 'react';
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
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SymptomSelector } from '@/components/symptom-selector';
import { GuideBox } from '@/components/guide-box';
import { HistoryCard } from '@/components/history-card';

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

export default function SymptomsScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSymptom, setSelectedSymptom] = useState('');
  const [severity, setSeverity] = useState(5);
  const [notes, setNotes] = useState('');

  const getSeverityColor = (value: number) => {
    if (value <= 3) return '#00B341';
    if (value <= 6) return '#FF9500';
    return '#FF3B30';
  };

  const handleSave = () => {
    console.log({ selectedSymptom, severity, notes });
    setModalVisible(false);
    setSelectedSymptom('');
    setSeverity(5);
    setNotes('');
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView style={{ padding: 16 }} showsVerticalScrollIndicator={false}>
        {/* Bouton d'ajout principal */}
        <TouchableOpacity style={styles.mainAddBtn} onPress={() => setModalVisible(true)}>
          <IconSymbol name='plus' color="white" size={20} />
          <ThemedText style={styles.whiteBtnText}>Nouveau Symptôme</ThemedText>
        </TouchableOpacity>

        {/* Card Historique avec Shadow */}
        <View style={styles.card}>
          <ThemedText type="defaultSemiBold" style={{ marginBottom: 12 }}>Dernier relevé</ThemedText>
          <HistoryCard
            title="Maux de tête"
            date="24 Nov 14:30"
            severity={6}
            note="Douleur pulsatile au niveau frontal"
          />
        </View>

        {/* Card Guide avec Shadow */}
        <View style={styles.card}>
          <ThemedText type="defaultSemiBold" style={{ marginBottom: 16 }}>
            Guide de l'Échelle
          </ThemedText>
          <GuideBox variant="light" range="1-3 : Léger" desc="N'interfère pas avec les activités" />
          <GuideBox variant="moderate" range="4-6 : Modéré" desc="Interfère avec certaines activités" />
          <GuideBox variant="severe" range="7-10 : Sévère" desc="Empêche les activités normales" />
        </View>
      </ScrollView>

      {/* MODAL / BOTTOM SHEET SYNCHRONISÉE AU CLAVIER */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContentWrapper}
          >
            <View style={styles.modalBody}>
              {/* Header fixe */}
              <View style={styles.modalHeader}>
                <ThemedText type="subtitle" style={styles.headerTitle}>Enregistrer un Symptôme</ThemedText>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                  <IconSymbol name='xmark' color="#000" size={18} />
                </TouchableOpacity>
              </View>

              {/* Contenu scrollable */}
              <ScrollView 
                showsVerticalScrollIndicator={false} 
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 20 }}
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

              {/* Footer avec Bouton (Poussé par le clavier) */}
              <View style={styles.footer}>
                <TouchableOpacity
                  style={[styles.saveBtn, !selectedSymptom && { opacity: 0.5 }]}
                  onPress={handleSave}
                  disabled={!selectedSymptom}
                >
                  <ThemedText style={styles.saveBtnText}>Enregistrer</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  mainAddBtn: {
    backgroundColor: '#00B341',
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      android: { elevation: 3 },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
    }),
  },
  whiteBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
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
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24
  },
  headerTitle: { 
    fontWeight: '700', 
    fontSize: 18 
  },
  closeBtn: { backgroundColor: '#F0F0F0', padding: 8, borderRadius: 20 },
  label: { fontSize: 15, color: '#4A5568', marginBottom: 12, fontWeight: '500' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 10 },
  slider: { width: '100%', height: 40 },
  severityStatusRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  statusText: { fontSize: 14, fontWeight: '600' },
  numberRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  numBox: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#F0F4F8', justifyContent: 'center', alignItems: 'center' },
  numLabel: { fontSize: 12, fontWeight: '700', color: '#718096' },
  textArea: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 15,
    backgroundColor: '#FFFFFF',
    marginBottom: 10
  },
  footer: {
    paddingVertical: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingBottom: Platform.OS === 'ios' ? 34 : 15 
  },
  saveBtn: { backgroundColor: '#00B341', padding: 18, borderRadius: 14, alignItems: 'center' },
  saveBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});
