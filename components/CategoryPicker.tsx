import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator,
  ScrollView,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CategoryService, { Category } from '../services/CategoryService';
import { useTheme } from '../contexts/ThemeContext';

interface CategoryPickerProps {
  value: string; // ID de la catégorie
  onValueChange: (value: string) => void; // ID de la catégorie
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  required?: boolean;
}

interface FlattenedCategory {
  category: Category;
  level: number;
  displayName: string;
}

const CategoryPicker: React.FC<CategoryPickerProps> = ({
  value,
  onValueChange,
  placeholder = 'Sélectionner une catégorie',
  label,
  disabled = false,
  required = false
}) => {
  const { colors } = useTheme();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  // Charger les catégories au montage du composant
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const categoryTree = await CategoryService.getCategoryTree();
      setCategories(categoryTree);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les catégories');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour aplatir l'arborescence des catégories avec indentation
  const flattenCategories = (cats: Category[], level: number = 0): FlattenedCategory[] => {
    let result: FlattenedCategory[] = [];
    
    cats.forEach(cat => {
      const indent = '  '.repeat(level);
      result.push({
        category: cat,
        level,
        displayName: `${indent}${cat.label}`
      });
      
      if (cat.children && cat.children.length > 0) {
        result = result.concat(flattenCategories(cat.children, level + 1));
      }
    });
    
    return result;
  };

  // Fonction pour trouver le label d'une catégorie par son ID
  const findCategoryLabelById = (id: string): string => {
    const findInCategories = (cats: Category[]): string | null => {
      for (const cat of cats) {
        if (cat.id.toString() === id) {
          return cat.label;
        }
        if (cat.children && cat.children.length > 0) {
          const found = findInCategories(cat.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    return findInCategories(categories) || '';
  };

  const handleSelectCategory = (category: Category) => {
    onValueChange(category.id.toString());
    setModalVisible(false);
  };

  const flattenedCategories = flattenCategories(categories);
  const selectedCategoryLabel = findCategoryLabelById(value);

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>
          {label}
          {required && <Text style={{ color: '#008080' }}> *</Text>}
        </Text>
      )}
      
      <TouchableOpacity 
        style={[
          styles.pickerButton, 
          { 
            backgroundColor: colors.card,
            borderColor: colors.border,
            opacity: disabled ? 0.6 : 1
          }
        ]} 
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled || loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color={colors.tabIconDefault} />
        ) : (
          <>
            <Text style={[
              styles.pickerButtonText, 
              { color: value ? colors.text : colors.tabIconDefault }
            ]}>
              {selectedCategoryLabel || placeholder}
            </Text>
            <Ionicons name="chevron-down" size={20} color={colors.tabIconDefault} />
          </>
        )}
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Sélectionner une catégorie
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalOptions}>
              {flattenedCategories.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.modalOption, 
                    { 
                      paddingLeft: 16 + (item.level * 16),
                      backgroundColor: value === item.category.id.toString() ? colors.card : 'transparent',
                      borderBottomColor: colors.border
                    }
                  ]}
                  onPress={() => handleSelectCategory(item.category)}
                >
                  <Text style={[
                    styles.modalOptionText, 
                    { 
                      color: value === item.category.id.toString() ? '#008080' : colors.text,
                      fontWeight: value === item.category.id.toString() ? '600' : 'normal'
                    }
                  ]}>
                    {item.displayName}
                  </Text>
                  {value === item.category.id.toString() && (
                    <Ionicons name="checkmark" size={20} color="#008080" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  pickerButton: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerButtonText: {
    fontSize: 16,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalOptions: {
    maxHeight: 400,
  },
  modalOption: {
    padding: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalOptionText: {
    fontSize: 16,
    flex: 1,
  },
});

export default CategoryPicker; 