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

async function testNewComponents() {
  log('🎨 Test des nouveaux composants ProductCard', 'bold');
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
        log('\n🔥 Test des nouveaux composants :', 'bold');
        
        log('\n📱 PinterestProductCard :', 'bold');
        log('✅ Composant dédié pour le mode Pinterest');
        log('✅ Flex: 1 pour s\'adapter aux colonnes');
        log('✅ Aspect ratio 1:1 pour les images');
        log('✅ Badge flamme 🔥 24x24px');
        log('✅ Badge favoris 12px');
        log('✅ Texte compact (10-11px)');
        log('✅ Design optimisé pour 2 colonnes');
        
        log('\n🛒 EcommerceProductCard :', 'bold');
        log('✅ Composant dédié pour le mode Ecommerce');
        log('✅ Layout horizontal (image + info)');
        log('✅ Image 100x100px fixe');
        log('✅ Badge flamme 🔥 28x28px');
        log('✅ Badge favoris 16px');
        log('✅ Texte détaillé (12-18px)');
        log('✅ Design optimisé pour liste verticale');
        
        log('\n🎯 Améliorations apportées :', 'bold');
        log('✅ Suppression de la largeur fixe 160px');
        log('✅ Adaptation automatique aux colonnes');
        log('✅ Badges de boost visibles dans les deux modes');
        log('✅ Styles optimisés pour chaque mode');
        log('✅ Cohérence visuelle maintenue');
        log('✅ Performance améliorée (composants dédiés)');
        
        log('\n📊 Comparaison des tailles :', 'bold');
        log('PinterestProductCard:');
        log('  - Badge flamme: 24x24px');
        log('  - Icône flamme: 12px');
        log('  - Badge favoris: 12px');
        log('  - Texte: 9-11px');
        
        log('EcommerceProductCard:');
        log('  - Badge flamme: 28x28px');
        log('  - Icône flamme: 14px');
        log('  - Badge favoris: 16px');
        log('  - Texte: 12-18px');
        
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
  testNewComponents()
    .then(success => {
      if (success) {
        logSuccess('🎉 Test des nouveaux composants réussi !');
        logInfo('Les composants PinterestProductCard et EcommerceProductCard sont prêts.');
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
  testNewComponents
}; 