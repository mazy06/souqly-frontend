import ApiService from './ApiService';

export interface AnalyticsMetrics {
  ctr: number;
  accuracy: number;
  conversionRate: number;
  totalInteractions: number;
  activeUsers: number;
  activeBoosts: number;
}

export interface BoostEffectiveness {
  [boostType: string]: {
    count: number;
    avgViews: number;
    avgClicks: number;
    avgFavorites: number;
    ctr: number;
  };
}

export interface AlgorithmPerformance {
  contentBasedAccuracy: number;
  collaborativeAccuracy: number;
  hybridAccuracy: number;
  responseTimes: {
    contentBased: number;
    collaborative: number;
    hybrid: number;
  };
}

export interface TrendsData {
  dailyInteractions: { [date: string]: number };
  dailyViews: { [date: string]: number };
  dailyClicks: { [date: string]: number };
}

class AnalyticsService {
  private static instance: AnalyticsService;

  private constructor() {}

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Obtient le CTR des recommandations pour un utilisateur
   */
  async getRecommendationCTR(userId: number, startDate: Date, endDate: Date): Promise<number> {
    try {
      const response = await ApiService.get<{ ctr: number }>(
        `/analytics/recommendations/ctr/${userId}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      return response?.ctr || 0;
    } catch (error) {
      console.error('Erreur lors de la récupération du CTR:', error);
      return 0;
    }
  }

  /**
   * Obtient l'efficacité des boosts
   */
  async getBoostEffectiveness(startDate: Date, endDate: Date): Promise<BoostEffectiveness> {
    try {
      const response = await ApiService.get<BoostEffectiveness>(
        `/analytics/boosts/effectiveness?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      return response || {};
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'efficacité des boosts:', error);
      return {};
    }
  }

  /**
   * Obtient la précision des recommandations pour un utilisateur
   */
  async getRecommendationAccuracy(userId: number, startDate: Date, endDate: Date): Promise<number> {
    try {
      const response = await ApiService.get<{ accuracy: number }>(
        `/analytics/recommendations/accuracy/${userId}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      return response?.accuracy || 0;
    } catch (error) {
      console.error('Erreur lors de la récupération de la précision:', error);
      return 0;
    }
  }

  /**
   * Obtient les métriques globales
   */
  async getGlobalMetrics(startDate: Date, endDate: Date): Promise<AnalyticsMetrics> {
    try {
      const response = await ApiService.get<AnalyticsMetrics>(
        `/analytics/global?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      return response || {
        ctr: 0,
        accuracy: 0,
        conversionRate: 0,
        totalInteractions: 0,
        activeUsers: 0,
        activeBoosts: 0
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des métriques globales:', error);
      return {
        ctr: 0,
        accuracy: 0,
        conversionRate: 0,
        totalInteractions: 0,
        activeUsers: 0,
        activeBoosts: 0
      };
    }
  }

  /**
   * Obtient les tendances temporelles
   */
  async getTrends(startDate: Date, endDate: Date): Promise<TrendsData> {
    try {
      const response = await ApiService.get<TrendsData>(
        `/analytics/trends?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      return response || {
        dailyInteractions: {},
        dailyViews: {},
        dailyClicks: {}
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des tendances:', error);
      return {
        dailyInteractions: {},
        dailyViews: {},
        dailyClicks: {}
      };
    }
  }

  /**
   * Obtient la performance des algorithmes
   */
  async getAlgorithmPerformance(startDate: Date, endDate: Date): Promise<AlgorithmPerformance> {
    try {
      const response = await ApiService.get<AlgorithmPerformance>(
        `/analytics/algorithms/performance?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      return response || {
        contentBasedAccuracy: 0,
        collaborativeAccuracy: 0,
        hybridAccuracy: 0,
        responseTimes: {
          contentBased: 0,
          collaborative: 0,
          hybrid: 0
        }
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de la performance des algorithmes:', error);
      return {
        contentBasedAccuracy: 0,
        collaborativeAccuracy: 0,
        hybridAccuracy: 0,
        responseTimes: {
          contentBased: 0,
          collaborative: 0,
          hybrid: 0
        }
      };
    }
  }

  /**
   * Obtient un rapport complet d'analytics
   */
  async getCompleteReport(startDate: Date, endDate: Date, userId?: number): Promise<any> {
    try {
      let url = `/analytics/report?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
      if (userId) {
        url += `&userId=${userId}`;
      }
      
      const response = await ApiService.get<any>(url);
      return response || {};
    } catch (error) {
      console.error('Erreur lors de la récupération du rapport complet:', error);
      return {};
    }
  }

  /**
   * Calcule les métriques de performance en temps réel
   */
  calculateRealTimeMetrics(interactions: any[]): AnalyticsMetrics {
    try {
      const totalInteractions = interactions.length;
      const views = interactions.filter(i => i.type === 'VIEW').length;
      const clicks = interactions.filter(i => i.type === 'CLICK').length;
      const favorites = interactions.filter(i => i.type === 'FAVORITE').length;
      
      const ctr = views > 0 ? clicks / views : 0;
      const conversionRate = totalInteractions > 0 ? (clicks + favorites) / totalInteractions : 0;
      
      return {
        ctr,
        accuracy: conversionRate,
        conversionRate,
        totalInteractions,
        activeUsers: new Set(interactions.map(i => i.userId)).size,
        activeBoosts: 0 // À calculer séparément
      };
    } catch (error) {
      console.error('Erreur lors du calcul des métriques temps réel:', error);
      return {
        ctr: 0,
        accuracy: 0,
        conversionRate: 0,
        totalInteractions: 0,
        activeUsers: 0,
        activeBoosts: 0
      };
    }
  }

  /**
   * Formate les données pour l'affichage
   */
  formatMetricsForDisplay(metrics: AnalyticsMetrics): {
    ctrPercentage: string;
    accuracyPercentage: string;
    conversionRatePercentage: string;
    formattedInteractions: string;
    formattedUsers: string;
    formattedBoosts: string;
  } {
    return {
      ctrPercentage: `${(metrics.ctr * 100).toFixed(2)}%`,
      accuracyPercentage: `${(metrics.accuracy * 100).toFixed(2)}%`,
      conversionRatePercentage: `${(metrics.conversionRate * 100).toFixed(2)}%`,
      formattedInteractions: metrics.totalInteractions.toLocaleString(),
      formattedUsers: metrics.activeUsers.toLocaleString(),
      formattedBoosts: metrics.activeBoosts.toLocaleString()
    };
  }

  /**
   * Génère des recommandations d'optimisation
   */
  generateOptimizationRecommendations(metrics: AnalyticsMetrics, boostEffectiveness: BoostEffectiveness): string[] {
    const recommendations: string[] = [];
    
    if (metrics.ctr < 0.05) {
      recommendations.push('Le CTR est faible. Considérez d\'améliorer la pertinence des recommandations.');
    }
    
    if (metrics.accuracy < 0.7) {
      recommendations.push('La précision des recommandations peut être améliorée. Analysez les préférences utilisateur.');
    }
    
    if (metrics.conversionRate < 0.1) {
      recommendations.push('Le taux de conversion est bas. Optimisez l\'expérience utilisateur.');
    }
    
    // Analyser l'efficacité des boosts
    Object.entries(boostEffectiveness).forEach(([type, data]) => {
      if (data.ctr < 0.03) {
        recommendations.push(`Le boost ${type} a un CTR faible. Considérez d'ajuster les paramètres.`);
      }
    });
    
    return recommendations;
  }
}

export default AnalyticsService; 