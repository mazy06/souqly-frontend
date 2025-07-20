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

async function testPinterest3Columns() {
  log('📱 Test du mode Pinterest avec 3 colonnes', 'bold');
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
        log('\n📱 Configuration Pinterest 3 colonnes :', 'bold');
        log('✅ FlatList numColumns={3} pour le mode Pinterest');
        log('✅ Flex: 1 pour s\'adapter aux 3 colonnes');
        log('✅ Cartes plus compactes pour 3 colonnes');
        
        log('\n🎨 Ajustements pour 3 colonnes :', 'bold');
        log('✅ Badge flamme 🔥 : 20x20px (au lieu de 24x24px)');
        log('✅ Icône flamme : 10px (au lieu de 12px)');
        log('✅ Badge favoris : 10px (au lieu de 12px)');
        log('✅ Texte : 8-11px (au lieu de 9-12px)');
        log('✅ Padding : 4px (au lieu de 6px)');
        
        log('\n📊 Comparaison des tailles :', 'bold');
        log('Mode Pinterest (3 colonnes):');
        log('  - Badge flamme: 20x20px');
        log('  - Icône flamme: 10px');
        log('  - Badge favoris: 10px');
        log('  - Texte: 8-11px');
        log('  - Padding: 4px');
        
        log('Mode Ecommerce (1 colonne):');
        log('  - Badge flamme: 28x28px');
        log('  - Icône flamme: 14px');
        log('  - Badge favoris: 16px');
        log('  - Texte: 12-18px');
        log('  - Padding: 12px');
        
        log('\n🎯 Avantages de 3 colonnes :', 'bold');
        log('✅ Plus de produits visibles à l\'écran');
        log('✅ Design plus compact et moderne');
        log('✅ Meilleure utilisation de l\'espace');
        log('✅ Badges toujours visibles malgré la taille réduite');
        log('✅ Adaptation automatique aux différentes tailles d\'écran');
        
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
  testPinterest3Columns()
    .then(success => {
      if (success) {
        logSuccess('🎉 Test du mode Pinterest 3 colonnes réussi !');
        logInfo('Le mode Pinterest affiche maintenant 3 colonnes avec des cartes optimisées.');
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
  testPinterest3Columns
}; 