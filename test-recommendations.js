// Script de test pour vérifier le système de recommandations
// À exécuter dans la console du navigateur ou via React Native Debugger

const testRecommendations = async () => {
  console.log('🧪 Test du système de recommandations...');
  
  // Test des recommandations content-based
  console.log('📊 Test recommandations content-based...');
  try {
    const response = await fetch('http://localhost:8080/api/recommendations/content-based/1?limit=5', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
      }
    });
    
    if (response.ok) {
      const products = await response.json();
      console.log('✅ Recommandations content-based:', products.length, 'produits');
    } else {
      console.log('❌ Erreur recommandations content-based:', response.status);
    }
  } catch (error) {
    console.log('❌ Erreur réseau content-based:', error);
  }
  
  // Test des recommandations collaboratives
  console.log('👥 Test recommandations collaboratives...');
  try {
    const response = await fetch('http://localhost:8080/api/recommendations/collaborative/1?limit=5', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
      }
    });
    
    if (response.ok) {
      const products = await response.json();
      console.log('✅ Recommandations collaboratives:', products.length, 'produits');
    } else {
      console.log('❌ Erreur recommandations collaboratives:', response.status);
    }
  } catch (error) {
    console.log('❌ Erreur réseau collaboratives:', error);
  }
  
  // Test des recommandations hybrides
  console.log('🔀 Test recommandations hybrides...');
  try {
    const response = await fetch('http://localhost:8080/api/recommendations/hybrid/1?limit=5', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
      }
    });
    
    if (response.ok) {
      const products = await response.json();
      console.log('✅ Recommandations hybrides:', products.length, 'produits');
    } else {
      console.log('❌ Erreur recommandations hybrides:', response.status);
    }
  } catch (error) {
    console.log('❌ Erreur réseau hybrides:', error);
  }
  
  // Test du calcul de profil utilisateur
  console.log('👤 Test calcul profil utilisateur...');
  try {
    const response = await fetch('http://localhost:8080/api/recommendations/calculate-profile/1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
      }
    });
    
    if (response.ok) {
      console.log('✅ Profil utilisateur calculé avec succès');
    } else {
      console.log('❌ Erreur calcul profil:', response.status);
    }
  } catch (error) {
    console.log('❌ Erreur réseau calcul profil:', error);
  }
  
  // Test du calcul des similarités
  console.log('🔗 Test calcul similarités...');
  try {
    const response = await fetch('http://localhost:8080/api/recommendations/calculate-similarities/1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
      }
    });
    
    if (response.ok) {
      console.log('✅ Similarités calculées avec succès');
    } else {
      console.log('❌ Erreur calcul similarités:', response.status);
    }
  } catch (error) {
    console.log('❌ Erreur réseau calcul similarités:', error);
  }
  
  console.log('🧪 Tests terminés');
};

// Exporter pour utilisation
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testRecommendations };
} else {
  // Pour utilisation dans le navigateur
  window.testRecommendations = testRecommendations;
}

console.log('📋 Script de test des recommandations chargé. Utilisez testRecommendations() pour lancer les tests.'); 