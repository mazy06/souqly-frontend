import ApiService from './ApiService';
import { Platform } from 'react-native';

export interface InteractionData {
  productId?: number;
  userId: number;
  interactionType: 'VIEW' | 'FAVORITE' | 'UNFAVORITE' | 'SEARCH' | 'CLICK' | 'SHARE' | 'CONTACT';
  interactionValue?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
}

class InteractionTrackingService {
  private static instance: InteractionTrackingService;
  private sessionId: string = '';
  private userAgent: string = '';

  private constructor() {
    this.generateSessionId();
    this.setUserAgent();
  }

  public static getInstance(): InteractionTrackingService {
    if (!InteractionTrackingService.instance) {
      InteractionTrackingService.instance = new InteractionTrackingService();
    }
    return InteractionTrackingService.instance;
  }

  private generateSessionId(): void {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setUserAgent(): void {
    this.userAgent = `SouqlyApp/${Platform.OS}/${Platform.Version}`;
  }

  /**
   * Track une vue de produit
   */
  async trackProductView(productId: number, userId: number): Promise<void> {
    try {
      const data = {
        productId,
        userId,
        sessionId: this.sessionId,
        userAgent: this.userAgent,
      };

      await ApiService.post('/interactions/track/view', data);

      console.log('Product view tracked:', productId);
    } catch (error) {
      console.error('Error tracking product view:', error);
    }
  }

  /**
   * Track un ajout aux favoris
   */
  async trackFavorite(productId: number, userId: number): Promise<void> {
    try {
      const data = {
        productId,
        userId,
        sessionId: this.sessionId,
        userAgent: this.userAgent,
      };

      await ApiService.post('/interactions/track/favorite', data);

      console.log('Favorite tracked:', productId);
    } catch (error) {
      console.error('Error tracking favorite:', error);
    }
  }

  /**
   * Track un retrait des favoris
   */
  async trackUnfavorite(productId: number, userId: number): Promise<void> {
    try {
      // Pour l'instant, on utilise le même endpoint que favorite
      // mais on pourrait créer un endpoint spécifique
      const data = {
        productId,
        userId,
        sessionId: this.sessionId,
        userAgent: this.userAgent,
      };

      await ApiService.post('/interactions/track/favorite', data);

      console.log('Unfavorite tracked:', productId);
    } catch (error) {
      console.error('Error tracking unfavorite:', error);
    }
  }

  /**
   * Track une recherche
   */
  async trackSearch(query: string, userId: number): Promise<void> {
    try {
      const data = {
        query,
        userId,
        sessionId: this.sessionId,
        userAgent: this.userAgent,
      };

      await ApiService.post('/interactions/track/search', data);

      console.log('Search tracked:', query);
    } catch (error) {
      console.error('Error tracking search:', error);
    }
  }

  /**
   * Track un clic sur un produit
   */
  async trackProductClick(productId: number, userId: number): Promise<void> {
    try {
      // Pour l'instant, on utilise le même endpoint que view
      const data = {
        productId,
        userId,
        sessionId: this.sessionId,
        userAgent: this.userAgent,
      };

      await ApiService.post('/interactions/track/view', data);

      console.log('Product click tracked:', productId);
    } catch (error) {
      console.error('Error tracking product click:', error);
    }
  }

  /**
   * Track un partage de produit
   */
  async trackProductShare(productId: number, userId: number, shareMethod?: string): Promise<void> {
    try {
      // Pour l'instant, on utilise le même endpoint que view
      const data = {
        productId,
        userId,
        sessionId: this.sessionId,
        userAgent: this.userAgent,
        shareMethod,
      };

      await ApiService.post('/interactions/track/view', data);

      console.log('Product share tracked:', productId, shareMethod);
    } catch (error) {
      console.error('Error tracking product share:', error);
    }
  }

  /**
   * Track un contact du vendeur
   */
  async trackContactSeller(productId: number, userId: number): Promise<void> {
    try {
      // Pour l'instant, on utilise le même endpoint que view
      const data = {
        productId,
        userId,
        sessionId: this.sessionId,
        userAgent: this.userAgent,
      };

      await ApiService.post('/interactions/track/view', data);

      console.log('Contact seller tracked:', productId);
    } catch (error) {
      console.error('Error tracking contact seller:', error);
    }
  }

  /**
   * Méthode utilitaire pour tracker automatiquement les interactions
   */
  async trackInteraction(
    interactionType: InteractionData['interactionType'],
    productId?: number,
    userId?: number,
    query?: string
  ): Promise<void> {
    if (!userId) {
      console.warn('No userId provided for tracking');
      return;
    }

    switch (interactionType) {
      case 'VIEW':
        if (productId) {
          await this.trackProductView(productId, userId);
        }
        break;
      case 'FAVORITE':
        if (productId) {
          await this.trackFavorite(productId, userId);
        }
        break;
      case 'UNFAVORITE':
        if (productId) {
          await this.trackUnfavorite(productId, userId);
        }
        break;
      case 'SEARCH':
        if (query) {
          await this.trackSearch(query, userId);
        }
        break;
      case 'CLICK':
        if (productId) {
          await this.trackProductClick(productId, userId);
        }
        break;
      case 'SHARE':
        if (productId) {
          await this.trackProductShare(productId, userId);
        }
        break;
      case 'CONTACT':
        if (productId) {
          await this.trackContactSeller(productId, userId);
        }
        break;
    }
  }
}

export default InteractionTrackingService; 