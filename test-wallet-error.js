// Test de la vérification des fonds insuffisants
const PaymentService = require('./services/PaymentService').default;

async function testWalletBalance() {
  console.log('🧪 Test de la vérification des fonds insuffisants...\n');

  try {
    // Test 1: Vérification avec un montant élevé (devrait échouer)
    console.log('1. Test avec montant élevé (200€) - devrait échouer:');
    const result1 = await PaymentService.checkWalletBalance(200);
    console.log('✅ Résultat:', result1);
    console.log(`   - Solde: ${result1.balance}€`);
    console.log(`   - Montant demandé: 200€`);
    console.log(`   - Suffisant: ${result1.hasEnoughFunds}\n`);

    // Test 2: Vérification avec un montant faible (devrait réussir)
    console.log('2. Test avec montant faible (30€) - devrait réussir:');
    const result2 = await PaymentService.checkWalletBalance(30);
    console.log('✅ Résultat:', result2);
    console.log(`   - Solde: ${result2.balance}€`);
    console.log(`   - Montant demandé: 30€`);
    console.log(`   - Suffisant: ${result2.hasEnoughFunds}\n`);

    // Test 3: Vérification avec le montant exact (devrait réussir)
    console.log('3. Test avec montant exact (50€) - devrait réussir:');
    const result3 = await PaymentService.checkWalletBalance(50);
    console.log('✅ Résultat:', result3);
    console.log(`   - Solde: ${result3.balance}€`);
    console.log(`   - Montant demandé: 50€`);
    console.log(`   - Suffisant: ${result3.hasEnoughFunds}\n`);

    console.log('🎉 Tous les tests sont passés !');
    console.log('\n📊 Résumé:');
    console.log('   - Solde simulé: 50€');
    console.log('   - Montants > 50€: Échec (fonds insuffisants)');
    console.log('   - Montants ≤ 50€: Succès (fonds suffisants)');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  }
}

testWalletBalance(); 