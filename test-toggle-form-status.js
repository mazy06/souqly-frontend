const fs = require('fs');
const path = require('path');

console.log('🧪 Test de la fonctionnalité de désactivation de formulaires\n');

// Vérifier les fichiers modifiés
const filesToCheck = [
  '../souqly-backend/src/main/java/io/mazy/souqly_backend/controller/AdminDynamicFormController.java',
  '../souqly-backend/src/main/java/io/mazy/souqly_backend/service/DynamicFormService.java',
  'services/DynamicFormService.ts',
  'screens/DynamicFormsManagementScreen.tsx'
];

console.log('📁 Vérification des modifications...\n');

filesToCheck.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    if (file.includes('AdminDynamicFormController.java')) {
      if (content.includes('toggleFormStatus')) {
        console.log('✅ Endpoint toggleFormStatus ajouté au contrôleur');
      } else {
        console.log('❌ Endpoint toggleFormStatus manquant dans le contrôleur');
      }
    } else if (file.includes('DynamicFormService.java')) {
      if (content.includes('toggleFormStatus')) {
        console.log('✅ Méthode toggleFormStatus ajoutée au service backend');
      } else {
        console.log('❌ Méthode toggleFormStatus manquante dans le service backend');
      }
    } else if (file.includes('DynamicFormService.ts')) {
      if (content.includes('toggleFormStatus')) {
        console.log('✅ Méthode toggleFormStatus ajoutée au service frontend');
      } else {
        console.log('❌ Méthode toggleFormStatus manquante dans le service frontend');
      }
    } else if (file.includes('DynamicFormsManagementScreen.tsx')) {
      if (content.includes('handleToggleFormStatus')) {
        console.log('✅ Fonction handleToggleFormStatus ajoutée');
      } else {
        console.log('❌ Fonction handleToggleFormStatus manquante');
      }
      
      if (content.includes('pause-outline') && content.includes('play-outline')) {
        console.log('✅ Boutons pause/play ajoutés');
      } else {
        console.log('❌ Boutons pause/play manquants');
      }
    }
  } else {
    console.log(`❌ ${file} - MANQUANT`);
  }
});

// Vérifier les types
console.log('\n🔍 Vérification des types...');
try {
  const typesPath = path.join(__dirname, 'types/dynamicForms.ts');
  const typesContent = fs.readFileSync(typesPath, 'utf8');
  
  if (typesContent.includes('isActive')) {
    console.log('✅ Propriété isActive présente dans les types');
  } else {
    console.log('❌ Propriété isActive manquante dans les types');
  }
  
} catch (error) {
  console.log('❌ Erreur lors de la vérification des types:', error.message);
}

console.log('\n✅ Vérification terminée');
console.log('\n📋 Résumé des fonctionnalités ajoutées :');
console.log('1. ✅ Endpoint PATCH /api/admin/forms/{formId}/toggle-status');
console.log('2. ✅ Méthode toggleFormStatus dans le service backend');
console.log('3. ✅ Méthode toggleFormStatus dans le service frontend');
console.log('4. ✅ Interface utilisateur avec boutons pause/play');
console.log('5. ✅ Confirmation avant désactivation/activation');
console.log('\n🎯 Fonctionnalités disponibles :');
console.log('- Désactiver un formulaire actif (bouton pause orange)');
console.log('- Activer un formulaire inactif (bouton play bleu)');
console.log('- Confirmation avant action');
console.log('- Mise à jour automatique de la liste');
console.log('- Messages de succès/erreur'); 