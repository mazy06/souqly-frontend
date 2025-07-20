const axios = require('axios');

const BASE_URL = 'http://localhost:8080/api';
const ADMIN_TOKEN = 'eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBzb3VxbHkuY29tIiwiaWF0IjoxNzUzMDI0ODAxLCJleHAiOjE3NTMxMTEyMDEsInVzZXJJZCI6MSwicm9sZSI6IkFETUlOIn0.rIyuiGpngcLc2T2JFXrEZJ9Hhkz7Uap-pgFcwNIcaDjIvxf-SoQcjmfOPVYHhbJL';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${ADMIN_TOKEN}`
};

async function testDynamicFormsAPI() {
  console.log('🧪 Test des endpoints des formulaires dynamiques\n');

  try {
    // 1. Test GET /api/admin/forms
    console.log('1. Test GET /api/admin/forms');
    try {
      const response = await axios.get(`${BASE_URL}/admin/forms`, { headers });
      console.log('✅ Succès:', response.data.length, 'formulaires trouvés');
    } catch (error) {
      console.log('❌ Erreur:', error.response?.status, error.response?.data);
    }

    // 2. Test POST /api/admin/forms (créer un formulaire)
    console.log('\n2. Test POST /api/admin/forms');
    const newForm = {
      name: 'Test Formulaire',
      description: 'Formulaire de test',
      categoryId: 1,
      fields: []
    };
    
    try {
      const response = await axios.post(`${BASE_URL}/admin/forms`, newForm, { headers });
      console.log('✅ Succès: Formulaire créé avec ID:', response.data.id);
      const formId = response.data.id;
      
      // 3. Test GET /api/admin/forms/{id}
      console.log('\n3. Test GET /api/admin/forms/' + formId);
      try {
        const getResponse = await axios.get(`${BASE_URL}/admin/forms/${formId}`, { headers });
        console.log('✅ Succès: Formulaire récupéré');
      } catch (error) {
        console.log('❌ Erreur:', error.response?.status, error.response?.data);
      }
      
      // 4. Test POST /api/admin/forms/{id}/fields (ajouter un champ)
      console.log('\n4. Test POST /api/admin/forms/' + formId + '/fields');
      const newField = {
        fieldKey: 'test_field',
        fieldLabel: 'Champ de test',
        fieldType: 'text',
        fieldPlaceholder: 'Entrez une valeur',
        fieldRequired: true,
        fieldOptions: '',
        fieldValidation: '',
        fieldOrder: 0
      };
      
      try {
        const fieldResponse = await axios.post(`${BASE_URL}/admin/forms/${formId}/fields`, newField, { headers });
        console.log('✅ Succès: Champ ajouté');
      } catch (error) {
        console.log('❌ Erreur:', error.response?.status, error.response?.data);
      }
      
      // 5. Test DELETE /api/admin/forms/{id}
      console.log('\n5. Test DELETE /api/admin/forms/' + formId);
      try {
        await axios.delete(`${BASE_URL}/admin/forms/${formId}`, { headers });
        console.log('✅ Succès: Formulaire supprimé');
      } catch (error) {
        console.log('❌ Erreur:', error.response?.status, error.response?.data);
      }
      
    } catch (error) {
      console.log('❌ Erreur lors de la création:', error.response?.status, error.response?.data);
    }

    // 6. Test GET /api/forms/category/{categoryId}
    console.log('\n6. Test GET /api/forms/category/1');
    try {
      const response = await axios.get(`${BASE_URL}/forms/category/1`, { headers });
      console.log('✅ Succès: Formulaire pour catégorie récupéré');
    } catch (error) {
      console.log('❌ Erreur:', error.response?.status, error.response?.data);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Test des catégories
async function testCategoriesAPI() {
  console.log('\n🧪 Test des endpoints des catégories\n');
  
  try {
    const response = await axios.get(`${BASE_URL}/categories`, { headers });
    console.log('✅ Succès: Catégories récupérées:', response.data.length, 'catégories');
    return response.data;
  } catch (error) {
    console.log('❌ Erreur:', error.response?.status, error.response?.data);
    return [];
  }
}

// Test principal
async function runTests() {
  console.log('🚀 Démarrage des tests backend...\n');
  
  // Test des catégories d'abord
  const categories = await testCategoriesAPI();
  
  // Test des formulaires dynamiques
  await testDynamicFormsAPI();
  
  console.log('\n✅ Tests terminés');
}

runTests().catch(console.error); 