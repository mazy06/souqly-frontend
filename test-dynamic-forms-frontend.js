const fs = require('fs');
const path = require('path');

console.log('🧪 Test des composants frontend des formulaires dynamiques\n');

// Vérifier les fichiers essentiels
const filesToCheck = [
  'screens/DynamicFormsManagementScreen.tsx',
  'screens/DynamicFormFieldsScreen.tsx',
  'components/DynamicForm.tsx',
  'services/DynamicFormService.ts',
  'types/dynamicForms.ts',
  'navigation/ProfileStack.tsx'
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

// Vérifier les imports dans ProfileStack
console.log('\n🔍 Vérification des imports dans ProfileStack...');
try {
  const profileStackPath = path.join(__dirname, 'navigation/ProfileStack.tsx');
  const profileStackContent = fs.readFileSync(profileStackPath, 'utf8');
  
  if (profileStackContent.includes('DynamicFormsManagementScreen')) {
    console.log('✅ DynamicFormsManagementScreen importé');
  } else {
    console.log('❌ DynamicFormsManagementScreen non importé');
  }
  
  if (profileStackContent.includes('DynamicFormFieldsScreen')) {
    console.log('✅ DynamicFormFieldsScreen importé');
  } else {
    console.log('❌ DynamicFormFieldsScreen non importé');
  }
  
  if (profileStackContent.includes('DynamicFormsManagement')) {
    console.log('✅ Route DynamicFormsManagement définie');
  } else {
    console.log('❌ Route DynamicFormsManagement manquante');
  }
  
  if (profileStackContent.includes('DynamicFormFields')) {
    console.log('✅ Route DynamicFormFields définie');
  } else {
    console.log('❌ Route DynamicFormFields manquante');
  }
} catch (error) {
  console.log('❌ Erreur lors de la vérification de ProfileStack:', error.message);
}

// Vérifier les types de navigation
console.log('\n🔍 Vérification des types de navigation...');
try {
  const navigationTypesPath = path.join(__dirname, 'types/navigation.ts');
  const navigationTypesContent = fs.readFileSync(navigationTypesPath, 'utf8');
  
  if (navigationTypesContent.includes('DynamicFormsManagement')) {
    console.log('✅ DynamicFormsManagement dans les types');
  } else {
    console.log('❌ DynamicFormsManagement manquant dans les types');
  }
  
  if (navigationTypesContent.includes('DynamicFormFields')) {
    console.log('✅ DynamicFormFields dans les types');
  } else {
    console.log('❌ DynamicFormFields manquant dans les types');
  }
} catch (error) {
  console.log('❌ Erreur lors de la vérification des types:', error.message);
}

// Vérifier le service DynamicFormService
console.log('\n🔍 Vérification du service DynamicFormService...');
try {
  const servicePath = path.join(__dirname, 'services/DynamicFormService.ts');
  const serviceContent = fs.readFileSync(servicePath, 'utf8');
  
  const requiredMethods = [
    'getFormByCategory',
    'getAllForms',
    'createForm',
    'updateForm',
    'deleteForm',
    'getFormById',
    'addFieldToForm',
    'updateFieldInForm',
    'deleteFieldFromForm'
  ];
  
  requiredMethods.forEach(method => {
    if (serviceContent.includes(`async ${method}`)) {
      console.log(`✅ Méthode ${method} présente`);
    } else {
      console.log(`❌ Méthode ${method} manquante`);
    }
  });
} catch (error) {
  console.log('❌ Erreur lors de la vérification du service:', error.message);
}

// Vérifier le composant DynamicForm
console.log('\n🔍 Vérification du composant DynamicForm...');
try {
  const componentPath = path.join(__dirname, 'components/DynamicForm.tsx');
  const componentContent = fs.readFileSync(componentPath, 'utf8');
  
  if (componentContent.includes('DynamicFormProps')) {
    console.log('✅ Interface DynamicFormProps définie');
  } else {
    console.log('❌ Interface DynamicFormProps manquante');
  }
  
  if (componentContent.includes('categoryId')) {
    console.log('✅ Prop categoryId présente');
  } else {
    console.log('❌ Prop categoryId manquante');
  }
  
  if (componentContent.includes('onFormSubmit')) {
    console.log('✅ Prop onFormSubmit présente');
  } else {
    console.log('❌ Prop onFormSubmit manquante');
  }
} catch (error) {
  console.log('❌ Erreur lors de la vérification du composant:', error.message);
}

console.log('\n✅ Vérification terminée'); 