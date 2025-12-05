// ============================================
// SERVICE DE NOTIFICATIONS
// ============================================

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class NotificationService {
  // Demander les permissions
  static async requestPermissions() {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      throw new Error('Permission de notification refusée');
    }
    
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('medication', {
        name: 'Rappels de médicaments',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4CAF50',
      });
    }
    
    return finalStatus;
  }

  // Planifier une notification pour un médicament
  static async scheduleMedicationReminder(medication: {
    id: string;
    name: string;
    dosage: string;
    time: string; // Format "HH:MM"
  }) {
    try {
      // Parser l'heure
      const [hours, minutes] = medication.time.split(':').map(Number);
      
      // Créer la date de la prochaine notification
      const trigger = new Date();
      trigger.setHours(hours, minutes, 0, 0);
      
      // Si l'heure est déjà passée aujourd'hui, planifier pour demain
      if (trigger < new Date()) {
        trigger.setDate(trigger.getDate() + 1);
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '💊 Rappel de médicament',
          body: `Il est temps de prendre ${medication.name} (${medication.dosage})`,
          data: { 
            medicationId: medication.id,
            type: 'medication_reminder' 
          },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
        },
        trigger: {
          channelId: 'medication',
          hour: hours,
          minute: minutes,
          repeats: true, // Répéter quotidiennement
        },
      });

      // Sauvegarder l'ID de notification
      await this.saveNotificationId(medication.id, notificationId);
      
      return notificationId;
    } catch (error) {
      console.error('Erreur planification notification:', error);
      throw error;
    }
  }

  // Annuler une notification
  static async cancelMedicationReminder(medicationId: string) {
    try {
      const notificationId = await this.getNotificationId(medicationId);
      if (notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        await this.removeNotificationId(medicationId);
      }
    } catch (error) {
      console.error('Erreur annulation notification:', error);
    }
  }

  // Mettre à jour une notification existante
  static async updateMedicationReminder(medication: {
    id: string;
    name: string;
    dosage: string;
    time: string;
  }) {
    await this.cancelMedicationReminder(medication.id);
    return await this.scheduleMedicationReminder(medication);
  }

  // Planifier un rappel de renouvellement
  static async scheduleRenewalReminder(medication: {
    id: string;
    name: string;
    renewalDate: Date;
  }) {
    const reminderDate = new Date(medication.renewalDate);
    reminderDate.setDate(reminderDate.getDate() - 7); // 7 jours avant

    if (reminderDate < new Date()) {
      return null; // Trop tard pour rappeler
    }

    return await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔄 Renouvellement nécessaire',
        body: `Pensez à renouveler votre ordonnance pour ${medication.name}`,
        data: { 
          medicationId: medication.id,
          type: 'renewal_reminder' 
        },
      },
      trigger: reminderDate,
    });
  }

  // Sauvegarder l'ID de notification
  private static async saveNotificationId(medicationId: string, notificationId: string) {
    const key = `notification_${medicationId}`;
    await AsyncStorage.setItem(key, notificationId);
  }

  // Récupérer l'ID de notification
  private static async getNotificationId(medicationId: string): Promise<string | null> {
    const key = `notification_${medicationId}`;
    return await AsyncStorage.getItem(key);
  }

  // Supprimer l'ID de notification
  private static async removeNotificationId(medicationId: string) {
    const key = `notification_${medicationId}`;
    await AsyncStorage.removeItem(key);
  }

  // Obtenir toutes les notifications planifiées
  static async getAllScheduledNotifications() {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  // Annuler toutes les notifications
  static async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}