import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { DynamicForm, FormField } from '../types/dynamicForms';
import DynamicFormService from '../services/DynamicFormService';
import { Picker } from '@react-native-picker/picker';

interface RouteParams {
  formId: number;
  formName: string;
}

export default function DynamicFormFieldsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { formId, formName } = route.params as RouteParams;
  const { colors } = useTheme();
  const [form, setForm] = useState<DynamicForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateField, setShowCreateField] = useState(false);
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [fieldData, setFieldData] = useState({
    fieldKey: '',
    fieldLabel: '',
    fieldType: 'text' as 'text' | 'select' | 'textarea' | 'number' | 'date' | 'checkbox',
    fieldPlaceholder: '',
    fieldRequired: false,
    fieldOptions: '',
    fieldValidation: '',
    fieldOrder: 0,
  });

  useEffect(() => {
    loadForm();
  }, [formId]);

  const loadForm = async () => {
    try {
      setLoading(true);
      const formData = await DynamicFormService.getFormById(formId);
      if (formData) {
        setForm(formData);
      } else {
        Alert.alert('Erreur', 'Formulaire non trouvé');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Erreur lors du chargement du formulaire:', error);
      Alert.alert('Erreur', 'Impossible de charger le formulaire');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleAddField = () => {
    setEditingField(null);
    setFieldData({
      fieldKey: '',
      fieldLabel: '',
      fieldType: 'text',
      fieldPlaceholder: '',
      fieldRequired: false,
      fieldOptions: '',
      fieldValidation: '',
      fieldOrder: form?.fields.length || 0,
    });
    setShowCreateField(true);
  };

  const handleEditField = (field: FormField) => {
    setEditingField(field);
    setFieldData({
      fieldKey: field.fieldKey,
      fieldLabel: field.fieldLabel,
      fieldType: field.fieldType,
      fieldPlaceholder: field.fieldPlaceholder || '',
      fieldRequired: field.fieldRequired,
      fieldOptions: field.fieldOptions || '',
      fieldValidation: field.fieldValidation || '',
      fieldOrder: field.fieldOrder,
    });
    setShowCreateField(true);
  };

  const handleDeleteField = (field: FormField) => {
    Alert.alert(
      'Supprimer le champ',
      `Êtes-vous sûr de vouloir supprimer le champ "${field.fieldLabel}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              if (form) {
                const updatedForm = await DynamicFormService.deleteFieldFromForm(form.id, field.id);
                if (updatedForm) {
                  setForm(updatedForm);
                  Alert.alert('Succès', 'Champ supprimé avec succès');
                }
              }
            } catch (error) {
              console.error('Erreur lors de la suppression:', error);
              Alert.alert('Erreur', 'Impossible de supprimer le champ');
            }
          },
        },
      ]
    );
  };

  const handleSaveField = async () => {
    // Validation des champs obligatoires
    if (!fieldData.fieldKey || !fieldData.fieldKey.trim()) {
      Alert.alert('Erreur', 'La clé du champ est obligatoire');
      return;
    }
    
    if (!fieldData.fieldLabel || !fieldData.fieldLabel.trim()) {
      Alert.alert('Erreur', 'Le libellé du champ est obligatoire');
      return;
    }

    try {
      if (form) {
        if (editingField) {
          // Mise à jour du champ
          const updatedForm = await DynamicFormService.updateFieldInForm(form.id, editingField.id, fieldData);
          if (updatedForm) {
            setForm(updatedForm);
            Alert.alert('Succès', 'Champ modifié avec succès');
            setShowCreateField(false);
          }
        } else {
          // Ajout d'un nouveau champ
          const updatedForm = await DynamicFormService.addFieldToForm(form.id, fieldData);
          if (updatedForm) {
            setForm(updatedForm);
            Alert.alert('Succès', 'Champ ajouté avec succès');
            setShowCreateField(false);
          }
        }
      } else {
        Alert.alert('Erreur', 'Formulaire non disponible');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder le champ');
    }
  };

  const renderFieldItem = ({ item }: { item: FormField }) => (
    <View style={[styles.fieldCard, { backgroundColor: colors.card }]}>
      <View style={styles.fieldHeader}>
        <View style={styles.fieldInfo}>
          <Text style={[styles.fieldLabel, { color: colors.text }]}>
            {item.fieldLabel}
          </Text>
          <Text style={[styles.fieldKey, { color: colors.textSecondary }]}>
            {item.fieldKey}
          </Text>
          <Text style={[styles.fieldType, { color: colors.textSecondary }]}>
            Type: {item.fieldType}
          </Text>
          {item.fieldRequired && (
            <Text style={[styles.requiredBadge, { color: colors.danger }]}>
              Obligatoire
            </Text>
          )}
        </View>
        <View style={styles.fieldActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => handleEditField(item)}
          >
            <Ionicons name="create-outline" size={16} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.danger }]}
            onPress={() => handleDeleteField(item)}
          >
            <Ionicons name="trash-outline" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Chargement...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Champs du formulaire
        </Text>
        <TouchableOpacity onPress={handleAddField} style={styles.addButton}>
          <Ionicons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Form Info */}
      <View style={[styles.formInfo, { backgroundColor: colors.card }]}>
        <Text style={[styles.formName, { color: colors.text }]}>
          {formName}
        </Text>
        <Text style={[styles.formStats, { color: colors.textSecondary }]}>
          {form?.fields.length || 0} champs
        </Text>
      </View>

      {/* Formulaire de création intégré */}
      {showCreateField && (
        <View style={[styles.createFieldContainer, { backgroundColor: colors.card }]}>
          <View style={styles.createFieldHeader}>
            <Text style={[styles.createFieldTitle, { color: colors.text }]}>
              {editingField ? 'Modifier le champ' : 'Ajouter un champ'}
            </Text>
            <TouchableOpacity onPress={() => setShowCreateField(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.createFieldBody}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Clé du champ *
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.background,
                  },
                ]}
                value={fieldData.fieldKey}
                onChangeText={(text) => setFieldData({ ...fieldData, fieldKey: text })}
                placeholder="Ex: taille, couleur, prix"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Libellé du champ *
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.background,
                  },
                ]}
                value={fieldData.fieldLabel}
                onChangeText={(text) => setFieldData({ ...fieldData, fieldLabel: text })}
                placeholder="Ex: Taille, Couleur, Prix"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Type de champ
              </Text>
              <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
                <Picker
                  selectedValue={fieldData.fieldType}
                  onValueChange={(value) => setFieldData({ ...fieldData, fieldType: value })}
                  style={[styles.picker, { color: colors.text }]}
                >
                  <Picker.Item label="Texte" value="text" />
                  <Picker.Item label="Sélection" value="select" />
                  <Picker.Item label="Zone de texte" value="textarea" />
                  <Picker.Item label="Nombre" value="number" />
                  <Picker.Item label="Date" value="date" />
                  <Picker.Item label="Case à cocher" value="checkbox" />
                </Picker>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Placeholder
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.background,
                  },
                ]}
                value={fieldData.fieldPlaceholder}
                onChangeText={(text) => setFieldData({ ...fieldData, fieldPlaceholder: text })}
                placeholder="Texte d'aide..."
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            {fieldData.fieldType === 'select' && (
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Options (séparées par des virgules)
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
                  value={fieldData.fieldOptions}
                  onChangeText={(text) => setFieldData({ ...fieldData, fieldOptions: text })}
                  placeholder="Option 1, Option 2, Option 3"
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={3}
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <TouchableOpacity
                style={[
                  styles.checkboxContainer,
                  {
                    backgroundColor: fieldData.fieldRequired ? colors.primary : colors.card,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setFieldData({ ...fieldData, fieldRequired: !fieldData.fieldRequired })}
              >
                <Ionicons
                  name={fieldData.fieldRequired ? "checkmark" : "ellipse-outline"}
                  size={20}
                  color={fieldData.fieldRequired ? "white" : colors.textSecondary}
                />
                <Text style={[styles.checkboxLabel, { color: fieldData.fieldRequired ? "white" : colors.text }]}>
                  Champ obligatoire
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.createFieldFooter}>
            <TouchableOpacity
              style={[styles.createFieldButton, { backgroundColor: colors.border }]}
              onPress={() => setShowCreateField(false)}
            >
              <Text style={[styles.createFieldButtonText, { color: colors.text }]}>
                Annuler
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.createFieldButton, { backgroundColor: colors.primary }]}
              onPress={handleSaveField}
            >
              <Text style={[styles.createFieldButtonText, { color: 'white' }]}>
                {editingField ? 'Modifier' : 'Ajouter'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {!form || form.fields.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="list-outline" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Aucun champ
            </Text>
            <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
              Ajoutez des champs à votre formulaire pour commencer
            </Text>
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: colors.primary }]}
              onPress={handleAddField}
            >
              <Text style={[styles.createButtonText, { color: 'white' }]}>
                Ajouter un champ
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={form.fields.sort((a, b) => a.fieldOrder - b.fieldOrder)}
            renderItem={renderFieldItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        )}
      </ScrollView>


    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  addButton: {
    padding: 8,
  },
  formInfo: {
    margin: 20,
    padding: 16,
    borderRadius: 12,
  },
  formName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  formStats: {
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  createButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  fieldCard: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  fieldInfo: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  fieldKey: {
    fontSize: 12,
    marginBottom: 4,
  },
  fieldType: {
    fontSize: 12,
    marginBottom: 4,
  },
  requiredBadge: {
    fontSize: 12,
    fontWeight: '600',
  },
  fieldActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
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
    minHeight: 80,
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  checkboxLabel: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
  },

  // Styles pour le formulaire intégré
  createFieldContainer: {
    margin: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  createFieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  createFieldTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  createFieldBody: {
    padding: 20,
    maxHeight: 400,
  },
  createFieldFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 10,
  },
  createFieldButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  createFieldButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 