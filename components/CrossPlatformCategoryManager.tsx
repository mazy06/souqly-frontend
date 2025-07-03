import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category } from '../services/CategoryService';
import CategoryService from '../services/CategoryService';
import { useTheme } from '../contexts/ThemeContext';

interface CrossPlatformCategoryManagerProps {
  categories: Category[];
  onCategoriesChange: (categories: Category[]) => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onAddSubCategory: (parent: Category) => void;
  expandedCategories: Set<number>;
  setExpandedCategories: React.Dispatch<React.SetStateAction<Set<number>>>;
}

interface FlatCategoryItem extends Category {
  level: number;
  isExpanded: boolean;
}

interface CategoryWithLevel extends Category {
  level: number;
}

const CrossPlatformCategoryManager: React.FC<CrossPlatformCategoryManagerProps> = ({
  categories,
  onCategoriesChange,
  onEdit,
  onDelete,
  onAddSubCategory,
  expandedCategories,
  setExpandedCategories,
}) => {
  const { colors } = useTheme();
  
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [availableParents, setAvailableParents] = useState<CategoryWithLevel[]>([]);
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);
  const [flatCategories, setFlatCategories] = useState<FlatCategoryItem[]>([]);

  // Fonction pour aplatir l'arborescence en liste
  const flattenCategories = useCallback((cats: Category[], level = 0): FlatCategoryItem[] => {
    let result: FlatCategoryItem[] = [];
    cats.forEach(cat => {
      const isExpanded = expandedCategories.has(cat.id);
      result.push({ 
        ...cat, 
        level,
        isExpanded
      });
      if (cat.children && cat.children.length > 0 && isExpanded) {
        result = result.concat(flattenCategories(cat.children, level + 1));
      }
    });
    return result;
  }, [expandedCategories]);

  // Mettre à jour la liste plate quand les catégories ou l'état d'expansion changent
  useEffect(() => {
    const flat = flattenCategories(categories);
    setFlatCategories(flat);
  }, [categories, expandedCategories, flattenCategories]);

  const toggleCategoryExpansion = (categoryId: number) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const openMoveModal = async (category: Category) => {
    setSelectedCategory(category);
    setShowMoveModal(true);
    
    // Initialiser avec le parent actuel de la catégorie
    setSelectedParentId(category.parentId || null);
    
    try {
      
      // Utiliser l'arborescence complète pour avoir toutes les catégories
      const allCategoriesTree = await CategoryService.getAllCategoryTree();
      
      // Aplatir l'arborescence pour avoir une liste plate de toutes les catégories
      const flattenAllCategories = (cats: Category[]): Category[] => {
        let result: Category[] = [];
        cats.forEach(cat => {
          result.push(cat);
          if (cat.children && cat.children.length > 0) {
            result = result.concat(flattenAllCategories(cat.children));
          }
        });
        return result;
      };
      
      const allCategories = flattenAllCategories(allCategoriesTree);
      
      // Construire l'arborescence complète pour la sélection
      const categoryTreeForSelection = buildCategoryTreeForSelection(allCategoriesTree);
      
      // Filtrer pour exclure la catégorie elle-même et ses descendants
      const availableParents = categoryTreeForSelection.filter(cat => {
        const isNotSelf = cat.id !== category.id;
        const isNotDescendant = !isDescendant(cat, category, allCategories);
        return isNotSelf && isNotDescendant;
      });
      
      
      setAvailableParents(availableParents);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les catégories disponibles');
    }
  };

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

  const getCategoryLevel = (category: Category, allCategories: Category[]): number => {
    if (!category.parentId) {
      return 0;
    }
    const parent = allCategories.find(cat => cat.id === category.parentId);
    if (parent) {
      return getCategoryLevel(parent, allCategories) + 1;
    }
    return 0;
  };

  const getCategoryPath = (category: Category, allCategories: (Category | CategoryWithLevel)[]): string => {
    if (!category.parentId) {
      return category.label;
    }
    const parent = allCategories.find(cat => cat.id === category.parentId);
    if (parent) {
      const parentPath = getCategoryPath(parent, allCategories);
      return `${parentPath} > ${category.label}`;
    }
    return category.label;
  };

  const buildCategoryTreeForSelection = (categories: Category[], level = 0): CategoryWithLevel[] => {
    let result: CategoryWithLevel[] = [];
    categories.forEach(cat => {
      // Ajouter la catégorie avec son niveau
      result.push({ ...cat, level });
      // Ajouter ses enfants récursivement
      if (cat.children && cat.children.length > 0) {
        result = result.concat(buildCategoryTreeForSelection(cat.children, level + 1));
      }
    });
    return result;
  };

  const handleMove = async () => {
    if (!selectedCategory) return;

    try {
      await CategoryService.moveCategory(selectedCategory.id, selectedParentId || undefined);
      Alert.alert('Succès', 'Catégorie déplacée avec succès');
      setShowMoveModal(false);
      setSelectedCategory(null);
      setSelectedParentId(null);
      
      // Recharger les catégories
      const updatedCategories = await CategoryService.getAllCategoryTree();
      onCategoriesChange(updatedCategories);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de déplacer la catégorie');
    }
  };

  const moveCategoryUp = async (category: FlatCategoryItem, index: number) => {
    if (index === 0) return; // Déjà en haut
    
    try {
      const currentCategories = [...flatCategories];
      const temp = currentCategories[index];
      currentCategories[index] = currentCategories[index - 1];
      currentCategories[index - 1] = temp;
      
      // Préparer les données pour l'API de réorganisation
      const reorderData = currentCategories.map((item, idx) => ({
        id: item.id,
        sortOrder: idx,
        parentId: item.parentId || null
      }));

      await CategoryService.reorderCategories(reorderData);
      
      // Recharger les catégories depuis le serveur
      const updatedCategories = await CategoryService.getAllCategoryTree();
      onCategoriesChange(updatedCategories);
      
      Alert.alert('Succès', 'Catégorie déplacée vers le haut');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de déplacer la catégorie');
    }
  };

  const moveCategoryDown = async (category: FlatCategoryItem, index: number) => {
    if (index === flatCategories.length - 1) return; // Déjà en bas
    
    try {
      const currentCategories = [...flatCategories];
      const temp = currentCategories[index];
      currentCategories[index] = currentCategories[index + 1];
      currentCategories[index + 1] = temp;
      
      // Préparer les données pour l'API de réorganisation
      const reorderData = currentCategories.map((item, idx) => ({
        id: item.id,
        sortOrder: idx,
        parentId: item.parentId || null
      }));

      await CategoryService.reorderCategories(reorderData);
      
      // Recharger les catégories depuis le serveur
      const updatedCategories = await CategoryService.getAllCategoryTree();
      onCategoriesChange(updatedCategories);
      
      Alert.alert('Succès', 'Catégorie déplacée vers le bas');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de déplacer la catégorie');
    }
  };

  const renderItem = useCallback(({ item, index }: { item: FlatCategoryItem; index: number }) => {
    const indent = item.level * 20;

    return (
      <View
        style={[
          styles.categoryItem,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            marginLeft: indent,
          },
        ]}
      >
        <View style={styles.categoryContent}>
          <View style={styles.categoryInfo}>
            <View style={styles.categoryHeader}>
              <TouchableOpacity
                style={styles.categoryLabelContainer}
                onPress={() => {
                  if (item.children && item.children.length > 0) {
                    toggleCategoryExpansion(item.id);
                  }
                }}
              >
                <Text style={[styles.categoryLabel, { color: colors.text }]}>
                  {item.label}
                </Text>
                {item.children && item.children.length > 0 && (
                  <View style={styles.childrenIndicator}>
                    <Text style={[styles.childrenCount, { color: colors.text }]}>
                      ({item.children.length})
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              
              {item.badgeText && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badgeText}</Text>
                </View>
              )}
              {!item.active && (
                <View style={styles.inactiveBadge}>
                  <Text style={styles.inactiveBadgeText}>Inactive</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.actionButtons}>
            {/* Boutons de déplacement */}
            <TouchableOpacity
              style={[styles.actionBtn, index === 0 && styles.disabledBtn]}
              onPress={() => moveCategoryUp(item, index)}
              disabled={index === 0}
            >
              <Ionicons 
                name="chevron-up" 
                size={20} 
                color={index === 0 ? colors.tabIconDefault : colors.text} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionBtn, index === flatCategories.length - 1 && styles.disabledBtn]}
              onPress={() => moveCategoryDown(item, index)}
              disabled={index === flatCategories.length - 1}
            >
              <Ionicons 
                name="chevron-down" 
                size={20} 
                color={index === flatCategories.length - 1 ? colors.tabIconDefault : colors.text} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => onEdit(item)}
            >
              <Ionicons name="create-outline" size={20} color={colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => onAddSubCategory(item)}
            >
              <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => openMoveModal(item)}
            >
              <Ionicons name="git-branch-outline" size={20} color={colors.warning} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => onDelete(item)}
            >
              <Ionicons name="trash-outline" size={20} color={colors.danger} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }, [colors, onEdit, onAddSubCategory, onDelete, toggleCategoryExpansion, openMoveModal, flatCategories.length]);

  return (
    <View style={styles.container}>
      <FlatList
        data={flatCategories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />

      {/* Modale de déplacement */}
      <Modal
        visible={showMoveModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMoveModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Déplacer la catégorie
              </Text>
              <TouchableOpacity onPress={() => setShowMoveModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedCategory && (
              <View style={styles.moveContainer}>
                <Text style={[styles.moveInfo, { color: colors.text }]}>
                  Déplacer : <Text style={styles.categoryName}>{selectedCategory.label}</Text>
                </Text>
                {selectedCategory.parentId && (
                  <Text style={[styles.currentParentInfo, { color: colors.text }]}>
                    Parent actuel : <Text style={styles.currentParentName}>
                      {getCategoryPath(selectedCategory, availableParents)}
                    </Text>
                  </Text>
                )}
                
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Nouveau parent</Text>
                  <TouchableOpacity
                    style={[styles.parentSelector, { 
                      backgroundColor: colors.background,
                      borderColor: colors.border
                    }]}
                    onPress={() => {
                      // Créer une liste d'options avec indentation pour montrer la hiérarchie
                      const options = [
                        {
                          text: selectedParentId === null ? '✅ 🏠 Aucun parent (catégorie racine)' : '🏠 Aucun parent (catégorie racine)',
                          onPress: () => setSelectedParentId(null)
                        },
                        ...availableParents.map(cat => {
                          // Utiliser le niveau de la catégorie dans l'arborescence
                          const indent = '  '.repeat(cat.level);
                          const icon = cat.children && cat.children.length > 0 ? '📁' : '📄';
                          const isSelected = selectedParentId === cat.id;
                          const status = !cat.active ? ' (inactive)' : '';
                          const checkmark = isSelected ? '✅ ' : '';
                          return {
                            text: `${checkmark}${indent}${icon} ${cat.label}${status}`,
                            onPress: () => setSelectedParentId(cat.id)
                          };
                        })
                      ];
                      
                      Alert.alert(
                        'Sélectionner un parent',
                        `Déplacer "${selectedCategory?.label}" vers un nouveau parent`,
                        [
                          ...options,
                          { text: 'Annuler', style: 'cancel' }
                        ]
                      );
                    }}
                  >
                    <Text style={[styles.parentSelectorText, { color: colors.text }]}>
                      {selectedParentId 
                        ? availableParents.find(cat => cat.id === selectedParentId)?.label || 'Sélectionner...'
                        : '🏠 Aucun parent (catégorie racine)'
                      }
                    </Text>
                    <Ionicons name="chevron-down" size={20} color={colors.text} />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.cancelButton, { borderColor: colors.border }]} 
                onPress={() => setShowMoveModal(false)}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.submitButton, { backgroundColor: colors.primary }]} 
                onPress={handleMove}
              >
                <Text style={styles.submitButtonText}>Déplacer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
  },
  categoryItem: {
    marginVertical: 2,
    marginHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  categoryInfo: {
    flex: 1,
    marginRight: 8,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  categoryLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  childrenIndicator: {
    marginRight: 8,
  },
  childrenCount: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  badge: {
    backgroundColor: '#008080',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '500',
  },
  inactiveBadge: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  inactiveBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    marginLeft: 8,
    padding: 4,
  },
  disabledBtn: {
    opacity: 0.5,
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
  currentParentInfo: {
    fontSize: 14,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  currentParentName: {
    fontWeight: 'bold',
    color: '#008080',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
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
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default CrossPlatformCategoryManager; 