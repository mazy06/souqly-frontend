// Script de test pour les fonctionnalités avancées de ML
// À exécuter dans la console du navigateur ou via React Native Debugger

const testAdvancedML = async () => {
  console.log('🧠 Test des fonctionnalités avancées de ML...');
  
  const userId = 1;
  
  // Test 1: Recommandations Deep Learning
  console.log('🤖 Test 1: Recommandations Deep Learning...');
  try {
    const response = await fetch(`http://localhost:8080/api/advanced-ml/recommendations/deep-learning/${userId}?limit=5`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
      }
    });
    
    if (response.ok) {
      const recommendations = await response.json();
      console.log('✅ Recommandations Deep Learning:', recommendations);
    } else {
      console.log('❌ Erreur recommandations Deep Learning:', response.status);
    }
  } catch (error) {
    console.log('❌ Erreur réseau recommandations Deep Learning:', error);
  }
  
  // Test 2: Clustering des utilisateurs
  console.log('👥 Test 2: Clustering des utilisateurs...');
  try {
    const response = await fetch('http://localhost:8080/api/advanced-ml/clustering/users', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
      }
    });
    
    if (response.ok) {
      const clustering = await response.json();
      console.log('✅ Clustering des utilisateurs:', clustering);
    } else {
      console.log('❌ Erreur clustering:', response.status);
    }
  } catch (error) {
    console.log('❌ Erreur réseau clustering:', error);
  }
  
  // Test 3: Prédiction de comportement
  console.log('🔮 Test 3: Prédiction de comportement...');
  try {
    const response = await fetch(`http://localhost:8080/api/advanced-ml/prediction/behavior/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
      }
    });
    
    if (response.ok) {
      const predictions = await response.json();
      console.log('✅ Prédictions de comportement:', predictions);
    } else {
      console.log('❌ Erreur prédictions:', response.status);
    }
  } catch (error) {
    console.log('❌ Erreur réseau prédictions:', error);
  }
  
  // Test 4: Détection d'anomalies
  console.log('🚨 Test 4: Détection d\'anomalies...');
  try {
    const response = await fetch('http://localhost:8080/api/advanced-ml/anomalies/detect', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
      }
    });
    
    if (response.ok) {
      const anomalies = await response.json();
      console.log('✅ Détection d\'anomalies:', anomalies);
    } else {
      console.log('❌ Erreur détection anomalies:', response.status);
    }
  } catch (error) {
    console.log('❌ Erreur réseau détection anomalies:', error);
  }
  
  // Test 5: Optimisation multi-objectif
  console.log('🎯 Test 5: Optimisation multi-objectif...');
  try {
    const response = await fetch(`http://localhost:8080/api/advanced-ml/optimization/multi-objective/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
      }
    });
    
    if (response.ok) {
      const optimization = await response.json();
      console.log('✅ Optimisation multi-objectif:', optimization);
    } else {
      console.log('❌ Erreur optimisation multi-objectif:', response.status);
    }
  } catch (error) {
    console.log('❌ Erreur réseau optimisation multi-objectif:', error);
  }
  
  // Test 6: Recommandations temps réel
  console.log('⚡ Test 6: Recommandations temps réel...');
  try {
    const response = await fetch(`http://localhost:8080/api/advanced-ml/recommendations/real-time/${userId}?limit=5`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
      }
    });
    
    if (response.ok) {
      const recommendations = await response.json();
      console.log('✅ Recommandations temps réel:', recommendations);
    } else {
      console.log('❌ Erreur recommandations temps réel:', response.status);
    }
  } catch (error) {
    console.log('❌ Erreur réseau recommandations temps réel:', error);
  }
  
  // Test 7: Comparaison d'algorithmes
  console.log('📊 Test 7: Comparaison d\'algorithmes...');
  try {
    const response = await fetch(`http://localhost:8080/api/advanced-ml/comparison/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
      }
    });
    
    if (response.ok) {
      const comparison = await response.json();
      console.log('✅ Comparaison d\'algorithmes:', comparison);
    } else {
      console.log('❌ Erreur comparaison algorithmes:', response.status);
    }
  } catch (error) {
    console.log('❌ Erreur réseau comparaison algorithmes:', error);
  }
  
  // Test 8: Insights avancés
  console.log('💡 Test 8: Insights avancés...');
  try {
    const response = await fetch(`http://localhost:8080/api/advanced-ml/insights/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
      }
    });
    
    if (response.ok) {
      const insights = await response.json();
      console.log('✅ Insights avancés:', insights);
    } else {
      console.log('❌ Erreur insights avancés:', response.status);
    }
  } catch (error) {
    console.log('❌ Erreur réseau insights avancés:', error);
  }
  
  // Test 9: Rapport complet
  console.log('📋 Test 9: Rapport complet...');
  try {
    const response = await fetch(`http://localhost:8080/api/advanced-ml/report/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
      }
    });
    
    if (response.ok) {
      const report = await response.json();
      console.log('✅ Rapport complet:', report);
    } else {
      console.log('❌ Erreur rapport complet:', response.status);
    }
  } catch (error) {
    console.log('❌ Erreur réseau rapport complet:', error);
  }
  
  console.log('🧠 Tests des fonctionnalités avancées de ML terminés');
};

// Test des simulations
const testSimulations = () => {
  console.log('🎮 Test des simulations...');
  
  // Simulation de recommandations Deep Learning
  const deepLearningRecommendations = [];
  for (let i = 0; i < 5; i++) {
    deepLearningRecommendations.push({
      productId: 1000 + i,
      score: 0.8 + Math.random() * 0.2,
      algorithm: 'deep-learning',
      confidence: 0.85 + Math.random() * 0.15,
      factors: {
        categoryPreference: 0.7 + Math.random() * 0.3,
        pricePreference: 0.6 + Math.random() * 0.4,
        timePreference: 0.5 + Math.random() * 0.5
      }
    });
  }
  
  // Simulation de clustering
  const clustering = {
    clusters: {
      premium: [1, 2, 3],
      active: [4, 5, 6, 7],
      regular: [8, 9, 10],
      casual: [11, 12],
      inactive: [13, 14, 15]
    },
    clusterStats: {
      premium: { size: 3, percentage: 0.2, averageScore: 0.9 },
      active: { size: 4, percentage: 0.27, averageScore: 0.75 },
      regular: { size: 3, percentage: 0.2, averageScore: 0.6 },
      casual: { size: 2, percentage: 0.13, averageScore: 0.4 },
      inactive: { size: 3, percentage: 0.2, averageScore: 0.2 }
    },
    totalUsers: 15,
    algorithm: 'k-means-clustering'
  };
  
  // Simulation de prédictions
  const predictions = {
    nextCategory: 'electronics',
    nextPriceRange: 'medium',
    nextActionTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    conversionProbability: 0.25,
    churnRisk: 0.08,
    confidence: 0.82
  };
  
  // Simulation d'anomalies
  const anomalies = {
    anomalies: [
      {
        type: 'HIGH_INTERACTION_COUNT',
        userId: 5,
        interactionCount: 150,
        threshold: 50,
        severity: 'MEDIUM'
      }
    ],
    totalAnomalies: 1,
    detectionAlgorithm: 'isolation-forest',
    confidence: 0.92
  };
  
  // Simulation d'optimisation multi-objectif
  const optimization = {
    relevanceScore: 0.78,
    diversityScore: 0.65,
    noveltyScore: 0.72,
    serendipityScore: 0.58,
    compositeScore: 0.71,
    recommendations: [
      'Améliorer la pertinence des recommandations',
      'Augmenter la diversité des suggestions'
    ],
    algorithm: 'multi-objective-optimization'
  };
  
  console.log('✅ Recommandations Deep Learning simulées:', deepLearningRecommendations);
  console.log('✅ Clustering simulé:', clustering);
  console.log('✅ Prédictions simulées:', predictions);
  console.log('✅ Anomalies simulées:', anomalies);
  console.log('✅ Optimisation multi-objectif simulée:', optimization);
  console.log('🎮 Tests des simulations terminés');
};

// Test des performances
const testPerformance = () => {
  console.log('⚡ Test des performances...');
  
  const performanceMetrics = {
    deepLearning: {
      responseTime: 150 + Math.random() * 100,
      accuracy: 0.85 + Math.random() * 0.15,
      memoryUsage: 200 + Math.random() * 100,
      cpuUsage: 30 + Math.random() * 20
    },
    realTime: {
      responseTime: 50 + Math.random() * 50,
      accuracy: 0.75 + Math.random() * 0.25,
      memoryUsage: 100 + Math.random() * 50,
      cpuUsage: 20 + Math.random() * 15
    },
    hybrid: {
      responseTime: 100 + Math.random() * 75,
      accuracy: 0.88 + Math.random() * 0.12,
      memoryUsage: 150 + Math.random() * 75,
      cpuUsage: 25 + Math.random() * 18
    }
  };
  
  // Analyser les performances
  const analysis = {
    fastestAlgorithm: Object.entries(performanceMetrics).reduce((a, b) => 
      performanceMetrics[a[0]].responseTime < performanceMetrics[b[0]].responseTime ? a : b)[0],
    mostAccurateAlgorithm: Object.entries(performanceMetrics).reduce((a, b) => 
      performanceMetrics[a[0]].accuracy > performanceMetrics[b[0]].accuracy ? a : b)[0],
    mostEfficientAlgorithm: Object.entries(performanceMetrics).reduce((a, b) => 
      (performanceMetrics[a[0]].accuracy / performanceMetrics[a[0]].responseTime) > 
      (performanceMetrics[b[0]].accuracy / performanceMetrics[b[0]].responseTime) ? a : b)[0]
  };
  
  console.log('✅ Métriques de performance:', performanceMetrics);
  console.log('✅ Analyse des performances:', analysis);
  console.log('⚡ Tests des performances terminés');
};

// Test des insights
const testInsights = () => {
  console.log('💡 Test des insights...');
  
  const insights = {
    behaviorPatterns: {
      activityLevel: 'high',
      preferredCategories: ['electronics', 'fashion'],
      priceSensitivity: 'medium',
      timeOfDay: 'afternoon',
      interactionFrequency: 'daily'
    },
    preferenceEvolution: {
      trend: 'increasing',
      newCategories: ['sports', 'books'],
      abandonedCategories: ['home'],
      confidence: 0.85
    },
    recommendationEffectiveness: {
      clickThroughRate: 0.12,
      conversionRate: 0.08,
      satisfactionScore: 0.75,
      improvement: '+15%'
    },
    optimizationOpportunities: [
      'Augmenter la diversité des recommandations',
      'Optimiser les horaires de suggestion',
      'Personnaliser davantage les prix'
    ],
    predictions: {
      nextWeekActivity: {
        predictedInteractions: 25,
        confidence: 0.82,
        trend: 'increasing'
      },
      conversionProbability: 0.18,
      churnRisk: 0.06
    }
  };
  
  // Analyser les insights
  const analysis = {
    riskLevel: insights.predictions.churnRisk > 0.1 ? 'High' : insights.predictions.churnRisk > 0.05 ? 'Medium' : 'Low',
    effectiveness: insights.recommendationEffectiveness.clickThroughRate > 0.1 ? 'Good' : 'Needs Improvement',
    trend: insights.preferenceEvolution.trend === 'increasing' ? 'Positive' : 'Negative',
    recommendations: insights.optimizationOpportunities.slice(0, 2)
  };
  
  console.log('✅ Insights générés:', insights);
  console.log('✅ Analyse des insights:', analysis);
  console.log('💡 Tests des insights terminés');
};

// Exporter pour utilisation
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testAdvancedML, testSimulations, testPerformance, testInsights };
} else {
  // Pour utilisation dans le navigateur
  window.testAdvancedML = testAdvancedML;
  window.testSimulations = testSimulations;
  window.testPerformance = testPerformance;
  window.testInsights = testInsights;
}

console.log('🧠 Script de test des fonctionnalités avancées de ML chargé. Utilisez testAdvancedML(), testSimulations(), testPerformance() ou testInsights() pour lancer les tests.'); 