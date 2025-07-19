// Script de test d'intégration pour le système de recommandations et boosts
// À exécuter dans la console du navigateur ou via React Native Debugger

const testIntegration = async () => {
  console.log('🧪 Test d\'intégration du système de recommandations et boosts...');
  
  // Test 1: Vérifier les recommandations
  console.log('📊 Test 1: Recommandations...');
  try {
    const response = await fetch('http://localhost:8080/api/recommendations/hybrid/1?limit=3', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
      }
    });
    
    if (response.ok) {
      const products = await response.json();
      console.log('✅ Recommandations hybrides:', products.length, 'produits');
      
      // Vérifier les boosts sur les produits recommandés
      for (const product of products) {
        const boostResponse = await fetch(`http://localhost:8080/api/boosts/product/${product.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer YOUR_TOKEN_HERE'
          }
        });
        
        if (boostResponse.ok) {
          const boost = await boostResponse.json();
          console.log(`🔍 Produit ${product.id}: boost ${boost.boostType} niveau ${boost.boostLevel}`);
        }
      }
    } else {
      console.log('❌ Erreur recommandations:', response.status);
    }
  } catch (error) {
    console.log('❌ Erreur réseau recommandations:', error);
  }
  
  // Test 2: Vérifier les boosts actifs
  console.log('🚀 Test 2: Boosts actifs...');
  try {
    const response = await fetch('http://localhost:8080/api/boosts/active', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
      }
    });
    
    if (response.ok) {
      const boosts = await response.json();
      console.log('✅ Boosts actifs:', boosts.length, 'boosts');
      
      for (const boost of boosts) {
        console.log(`🔍 Boost ${boost.id}: ${boost.boostType} niveau ${boost.boostLevel} pour produit ${boost.product.id}`);
      }
    } else {
      console.log('❌ Erreur boosts actifs:', response.status);
    }
  } catch (error) {
    console.log('❌ Erreur réseau boosts:', error);
  }
  
  // Test 3: Vérifier les produits boostés
  console.log('⭐ Test 3: Produits boostés...');
  try {
    const response = await fetch('http://localhost:8080/api/boosts/boosted-products', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
      }
    });
    
    if (response.ok) {
      const products = await response.json();
      console.log('✅ Produits boostés:', products.length, 'produits');
    } else {
      console.log('❌ Erreur produits boostés:', response.status);
    }
  } catch (error) {
    console.log('❌ Erreur réseau produits boostés:', error);
  }
  
  // Test 4: Vérifier les prix des boosts
  console.log('💰 Test 4: Prix des boosts...');
  try {
    const response = await fetch('http://localhost:8080/api/boosts/prices', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
      }
    });
    
    if (response.ok) {
      const prices = await response.json();
      console.log('✅ Prix des boosts:', prices);
    } else {
      console.log('❌ Erreur prix boosts:', response.status);
    }
  } catch (error) {
    console.log('❌ Erreur réseau prix boosts:', error);
  }
  
  // Test 5: Vérifier le calcul de profil utilisateur
  console.log('👤 Test 5: Calcul profil utilisateur...');
  try {
    const response = await fetch('http://localhost:8080/api/recommendations/calculate-profile/1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
      }
    });
    
    if (response.ok) {
      console.log('✅ Profil utilisateur calculé');
    } else {
      console.log('❌ Erreur calcul profil:', response.status);
    }
  } catch (error) {
    console.log('❌ Erreur réseau calcul profil:', error);
  }
  
  // Test 6: Vérifier les similarités utilisateur
  console.log('🔗 Test 6: Similarités utilisateur...');
  try {
    const response = await fetch('http://localhost:8080/api/recommendations/calculate-similarities/1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
      }
    });
    
    if (response.ok) {
      console.log('✅ Similarités utilisateur calculées');
    } else {
      console.log('❌ Erreur calcul similarités:', response.status);
    }
  } catch (error) {
    console.log('❌ Erreur réseau calcul similarités:', error);
  }
  
  console.log('🧪 Tests d\'intégration terminés');
};

// Test des services frontend
const testFrontendServices = async () => {
  console.log('📱 Test des services frontend...');
  
  // Simuler l'utilisation des services
  const recommendationService = {
    getSmartRecommendations: async (userId, limit) => {
      console.log(`📊 Récupération de ${limit} recommandations pour l'utilisateur ${userId}`);
      return [];
    },
    getBoostedRecommendations: async (userId, limit) => {
      console.log(`⭐ Récupération de ${limit} recommandations boostées pour l'utilisateur ${userId}`);
      return { products: [], boostedProducts: [] };
    }
  };
  
  const boostService = {
    getActiveBoosts: async () => {
      console.log('🚀 Récupération des boosts actifs');
      return [];
    },
    getBoostPrices: async () => {
      console.log('💰 Récupération des prix des boosts');
      return { premium: 10, standard: 5, urgent: 15 };
    }
  };
  
  // Tests simulés
  await recommendationService.getSmartRecommendations(1, 5);
  await recommendationService.getBoostedRecommendations(1, 5);
  await boostService.getActiveBoosts();
  await boostService.getBoostPrices();
  
  console.log('✅ Services frontend testés');
};

// Exporter pour utilisation
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testIntegration, testFrontendServices };
} else {
  // Pour utilisation dans le navigateur
  window.testIntegration = testIntegration;
  window.testFrontendServices = testFrontendServices;
}

console.log('📋 Script de test d\'intégration chargé. Utilisez testIntegration() ou testFrontendServices() pour lancer les tests.'); 