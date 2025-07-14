import ApiService from './ApiService';

export interface Message {
  id: string;
  text: string;
  timestamp: string;
  isFromMe: boolean;
  productId?: number;
  offerPrice?: number;
  sender?: string;
}

export interface Conversation {
  id: string;
  name: string;
  avatarUrl?: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  productId?: number;
  sellerId: number;
  buyerName?: string;
  sellerName?: string;
}

export interface CreateConversationRequest {
  sellerId: number;
  productId: number;
  initialMessage: string;
  offerPrice?: number;
}

export interface SendMessageRequest {
  conversationId: string;
  text: string;
  productId?: number;
  offerPrice?: number;
}

class ConversationService {
  private baseUrl = '/conversations';

  // Récupérer toutes les conversations de l'utilisateur
  async getConversations(): Promise<Conversation[]> {
    try {
      return await ApiService.get<Conversation[]>(this.baseUrl, true);
    } catch (error) {
      console.error('[ConversationService] Erreur lors de la récupération des conversations:', error);
      return [];
    }
  }

  // Récupérer une conversation par ID
  async getConversation(conversationId: string): Promise<Conversation> {
    return ApiService.get(`${this.baseUrl}/${conversationId}`, true);
  }

  // Récupérer les messages d'une conversation
  async getMessages(conversationId: string): Promise<Message[]> {
    try {
      return await ApiService.get<Message[]>(`${this.baseUrl}/${conversationId}/messages`, true);
    } catch (error) {
      console.error('[ConversationService] Erreur lors de la récupération des messages:', error);
      return [];
    }
  }

  // Créer une nouvelle conversation avec un vendeur
  async createConversation(data: CreateConversationRequest): Promise<Conversation> {
    return ApiService.post(this.baseUrl, data, true);
  }

  // Envoyer un message dans une conversation
  async sendMessage(data: SendMessageRequest): Promise<Message> {
    return ApiService.post(`${this.baseUrl}/${data.conversationId}/messages`, {
      text: data.text,
      productId: data.productId,
      offerPrice: data.offerPrice,
    }, true);
  }

  // Marquer une conversation comme lue
  async markAsRead(conversationId: string): Promise<void> {
    return ApiService.post(`${this.baseUrl}/${conversationId}/read`, {}, true);
  }

  // Supprimer une conversation
  async deleteConversation(conversationId: string): Promise<void> {
    return ApiService.delete(`${this.baseUrl}/${conversationId}`, true);
  }
}

export default new ConversationService(); 