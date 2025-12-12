// /services/notificationService.ts

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Clé spécifique pour le stockage des IDs de notification de PRISE (tableau)
const NOTIFICATION_IDS_KEY = (medicationId: string) => `med_notif_ids_${medicationId}`;
// Clé spécifique pour le stockage de l'ID de notification de RENOUVELLEMENT (single)
const RENEWAL_NOTIF_ID_KEY = (medicationId: string) => `renewal_notif_id_${medicationId}`;

// Configuration globale des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class NotificationService {
  /**
   * Demande les permissions et configure le canal Android.
   */
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
        sound: 'default',
      });
    }

    return finalStatus;
  }

  /**
   * Planifie une notification récurrente de prise de médicament (un seul horaire).
   */
  static async scheduleMedicationReminder(medication: {
    id: string;
    name: string;
    dosage: string;
    time: string; // "HH:MM"
  }): Promise<string> {
    try {
      const [hours, minutes] = medication.time.split(':').map(Number);

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '💊 Rappel de médicament',
          body: `Il est temps de prendre ${medication.name} (${medication.dosage})`,
          data: {
            medicationId: medication.id,
            type: 'medication_reminder',
            timeSlot: medication.time,
          },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.MAX,
        },
        trigger: {
          hour: hours,
          minute: minutes,
          repeats: true,
          channelId: Platform.OS === 'android' ? 'medication' : undefined,
        },
      });

      await this.saveNotificationId(medication.id, notificationId);
      return notificationId;
    } catch (error) {
      console.error('Erreur planification notification:', error);
      throw error;
    }
  }

  /**
   * Annule TOUTES les notifications de prise pour un médicament et nettoie le stockage local.
   * La correction de robustesse est ici : toujours nettoyer AsyncStorage même si l'annulation OS échoue.
   */
  static async cancelMedicationReminder(medicationId: string) {
    try {
      const notificationIds = await this.getNotificationIds(medicationId);
      if (notificationIds && notificationIds.length > 0) {
        for (const id of notificationIds) {
          // Tentative d'annulation sur l'OS
          await Notifications.cancelScheduledNotificationAsync(id);
        }
      }
    } catch (error) {
      // Log en cas d'erreur (ex: l'ID n'existe plus dans l'OS), mais on continue.
      console.error(
        `Erreur partielle d'annulation pour ${medicationId}. Nettoyage du stockage forcé.`, 
        error
      );
    } finally {
      // ÉTAPE CRUCIALE : On retire les IDs de notre stockage pour éviter la double planification future.
      await this.removeAllNotificationIds(medicationId);
    }
  }

  /**
   * Annule les anciennes notifications de prise et replanifie les nouvelles.
   */
  static async updateMedicationReminders(medication: {
    id: string;
    name: string;
    dosage: string;
    timeSlots: string[];
  }) {
    // 1. Annule et nettoie toutes les anciennes références
    await this.cancelMedicationReminder(medication.id);
    
    // 2. Replanifie tous les nouveaux rappels
    for (const time of medication.timeSlots) {
      await this.scheduleMedicationReminder({
        id: medication.id,
        name: medication.name,
        dosage: medication.dosage,
        time,
      });
    }
  }


  /**
   * Planifie un rappel de renouvellement unique (7 jours avant la date).
   */
  static async scheduleRenewalReminder(medication: {
    id: string;
    name: string;
    renewalDate: Date;
  }) {
    await this.cancelRenewalReminder(medication.id);

    const reminderDate = new Date(medication.renewalDate);
    reminderDate.setDate(reminderDate.getDate() - 7); 
    reminderDate.setHours(10, 0, 0, 0); 

    if (reminderDate < new Date()) {
      return null;
    }

    const renewalNotificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔄 Renouvellement nécessaire',
        body: `Pensez à renouveler votre ordonnance pour ${medication.name}`,
        data: {
          medicationId: medication.id,
          type: 'renewal_reminder',
        },
        sound: 'default',
      },
      trigger: reminderDate,
    });
    
    await AsyncStorage.setItem(RENEWAL_NOTIF_ID_KEY(medication.id), renewalNotificationId);
    
    return renewalNotificationId;
  }
  
  /**
   * Annule le rappel de renouvellement unique.
   */
  static async cancelRenewalReminder(medicationId: string) {
      const renewalId = await AsyncStorage.getItem(RENEWAL_NOTIF_ID_KEY(medicationId));
      if (renewalId) {
          await Notifications.cancelScheduledNotificationAsync(renewalId);
          await AsyncStorage.removeItem(RENEWAL_NOTIF_ID_KEY(medicationId));
      }
  }
  
  // ============================================
  // Fonctions internes de gestion d'AsyncStorage
  // ============================================

  /**
   * Sauvegarde un ID de notification dans le tableau pour le médicament.
   */
  private static async saveNotificationId(medicationId: string, newNotificationId: string) {
    const key = NOTIFICATION_IDS_KEY(medicationId);
    const data = await AsyncStorage.getItem(key);
    const ids: string[] = data ? JSON.parse(data) : [];
    
    ids.push(newNotificationId);
    await AsyncStorage.setItem(key, JSON.stringify(ids));
  }

  /**
   * Récupère tous les IDs de notification pour le médicament.
   */
  private static async getNotificationIds(medicationId: string): Promise<string[] | null> {
    const key = NOTIFICATION_IDS_KEY(medicationId);
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Supprime toutes les références d'IDs de notification pour le médicament dans AsyncStorage.
   */
  private static async removeAllNotificationIds(medicationId: string) {
    const key = NOTIFICATION_IDS_KEY(medicationId);
    await AsyncStorage.removeItem(key);
  }
  
  /**
   * [OUTIL DE DÉBOGAGE] Annule TOUTES les notifications planifiées dans l'OS et vide notre stockage interne.
   * Doit être appelé UNE FOIS pour nettoyer l'état après une erreur de double planification.
   */
  static async resetAllNotificationsAndStorage() {
      console.log("--- RESET TOTAL DES NOTIFICATIONS ---");
      console.log("Annulation de TOUTES les notifications OS...");
      await Notifications.cancelAllScheduledNotificationsAsync(); 
      
      console.log("Nettoyage du stockage local...");
      try {
          const keys = await AsyncStorage.getAllKeys();
          const notificationKeys = keys.filter(key => 
              key.startsWith('med_notif_ids_') || key.startsWith('renewal_notif_id_')
          );
          if (notificationKeys.length > 0) {
              await AsyncStorage.multiRemove(notificationKeys);
          }
      } catch (error) {
          console.error("Erreur lors du nettoyage d'AsyncStorage:", error);
      }
      console.log("--- RESET TERMINÉ. Replanifiez les médicaments ---");
  }
}