const axios = require('axios');

const API_BASE_URL = 'http://localhost:8080/api';

// Fonction pour tester l'authentification
async function login() {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@souqly.com',
      password: 'admin123'
    });
    return response.data.token;
  } catch (error) {
    console.error('Erreur de connexion:', error.response?.data || error.message);
    return null;
  }
}

// Fonction pour créer un signalement
async function createReport(token, reportData) {
  try {
    const response = await axios.post(`${API_BASE_URL}/reports`, reportData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Signalement créé avec succès:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Erreur lors de la création du signalement:', error.response?.data || error.message);
    return null;
  }
}

// Fonction pour récupérer tous les signalements
async function getAllReports(token) {
  try {
    const response = await axios.get(`${API_BASE_URL}/reports`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Signalements récupérés:', response.data.length, 'signalements trouvés');
    return response.data;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des signalements:', error.response?.data || error.message);
    return null;
  }
}

// Fonction pour récupérer les statistiques
async function getReportStats(token) {
  try {
    const response = await axios.get(`${API_BASE_URL}/reports/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Statistiques récupérées:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des statistiques:', error.response?.data || error.message);
    return null;
  }
}

// Fonction pour mettre à jour le statut d'un signalement
async function updateReportStatus(token, reportId, status) {
  try {
    const response = await axios.put(`${API_BASE_URL}/reports/${reportId}/status`, {
      status: status
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Statut du signalement mis à jour:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du statut:', error.response?.data || error.message);
    return null;
  }
}

// Test principal
async function runTests() {
  console.log('🚀 Démarrage des tests du système de signalement...\n');

  // 1. Connexion
  console.log('1. Test de connexion...');
  const token = await login();
  if (!token) {
    console.error('❌ Impossible de se connecter. Arrêt des tests.');
    return;
  }
  console.log('✅ Connexion réussie\n');

  // 2. Créer un signalement de test
  console.log('2. Test de création de signalement...');
  const testReport = {
    productId: 1, // Assurez-vous qu'un produit avec cet ID existe
    userId: 1,    // Assurez-vous qu'un utilisateur avec cet ID existe
    reasons: ['Prix suspect ou trompeur', 'Description trompeuse'],
    customReason: 'Ce produit semble trop bon pour être vrai',
    description: 'Le prix est très bas par rapport au marché et les photos semblent suspectes.'
  };
  
  const createdReport = await createReport(token, testReport);
  if (!createdReport) {
    console.error('❌ Impossible de créer le signalement. Arrêt des tests.');
    return;
  }
  console.log('✅ Signalement créé avec succès\n');

  // 3. Récupérer tous les signalements
  console.log('3. Test de récupération des signalements...');
  const reports = await getAllReports(token);
  if (!reports) {
    console.error('❌ Impossible de récupérer les signalements.');
    return;
  }
  console.log('✅ Signalements récupérés avec succès\n');

  // 4. Récupérer les statistiques
  console.log('4. Test de récupération des statistiques...');
  const stats = await getReportStats(token);
  if (!stats) {
    console.error('❌ Impossible de récupérer les statistiques.');
    return;
  }
  console.log('✅ Statistiques récupérées avec succès\n');

  // 5. Mettre à jour le statut du signalement créé
  console.log('5. Test de mise à jour du statut...');
  const updatedReport = await updateReportStatus(token, createdReport.id, 'REVIEWED');
  if (!updatedReport) {
    console.error('❌ Impossible de mettre à jour le statut.');
    return;
  }
  console.log('✅ Statut mis à jour avec succès\n');

  // 6. Afficher les résultats finaux
  console.log('📊 Résultats finaux:');
  console.log('- Signalements créés:', reports.length);
  console.log('- Statistiques:', stats);
  console.log('- Dernier signalement mis à jour:', updatedReport.status);

  console.log('\n🎉 Tous les tests sont passés avec succès!');
}

// Exécuter les tests
runTests().catch(error => {
  console.error('❌ Erreur lors de l\'exécution des tests:', error);
}); 