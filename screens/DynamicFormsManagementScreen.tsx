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
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { DynamicForm, FormField } from '../types/dynamicForms';
import DynamicFormService from '../services/DynamicFormService';
import CategoryService from '../services/CategoryService';
import { ProfileStackParamList } from '../types/navigation';
import { Picker } from '@react-native-picker/picker';

interface Category {
  id: number;
  label: string;
  key: string;
}

export default function DynamicFormsManagementScreen() {
  const navigation = useNavigation<StackNavigationProp<ProfileStackParamList>>();
  const { colors } = useTheme();
  const [forms, setForms] = useState<DynamicForm[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingForm, setEditingForm] = useState<DynamicForm | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: 0,
  });
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [formsData, categoriesData] = await Promise.all([
        DynamicFormService.getAllForms(),
        CategoryService.getAllCategories(),
      ]);

      setForms(formsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      Alert.alert('Erreur', 'Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateForm = () => {
    setEditingForm(null);
    setFormData({
      name: '',
      description: '',
      categoryId: 0,
    });
    setShowCreateForm(true);
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
    setFormData({
      name: '',
      description: '',
      categoryId: 0,
    });
  };

  const handleEditForm = (form: DynamicForm) => {
    setEditingForm(form);
    setFormData({
      name: form.name,
      description: form.description || '',
      categoryId: form.categoryId,
    });
    setShowEditForm(true);
  };

  const handleDeleteForm = (form: DynamicForm) => {
    Alert.alert(
      'Supprimer le formulaire',
      `Êtes-vous sûr de vouloir supprimer le formulaire "${form.name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              // Appel API pour supprimer le formulaire
              await DynamicFormService.deleteForm(form.id);
              await loadData();
              Alert.alert('Succès', 'Formulaire supprimé avec succès');
            } catch (error) {
              console.error('Erreur lors de la suppression:', error);
              Alert.alert('Erreur', 'Impossible de supprimer le formulaire');
            }
          },
        },
      ]
    );
  };

  const handleToggleFormStatus = async (form: DynamicForm) => {
    try {
      const updatedForm = await DynamicFormService.toggleFormStatus(form.id);
      if (updatedForm) {
        await loadData();
      }
    } catch (error) {
      console.error('Erreur lors de la modification du statut:', error);
    }
  };

  const handleSaveForm = async () => {
    if (!formData.name || formData.categoryId === 0) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      if (editingForm) {
        // Mise à jour dans le formulaire intégré
        await DynamicFormService.updateForm(editingForm.id, {
          ...formData,
          fields: editingForm.fields,
        });
        Alert.alert('Succès', 'Formulaire mis à jour avec succès');
        setShowEditForm(false);
      } else {
        // Création dans le formulaire intégré
        await DynamicFormService.createForm({
          ...formData,
          fields: [],
        });
        Alert.alert('Succès', 'Formulaire créé avec succès');
        setShowCreateForm(false);
      }
      
      await loadData();
      // Reset form data
      setFormData({
        name: '',
        description: '',
        categoryId: 0,
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder le formulaire');
    }
  };

  const getCategoryName = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.label || 'Catégorie inconnue';
  };

  const getFilteredForms = () => {
    switch (filterStatus) {
      case 'active':
        return forms.filter(form => form.isActive);
      case 'inactive':
        return forms.filter(form => !form.isActive);
      default:
        return forms;
    }
  };

  const renderFormItem = ({ item }: { item: DynamicForm }) => (
    <View style={[styles.formCard, { backgroundColor: colors.card }]}>
      <View style={styles.formHeader}>
        <View style={styles.formInfo}>
          <Text style={[styles.formName, { color: colors.text }]}>
            {item.name}
          </Text>
          <Text style={[styles.formCategory, { color: colors.textSecondary }]}>
            {getCategoryName(item.categoryId)}
          </Text>
          {item.description && (
            <Text style={[styles.formDescription, { color: colors.textSecondary }]}>
              {item.description}
            </Text>
          )}
        </View>
        <View style={styles.formActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => handleEditForm(item)}
          >
            <Ionicons name="create-outline" size={16} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: item.isActive ? colors.warning : colors.primary }]}
            onPress={() => handleToggleFormStatus(item)}
          >
            <Ionicons name={item.isActive ? "pause-outline" : "play-outline"} size={16} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.danger }]}
            onPress={() => handleDeleteForm(item)}
          >
            <Ionicons name="trash-outline" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.formStats}>
        <Text style={[styles.formStatsText, { color: colors.textSecondary }]}>
          {item.fields.length} champs
        </Text>
        <Text style={[styles.formStatsText, { color: colors.textSecondary }]}>
          {item.isActive ? 'Actif' : 'Inactif'}
        </Text>
        <TouchableOpacity
          style={[styles.manageFieldsButton, { backgroundColor: colors.secondary }]}
          onPress={() => navigation.navigate('DynamicFormFields', { 
            formId: item.id, 
            formName: item.name 
          })}
        >
          <Ionicons name="settings-outline" size={16} color="white" />
          <Text style={[styles.manageFieldsText, { color: 'white' }]}>
            Gérer les champs
          </Text>
        </TouchableOpacity>
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
          Formulaires dynamiques
        </Text>
        <TouchableOpacity onPress={handleCreateForm} style={styles.addButton}>
          <Ionicons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Formulaire de création intégré */}
        {showCreateForm && (
          <View style={[styles.createFormContainer, { backgroundColor: colors.card }]}>
            <View style={styles.createFormHeader}>
              <Text style={[styles.createFormTitle, { color: colors.text }]}>
                Créer un nouveau formulaire
              </Text>
              <TouchableOpacity onPress={handleCancelCreate}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Nom du formulaire *
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
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Ex: Formulaire Vêtements"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Description
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
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="Description du formulaire..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Catégorie *
              </Text>
              <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
                <Picker
                  selectedValue={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                  style={[styles.picker, { color: colors.text }]}
                >
                  <Picker.Item label="Sélectionner une catégorie" value={0} />
                  {categories.map((category) => (
                    <Picker.Item
                      key={category.id}
                      label={category.label}
                      value={category.id}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.createFormActions}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: colors.border }]}
                onPress={handleCancelCreate}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                  Annuler
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.createButton, { backgroundColor: colors.primary }]}
                onPress={handleSaveForm}
              >
                <Text style={[styles.createButtonText, { color: 'white' }]}>
                  Créer
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Formulaire d'édition intégré */}
        {showEditForm && editingForm && (
          <View style={[styles.editFormContainer, { backgroundColor: colors.card }]}>
            <View style={styles.editFormHeader}>
              <Text style={[styles.editFormTitle, { color: colors.text }]}>
                Modifier le formulaire
              </Text>
              <TouchableOpacity onPress={() => setShowEditForm(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.editFormBody}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Nom du formulaire *
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
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder="Ex: Formulaire Vêtements"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Description
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
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  placeholder="Description du formulaire..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Catégorie *
                </Text>
                <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
                  <Picker
                    selectedValue={formData.categoryId}
                    onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                    style={[styles.picker, { color: colors.text }]}
                  >
                    <Picker.Item label="Sélectionner une catégorie" value={0} />
                    {categories.map((category) => (
                      <Picker.Item
                        key={category.id}
                        label={category.label}
                        value={category.id}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            </ScrollView>

            <View style={styles.editFormFooter}>
              <TouchableOpacity
                style={[styles.editFormButton, { backgroundColor: colors.border }]}
                onPress={() => setShowEditForm(false)}
              >
                <Text style={[styles.editFormButtonText, { color: colors.text }]}>
                  Annuler
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.editFormButton, { backgroundColor: colors.primary }]}
                onPress={handleSaveForm}
              >
                <Text style={[styles.editFormButtonText, { color: 'white' }]}>
                  Modifier
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Filtres */}
        {forms.length > 0 && (
          <View style={[styles.filterContainer, { backgroundColor: colors.card }]}>
            <Text style={[styles.filterTitle, { color: colors.text }]}>
              Filtrer par statut
            </Text>
            <View style={styles.filterButtons}>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  filterStatus === 'all' && { backgroundColor: colors.primary }
                ]}
                onPress={() => setFilterStatus('all')}
              >
                <Text style={[
                  styles.filterButtonText,
                  { color: filterStatus === 'all' ? 'white' : colors.text }
                ]}>
                  Tous ({forms.length})
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  filterStatus === 'active' && { backgroundColor: colors.primary }
                ]}
                onPress={() => setFilterStatus('active')}
              >
                <Text style={[
                  styles.filterButtonText,
                  { color: filterStatus === 'active' ? 'white' : colors.text }
                ]}>
                  Actifs ({forms.filter(f => f.isActive).length})
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  filterStatus === 'inactive' && { backgroundColor: colors.primary }
                ]}
                onPress={() => setFilterStatus('inactive')}
              >
                <Text style={[
                  styles.filterButtonText,
                  { color: filterStatus === 'inactive' ? 'white' : colors.text }
                ]}>
                  Inactifs ({forms.filter(f => !f.isActive).length})
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Liste des formulaires existants */}
        {getFilteredForms().length === 0 && !showCreateForm ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Aucun formulaire
            </Text>
            <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
              Créez votre premier formulaire dynamique pour commencer
            </Text>
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: colors.primary }]}
              onPress={handleCreateForm}
            >
              <Text style={[styles.createButtonText, { color: 'white' }]}>
                Créer un formulaire
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={getFilteredForms()}
            renderItem={renderFormItem}
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
  formCard: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  formInfo: {
    flex: 1,
  },
  formName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  formCategory: {
    fontSize: 14,
    marginBottom: 4,
  },
  formDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  formActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
  },
  formStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  formStatsText: {
    fontSize: 12,
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
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 16,
  },

  manageFieldsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  manageFieldsText: {
    fontSize: 12,
    fontWeight: '500',
  },
  createFormContainer: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  createFormHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  createFormTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  createFormActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  picker: {
    flex: 1,
  },
  // Styles pour le formulaire d'édition intégré
  editFormContainer: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  editFormHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  editFormTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  editFormBody: {
    maxHeight: 400,
  },
  editFormFooter: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  editFormButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  editFormButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Styles pour les filtres
  filterContainer: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
}); 