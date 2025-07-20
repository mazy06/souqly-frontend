const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:8080/api';

async function testFormAPI() {
  console.log('🧪 Test de l\'API des formulaires dynamiques\n');

  try {
    // Test 1: Récupérer tous les formulaires
    console.log('📋 Test 1: Récupération de tous les formulaires...');
    const formsResponse = await fetch(`${API_BASE_URL}/admin/forms`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token', // Remplacez par un vrai token
      },
    });

    if (formsResponse.ok) {
      const forms = await formsResponse.json();
      console.log(`✅ ${forms.length} formulaires trouvés`);
      
      if (forms.length > 0) {
        const firstForm = forms[0];
        console.log(`📝 Premier formulaire: ID=${firstForm.id}, Nom="${firstForm.name}"`);
        
        // Test 2: Récupérer le premier formulaire par ID
        console.log('\n📋 Test 2: Récupération du formulaire par ID...');
        const formResponse = await fetch(`${API_BASE_URL}/admin/forms/${firstForm.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          },
        });

        if (formResponse.ok) {
          const form = await formResponse.json();
          console.log(`✅ Formulaire trouvé: "${form.name}"`);
          console.log(`📊 Nombre de champs: ${form.fields ? form.fields.length : 0}`);
        } else {
          console.log(`❌ Erreur ${formResponse.status}: ${formResponse.statusText}`);
        }
      } else {
        console.log('⚠️ Aucun formulaire trouvé - créons-en un pour tester');
        
        // Test 3: Créer un formulaire de test
        console.log('\n📋 Test 3: Création d\'un formulaire de test...');
        const createResponse = await fetch(`${API_BASE_URL}/admin/forms`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          },
          body: JSON.stringify({
            name: 'Formulaire Test',
            description: 'Formulaire de test pour vérification',
            categoryId: 1,
            isActive: true
          }),
        });

        if (createResponse.ok) {
          const newForm = await createResponse.json();
          console.log(`✅ Formulaire créé: ID=${newForm.id}, Nom="${newForm.name}"`);
        } else {
          console.log(`❌ Erreur ${createResponse.status}: ${createResponse.statusText}`);
        }
      }
    } else {
      console.log(`❌ Erreur ${formsResponse.status}: ${formsResponse.statusText}`);
    }

  } catch (error) {
    console.log('❌ Erreur de connexion:', error.message);
    console.log('💡 Vérifiez que le backend est démarré sur http://localhost:8080');
  }

  console.log('\n✅ Test terminé');
}

testFormAPI(); 