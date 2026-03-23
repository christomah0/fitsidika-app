import { AppSymptomHistoryCard } from '@/components/app-symptom-history-card';
import { GuideBox } from '@/components/guide-box';
import { SymptomSelector } from '@/components/symptom-selector';
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import Slider from '@react-native-community/slider';
import React, { useCallback, useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '@/hooks/use-auth';
import { createPatientSymptom, getLast2Symptoms } from '@/services/firebase/firestoreServices';
import { Symptom } from '@/types/symptom.type';
import { formatTime } from '@/utils/date-format';
import { useFocusEffect } from 'expo-router';
import Toast from 'react-native-toast-message';

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
  const { user } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSymptom, setSelectedSymptom] = useState('');
  const [severity, setSeverity] = useState(5);
  const [notes, setNotes] = useState('');
  const [recentSymptoms, setRecentSymptoms] = useState<Symptom[]>([]);
  const [saving, setSaving] = useState(false);

  const loadRecentSymptoms = useCallback(async () => {
    if (!user) return;
    try {
      const symptoms = await getLast2Symptoms(user.id);
      setRecentSymptoms(symptoms);
    } catch (err) {
      console.error('Error loading symptoms:', err);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadRecentSymptoms();
    }, [loadRecentSymptoms])
  );

  const getSeverityColor = (value: number) => {
    if (value <= 3) return '#00B341';
    if (value <= 6) return '#FF9500';
    return '#FF3B30';
  };

  const handleSave = async () => {
    if (!user || !selectedSymptom) return;
    setSaving(true);
    try {
      const symptomLabel = SYMPTOMS.find(s => s.id === selectedSymptom)?.label || 'Symptôme';
      await createPatientSymptom(user.id, {
        title: symptomLabel,
        date: new Date(),
        severity,
        notes: notes.trim() || undefined,
      });
      Toast.show({ type: 'success', text1: 'Enregistré', text2: 'Symptôme enregistré avec succès.', position: 'bottom' });
      setModalVisible(false);
      setSelectedSymptom('');
      setSeverity(5);
      setNotes('');
      loadRecentSymptoms();
    } catch (err) {
      console.error('Error saving symptom:', err);
      Toast.show({ type: 'error', text1: 'Erreur', text2: "Échec de l'enregistrement.", position: 'bottom' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView style={{ padding: 16 }} showsVerticalScrollIndicator={false}>
        {/* Main Action Button */}
        <TouchableOpacity style={styles.mainAddBtn} onPress={() => setModalVisible(true)}>
          <IconSymbol name='plus' color="white" size={20} />
          <ThemedText style={styles.whiteBtnText}>Nouveau Symptôme</ThemedText>
        </TouchableOpacity>

        {/* Recent Symptoms */}
        <View style={styles.card}>
          <ThemedText type="defaultSemiBold" style={{ marginBottom: 12 }}>Derniers relevés</ThemedText>
          {recentSymptoms.length > 0 ? (
            recentSymptoms.map(s => (
              <AppSymptomHistoryCard
                key={s.id}
                title={s.title}
                date={formatTime(s.date)}
                severity={s.severity}
                note={s.notes ?? ''}
              />
            ))
          ) : (
            <ThemedText style={{ color: '#9CA3AF', textAlign: 'center', paddingVertical: 16 }}>
              Aucun symptôme enregistré
            </ThemedText>
          )}
        </View>

        {/* Guide Card */}
        <View style={styles.card}>
          <ThemedText type="defaultSemiBold" style={{ marginBottom: 16 }}>
            Guide de l'Échelle
          </ThemedText>
          <GuideBox variant="light" range="1-3 : Léger" desc="N'interfère pas avec les activités" />
          <GuideBox variant="moderate" range="4-6 : Modéré" desc="Interfère avec certaines activités" />
          <GuideBox variant="severe" range="7-10 : Sévère" desc="Empêche les activités normales" />
        </View>
      </ScrollView>

      {/* MODAL */}
      <Modal visible={modalVisible} animationType="slide" transparent statusBarTranslucent>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContentWrapper}
          >
            <View style={styles.modalBody}>
              <View style={styles.modalHeader}>
                <ThemedText type="subtitle" style={styles.headerTitle}>Enregistrer un Symptôme</ThemedText>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
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
                  style={[styles.saveBtn, (!selectedSymptom || saving) && { opacity: 0.5 }]}
                  onPress={handleSave}
                  disabled={!selectedSymptom || saving}
                >
                  <ThemedText style={styles.saveBtnText}>
                    {saving ? 'Enregistrement...' : 'Enregistrer'}
                  </ThemedText>
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
    backgroundColor: Colors.light.tint,
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
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContentWrapper: { width: '100%', height: '88%' },
  modalBody: { flex: 1, backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32 },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  headerTitle: { fontWeight: '700', fontSize: 20, color: '#1e293b' },
  closeBtn: { backgroundColor: '#F0F0F0', padding: 8, borderRadius: 20 },
  scrollContainer: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 20 },
  label: { fontSize: 15, color: '#4A5568', marginBottom: 12, fontWeight: '500' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 10 },
  slider: { width: '100%', height: 40 },
  severityStatusRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  statusText: { fontSize: 14, fontWeight: '600' },
  numberRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  numBox: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#F0F4F8', justifyContent: 'center', alignItems: 'center' },
  numLabel: { fontSize: 12, fontWeight: '700', color: '#718096' },
  textArea: {
    borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 12,
    minHeight: 100, textAlignVertical: 'top', fontSize: 15, backgroundColor: '#FFFFFF', marginBottom: 10
  },
  footer: {
    paddingHorizontal: 20, paddingVertical: 12, backgroundColor: 'white',
    borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingBottom: Platform.OS === 'ios' ? 34 : 15
  },
  saveBtn: { backgroundColor: Colors.light.tint, padding: 18, borderRadius: 14, alignItems: 'center' },
  saveBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});
