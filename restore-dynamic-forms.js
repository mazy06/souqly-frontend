const fetch = require('node-fetch');

console.log('🔄 Restauration des formulaires dynamiques\n');

async function restoreDynamicForms() {
  try {
    console.log('📋 Récupération des catégories...');
    
    // Récupérer les catégories
    const categoriesResponse = await fetch('http://localhost:8080/api/categories', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!categoriesResponse.ok) {
      console.log('❌ Erreur lors de la récupération des catégories');
      return;
    }

    const categories = await categoriesResponse.json();
    console.log(`✅ ${categories.length} catégories trouvées`);
    
    if (categories.length === 0) {
      console.log('❌ Aucune catégorie disponible');
      return;
    }

    // Formulaires à restaurer (les formulaires originaux)
    const formsToRestore = [
      {
        name: 'Formulaire Vêtements',
        description: 'Formulaire pour les vêtements avec taille et couleur',
        categoryId: categories.find(c => c.key === 'vetements')?.id || categories[0].id,
        isActive: true
      },
      {
        name: 'Formulaire Électronique',
        description: 'Formulaire pour les appareils électroniques',
        categoryId: categories.find(c => c.key === 'electronique')?.id || categories[0].id,
        isActive: true
      },
      {
        name: 'Formulaire Livres',
        description: 'Formulaire pour les livres et publications',
        categoryId: categories.find(c => c.key === 'livres')?.id || categories[0].id,
        isActive: true
      },
      {
        name: 'Formulaire Mobilier',
        description: 'Formulaire pour les meubles et décoration',
        categoryId: categories.find(c => c.key === 'mobilier')?.id || categories[0].id,
        isActive: true
      }
    ];

    console.log('\n📝 Restauration des formulaires...');
    
    for (let i = 0; i < formsToRestore.length; i++) {
      const form = formsToRestore[i];
      console.log(`\n${i + 1}. Restauration de "${form.name}"...`);
      
      const createResponse = await fetch('http://localhost:8080/api/admin/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          categoryId: form.categoryId
        }),
      });

      if (createResponse.ok) {
        const createdForm = await createResponse.json();
        console.log(`✅ Formulaire restauré: "${createdForm.name}" (ID: ${createdForm.id}, Actif: ${createdForm.isActive})`);
        
        // Ajouter quelques champs de test pour chaque formulaire
        if (form.name.includes('Vêtements')) {
          await addTestFields(createdForm.id, [
            { fieldKey: 'taille', fieldLabel: 'Taille', fieldType: 'select', fieldOptions: 'XS,S,M,L,XL,XXL', fieldRequired: true },
            { fieldKey: 'couleur', fieldLabel: 'Couleur', fieldType: 'text', fieldRequired: true },
            { fieldKey: 'matiere', fieldLabel: 'Matière', fieldType: 'text', fieldRequired: false },
            { fieldKey: 'etat', fieldLabel: 'État', fieldType: 'select', fieldOptions: 'Neuf,Très bon état,Bon état,Correct', fieldRequired: true }
          ]);
        } else if (form.name.includes('Électronique')) {
          await addTestFields(createdForm.id, [
            { fieldKey: 'marque', fieldLabel: 'Marque', fieldType: 'text', fieldRequired: true },
            { fieldKey: 'modele', fieldLabel: 'Modèle', fieldType: 'text', fieldRequired: true },
            { fieldKey: 'etat', fieldLabel: 'État', fieldType: 'select', fieldOptions: 'Neuf,Très bon état,Bon état,Correct', fieldRequired: true },
            { fieldKey: 'garantie', fieldLabel: 'Garantie', fieldType: 'text', fieldRequired: false }
          ]);
        } else {
          await addTestFields(createdForm.id, [
            { fieldKey: 'titre', fieldLabel: 'Titre', fieldType: 'text', fieldRequired: true },
            { fieldKey: 'auteur', fieldLabel: 'Auteur', fieldType: 'text', fieldRequired: true },
            { fieldKey: 'etat', fieldLabel: 'État', fieldType: 'select', fieldOptions: 'Neuf,Très bon état,Bon état,Correct', fieldRequired: true },
            { fieldKey: 'annee', fieldLabel: 'Année', fieldType: 'text', fieldRequired: false }
          ]);
        }
        
      } else {
        console.log(`❌ Erreur lors de la restauration de "${form.name}"`);
      }
    }

    console.log('\n📊 Vérification finale...');
    const finalResponse = await fetch('http://localhost:8080/api/admin/forms', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (finalResponse.ok) {
      const forms = await finalResponse.json();
      console.log(`✅ ${forms.length} formulaires restaurés`);
      
      const activeForms = forms.filter(f => f.isActive);
      const inactiveForms = forms.filter(f => !f.isActive);
      
      console.log(`📈 - Actifs: ${activeForms.length}`);
      console.log(`📉 - Inactifs: ${inactiveForms.length}`);
      
      console.log('\n🎉 Formulaires dynamiques restaurés avec succès!');
      console.log('💡 Le composant de filtre devrait maintenant apparaître dans l\'application');
      console.log('🔧 Vous pouvez maintenant tester les fonctionnalités de désactivation et de filtrage');
      
    } else {
      console.log('❌ Erreur lors de la vérification finale');
    }

  } catch (error) {
    console.log('❌ Erreur:', error.message);
  }
}

async function addTestFields(formId, fields) {
  console.log(`  📝 Ajout de ${fields.length} champs...`);
  
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    const fieldResponse = await fetch(`http://localhost:8080/api/admin/forms/${formId}/fields`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...field,
        fieldPlaceholder: field.fieldType === 'select' ? 'Sélectionnez...' : 'Saisissez...',
        fieldOrder: i + 1,
        fieldValidation: null
      }),
    });

    if (fieldResponse.ok) {
      console.log(`    ✅ Champ "${field.fieldLabel}" ajouté`);
    } else {
      console.log(`    ❌ Erreur lors de l'ajout du champ "${field.fieldLabel}"`);
    }
  }
}

restoreDynamicForms(); 