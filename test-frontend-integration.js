const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:8080/api';

// Couleurs pour les logs
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

async function testBackendConnection() {
  logInfo('Test de connexion au backend...');
  
  try {
    const response = await axios.get(`${API_BASE_URL}/products?page=0&size=1`);
    if (response.status === 200) {
      logSuccess('Backend accessible');
      return true;
    }
  } catch (error) {
    logError(`Backend inaccessible: ${error.message}`);
    return false;
  }
}

async function testBoostFields() {
  logInfo('Test des champs boost dans l\'API...');
  
  try {
    const response = await axios.get(`${API_BASE_URL}/products?page=0&size=5`);
    
    if (response.data && response.data.content) {
      const products = response.data.content;
      const boostedProducts = products.filter(p => p.isBoosted);
      
      logSuccess(`Récupération de ${products.length} produits`);
      logInfo(`${boostedProducts.length} produits boostés trouvés`);
      
      if (boostedProducts.length > 0) {
        boostedProducts.forEach(product => {
          logInfo(`- ${product.title} (Boost Level: ${product.boostLevel})`);
        });
      }
      
      return true;
    }
  } catch (error) {
    logError(`Erreur lors du test des champs boost: ${error.message}`);
    return false;
  }
}

async function testRecommendations() {
  logInfo('Test des recommandations avec boost...');
  
  try {
    const response = await axios.get(`${API_BASE_URL}/recommendations/for-me?limit=10`);
    
    if (response.data && response.data.recommendations) {
      const recommendations = response.data.recommendations;
      const boostedRecommendations = recommendations.filter(p => p.isBoosted);
      
      logSuccess(`Récupération de ${recommendations.length} recommandations`);
      logInfo(`${boostedRecommendations.length} recommandations boostées`);
      
      if (boostedRecommendations.length > 0) {
        boostedRecommendations.forEach(product => {
          logInfo(`- ${product.title} (Boost Level: ${product.boostLevel})`);
        });
      }
      
      return true;
    }
  } catch (error) {
    logError(`Erreur lors du test des recommandations: ${error.message}`);
    return false;
  }
}

async function testCacheClearing() {
  logInfo('Test du nettoyage du cache...');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/products/cache/clear`);
    
    if (response.status === 200) {
      logSuccess('Cache nettoyé avec succès');
      return true;
    }
  } catch (error) {
    logError(`Erreur lors du nettoyage du cache: ${error.message}`);
    return false;
  }
}

async function runIntegrationTests() {
  log('🚀 Démarrage des tests d\'intégration frontend', 'bold');
  log('', 'reset');
  
  const tests = [
    { name: 'Connexion Backend', test: testBackendConnection },
    { name: 'Champs Boost', test: testBoostFields },
    { name: 'Recommandations', test: testRecommendations },
    { name: 'Nettoyage Cache', test: testCacheClearing }
  ];
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  for (const test of tests) {
    log(`\n📋 Test: ${test.name}`, 'bold');
    const result = await test.test();
    if (result) {
      passedTests++;
    }
  }
  
  log('\n📊 Résumé des tests', 'bold');
  log(`Tests réussis: ${passedTests}/${totalTests}`, passedTests === totalTests ? 'green' : 'yellow');
  
  if (passedTests === totalTests) {
    logSuccess('🎉 Tous les tests d\'intégration sont passés !');
    logInfo('Le frontend peut maintenant utiliser les fonctionnalités de boost.');
  } else {
    logWarning('⚠️  Certains tests ont échoué. Vérifiez la configuration.');
  }
  
  return passedTests === totalTests;
}

// Exécution des tests
if (require.main === module) {
  runIntegrationTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      logError(`Erreur lors de l'exécution des tests: ${error.message}`);
      process.exit(1);
    });
}

module.exports = {
  runIntegrationTests,
  testBackendConnection,
  testBoostFields,
  testRecommendations,
  testCacheClearing
}; 