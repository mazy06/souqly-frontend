const fetch = require('node-fetch');

console.log('🔍 Debug du filtrage et de la désactivation\n');

async function testFilterAndToggle() {
  try {
    console.log('📋 1. Récupération des formulaires initiaux...');
    
    const initialResponse = await fetch('http://localhost:8080/api/admin/forms', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!initialResponse.ok) {
      console.log('❌ Erreur lors de la récupération initiale');
      return;
    }

    const initialForms = await initialResponse.json();
    console.log(`✅ ${initialForms.length} formulaires trouvés`);
    
    const activeForms = initialForms.filter(f => f.isActive);
    const inactiveForms = initialForms.filter(f => !f.isActive);
    
    console.log(`📊 - Actifs: ${activeForms.length}`);
    console.log(`📊 - Inactifs: ${inactiveForms.length}`);
    
    if (activeForms.length === 0) {
      console.log('⚠️ Aucun formulaire actif trouvé pour tester');
      return;
    }

    // Prendre le premier formulaire actif pour le test
    const testForm = activeForms[0];
    console.log(`\n🎯 Test avec le formulaire: "${testForm.name}" (ID: ${testForm.id}, Actif: ${testForm.isActive})`);

    console.log('\n📋 2. Désactivation du formulaire...');
    
    const toggleResponse = await fetch(`http://localhost:8080/api/admin/forms/${testForm.id}/toggle-status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (toggleResponse.ok) {
      const updatedForm = await toggleResponse.json();
      console.log(`✅ Formulaire désactivé: "${updatedForm.name}" (Actif: ${updatedForm.isActive})`);
      
      console.log('\n📋 3. Vérification après désactivation...');
      
      const afterToggleResponse = await fetch('http://localhost:8080/api/admin/forms', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (afterToggleResponse.ok) {
        const afterForms = await afterToggleResponse.json();
        const afterActiveForms = afterForms.filter(f => f.isActive);
        const afterInactiveForms = afterForms.filter(f => !f.isActive);
        
        console.log(`📊 - Actifs: ${afterActiveForms.length}`);
        console.log(`📊 - Inactifs: ${afterInactiveForms.length}`);
        
        // Vérifier si le formulaire testé est maintenant inactif
        const testFormAfter = afterForms.find(f => f.id === testForm.id);
        if (testFormAfter) {
          console.log(`✅ Le formulaire testé est maintenant: ${testFormAfter.isActive ? 'Actif' : 'Inactif'}`);
          
          if (!testFormAfter.isActive) {
            console.log('✅ Le formulaire apparaît dans les inactifs');
          } else {
            console.log('❌ Le formulaire n\'apparaît pas dans les inactifs');
          }
        }
        
        console.log('\n📋 4. Test de réactivation...');
        
        const reactivateResponse = await fetch(`http://localhost:8080/api/admin/forms/${testForm.id}/toggle-status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (reactivateResponse.ok) {
          const reactivatedForm = await reactivateResponse.json();
          console.log(`✅ Formulaire réactivé: "${reactivatedForm.name}" (Actif: ${reactivatedForm.isActive})`);
          
          console.log('\n📋 5. Vérification finale...');
          
          const finalResponse = await fetch('http://localhost:8080/api/admin/forms', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (finalResponse.ok) {
            const finalForms = await finalResponse.json();
            const finalActiveForms = finalForms.filter(f => f.isActive);
            const finalInactiveForms = finalForms.filter(f => !f.isActive);
            
            console.log(`📊 - Actifs: ${finalActiveForms.length}`);
            console.log(`📊 - Inactifs: ${finalInactiveForms.length}`);
            
            console.log('\n✅ Test terminé avec succès!');
            console.log('💡 Si les compteurs ne se mettent pas à jour dans l\'app, c\'est un problème d\'état local');
            
          } else {
            console.log('❌ Erreur lors de la vérification finale');
          }
        } else {
          console.log('❌ Erreur lors de la réactivation');
        }
        
      } else {
        console.log('❌ Erreur lors de la vérification après désactivation');
      }
      
    } else {
      console.log('❌ Erreur lors de la désactivation');
    }

  } catch (error) {
    console.log('❌ Erreur:', error.message);
  }
}

testFilterAndToggle(); 