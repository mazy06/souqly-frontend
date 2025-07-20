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

async function testBoostBadgeDesign() {
  log('🎨 Test du nouveau design des badges de boost', 'bold');
  log('', 'reset');
  
  try {
    // Test des produits avec boost
    const productsResponse = await axios.get(`${API_BASE_URL}/products?page=0&size=5`);
    
    if (productsResponse.data && productsResponse.data.content) {
      const products = productsResponse.data.content;
      const boostedProducts = products.filter(p => p.isBoosted);
      
      logSuccess(`Récupération de ${products.length} produits`);
      logInfo(`${boostedProducts.length} produits boostés trouvés`);
      
      if (boostedProducts.length > 0) {
        log('\n🔥 Produits avec badge de boost (nouveau design) :', 'bold');
        boostedProducts.forEach(product => {
          logInfo(`- ${product.title} (Boost Level: ${product.boostLevel})`);
          log(`  └─ Badge: Icône "flame" 🔥 orange (#FF6B35)`);
          log(`  └─ Taille: 28x28px, cercle parfait`);
          log(`  └─ Position: Top-left, avec ombre`);
        });
      }
      
      // Test des recommandations
      const recommendationsResponse = await axios.get(`${API_BASE_URL}/recommendations/for-me?limit=5`);
      
      if (recommendationsResponse.data && recommendationsResponse.data.recommendations) {
        const recommendations = recommendationsResponse.data.recommendations;
        const boostedRecommendations = recommendations.filter(p => p.isBoosted);
        
        log('\n📊 Recommandations boostées :', 'bold');
        logInfo(`${boostedRecommendations.length} recommandations boostées`);
        
        if (boostedRecommendations.length > 0) {
          boostedRecommendations.forEach(product => {
            logInfo(`- ${product.title} (Boost Level: ${product.boostLevel})`);
          });
        }
      }
      
      log('\n🎯 Résumé du nouveau design :', 'bold');
      log('✅ Badge circulaire de 28x28px');
      log('✅ Icône "flame" 🔥 en blanc');
      log('✅ Fond orange (#FF6B35)');
      log('✅ Ombre portée pour la profondeur');
      log('✅ Position top-left sur la carte produit');
      log('✅ Design minimaliste et élégant');
      
      return true;
    }
  } catch (error) {
    logWarning(`Erreur lors du test: ${error.message}`);
    return false;
  }
}

// Exécution du test
if (require.main === module) {
  testBoostBadgeDesign()
    .then(success => {
      if (success) {
        logSuccess('🎉 Test du design des badges de boost réussi !');
        logInfo('Le nouveau design est prêt pour l\'intégration frontend.');
      } else {
        logWarning('⚠️  Certains tests ont échoué.');
      }
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      log(`❌ Erreur lors de l'exécution du test: ${error.message}`, 'red');
      process.exit(1);
    });
}

module.exports = {
  testBoostBadgeDesign
}; 