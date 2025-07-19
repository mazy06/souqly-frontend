import ApiService from './ApiService';

export interface DeepLearningRecommendation {
  productId: number;
  score: number;
  algorithm: string;
  confidence: number;
  factors: {
    categoryPreference: number;
    pricePreference: number;
    timePreference: number;
  };
}

export interface UserClustering {
  clusters: { [clusterName: string]: number[] };
  clusterStats: { [clusterName: string]: any };
  totalUsers: number;
  algorithm: string;
}

export interface BehaviorPrediction {
  nextCategory: string;
  nextPriceRange: string;
  nextActionTime: string;
  conversionProbability: number;
  churnRisk: number;
  confidence: number;
}

export interface AnomalyDetection {
  anomalies: any[];
  totalAnomalies: number;
  detectionAlgorithm: string;
  confidence: number;
}

export interface MultiObjectiveOptimization {
  relevanceScore: number;
  diversityScore: number;
  noveltyScore: number;
  serendipityScore: number;
  compositeScore: number;
  recommendations: string[];
  algorithm: string;
}

export interface RealTimeRecommendation {
  productId: number;
  score: number;
  algorithm: string;
  timestamp: string;
  factors: {
    recentInteractions: number;
    preferenceStrength: number;
    timeDecay: number;
    trendingScore: number;
  };
  freshness: number;
}

export interface AlgorithmComparison {
  userId: number;
  algorithms: {
    deepLearning: {
      recommendations: DeepLearningRecommendation[];
      avgScore: number;
      diversity: number;
      freshness: number;
    };
    realTime: {
      recommendations: RealTimeRecommendation[];
      avgScore: number;
      diversity: number;
      freshness: number;
    };
  };
  recommendations: {
    bestAlgorithm: string;
    hybridRecommendations: any[];
  };
}

export interface AdvancedInsights {
  userId: number;
  behaviorPatterns: {
    activityLevel: string;
    preferredCategories: string[];
    priceSensitivity: string;
    timeOfDay: string;
    interactionFrequency: string;
  };
  preferenceEvolution: {
    trend: string;
    newCategories: string[];
    abandonedCategories: string[];
    confidence: number;
  };
  recommendationEffectiveness: {
    clickThroughRate: number;
    conversionRate: number;
    satisfactionScore: number;
    improvement: string;
  };
  optimizationOpportunities: string[];
  predictions: {
    nextWeekActivity: {
      predictedInteractions: number;
      confidence: number;
      trend: string;
    };
    conversionProbability: number;
    churnRisk: number;
  };
}

class AdvancedMLService {
  private static instance: AdvancedMLService;

  private constructor() {}

  public static getInstance(): AdvancedMLService {
    if (!AdvancedMLService.instance) {
      AdvancedMLService.instance = new AdvancedMLService();
    }
    return AdvancedMLService.instance;
  }

  /**
   * Obtient des recommandations Deep Learning
   */
  async getDeepLearningRecommendations(userId: number, limit: number = 10): Promise<DeepLearningRecommendation[]> {
    try {
      const response = await ApiService.get<DeepLearningRecommendation[]>(
        `/advanced-ml/recommendations/deep-learning/${userId}?limit=${limit}`
      );
      return response || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des recommandations Deep Learning:', error);
      return [];
    }
  }

  /**
   * Effectue le clustering des utilisateurs
   */
  async performUserClustering(): Promise<UserClustering> {
    try {
      const response = await ApiService.get<UserClustering>('/advanced-ml/clustering/users');
      return response || {
        clusters: {},
        clusterStats: {},
        totalUsers: 0,
        algorithm: 'k-means-clustering'
      };
    } catch (error) {
      console.error('Erreur lors du clustering des utilisateurs:', error);
      return {
        clusters: {},
        clusterStats: {},
        totalUsers: 0,
        algorithm: 'k-means-clustering'
      };
    }
  }

  /**
   * Prédit le comportement d'un utilisateur
   */
  async predictUserBehavior(userId: number): Promise<BehaviorPrediction> {
    try {
      const response = await ApiService.get<BehaviorPrediction>(`/advanced-ml/prediction/behavior/${userId}`);
      return response || {
        nextCategory: '',
        nextPriceRange: '',
        nextActionTime: '',
        conversionProbability: 0,
        churnRisk: 0,
        confidence: 0
      };
    } catch (error) {
      console.error('Erreur lors de la prédiction du comportement:', error);
      return {
        nextCategory: '',
        nextPriceRange: '',
        nextActionTime: '',
        conversionProbability: 0,
        churnRisk: 0,
        confidence: 0
      };
    }
  }

  /**
   * Détecte les anomalies
   */
  async detectAnomalies(): Promise<AnomalyDetection> {
    try {
      const response = await ApiService.get<AnomalyDetection>('/advanced-ml/anomalies/detect');
      return response || {
        anomalies: [],
        totalAnomalies: 0,
        detectionAlgorithm: 'isolation-forest',
        confidence: 0
      };
    } catch (error) {
      console.error('Erreur lors de la détection d\'anomalies:', error);
      return {
        anomalies: [],
        totalAnomalies: 0,
        detectionAlgorithm: 'isolation-forest',
        confidence: 0
      };
    }
  }

  /**
   * Optimise multi-objectif pour un utilisateur
   */
  async optimizeMultiObjective(userId: number): Promise<MultiObjectiveOptimization> {
    try {
      const response = await ApiService.get<MultiObjectiveOptimization>(`/advanced-ml/optimization/multi-objective/${userId}`);
      return response || {
        relevanceScore: 0,
        diversityScore: 0,
        noveltyScore: 0,
        serendipityScore: 0,
        compositeScore: 0,
        recommendations: [],
        algorithm: 'multi-objective-optimization'
      };
    } catch (error) {
      console.error('Erreur lors de l\'optimisation multi-objectif:', error);
      return {
        relevanceScore: 0,
        diversityScore: 0,
        noveltyScore: 0,
        serendipityScore: 0,
        compositeScore: 0,
        recommendations: [],
        algorithm: 'multi-objective-optimization'
      };
    }
  }

  /**
   * Obtient des recommandations en temps réel
   */
  async getRealTimeRecommendations(userId: number, limit: number = 10): Promise<RealTimeRecommendation[]> {
    try {
      const response = await ApiService.get<RealTimeRecommendation[]>(
        `/advanced-ml/recommendations/real-time/${userId}?limit=${limit}`
      );
      return response || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des recommandations temps réel:', error);
      return [];
    }
  }

  /**
   * Obtient un rapport complet des fonctionnalités avancées
   */
  async getAdvancedReport(userId: number): Promise<any> {
    try {
      const response = await ApiService.get<any>(`/advanced-ml/report/${userId}`);
      return response || {};
    } catch (error) {
      console.error('Erreur lors de la récupération du rapport avancé:', error);
      return {};
    }
  }

  /**
   * Compare les performances des différents algorithmes
   */
  async compareAlgorithms(userId: number): Promise<AlgorithmComparison> {
    try {
      const response = await ApiService.get<AlgorithmComparison>(`/advanced-ml/comparison/${userId}`);
      return response || {
        userId,
        algorithms: {
          deepLearning: {
            recommendations: [],
            avgScore: 0,
            diversity: 0,
            freshness: 0
          },
          realTime: {
            recommendations: [],
            avgScore: 0,
            diversity: 0,
            freshness: 0
          }
        },
        recommendations: {
          bestAlgorithm: '',
          hybridRecommendations: []
        }
      };
    } catch (error) {
      console.error('Erreur lors de la comparaison des algorithmes:', error);
      return {
        userId,
        algorithms: {
          deepLearning: {
            recommendations: [],
            avgScore: 0,
            diversity: 0,
            freshness: 0
          },
          realTime: {
            recommendations: [],
            avgScore: 0,
            diversity: 0,
            freshness: 0
          }
        },
        recommendations: {
          bestAlgorithm: '',
          hybridRecommendations: []
        }
      };
    }
  }

  /**
   * Obtient des insights avancés
   */
  async getAdvancedInsights(userId: number): Promise<AdvancedInsights> {
    try {
      const response = await ApiService.get<AdvancedInsights>(`/advanced-ml/insights/${userId}`);
      return response || {
        userId,
        behaviorPatterns: {
          activityLevel: '',
          preferredCategories: [],
          priceSensitivity: '',
          timeOfDay: '',
          interactionFrequency: ''
        },
        preferenceEvolution: {
          trend: '',
          newCategories: [],
          abandonedCategories: [],
          confidence: 0
        },
        recommendationEffectiveness: {
          clickThroughRate: 0,
          conversionRate: 0,
          satisfactionScore: 0,
          improvement: ''
        },
        optimizationOpportunities: [],
        predictions: {
          nextWeekActivity: {
            predictedInteractions: 0,
            confidence: 0,
            trend: ''
          },
          conversionProbability: 0,
          churnRisk: 0
        }
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des insights avancés:', error);
      return {
        userId,
        behaviorPatterns: {
          activityLevel: '',
          preferredCategories: [],
          priceSensitivity: '',
          timeOfDay: '',
          interactionFrequency: ''
        },
        preferenceEvolution: {
          trend: '',
          newCategories: [],
          abandonedCategories: [],
          confidence: 0
        },
        recommendationEffectiveness: {
          clickThroughRate: 0,
          conversionRate: 0,
          satisfactionScore: 0,
          improvement: ''
        },
        optimizationOpportunities: [],
        predictions: {
          nextWeekActivity: {
            predictedInteractions: 0,
            confidence: 0,
            trend: ''
          },
          conversionProbability: 0,
          churnRisk: 0
        }
      };
    }
  }

  /**
   * Analyse les performances des algorithmes
   */
  analyzeAlgorithmPerformance(comparison: AlgorithmComparison): {
    bestAlgorithm: string;
    performanceGap: number;
    recommendations: string[];
  } {
    const deepLearningScore = comparison.algorithms.deepLearning.avgScore;
    const realTimeScore = comparison.algorithms.realTime.avgScore;
    
    const bestAlgorithm = deepLearningScore > realTimeScore ? 'Deep Learning' : 'Real Time';
    const performanceGap = Math.abs(deepLearningScore - realTimeScore);
    
    const recommendations: string[] = [];
    
    if (performanceGap < 0.1) {
      recommendations.push('Les algorithmes ont des performances similaires. Considérez un approche hybride.');
    }
    
    if (comparison.algorithms.deepLearning.diversity < 0.5) {
      recommendations.push('Améliorer la diversité des recommandations Deep Learning.');
    }
    
    if (comparison.algorithms.realTime.freshness < 0.6) {
      recommendations.push('Améliorer la fraîcheur des recommandations temps réel.');
    }
    
    return {
      bestAlgorithm,
      performanceGap,
      recommendations
    };
  }

  /**
   * Formate les insights pour l'affichage
   */
  formatInsightsForDisplay(insights: AdvancedInsights): {
    behaviorSummary: string;
    effectivenessSummary: string;
    riskLevel: string;
    recommendations: string[];
  } {
    const behaviorSummary = `${insights.behaviorPatterns.activityLevel} activity level, prefers ${insights.behaviorPatterns.preferredCategories.join(', ')}`;
    
    const effectivenessSummary = `CTR: ${(insights.recommendationEffectiveness.clickThroughRate * 100).toFixed(1)}%, Conversion: ${(insights.recommendationEffectiveness.conversionRate * 100).toFixed(1)}%`;
    
    const riskLevel = insights.predictions.churnRisk > 0.1 ? 'High' : insights.predictions.churnRisk > 0.05 ? 'Medium' : 'Low';
    
    const recommendations = [
      ...insights.optimizationOpportunities,
      `Churn Risk: ${riskLevel}`,
      `Next Week Activity: ${insights.predictions.nextWeekActivity.predictedInteractions} interactions predicted`
    ];
    
    return {
      behaviorSummary,
      effectivenessSummary,
      riskLevel,
      recommendations
    };
  }

  /**
   * Simule des recommandations en temps réel pour les tests
   */
  simulateRealTimeRecommendations(userId: number, limit: number = 5): RealTimeRecommendation[] {
    const recommendations: RealTimeRecommendation[] = [];
    
    for (let i = 0; i < limit; i++) {
      recommendations.push({
        productId: 1000 + i,
        score: 0.7 + Math.random() * 0.3,
        algorithm: 'real-time',
        timestamp: new Date().toISOString(),
        factors: {
          recentInteractions: Math.floor(Math.random() * 10) + 1,
          preferenceStrength: 0.6 + Math.random() * 0.4,
          timeDecay: 0.8 + Math.random() * 0.2,
          trendingScore: 0.5 + Math.random() * 0.5
        },
        freshness: 1.0 - (i * 0.1)
      });
    }
    
    return recommendations.sort((a, b) => b.score - a.score);
  }
}

export default AdvancedMLService; 