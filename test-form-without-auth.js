const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:8080/api';

async function testFormAPIWithoutAuth() {
  console.log('🧪 Test de l\'API des formulaires sans authentification\n');

  try {
    // Test 1: Récupérer tous les formulaires
    console.log('📋 Test 1: Récupération de tous les formulaires...');
    const formsResponse = await fetch(`${API_BASE_URL}/admin/forms`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(`Status: ${formsResponse.status} ${formsResponse.statusText}`);

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
          },
        });

        console.log(`Status: ${formResponse.status} ${formResponse.statusText}`);

        if (formResponse.ok) {
          const form = await formResponse.json();
          console.log(`✅ Formulaire trouvé: "${form.name}"`);
          console.log(`📊 Nombre de champs: ${form.fields ? form.fields.length : 0}`);
          
          // Afficher les détails du formulaire
          console.log('\n📋 Détails du formulaire:');
          console.log(`- ID: ${form.id}`);
          console.log(`- Nom: ${form.name}`);
          console.log(`- Description: ${form.description}`);
          console.log(`- Catégorie ID: ${form.categoryId}`);
          console.log(`- Actif: ${form.isActive}`);
          console.log(`- Champs: ${JSON.stringify(form.fields, null, 2)}`);
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
          },
          body: JSON.stringify({
            name: 'Formulaire Test',
            description: 'Formulaire de test pour vérification',
            categoryId: 1,
            isActive: true
          }),
        });

        console.log(`Status: ${createResponse.status} ${createResponse.statusText}`);

        if (createResponse.ok) {
          const newForm = await createResponse.json();
          console.log(`✅ Formulaire créé: ID=${newForm.id}, Nom="${newForm.name}"`);
        } else {
          const errorText = await createResponse.text();
          console.log(`❌ Erreur ${createResponse.status}: ${errorText}`);
        }
      }
    } else {
      const errorText = await formsResponse.text();
      console.log(`❌ Erreur ${formsResponse.status}: ${errorText}`);
    }

  } catch (error) {
    console.log('❌ Erreur de connexion:', error.message);
    console.log('💡 Vérifiez que le backend est démarré sur http://localhost:8080');
  }

  console.log('\n✅ Test terminé');
}

testFormAPIWithoutAuth(); 