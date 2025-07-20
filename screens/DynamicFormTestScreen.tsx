import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import DynamicFormComponent from '../components/DynamicForm';
import { FormValues } from '../types/dynamicForms';

export default function DynamicFormTestScreen() {
  const { colors } = useTheme();
  const [selectedCategoryId, setSelectedCategoryId] = useState(10); // Catégorie Vêtements

  const handleFormSubmit = (values: FormValues) => {
    console.log('Valeurs du formulaire:', values);
    Alert.alert(
      'Formulaire soumis',
      `Valeurs: ${JSON.stringify(values, null, 2)}`,
      [
        {
          text: 'OK',
          onPress: () => console.log('OK Pressed'),
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Test Formulaire Dynamique
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Catégorie: Vêtements (ID: {selectedCategoryId})
        </Text>
      </View>

      <DynamicFormComponent
        categoryId={selectedCategoryId}
        onFormSubmit={handleFormSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
  },
}); 