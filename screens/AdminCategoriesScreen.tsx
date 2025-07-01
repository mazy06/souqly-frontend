import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useColorScheme } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Colors from '../constants/Colors';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import CategoryService, { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../services/CategoryService';
import CrossPlatformCategoryManager from '../components/CrossPlatformCategoryManager';
import IconPickerModal from '../components/IconPickerModal';

// Type pour la navigation
type ProfileStackParamList = {
  ProfileMain: undefined;
  AdminCategories: undefined;
};

// Type pour les modales
type ModalType = 'add' | 'edit' | 'move' | null;

const AdminCategoriesScreen = () => {
  const navigation = useNavigation<StackNavigationProp<ProfileStackParamList>>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  
  // États
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [parentCategory, setParentCategory] = useState<Category | null>(null);
  const [availableParents, setAvailableParents] = useState<Category[]>([]);
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  
  // États pour les formulaires
  const [formData, setFormData] = useState({
    label: '',
    key: '',
    iconName: '',
    badgeText: '',
    active: true
  });

  const [iconPickerVisible, setIconPickerVisible] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    // Nettoie le set des catégories qui n'existent plus
    setExpandedCategories(prev => {
      const allIds = new Set<number>();
      function collectIds(cats: Category[]) {
        cats.forEach(cat => {
          allIds.add(cat.id);
          if (cat.children) collectIds(cat.children);
        });
      }
      collectIds(categories);
      // Ne garde que les IDs encore présents
      return new Set([...prev].filter(id => allIds.has(id)));
    });
  }, [categories]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await CategoryService.getAllCategoryTree();
      data.forEach((cat, index) => {
        if (cat.children && cat.children.length > 0) {
          cat.children.forEach((child, childIndex) => {
          });
        }
      });
      setCategories(data);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les catégories');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      label: '',
      key: '',
      iconName: '',
      badgeText: '',
      active: true
    });
    setSelectedCategory(null);
    setParentCategory(null);
    setSelectedParentId(null);
  };

  const openAddModal = (parent?: Category) => {
    setModalType('add');
    resetForm();
    setParentCategory(parent || null);
    setModalVisible(true);
  };

  const openEditModal = (category: Category) => {
    setModalType('edit');
    setSelectedCategory(category);
    setFormData({
      label: category.label,
      key: category.key,
      iconName: category.iconName || '',
      badgeText: category.badgeText || '',
      active: category.active
    });
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setModalType(null);
    resetForm();
  };

  const openMoveModal = async (category: Category) => {
    setModalType('move');
    setSelectedCategory(category);
    setModalVisible(true);
    
    try {
      // Charger toutes les catégories disponibles comme parents
      const allCategories = await CategoryService.getAllCategoriesForSelection();
      // Filtrer pour exclure la catégorie elle-même et ses descendants
      const availableParents = allCategories.filter(cat => 
        cat.id !== category.id && 
        !isDescendant(cat, category, allCategories)
      );
      setAvailableParents(availableParents);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les catégories disponibles');
    }
  };

  // Fonction pour vérifier si une catégorie est un descendant d'une autre
  const isDescendant = (potentialDescendant: Category, ancestor: Category, allCategories: Category[]): boolean => {
    if (potentialDescendant.parentId === ancestor.id) {
      return true;
    }
    if (potentialDescendant.parentId) {
      const parent = allCategories.find(cat => cat.id === potentialDescendant.parentId);
      if (parent) {
        return isDescendant(parent, ancestor, allCategories);
      }
    }
    return false;
  };

  const handleLabelChange = (text: string) => {
    setFormData(prev => ({
      ...prev,
      label: text,
      key: CategoryService.generateCategoryKey(text)
    }));
  };

  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!formData.label.trim()) {
      errors.push('Le nom de la catégorie est requis');
    }

    if (!formData.key.trim()) {
      errors.push('La clé de la catégorie est requise');
    }

    if (formData.label.length > 100) {
      errors.push('Le nom ne peut pas dépasser 100 caractères');
    }

    if (formData.key.length > 50) {
      errors.push('La clé ne peut pas dépasser 50 caractères');
    }

    return { isValid: errors.length === 0, errors };
  };

  const handleSubmit = async () => {
    const validation = validateForm();
    if (!validation.isValid) {
      Alert.alert('Erreur de validation', validation.errors.join('\n'));
      return;
    }

    try {
      if (modalType === 'add') {
        const createData: any = {
          label: formData.label.trim(),
          key: formData.key.trim(),
          iconName: formData.iconName.trim() || undefined,
          badgeText: formData.badgeText.trim() || undefined,
          parent: parentCategory ? { id: parentCategory.id } : null,
          active: formData.active
        };


        await CategoryService.createCategory(createData);
        Alert.alert('Succès', 'Catégorie créée avec succès');
      } else if (modalType === 'edit' && selectedCategory) {
        const updateData: UpdateCategoryRequest = {
          label: formData.label.trim(),
          key: formData.key.trim(),
          iconName: formData.iconName.trim() || undefined,
          badgeText: formData.badgeText.trim() || undefined,
          active: formData.active
        };

        await CategoryService.updateCategory(selectedCategory.id, updateData);
        Alert.alert('Succès', 'Catégorie modifiée avec succès');
      }

      closeModal();
      loadCategories(); // Recharger les données
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder la catégorie');
    }
  };

  const handleMove = async () => {
    if (!selectedCategory) return;

    try {
      await CategoryService.moveCategory(selectedCategory.id, selectedParentId || undefined);
      Alert.alert('Succès', 'Catégorie déplacée avec succès');
      closeModal();
      loadCategories(); // Recharger les données
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de déplacer la catégorie');
    }
  };

  const handleDelete = async (category: Category) => {
    
    try {
      const success = await CategoryService.deleteCategory(category.id);
      if (success) {
        Alert.alert('Succès', 'Catégorie supprimée avec succès');
        loadCategories();
      } else {
        Alert.alert('Erreur', 'Impossible de supprimer la catégorie');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de supprimer la catégorie');
    }
  };

  // Affichage récursif
  const renderCategory = (cat: Category, level = 0) => (
    <View key={cat.id} style={[styles.categoryRow, { paddingLeft: 16 * (level + 1) }]}> 
      {cat.iconName && (
        <MaterialCommunityIcons name={cat.iconName as any} size={22} color="#008080" style={{ marginRight: 8 }} />
      )}
      <View style={styles.categoryInfo}>
        <Text style={[styles.label, { color: colors.text }]}>{cat.label}</Text>
        {cat.badgeText && (
          <Text style={styles.badge}>{cat.badgeText}</Text>
        )}
        {!cat.active && (
          <Text style={styles.inactiveBadge}>Inactive</Text>
        )}
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => openEditModal(cat)}>
          <Ionicons name="create-outline" size={20} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => openMoveModal(cat)}>
          <Ionicons name="git-branch-outline" size={20} color="#f39c12" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(cat)}>
          <Ionicons name="trash-outline" size={20} color="#e74c3c" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => openAddModal(cat)}>
          <Ionicons name="add-circle-outline" size={20} color="#008080" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTree = (cats: Category[], level = 0): React.ReactNode[] =>
    cats.map(cat => [
      renderCategory(cat, level),
      cat.children ? renderTree(cat.children, level + 1) : null,
    ]).flat().filter(Boolean);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Gestion des catégories</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => openAddModal()}>
          <Ionicons name="add-circle" size={28} color="#008080" />
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color="#008080" style={{ marginTop: 40 }} />
      ) : (
        <CrossPlatformCategoryManager
          categories={categories}
          onCategoriesChange={setCategories}
          onEdit={openEditModal}
          onDelete={handleDelete}
          onAddSubCategory={openAddModal}
          expandedCategories={expandedCategories}
          setExpandedCategories={setExpandedCategories}
        />
      )}

      {/* Modal pour ajouter/modifier */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {modalType === 'add' ? 'Ajouter une catégorie' : 
                 modalType === 'edit' ? 'Modifier la catégorie' : 
                 'Déplacer la catégorie'}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              {parentCategory && modalType === 'add' && (
                <Text style={[styles.parentInfo, { color: colors.text }]}>
                  Sous-catégorie de : {parentCategory.label}
                </Text>
              )}

              {modalType === 'move' && selectedCategory && (
                <View style={styles.moveContainer}>
                  <Text style={[styles.moveInfo, { color: colors.text }]}>
                    Déplacer : <Text style={styles.categoryName}>{selectedCategory.label}</Text>
                  </Text>
                  
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>Nouveau parent</Text>
                    <TouchableOpacity
                      style={[styles.parentSelector, { 
                        backgroundColor: colors.card,
                        borderColor: colors.border
                      }]}
                      onPress={() => {
                        // Ouvrir un picker pour sélectionner le parent
                        Alert.alert(
                          'Sélectionner un parent',
                          'Choisissez une catégorie parent ou "Aucun parent" pour une catégorie racine',
                          [
                            ...availableParents.map(cat => ({
                              text: cat.label,
                              onPress: () => setSelectedParentId(cat.id)
                            })),
                            {
                              text: 'Aucun parent (catégorie racine)',
                              onPress: () => setSelectedParentId(null)
                            },
                            { text: 'Annuler', style: 'cancel' }
                          ]
                        );
                      }}
                    >
                      <Text style={[styles.parentSelectorText, { color: colors.text }]}>
                        {selectedParentId 
                          ? availableParents.find(cat => cat.id === selectedParentId)?.label || 'Sélectionner...'
                          : 'Aucun parent (catégorie racine)'
                        }
                      </Text>
                      <Ionicons name="chevron-down" size={20} color={colors.text} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {modalType !== 'move' && (
                <>
                <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Nom de la catégorie *</Text>
                <TextInput
                  style={[styles.textInput, { 
                    backgroundColor: colors.card,
                    color: colors.text,
                    borderColor: colors.border
                  }]}
                  value={formData.label}
                  onChangeText={handleLabelChange}
                  placeholder="Ex: Vêtements"
                  placeholderTextColor={colors.tabIconDefault}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Clé de la catégorie *</Text>
                <TextInput
                  style={[styles.textInput, { 
                    backgroundColor: colors.card,
                    color: colors.text,
                    borderColor: colors.border
                  }]}
                  value={formData.key}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, key: text }))}
                  placeholder="Ex: vetements"
                  placeholderTextColor={colors.tabIconDefault}
                />
              </View>

              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontWeight: 'bold', marginBottom: 4, color: colors.text }}>Icône</Text>
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', padding: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, backgroundColor: '#f8f8f8' }}
                  onPress={() => setIconPickerVisible(true)}
                >
                  {formData.iconName ? (
                    <MaterialCommunityIcons name={formData.iconName as any} size={28} color="#008080" style={{ marginRight: 8 }} />
                  ) : (
                    <MaterialCommunityIcons name="tag-outline" size={28} color="#ccc" style={{ marginRight: 8 }} />
                  )}
                  <Text style={{ color: colors.text, fontSize: 16 }}>
                    {formData.iconName ? formData.iconName : 'Aucune icône'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Badge (optionnel)</Text>
                <TextInput
                  style={[styles.textInput, { 
                    backgroundColor: colors.card,
                    color: colors.text,
                    borderColor: colors.border
                  }]}
                  value={formData.badgeText}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, badgeText: text }))}
                  placeholder="Ex: Nouveau"
                  placeholderTextColor={colors.tabIconDefault}
                />
              </View>

              <View style={styles.switchContainer}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Catégorie active</Text>
                <TouchableOpacity
                  style={[styles.switch, { backgroundColor: formData.active ? '#008080' : '#666' }]}
                  onPress={() => setFormData(prev => ({ ...prev, active: !prev.active }))}
                >
                  <View style={[styles.switchThumb, { 
                    transform: [{ translateX: formData.active ? 20 : 0 }] 
                  }]} />
                </TouchableOpacity>
              </View>
                </>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={modalType === 'move' ? handleMove : handleSubmit}>
                <Text style={styles.submitButtonText}>
                  {modalType === 'add' ? 'Créer' : 
                   modalType === 'edit' ? 'Modifier' : 
                   'Déplacer'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <IconPickerModal
        visible={iconPickerVisible}
        onSelect={iconName => {
          setFormData(prev => ({ ...prev, iconName }));
          setIconPickerVisible(false);
        }}
        onClose={() => setIconPickerVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
  },
  addBtn: {
    marginLeft: 8,
  },
  treeContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  categoryInfo: {
    flex: 1,
    marginRight: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  badge: {
    fontSize: 12,
    color: '#008080',
    marginTop: 2,
  },
  inactiveBadge: {
    fontSize: 12,
    color: '#e74c3c',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    marginLeft: 8,
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  parentInfo: {
    fontSize: 14,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  formContainer: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  switch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#666',
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#008080',
    marginLeft: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  moveContainer: {
    marginBottom: 16,
  },
  moveInfo: {
    fontSize: 16,
    marginBottom: 16,
  },
  categoryName: {
    fontWeight: 'bold',
    color: '#008080',
  },
  parentSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  parentSelectorText: {
    fontSize: 16,
    flex: 1,
  },
});

export default AdminCategoriesScreen; 