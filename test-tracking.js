// Script de test pour vérifier le tracking des interactions
// À exécuter dans la console du navigateur ou via React Native Debugger

const testTracking = async () => {
  console.log('🧪 Test du système de tracking...');
  
  // Simuler une vue de produit
  console.log('📱 Test tracking vue produit...');
  try {
    const response = await fetch('http://localhost:8080/api/interactions/track/view', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
      },
      body: JSON.stringify({
        productId: 1,
        userId: 1,
        sessionId: 'test-session-123',
        userAgent: 'SouqlyApp/test'
      })
    });
    
    if (response.ok) {
      console.log('✅ Vue produit trackée avec succès');
    } else {
      console.log('❌ Erreur tracking vue produit:', response.status);
    }
  } catch (error) {
    console.log('❌ Erreur réseau:', error);
  }
  
  // Simuler une recherche
  console.log('🔍 Test tracking recherche...');
  try {
    const response = await fetch('http://localhost:8080/api/interactions/track/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
      },
      body: JSON.stringify({
        query: 'iPhone 13',
        userId: 1,
        sessionId: 'test-session-123',
        userAgent: 'SouqlyApp/test'
      })
    });
    
    if (response.ok) {
      console.log('✅ Recherche trackée avec succès');
    } else {
      console.log('❌ Erreur tracking recherche:', response.status);
    }
  } catch (error) {
    console.log('❌ Erreur réseau:', error);
  }
  
  // Simuler un favori
  console.log('❤️ Test tracking favori...');
  try {
    const response = await fetch('http://localhost:8080/api/interactions/track/favorite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
      },
      body: JSON.stringify({
        productId: 1,
        userId: 1,
        sessionId: 'test-session-123',
        userAgent: 'SouqlyApp/test'
      })
    });
    
    if (response.ok) {
      console.log('✅ Favori tracké avec succès');
    } else {
      console.log('❌ Erreur tracking favori:', response.status);
    }
  } catch (error) {
    console.log('❌ Erreur réseau:', error);
  }
  
  console.log('🧪 Tests terminés');
};

// Exporter pour utilisation
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testTracking };
} else {
  // Pour utilisation dans le navigateur
  window.testTracking = testTracking;
}

console.log('📋 Script de test chargé. Utilisez testTracking() pour lancer les tests.'); 