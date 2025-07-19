import ApiService from './ApiService';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

export interface KafkaNotificationMessage {
  type: 'NO_PHOTOS_REMINDER' | 'PHOTO_REMINDER' | 'TEST_NOTIFICATION';
  userId?: string;
  productId?: string;
  productTitle?: string;
  message: string;
  delayMinutes?: number;
  priority: 'low' | 'medium' | 'high';
  timestamp: string;
}

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: boolean;
  badge?: number;
}

class KafkaNotificationService {
  private baseUrl = '/api/notifications'; // Utiliser l'endpoint existant
  private isConnected = false;

  // Initialiser la connexion Kafka
  async initializeKafkaConnection(): Promise<boolean> {
    // Pour l'instant, utiliser uniquement les notifications locales
    // TODO: Implémenter la connexion Kafka quand le backend sera prêt
    console.log('[KafkaNotificationService] Mode local activé - notifications locales uniquement');
    this.isConnected = false;
    return false;
  }

  // Envoyer un message à Kafka pour notification
  async sendNotificationToKafka(message: KafkaNotificationMessage): Promise<boolean> {
    if (!this.isConnected) {
      console.log('[KafkaNotificationService] Kafka non connecté, notification locale');
      return this.sendLocalNotification(message);
    }

    try {
      await ApiService.post(`${this.baseUrl}/send`, message, false);
      console.log('[KafkaNotificationService] Message envoyé à Kafka:', message.type);
      return true;
    } catch (error) {
      console.error('[KafkaNotificationService] Erreur envoi Kafka:', error);
      // Fallback vers notification locale
      return this.sendLocalNotification(message);
    }
  }

  // Notification locale en fallback
  private async sendLocalNotification(message: KafkaNotificationMessage): Promise<boolean> {
    try {
      const payload = this.createNotificationPayload(message);
      await Notifications.scheduleNotificationAsync({
        content: payload,
        trigger: null, // Notification immédiate
      });
      console.log('[KafkaNotificationService] Notification locale envoyée:', message.type);
      return true;
    } catch (error) {
      console.error('[KafkaNotificationService] Erreur notification locale:', error);
      return false;
    }
  }

  // Créer le payload de notification selon le type
  private createNotificationPayload(message: KafkaNotificationMessage): NotificationPayload {
    switch (message.type) {
      case 'NO_PHOTOS_REMINDER':
        return {
          title: 'Ajoutez des photos à votre annonce',
          body: message.message,
          data: { 
            productId: message.productId,
            productTitle: message.productTitle,
            type: 'NO_PHOTOS_REMINDER'
          },
          sound: true,
          badge: 1,
        };

      case 'PHOTO_REMINDER':
        return {
          title: 'Rappel : Photos de votre annonce',
          body: message.message,
          data: { 
            productId: message.productId,
            productTitle: message.productTitle,
            type: 'PHOTO_REMINDER'
          },
          sound: true,
          badge: 1,
        };

      case 'TEST_NOTIFICATION':
        return {
          title: 'Test de notification',
          body: message.message,
          data: { type: 'TEST_NOTIFICATION' },
          sound: false,
        };

      default:
        return {
          title: 'Notification Souqly',
          body: message.message,
          data: { type: message.type },
        };
    }
  }

  // Notifier qu'une annonce a été publiée sans photos
  async notifyNoPhotosInAd(productTitle: string, productId?: string, userId?: string): Promise<boolean> {
    const message: KafkaNotificationMessage = {
      type: 'NO_PHOTOS_REMINDER',
      userId,
      productId,
      productTitle,
      message: `Votre annonce "${productTitle}" a été publiée sans photos. Ajoutez des photos pour augmenter vos chances de vente !`,
      priority: 'medium',
      timestamp: new Date().toISOString(),
    };

    return this.sendNotificationToKafka(message);
  }

  // Programmer un rappel pour ajouter des photos
  async schedulePhotoReminder(productTitle: string, delayMinutes: number, productId?: string, userId?: string): Promise<boolean> {
    const message: KafkaNotificationMessage = {
      type: 'PHOTO_REMINDER',
      userId,
      productId,
      productTitle,
      message: `N'oubliez pas d'ajouter des photos à votre annonce "${productTitle}" pour attirer plus d'acheteurs !`,
      delayMinutes,
      priority: 'low',
      timestamp: new Date().toISOString(),
    };

    return this.sendNotificationToKafka(message);
  }

  // Envoyer une notification de test
  async sendTestNotification(): Promise<boolean> {
    const message: KafkaNotificationMessage = {
      type: 'TEST_NOTIFICATION',
      message: 'Ceci est une notification de test pour vérifier que tout fonctionne correctement.',
      priority: 'low',
      timestamp: new Date().toISOString(),
    };

    return this.sendNotificationToKafka(message);
  }

  // Configurer les notifications push
  async registerForPushNotificationsAsync(): Promise<string | undefined> {
    let token;

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Permissions de notifications non accordées');
        return;
      }
      
      token = (await Notifications.getExpoPushTokenAsync()).data;
      
      // Enregistrer le token auprès du serveur Kafka
      if (token && this.isConnected) {
        try {
          await ApiService.post(`${this.baseUrl}/register-token`, { token }, false);
          console.log('[KafkaNotificationService] Token enregistré auprès du serveur');
        } catch (error) {
          console.error('[KafkaNotificationService] Erreur enregistrement token:', error);
        }
      }
    } else {
      console.log('Notifications push non disponibles sur l\'émulateur');
    }

    return token;
  }

  // Vérifier si les notifications sont activées
  async areNotificationsEnabled(): Promise<boolean> {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  }

  // Demander les permissions
  async requestPermissions(): Promise<boolean> {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }

  // Écouter les notifications reçues
  setupNotificationListener(): void {
    Notifications.addNotificationReceivedListener(notification => {
      console.log('[KafkaNotificationService] Notification reçue:', notification);
      
      // Traiter les données de la notification
      const data = notification.request.content.data;
      if (data?.type === 'NO_PHOTOS_REMINDER' || data?.type === 'PHOTO_REMINDER') {
        // Navigation vers l'écran d'édition du produit si nécessaire
        console.log('[KafkaNotificationService] Notification de rappel photos reçue');
      }
    });

    Notifications.addNotificationResponseReceivedListener(response => {
      console.log('[KafkaNotificationService] Réponse à la notification:', response);
      
      // Traiter l'action de l'utilisateur
      const data = response.notification.request.content.data;
      if (data?.productId) {
        // Navigation vers le produit spécifique
        console.log('[KafkaNotificationService] Navigation vers le produit:', data.productId);
      }
    });
  }

  // Obtenir le statut de connexion Kafka
  getKafkaStatus(): boolean {
    return this.isConnected;
  }
}

export default new KafkaNotificationService(); 