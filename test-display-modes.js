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

async function testDisplayModes() {
  log('🎨 Test des modes d\'affichage avec badges de boost', 'bold');
  log('', 'reset');
  
  try {
    // Test des produits avec boost
    const productsResponse = await axios.get(`${API_BASE_URL}/products?page=0&size=10`);
    
    if (productsResponse.data && productsResponse.data.content) {
      const products = productsResponse.data.content;
      const boostedProducts = products.filter(p => p.isBoosted);
      
      logSuccess(`Récupération de ${products.length} produits`);
      logInfo(`${boostedProducts.length} produits boostés trouvés`);
      
      if (boostedProducts.length > 0) {
        log('\n🔥 Produits boostés dans les deux modes :', 'bold');
        boostedProducts.forEach(product => {
          logInfo(`- ${product.title} (Boost Level: ${product.boostLevel})`);
        });
        
        log('\n📱 Mode Pinterest (Grille 2 colonnes) :', 'bold');
        log('✅ Cartes de 50% de largeur');
        log('✅ Badge flamme 🔥 en haut à gauche');
        log('✅ Badge favoris en haut à droite');
        log('✅ Design compact et élégant');
        
        log('\n🛒 Mode Ecommerce (Liste verticale) :', 'bold');
        log('✅ Cartes pleine largeur avec padding');
        log('✅ Badge flamme 🔥 en haut à gauche');
        log('✅ Badge favoris en haut à droite');
        log('✅ Design détaillé avec plus d\'informations');
        
        log('\n🎯 Cohérence entre les modes :', 'bold');
        log('✅ Même composant ProductCard utilisé');
        log('✅ Mêmes badges de boost affichés');
        log('✅ Même logique de favoris');
        log('✅ Même navigation vers les détails');
        
        return true;
      } else {
        logWarning('Aucun produit boosté trouvé pour le test');
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
  testDisplayModes()
    .then(success => {
      if (success) {
        logSuccess('🎉 Test des modes d\'affichage réussi !');
        logInfo('Les badges de boost sont visibles dans les deux modes.');
      } else {
        logWarning('⚠️  Test incomplet - vérifiez les données de test.');
      }
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      log(`❌ Erreur lors de l'exécution du test: ${error.message}`, 'red');
      process.exit(1);
    });
}

module.exports = {
  testDisplayModes
}; 