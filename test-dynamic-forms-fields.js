const fs = require('fs');
const path = require('path');

console.log('🧪 Test de la gestion des champs de formulaires dynamiques\n');

// Vérifier les fichiers essentiels
const filesToCheck = [
  'screens/DynamicFormFieldsScreen.tsx',
  'services/DynamicFormService.ts',
  'types/dynamicForms.ts'
];

console.log('📁 Vérification des fichiers...\n');

filesToCheck.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`✅ ${file} (${stats.size} bytes)`);
  } else {
    console.log(`❌ ${file} - MANQUANT`);
  }
});

// Vérifier les imports dans DynamicFormFieldsScreen
console.log('\n🔍 Vérification des imports dans DynamicFormFieldsScreen...');
try {
  const fieldsScreenPath = path.join(__dirname, 'screens/DynamicFormFieldsScreen.tsx');
  const fieldsScreenContent = fs.readFileSync(fieldsScreenPath, 'utf8');
  
  const requiredImports = [
    'Picker',
    'DynamicFormService',
    'DynamicForm',
    'FormField'
  ];
  
  requiredImports.forEach(importName => {
    if (fieldsScreenContent.includes(importName)) {
      console.log(`✅ Import ${importName} présent`);
    } else {
      console.log(`❌ Import ${importName} manquant`);
    }
  });
  
  // Vérifier les méthodes du service
  const servicePath = path.join(__dirname, 'services/DynamicFormService.ts');
  const serviceContent = fs.readFileSync(servicePath, 'utf8');
  
  const requiredMethods = [
    'getFormById',
    'addFieldToForm',
    'updateFieldInForm',
    'deleteFieldFromForm'
  ];
  
  console.log('\n🔍 Vérification des méthodes du service...');
  requiredMethods.forEach(method => {
    if (serviceContent.includes(`async ${method}`)) {
      console.log(`✅ Méthode ${method} présente`);
    } else {
      console.log(`❌ Méthode ${method} manquante`);
    }
  });
  
  // Vérifier la gestion d'erreurs
  console.log('\n🔍 Vérification de la gestion d\'erreurs...');
  if (fieldsScreenContent.includes('if (formData)')) {
    console.log('✅ Vérification du formulaire null présente');
  } else {
    console.log('❌ Vérification du formulaire null manquante');
  }
  
  if (fieldsScreenContent.includes('fieldData.fieldKey.trim()')) {
    console.log('✅ Validation des champs avec trim() présente');
  } else {
    console.log('❌ Validation des champs avec trim() manquante');
  }
  
  // Vérifier la modal
  if (fieldsScreenContent.includes('Modal')) {
    console.log('✅ Modal présente');
  } else {
    console.log('❌ Modal manquante');
  }
  
  // Vérifier les champs de saisie
  const requiredFields = [
    'fieldKey',
    'fieldLabel',
    'fieldType',
    'fieldPlaceholder'
  ];
  
  console.log('\n🔍 Vérification des champs de saisie...');
  requiredFields.forEach(field => {
    if (fieldsScreenContent.includes(`fieldData.${field}`)) {
      console.log(`✅ Champ ${field} présent`);
    } else {
      console.log(`❌ Champ ${field} manquant`);
    }
  });
  
} catch (error) {
  console.log('❌ Erreur lors de la vérification:', error.message);
}

console.log('\n✅ Vérification terminée'); 