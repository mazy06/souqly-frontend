import ApiService from './ApiService';
import { Product } from './ProductService';

export interface RecommendationMetrics {
  totalRecommendations: number;
  boostedCount: number;
  boostedPercentage: number;
  avgPrice: number;
  avgFavorites: number;
  uniqueBrands: number;
  diversity: number;
}

export interface BoostedRecommendationResponse {
  products: Product[];
  boostedProducts: number[];
  metrics: RecommendationMetrics;
}

class RecommendationService {
  private static instance: RecommendationService;

  private constructor() {}

  static getInstance(): RecommendationService {
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
   * Obtient des recommandations avec boosts et métriques
   */
  async getBoostedRecommendations(userId: number, limit: number = 10): Promise<BoostedRecommendationResponse> {
    try {
      const response = await ApiService.get<{
        recommendations: Product[];
        metrics: RecommendationMetrics;
      }>(`/recommendations/for-me?limit=${limit}&includeMetrics=true`);

      if (!response) {
        return {
          products: [],
          boostedProducts: [],
          metrics: {
            totalRecommendations: 0,
            boostedCount: 0,
            boostedPercentage: 0,
            avgPrice: 0,
            avgFavorites: 0,
            uniqueBrands: 0,
            diversity: 0
          }
        };
      }

      const products = response.recommendations || [];
      const boostedProducts = products
        .filter(product => product.isBoosted)
        .map(product => product.id);

      return {
        products,
        boostedProducts,
        metrics: response.metrics || {
          totalRecommendations: products.length,
          boostedCount: boostedProducts.length,
          boostedPercentage: products.length > 0 ? (boostedProducts.length / products.length) * 100 : 0,
          avgPrice: products.reduce((sum, p) => sum + (p.price || 0), 0) / products.length || 0,
          avgFavorites: products.reduce((sum, p) => sum + (p.favoriteCount || 0), 0) / products.length || 0,
          uniqueBrands: new Set(products.map(p => p.brand).filter(Boolean)).size,
          diversity: products.length > 0 ? new Set(products.map(p => p.brand).filter(Boolean)).size / products.length : 0
        }
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des recommandations boostées:', error);
      return {
        products: [],
        boostedProducts: [],
        metrics: {
          totalRecommendations: 0,
          boostedCount: 0,
          boostedPercentage: 0,
          avgPrice: 0,
          avgFavorites: 0,
          uniqueBrands: 0,
          diversity: 0
        }
      };
    }
  }

  /**
   * Obtient des recommandations détaillées avec métriques
   */
  async getDetailedRecommendations(userId: number, limit: number = 10, type: 'content' | 'collaborative' | 'hybrid' = 'hybrid'): Promise<{
    recommendations: Product[];
    metrics: RecommendationMetrics;
  }> {
    try {
      const response = await ApiService.get<{
        recommendations: Product[];
        metrics: RecommendationMetrics;
      }>(`/recommendations/detailed/${userId}?limit=${limit}&type=${type}`);

      return {
        recommendations: response?.recommendations || [],
        metrics: response?.metrics || {
          totalRecommendations: 0,
          boostedCount: 0,
          boostedPercentage: 0,
          avgPrice: 0,
          avgFavorites: 0,
          uniqueBrands: 0,
          diversity: 0
        }
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des recommandations détaillées:', error);
      return {
        recommendations: [],
        metrics: {
          totalRecommendations: 0,
          boostedCount: 0,
          boostedPercentage: 0,
          avgPrice: 0,
          avgFavorites: 0,
          uniqueBrands: 0,
          diversity: 0
        }
      };
    }
  }

  /**
   * Calcule le profil utilisateur
   */
  async calculateUserProfile(userId: number): Promise<boolean> {
    try {
      await ApiService.post(`/recommendations/calculate-profile/${userId}`, {});
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
   * Obtient des recommandations avec fallback vers les produits populaires
   */
  async getRecommendationsWithFallback(userId: number, limit: number = 10): Promise<BoostedRecommendationResponse> {
    try {
      // Essayer d'abord les recommandations boostées
      const boostedRecs = await this.getBoostedRecommendations(userId, limit);
      if (boostedRecs.products.length > 0) {
        return boostedRecs;
      }

      // Fallback vers les recommandations intelligentes
      const smartRecs = await this.getSmartRecommendations(userId, limit);
      if (smartRecs.length > 0) {
        const boostedProducts = smartRecs.filter(p => p.isBoosted).map(p => p.id);
        return {
          products: smartRecs,
          boostedProducts,
          metrics: {
            totalRecommendations: smartRecs.length,
            boostedCount: boostedProducts.length,
            boostedPercentage: smartRecs.length > 0 ? (boostedProducts.length / smartRecs.length) * 100 : 0,
            avgPrice: smartRecs.reduce((sum, p) => sum + (p.price || 0), 0) / smartRecs.length || 0,
            avgFavorites: smartRecs.reduce((sum, p) => sum + (p.favoriteCount || 0), 0) / smartRecs.length || 0,
            uniqueBrands: new Set(smartRecs.map(p => p.brand).filter(Boolean)).size,
            diversity: smartRecs.length > 0 ? new Set(smartRecs.map(p => p.brand).filter(Boolean)).size / smartRecs.length : 0
          }
        };
      }

      // Fallback final : retourner des produits populaires
      return {
        products: [],
        boostedProducts: [],
        metrics: {
          totalRecommendations: 0,
          boostedCount: 0,
          boostedPercentage: 0,
          avgPrice: 0,
          avgFavorites: 0,
          uniqueBrands: 0,
          diversity: 0
        }
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des recommandations avec fallback:', error);
      return {
        products: [],
        boostedProducts: [],
        metrics: {
          totalRecommendations: 0,
          boostedCount: 0,
          boostedPercentage: 0,
          avgPrice: 0,
          avgFavorites: 0,
          uniqueBrands: 0,
          diversity: 0
        }
      };
    }
  }
}

export default RecommendationService; 