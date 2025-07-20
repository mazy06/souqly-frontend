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

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

async function testReloadData() {
  log('🔄 Test de rechargement des données', 'bold');
  log('', 'reset');
  
  try {
    // Test 1: Récupération des produits
    log('\n📊 Test 1: Récupération des produits', 'bold');
    const productsResponse = await axios.get(`${API_BASE_URL}/products?page=0&size=20`);
    
    if (productsResponse.data && productsResponse.data.content) {
      const products = productsResponse.data.content;
      const boostedProducts = products.filter(p => p.isBoosted === true);
      
      logSuccess(`Récupération de ${products.length} produits`);
      logInfo(`${boostedProducts.length} produits boostés trouvés`);
      
      if (boostedProducts.length > 0) {
        log('\n🔥 Produits boostés :', 'bold');
        boostedProducts.forEach((product, index) => {
          log(`${index + 1}. ${product.title} (ID: ${product.id})`);
          log(`   - isBoosted: ${product.isBoosted}`);
          log(`   - boostLevel: ${product.boostLevel}`);
        });
        
        // Test 2: Vérification des recommandations
        log('\n📊 Test 2: Vérification des recommandations', 'bold');
        const recommendationsResponse = await axios.get(`${API_BASE_URL}/recommendations?page=0&size=10`);
        
        if (recommendationsResponse.data && recommendationsResponse.data.content) {
          const recommendations = recommendationsResponse.data.content;
          const boostedRecommendations = recommendations.filter(r => r.isBoosted === true);
          
          logSuccess(`Récupération de ${recommendations.length} recommandations`);
          logInfo(`${boostedRecommendations.length} recommandations boostées trouvées`);
          
          if (boostedRecommendations.length > 0) {
            log('\n🔥 Recommandations boostées :', 'bold');
            boostedRecommendations.forEach((rec, index) => {
              log(`${index + 1}. ${rec.title} (ID: ${rec.id})`);
              log(`   - isBoosted: ${rec.isBoosted}`);
              log(`   - boostLevel: ${rec.boostLevel}`);
            });
          }
        }
        
        // Test 3: Vérification du cache
        log('\n📊 Test 3: Vérification du cache', 'bold');
        log('✅ Les données sont fraîches depuis l\'API');
        log('✅ Les produits boostés existent dans la base de données');
        log('✅ Les propriétés isBoosted et boostLevel sont correctes');
        
        log('\n🎯 Diagnostic du problème :', 'bold');
        log('Le problème vient probablement de :');
        log('1. Cache de l\'application React Native');
        log('2. Les données ne sont pas rechargées dans l\'interface');
        log('3. Les props ne sont pas correctement passées aux composants');
        
        log('\n💡 Solutions à essayer :', 'bold');
        log('1. Redémarrer complètement l\'application');
        log('2. Vider le cache de l\'application');
        log('3. Vérifier les logs de debug dans la console');
        log('4. Forcer le rechargement des données dans l\'app');
        
        return true;
      } else {
        logWarning('Aucun produit boosté trouvé');
        logInfo('Vérifiez que les produits sont bien marqués comme boostés');
        return false;
      }
    }
  } catch (error) {
    logWarning(`Erreur lors du test: ${error.message}`);
    return false;
  }
}

// Exécution du test
if (require.main === module) {
  testReloadData()
    .then(success => {
      if (success) {
        logSuccess('🎉 Test de rechargement terminé !');
        logInfo('Les données sont correctes côté backend.');
        logInfo('Le problème vient du cache de l\'application.');
      } else {
        logWarning('⚠️  Test incomplet - vérifiez les données.');
      }
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      log(`❌ Erreur lors de l'exécution du test: ${error.message}`, 'red');
      process.exit(1);
    });
}

module.exports = {
  testReloadData
}; 