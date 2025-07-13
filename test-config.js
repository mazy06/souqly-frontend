// Script de test pour vérifier la configuration
const { CONFIG, getBaseUrl, getApiUrl } = require('./constants/Config.ts');

console.log('🔧 Test de Configuration Souqly');
console.log('================================');

console.log('\n📋 Configuration actuelle:');
console.log('- Environnement:', CONFIG.environment);
console.log('- URL de base:', CONFIG.apiBaseUrl);
console.log('- Chemin API:', CONFIG.apiPath);
console.log('- Plateforme:', CONFIG.platform);

console.log('\n🌐 URLs générées:');
console.log('- URL de base:', getBaseUrl());
console.log('- URL API exemple:', getApiUrl('/products'));

console.log('\n⚙️ Configuration personnalisée:');
console.log('- URL personnalisée:', CONFIG.customConfig.hasCustomBaseUrl ? 'Oui' : 'Non');
console.log('- Chemin personnalisé:', CONFIG.customConfig.hasCustomPath ? 'Oui' : 'Non');

console.log('\n✅ Test terminé !');
console.log('\n💡 Si vous voyez "localhost:8080", la configuration fonctionne correctement.');
console.log('💡 Si vous voyez une IP locale, c\'est normal si vous testez sur un appareil physique.'); 