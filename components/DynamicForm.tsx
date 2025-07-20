import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '../contexts/ThemeContext';
import { DynamicForm, FormField, FormValues } from '../types/dynamicForms';
import DynamicFormService from '../services/DynamicFormService';

interface DynamicFormProps {
  categoryId: number;
  onFormSubmit?: (values: FormValues) => void;
  initialValues?: FormValues;
  isEditing?: boolean;
}

export default function DynamicFormComponent({
  categoryId,
  onFormSubmit,
  initialValues = {},
  isEditing = false,
}: DynamicFormProps) {
  const { colors } = useTheme();
  const [form, setForm] = useState<DynamicForm | null>(null);
  const [formValues, setFormValues] = useState<FormValues>(initialValues);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadForm();
  }, [categoryId]);

  const loadForm = async () => {
    try {
      setLoading(true);
      const dynamicForm = await DynamicFormService.getFormByCategory(categoryId);
      setForm(dynamicForm);
    } catch (error) {
      console.error('Erreur lors du chargement du formulaire:', error);
      Alert.alert('Erreur', 'Impossible de charger le formulaire');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldKey: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [fieldKey]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!form) return false;

    for (const field of form.fields) {
      if (field.fieldRequired && (!formValues[field.fieldKey] || formValues[field.fieldKey] === '')) {
        Alert.alert('Champ requis', `Le champ "${field.fieldLabel}" est obligatoire`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      
      if (onFormSubmit) {
        onFormSubmit(formValues);
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder les données');
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const value = String(formValues[field.fieldKey] || '');

    switch (field.fieldType) {
      case 'select':
        return (
          <View key={field.id} style={styles.fieldContainer}>
            <Text style={[styles.label, { color: colors.text }]}>
              {field.fieldLabel}
              {field.fieldRequired && <Text style={{ color: colors.danger }}> *</Text>}
            </Text>
            <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
              <Picker
                selectedValue={value}
                onValueChange={(itemValue) => handleInputChange(field.fieldKey, String(itemValue))}
                style={[styles.picker, { color: colors.text }]}
              >
                <Picker.Item label={field.fieldPlaceholder || 'Sélectionnez...'} value="" />
                {field.fieldOptions?.split(',').map((option, index) => (
                  <Picker.Item
                    key={index}
                    label={option.trim()}
                    value={option.trim()}
                  />
                ))}
              </Picker>
            </View>
          </View>
        );

      case 'textarea':
        return (
          <View key={field.id} style={styles.fieldContainer}>
            <Text style={[styles.label, { color: colors.text }]}>
              {field.fieldLabel}
              {field.fieldRequired && <Text style={{ color: colors.danger }}> *</Text>}
            </Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: colors.background,
                },
              ]}
              placeholder={field.fieldPlaceholder}
              placeholderTextColor={colors.textSecondary}
              value={value}
              onChangeText={(text) => handleInputChange(field.fieldKey, text)}
              multiline
              numberOfLines={4}
            />
          </View>
        );

      case 'number':
        return (
          <View key={field.id} style={styles.fieldContainer}>
            <Text style={[styles.label, { color: colors.text }]}>
              {field.fieldLabel}
              {field.fieldRequired && <Text style={{ color: colors.danger }}> *</Text>}
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: colors.background,
                },
              ]}
              placeholder={field.fieldPlaceholder}
              placeholderTextColor={colors.textSecondary}
              value={value}
              onChangeText={(text) => handleInputChange(field.fieldKey, text)}
              keyboardType="numeric"
            />
          </View>
        );

      default: // text
        return (
          <View key={field.id} style={styles.fieldContainer}>
            <Text style={[styles.label, { color: colors.text }]}>
              {field.fieldLabel}
              {field.fieldRequired && <Text style={{ color: colors.danger }}> *</Text>}
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: colors.background,
                },
              ]}
              placeholder={field.fieldPlaceholder}
              placeholderTextColor={colors.textSecondary}
              value={value}
              onChangeText={(text) => handleInputChange(field.fieldKey, text)}
            />
          </View>
        );
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Chargement du formulaire...
        </Text>
      </View>
    );
  }

  if (!form) {
    return (
      <View style={styles.noFormContainer}>
        <Text style={[styles.noFormText, { color: colors.textSecondary }]}>
          Aucun formulaire spécifique pour cette catégorie.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {form.name}
        </Text>
        {form.description && (
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {form.description}
          </Text>
        )}
      </View>

      <View style={styles.formContainer}>
        {form.fields
          .sort((a, b) => a.fieldOrder - b.fieldOrder)
          .map(renderField)}
      </View>

      {onFormSubmit && (
        <View style={styles.submitContainer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              {
                backgroundColor: colors.primary,
              },
            ]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Text style={[styles.submitButtonText, { color: colors.text }]}>
              {submitting ? 'Sauvegarde...' : isEditing ? 'Mettre à jour' : 'Continuer'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  noFormContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noFormText: {
    fontSize: 16,
    textAlign: 'center',
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
  description: {
    fontSize: 16,
    lineHeight: 22,
  },
  formContainer: {
    padding: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  submitContainer: {
    padding: 20,
    paddingTop: 10,
  },
  submitButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 