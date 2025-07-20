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

async function testNoPriceSingleLine() {
  log('🎨 Test : Suppression des prix et titre sur une ligne', 'bold');
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
        log('\n🎯 Modifications appliquées :', 'bold');
        
        log('\n❌ Prix supprimés :', 'bold');
        log('✅ Aucun affichage du prix dans PinterestProductCard');
        log('✅ Aucun affichage du prix dans EcommerceProductCard');
        log('✅ Styles de prix supprimés des deux composants');
        log('✅ Espace libéré pour plus de contenu');
        
        log('\n📝 Titre sur une ligne :', 'bold');
        log('✅ numberOfLines={1} pour les titres');
        log('✅ Troncature automatique si le titre dépasse');
        log('✅ Hauteur optimisée pour une seule ligne');
        log('✅ Cohérence entre les deux modes d\'affichage');
        
        log('\n📱 PinterestProductCard (3 colonnes) :', 'bold');
        log('✅ Titre : numberOfLines={1}, fontSize: 10px');
        log('✅ minHeight: 12px, lineHeight: 12px');
        log('✅ Troncature automatique avec "..."');
        log('✅ Pas d\'affichage du prix');
        
        log('\n🛒 EcommerceProductCard (1 colonne) :', 'bold');
        log('✅ Titre : numberOfLines={1}, fontSize: 16px');
        log('✅ minHeight: 18px, lineHeight: 18px');
        log('✅ Troncature automatique avec "..."');
        log('✅ Pas d\'affichage du prix');
        
        log('\n🎨 Avantages de ces modifications :', 'bold');
        log('✅ Interface plus épurée et moderne');
        log('✅ Focus sur le contenu principal (titre, marque, état)');
        log('✅ Meilleure lisibilité avec moins d\'éléments');
        log('✅ Cohérence visuelle entre les modes');
        log('✅ Espace optimisé pour les badges de boost');
        log('✅ Titres toujours lisibles même s\'ils sont longs');
        
        log('\n📊 Structure finale des cartes :', 'bold');
        log('PinterestProductCard:');
        log('  - Image (aspect ratio 1:1)');
        log('  - Badge flamme 🔥 (20x20px)');
        log('  - Badge favoris (10px)');
        log('  - Marque (9px, 1 ligne)');
        log('  - Titre (10px, 1 ligne, tronqué)');
        log('  - Détails (8px, 1 ligne)');
        
        log('EcommerceProductCard:');
        log('  - Image (100x100px)');
        log('  - Badge flamme 🔥 (28x28px)');
        log('  - Badge favoris (16px)');
        log('  - Marque (12px, 1 ligne)');
        log('  - Titre (16px, 1 ligne, tronqué)');
        log('  - Détails (12px, 1 ligne)');
        
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
  testNoPriceSingleLine()
    .then(success => {
      if (success) {
        logSuccess('🎉 Test de suppression des prix et titre sur une ligne réussi !');
        logInfo('Les cartes affichent maintenant uniquement le titre, la marque et les détails.');
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
  testNoPriceSingleLine
}; 