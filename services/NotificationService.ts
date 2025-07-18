import ApiService from './ApiService';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: string;
  isRead: boolean;
  productId?: number;
  conversationId?: string;
}

// Données mockées par défaut
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Nouvelle offre reçue',
    message: 'Jean Dupont vous a fait une offre de 150€ pour votre iPhone',
    type: 'info',
    timestamp: 'Il y a 2h',
    isRead: false,
    productId: 123,
  },
  {
    id: '2',
    title: 'Message non lu',
    message: 'Vous avez 3 messages non lus de Sophie Martin',
    type: 'warning',
    timestamp: 'Il y a 4h',
    isRead: false,
    conversationId: 'conv_456',
  },
  {
    id: '3',
    title: 'Produit vendu',
    message: 'Félicitations ! Votre Nike Air Max a été vendue',
    type: 'success',
    timestamp: 'Hier',
    isRead: true,
    productId: 789,
  },
  {
    id: '4',
    title: 'Annonce expirée',
    message: 'Votre annonce "Samsung Galaxy" a expiré',
    type: 'error',
    timestamp: 'Il y a 2 jours',
    isRead: true,
    productId: 456,
  },
];

class NotificationService {
  private baseUrl = '/notifications';

  // Récupérer toutes les notifications de l'utilisateur
  async getNotifications(): Promise<Notification[]> {
    try {
      // Pour l'instant, on utilise les données mockées car l'API n'existe pas encore
      console.log('[NotificationService] Utilisation des données mockées (API non disponible)');
      return MOCK_NOTIFICATIONS;
      
      // TODO: Décommenter quand l'API sera disponible
      // return await ApiService.get<Notification[]>(this.baseUrl, true);
    } catch (error) {
      console.error('[NotificationService] Erreur lors de la récupération des notifications:', error);
      console.log('[NotificationService] Retour aux données mockées');
      return MOCK_NOTIFICATIONS;
    }
  }

  // Marquer une notification comme lue
  async markAsRead(notificationId: string): Promise<void> {
    try {
      // TODO: Décommenter quand l'API sera disponible
      // await ApiService.post(`${this.baseUrl}/${notificationId}/read`, {}, true);
      console.log(`[NotificationService] Notification ${notificationId} marquée comme lue (mock)`);
    } catch (error) {
      console.error('[NotificationService] Erreur lors du marquage comme lu:', error);
    }
  }

  // Marquer toutes les notifications comme lues
  async markAllAsRead(): Promise<void> {
    try {
      // TODO: Décommenter quand l'API sera disponible
      // await ApiService.post(`${this.baseUrl}/read-all`, {}, true);
      console.log('[NotificationService] Toutes les notifications marquées comme lues (mock)');
    } catch (error) {
      console.error('[NotificationService] Erreur lors du marquage de toutes comme lues:', error);
    }
  }

  // Supprimer une notification
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      // TODO: Décommenter quand l'API sera disponible
      // await ApiService.delete(`${this.baseUrl}/${notificationId}`, true);
      console.log(`[NotificationService] Notification ${notificationId} supprimée (mock)`);
    } catch (error) {
      console.error('[NotificationService] Erreur lors de la suppression:', error);
    }
  }

  // Obtenir le nombre de notifications non lues
  async getUnreadCount(): Promise<number> {
    try {
      // Pour l'instant, on compte les notifications mockées non lues
      const notifications = await this.getNotifications();
      return notifications.filter(n => !n.isRead).length;
      
      // TODO: Décommenter quand l'API sera disponible
      // const response = await ApiService.get<{ count: number }>(`${this.baseUrl}/unread-count`, true);
      // return response.count;
    } catch (error) {
      console.error('[NotificationService] Erreur lors de la récupération du compteur:', error);
      return 0;
    }
  }
}

export default new NotificationService(); 