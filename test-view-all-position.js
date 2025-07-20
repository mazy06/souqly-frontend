console.log('🎯 Test de la position du bouton "Voir tout"...\n');

console.log('✅ Correction apportée:');
console.log('   1. Suppression du marginLeft: 12 du viewAllButton');
console.log('   2. Conservation du justifyContent: space-between du header');
console.log('   3. Conservation du paddingHorizontal: 16 du header');

console.log('\n🔧 Problème identifié:');
console.log('   - Le style viewAllButton avait marginLeft: 12');
console.log('   - Cela poussait le bouton trop à droite');
console.log('   - Le bouton sortait de l\'écran');

console.log('\n📱 Instructions de test:');
console.log('1. Redémarre l\'application');
console.log('2. Va sur l\'écran d\'accueil');
console.log('3. Vérifie que la section "Recommandés pour vous" a:');
console.log('   - Une icône étoile orange à gauche');
console.log('   - Le titre "Recommandés pour vous"');
console.log('   - Un bouton "Voir tout" orange visible à droite');
console.log('   - Le bouton ne sort pas de l\'écran');

console.log('\n🎯 Résultat attendu:');
console.log('   - Bouton "Voir tout" orange visible à droite');
console.log('   - Bouton avec icône chevron-forward');
console.log('   - Bouton dans les limites de l\'écran');
console.log('   - Espacement correct entre titre et bouton');

console.log('\n🔧 Si le bouton n\'est toujours pas visible:');
console.log('   1. Vérifie que le header a bien justifyContent: space-between');
console.log('   2. Vérifie que le paddingHorizontal: 16 est appliqué');
console.log('   3. Vérifie qu\'il n\'y a pas d\'autres marges qui poussent le bouton');
console.log('   4. Vérifie que le titre n\'est pas trop long');

console.log('\n📊 Comparaison avec les autres sections:');
console.log('   - Favoris: bouton "Voir tout" rose visible');
console.log('   - Récents: bouton "Voir tout" bleu visible');
console.log('   - Recommandés: bouton "Voir tout" orange visible (corrigé)'); 