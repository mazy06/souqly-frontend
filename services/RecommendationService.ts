import ApiService from './ApiService';
import { Product } from './ProductService';

export interface RecommendationResponse {
  products: Product[];
  type: 'content' | 'collaborative' | 'hybrid';
  timestamp: string;
}

class RecommendationService {
  private static instance: RecommendationService;

  private constructor() {}

  public static getInstance(): RecommendationService {
    if (!RecommendationService.instance) {
      RecommendationService.instance = new RecommendationService();
    }
    return RecommendationService.instance;
  }

  /**
   * Obtient des recommandations basées sur le contenu
   */
  async getContentBasedRecommendations(userId: number, limit: number = 10): Promise<Product[]> {
    try {
      const response = await ApiService.get<Product[]>(`/recommendations/content-based/${userId}?limit=${limit}`);
      return response || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des recommandations content-based:', error);
      return [];
    }
  }

  /**
   * Obtient des recommandations basées sur la collaboration
   */
  async getCollaborativeRecommendations(userId: number, limit: number = 10): Promise<Product[]> {
    try {
      const response = await ApiService.get<Product[]>(`/recommendations/collaborative/${userId}?limit=${limit}`);
      return response || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des recommandations collaboratives:', error);
      return [];
    }
  }

  /**
   * Obtient des recommandations hybrides
   */
  async getHybridRecommendations(userId: number, limit: number = 10): Promise<Product[]> {
    try {
      const response = await ApiService.get<Product[]>(`/recommendations/hybrid/${userId}?limit=${limit}`);
      return response || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des recommandations hybrides:', error);
      return [];
    }
  }

  /**
   * Obtient des recommandations pour l'utilisateur connecté
   */
  async getRecommendationsForMe(limit: number = 10, type: 'content' | 'collaborative' | 'hybrid' = 'hybrid'): Promise<Product[]> {
    try {
      const response = await ApiService.get<Product[]>(`/recommendations/for-me?limit=${limit}&type=${type}`);
      return response || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des recommandations:', error);
      return [];
    }
  }

  /**
   * Calcule le profil utilisateur
   */
  async calculateUserProfile(userId: number): Promise<boolean> {
    try {
      await ApiService.post(`/recommendations/calculate-profile/${userId}`, {});
      console.log('Profil utilisateur calculé avec succès');
      return true;
    } catch (error) {
      console.error('Erreur lors du calcul du profil utilisateur:', error);
      return false;
    }
  }

  /**
   * Calcule les similarités utilisateur
   */
  async calculateUserSimilarities(userId: number): Promise<boolean> {
    try {
      await ApiService.post(`/recommendations/calculate-similarities/${userId}`, {});
      console.log('Similarités utilisateur calculées avec succès');
      return true;
    } catch (error) {
      console.error('Erreur lors du calcul des similarités utilisateur:', error);
      return false;
    }
  }

  /**
   * Obtient des recommandations intelligentes (méthode principale)
   */
  async getSmartRecommendations(userId: number, limit: number = 10): Promise<Product[]> {
    try {
      // Essayer d'abord les recommandations hybrides
      const hybridRecs = await this.getHybridRecommendations(userId, limit);
      if (hybridRecs.length > 0) {
        return hybridRecs;
      }

      // Fallback vers content-based
      const contentRecs = await this.getContentBasedRecommendations(userId, limit);
      if (contentRecs.length > 0) {
        return contentRecs;
      }

      // Fallback vers collaborative
      const collaborativeRecs = await this.getCollaborativeRecommendations(userId, limit);
      if (collaborativeRecs.length > 0) {
        return collaborativeRecs;
      }

      // Si aucune recommandation n'est disponible, retourner un tableau vide
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération des recommandations intelligentes:', error);
      return [];
    }
  }

  /**
   * Obtient des recommandations avec indicateurs de boost
   */
  async getBoostedRecommendations(userId: number, limit: number = 10): Promise<{
    products: Product[];
    boostedProducts: number[];
  }> {
    try {
      const products = await this.getSmartRecommendations(userId, limit);
      
      // Identifier les produits boostés (pour l'instant, on utilise un critère simple)
      const boostedProducts = products
        .filter(product => product.favoriteCount > 10 || product.viewCount > 50)
        .map(product => product.id);

      return {
        products,
        boostedProducts
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des recommandations boostées:', error);
      return {
        products: [],
        boostedProducts: []
      };
    }
  }

  /**
   * Met à jour les profils et similarités en arrière-plan
   */
  async updateRecommendationData(userId: number): Promise<void> {
    try {
      // Calculer le profil utilisateur
      await this.calculateUserProfile(userId);
      
      // Calculer les similarités
      await this.calculateUserSimilarities(userId);
      
      console.log('Données de recommandation mises à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour des données de recommandation:', error);
    }
  }
}

export default RecommendationService; 