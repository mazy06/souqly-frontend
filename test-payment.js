const ApiService = require('./services/ApiService').default;

// Test du système de paiement
async function testPaymentSystem() {
  console.log('🧪 Test du système de paiement...\n');

  try {
    // Test 1: Récupération des méthodes de paiement
    console.log('1️⃣ Test récupération méthodes de paiement...');
    const methods = await ApiService.get('/api/payments/methods');
    console.log('✅ Méthodes de paiement:', methods);
    console.log('');

    // Test 2: Vérification du solde du portefeuille
    console.log('2️⃣ Test vérification solde portefeuille...');
    const balance = await ApiService.get('/api/payments/wallet/balance');
    console.log('✅ Solde du portefeuille:', balance);
    console.log('');

    // Test 3: Simulation d'un achat
    console.log('3️⃣ Test simulation achat...');
    const purchaseRequest = {
      productId: 1,
      paymentMethodId: 'wallet-1',
      amount: 150.00
    };
    
    const purchaseResult = await ApiService.post('/api/payments/purchase', purchaseRequest);
    console.log('✅ Résultat de l\'achat:', purchaseResult);
    console.log('');

    // Test 4: Historique des transactions
    console.log('4️⃣ Test historique transactions...');
    const transactions = await ApiService.get('/api/payments/transactions');
    console.log('✅ Historique des transactions:', transactions);
    console.log('');

    console.log('🎉 Tous les tests de paiement sont passés avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Exécuter les tests
testPaymentSystem(); 