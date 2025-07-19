// Script de test pour les analytics et optimisations
// À exécuter dans la console du navigateur ou via React Native Debugger

const testAnalytics = async () => {
  console.log('📊 Test des analytics et optimisations...');
  
  const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 jours en arrière
  const endDate = new Date();
  
  // Test 1: Métriques globales
  console.log('📈 Test 1: Métriques globales...');
  try {
    const response = await fetch(`http://localhost:8080/api/analytics/global?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
      }
    });
    
    if (response.ok) {
      const metrics = await response.json();
      console.log('✅ Métriques globales:', metrics);
    } else {
      console.log('❌ Erreur métriques globales:', response.status);
    }
  } catch (error) {
    console.log('❌ Erreur réseau métriques globales:', error);
  }
  
  // Test 2: Efficacité des boosts
  console.log('🚀 Test 2: Efficacité des boosts...');
  try {
    const response = await fetch(`http://localhost:8080/api/analytics/boosts/effectiveness?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
      }
    });
    
    if (response.ok) {
      const effectiveness = await response.json();
      console.log('✅ Efficacité des boosts:', effectiveness);
    } else {
      console.log('❌ Erreur efficacité boosts:', response.status);
    }
  } catch (error) {
    console.log('❌ Erreur réseau efficacité boosts:', error);
  }
  
  // Test 3: Performance des algorithmes
  console.log('🧠 Test 3: Performance des algorithmes...');
  try {
    const response = await fetch(`http://localhost:8080/api/analytics/algorithms/performance?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
      }
    });
    
    if (response.ok) {
      const performance = await response.json();
      console.log('✅ Performance des algorithmes:', performance);
    } else {
      console.log('❌ Erreur performance algorithmes:', response.status);
    }
  } catch (error) {
    console.log('❌ Erreur réseau performance algorithmes:', error);
  }
  
  // Test 4: Tendances temporelles
  console.log('📅 Test 4: Tendances temporelles...');
  try {
    const response = await fetch(`http://localhost:8080/api/analytics/trends?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
      }
    });
    
    if (response.ok) {
      const trends = await response.json();
      console.log('✅ Tendances temporelles:', trends);
    } else {
      console.log('❌ Erreur tendances:', response.status);
    }
  } catch (error) {
    console.log('❌ Erreur réseau tendances:', error);
  }
  
  // Test 5: CTR des recommandations
  console.log('🎯 Test 5: CTR des recommandations...');
  try {
    const response = await fetch(`http://localhost:8080/api/analytics/recommendations/ctr/1?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
      }
    });
    
    if (response.ok) {
      const ctr = await response.json();
      console.log('✅ CTR des recommandations:', ctr);
    } else {
      console.log('❌ Erreur CTR:', response.status);
    }
  } catch (error) {
    console.log('❌ Erreur réseau CTR:', error);
  }
  
  // Test 6: Précision des recommandations
  console.log('🎯 Test 6: Précision des recommandations...');
  try {
    const response = await fetch(`http://localhost:8080/api/analytics/recommendations/accuracy/1?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
      }
    });
    
    if (response.ok) {
      const accuracy = await response.json();
      console.log('✅ Précision des recommandations:', accuracy);
    } else {
      console.log('❌ Erreur précision:', response.status);
    }
  } catch (error) {
    console.log('❌ Erreur réseau précision:', error);
  }
  
  // Test 7: Rapport complet
  console.log('📋 Test 7: Rapport complet...');
  try {
    const response = await fetch(`http://localhost:8080/api/analytics/report?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&userId=1`, {
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
  
  console.log('📊 Tests des analytics terminés');
};

// Test des optimisations
const testOptimizations = async () => {
  console.log('⚡ Test des optimisations...');
  
  // Simulation d'optimisations
  const optimizations = {
    cacheSize: Math.floor(Math.random() * 1000) + 500,
    responseTime: Math.floor(Math.random() * 200) + 50,
    memoryUsage: Math.floor(Math.random() * 100) + 20,
    cpuUsage: Math.floor(Math.random() * 50) + 10,
    recommendations: {
      contentBased: Math.random() * 0.3 + 0.7,
      collaborative: Math.random() * 0.3 + 0.6,
      hybrid: Math.random() * 0.2 + 0.8
    },
    boosts: {
      premium: Math.random() * 0.2 + 0.8,
      standard: Math.random() * 0.3 + 0.6,
      urgent: Math.random() * 0.1 + 0.9
    }
  };
  
  console.log('✅ Optimisations simulées:', optimizations);
  
  // Recommandations d'optimisation
  const recommendations = [];
  
  if (optimizations.responseTime > 150) {
    recommendations.push('Temps de réponse élevé. Considérez d\'optimiser les requêtes.');
  }
  
  if (optimizations.memoryUsage > 80) {
    recommendations.push('Utilisation mémoire élevée. Vérifiez les fuites mémoire.');
  }
  
  if (optimizations.cpuUsage > 40) {
    recommendations.push('Utilisation CPU élevée. Optimisez les algorithmes.');
  }
  
  if (optimizations.recommendations.hybrid < 0.8) {
    recommendations.push('Performance hybride faible. Ajustez les poids des algorithmes.');
  }
  
  console.log('💡 Recommandations d\'optimisation:', recommendations);
  console.log('⚡ Tests des optimisations terminés');
};

// Test des métriques en temps réel
const testRealTimeMetrics = () => {
  console.log('⏱️ Test des métriques temps réel...');
  
  // Simuler des interactions en temps réel
  const interactions = [
    { userId: 1, productId: 100, type: 'VIEW', timestamp: new Date() },
    { userId: 1, productId: 100, type: 'CLICK', timestamp: new Date() },
    { userId: 2, productId: 101, type: 'VIEW', timestamp: new Date() },
    { userId: 2, productId: 101, type: 'FAVORITE', timestamp: new Date() },
    { userId: 3, productId: 102, type: 'VIEW', timestamp: new Date() }
  ];
  
  // Calculer les métriques
  const totalInteractions = interactions.length;
  const views = interactions.filter(i => i.type === 'VIEW').length;
  const clicks = interactions.filter(i => i.type === 'CLICK').length;
  const favorites = interactions.filter(i => i.type === 'FAVORITE').length;
  
  const ctr = views > 0 ? clicks / views : 0;
  const conversionRate = totalInteractions > 0 ? (clicks + favorites) / totalInteractions : 0;
  
  const metrics = {
    totalInteractions,
    views,
    clicks,
    favorites,
    ctr: ctr.toFixed(4),
    conversionRate: conversionRate.toFixed(4),
    activeUsers: new Set(interactions.map(i => i.userId)).size
  };
  
  console.log('✅ Métriques temps réel:', metrics);
  console.log('⏱️ Tests des métriques temps réel terminés');
};

// Exporter pour utilisation
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testAnalytics, testOptimizations, testRealTimeMetrics };
} else {
  // Pour utilisation dans le navigateur
  window.testAnalytics = testAnalytics;
  window.testOptimizations = testOptimizations;
  window.testRealTimeMetrics = testRealTimeMetrics;
}

console.log('📊 Script de test des analytics chargé. Utilisez testAnalytics(), testOptimizations() ou testRealTimeMetrics() pour lancer les tests.'); 