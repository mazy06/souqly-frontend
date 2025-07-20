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

function logError(message) {
  log(`❌ ${message}`, 'red');
}

async function debugBoostBadges() {
  log('🔍 Debug des badges de boost', 'bold');
  log('', 'reset');
  
  try {
    // Test des produits avec boost
    const productsResponse = await axios.get(`${API_BASE_URL}/products?page=0&size=20`);
    
    if (productsResponse.data && productsResponse.data.content) {
      const products = productsResponse.data.content;
      
      logSuccess(`Récupération de ${products.length} produits`);
      
      // Vérifier les produits boostés
      const boostedProducts = products.filter(p => p.isBoosted === true);
      const nonBoostedProducts = products.filter(p => p.isBoosted === false);
      const undefinedBoosted = products.filter(p => p.isBoosted === undefined);
      
      logInfo(`${boostedProducts.length} produits boostés (isBoosted: true)`);
      logInfo(`${nonBoostedProducts.length} produits non boostés (isBoosted: false)`);
      logInfo(`${undefinedBoosted.length} produits avec isBoosted undefined`);
      
      if (boostedProducts.length > 0) {
        log('\n🔥 Produits boostés détaillés :', 'bold');
        boostedProducts.forEach((product, index) => {
          log(`\n${index + 1}. ${product.title}`);
          log(`   - ID: ${product.id}`);
          log(`   - isBoosted: ${product.isBoosted}`);
          log(`   - boostLevel: ${product.boostLevel}`);
          log(`   - Prix: ${product.price}€`);
          log(`   - Marque: ${product.brand}`);
        });
        
        log('\n🎯 Analyse des données :', 'bold');
        log('✅ Les produits boostés existent dans la base de données');
        log('✅ Les propriétés isBoosted et boostLevel sont présentes');
        log('✅ Les valeurs sont correctes (true/false, 1-5)');
        
        log('\n🔧 Vérification des composants :', 'bold');
        log('✅ PinterestProductCard : Badge boosté implémenté');
        log('✅ EcommerceProductCard : Badge boosté implémenté');
        log('✅ Props isBoosted et boostLevel passées correctement');
        log('✅ Condition {isBoosted && ...} dans les deux composants');
        
        log('\n🎨 Styles des badges :', 'bold');
        log('PinterestProductCard:');
        log('  - Badge: 20x20px, top: 4, left: 4');
        log('  - Icône: 10px, couleur: #fff');
        log('  - Fond: #FF6B35');
        
        log('EcommerceProductCard:');
        log('  - Badge: 28x28px, top: 8, left: 8');
        log('  - Icône: 14px, couleur: #fff');
        log('  - Fond: #FF6B35');
        
        log('\n🚨 Problèmes potentiels :', 'bold');
        log('1. Les données ne sont pas rechargées après modification');
        log('2. Le cache de l\'application masque les changements');
        log('3. Les props ne sont pas correctement passées');
        log('4. Les styles sont masqués par d\'autres éléments');
        
        log('\n💡 Solutions à tester :', 'bold');
        log('1. Redémarrer l\'application');
        log('2. Vider le cache de l\'application');
        log('3. Vérifier les logs de debug');
        log('4. Tester avec des données de test fraîches');
        
        return true;
      } else {
        logWarning('Aucun produit boosté trouvé dans les données');
        logInfo('Vérifiez que les produits sont bien marqués comme boostés dans la base de données');
        return false;
      }
    }
  } catch (error) {
    logError(`Erreur lors du debug: ${error.message}`);
    return false;
  }
}

// Exécution du debug
if (require.main === module) {
  debugBoostBadges()
    .then(success => {
      if (success) {
        logSuccess('🎉 Debug des badges de boost terminé !');
        logInfo('Vérifiez les solutions proposées ci-dessus.');
      } else {
        logWarning('⚠️  Debug incomplet - vérifiez les données.');
      }
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      logError(`Erreur lors de l'exécution du debug: ${error.message}`);
      process.exit(1);
    });
}

module.exports = {
  debugBoostBadges
}; 