const axios = require('axios');

const BASE_URL = 'http://localhost:8080/api';

async function testFavorites() {
  try {
    console.log('🧪 Test des endpoints de favoris...\n');

    // Test 1: Récupérer l'état des favoris pour un produit
    console.log('1️⃣ Test getFavoriteStatus...');
    const productId = 1;
    const favoriteStatus = await axios.get(`${BASE_URL}/products/${productId}/favorite`);
    console.log('✅ État des favoris:', favoriteStatus.data);
    console.log('');

    // Test 2: Toggle favoris (ajouter)
    console.log('2️⃣ Test toggleFavorite (ajouter)...');
    const toggleResult = await axios.post(`${BASE_URL}/products/${productId}/favorite`, {});
    console.log('✅ Résultat du toggle:', toggleResult.data);
    console.log('');

    // Test 3: Vérifier l'état après toggle
    console.log('3️⃣ Vérification de l\'état après toggle...');
    const newStatus = await axios.get(`${BASE_URL}/products/${productId}/favorite`);
    console.log('✅ Nouvel état des favoris:', newStatus.data);
    console.log('');

    // Test 4: Toggle favoris (retirer)
    console.log('4️⃣ Test toggleFavorite (retirer)...');
    const toggleResult2 = await axios.post(`${BASE_URL}/products/${productId}/favorite`, {});
    console.log('✅ Résultat du second toggle:', toggleResult2.data);
    console.log('');

    // Test 5: Vérifier l'état final
    console.log('5️⃣ Vérification de l\'état final...');
    const finalStatus = await axios.get(`${BASE_URL}/products/${productId}/favorite`);
    console.log('✅ État final des favoris:', finalStatus.data);
    console.log('');

    console.log('🎉 Tous les tests sont passés !');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.response?.data || error.message);
  }
}

testFavorites(); 