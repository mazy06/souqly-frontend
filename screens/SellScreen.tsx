import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated
} from 'react-native';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import ProductImagePicker from '../components/ProductImagePicker';
import CategoryPicker from '../components/CategoryPicker';
import SimplePicker from '../components/SimplePicker';
import ProductService from '../services/ProductService';
import { useAuth } from '../contexts/AuthContext';
import { getImageUrl, getUploadUrl } from '../constants/Config';

interface ProductForm {
  title: string;
  description: string;
  category: string;
  brand: string;
  size: string;
  condition: string;
  price: string;
  imageIds: number[];
}

const CONDITIONS = [
  'Comme neuf',
  'Très bon état',
  'Bon état',
  'État correct',
  'Pour pièces'
];

const SIZES = [
  'XS / 34 / 6',
  'S / 36 / 8',
  'M / 38 / 10',
  'L / 40 / 12',
  'XL / 42 / 14',
  'XXL / 44 / 16',
  '3XL / 46 / 18',
  '4XL / 48 / 20',
  '5XL / 50 / 22',
  '6XL / 52 / 24',
  'Unique'
];

export default function SellScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { isAuthenticated, user } = useAuth();
  
  const [formData, setFormData] = useState<ProductForm>({
    title: '',
    description: '',
    category: '',
    brand: '',
    size: '',
    condition: '',
    price: '',
    imageIds: []
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async () => {
    
    // Vérifier l'authentification
    if (!isAuthenticated) {
      Alert.alert('Erreur', 'Vous devez être connecté pour publier un produit');
      return;
    }
    
    // Validation
    if (!formData.title.trim()) {
      Alert.alert('Erreur', 'Le titre est requis');
      return;
    }
    if (!formData.price.trim()) {
      Alert.alert('Erreur', 'Le prix est requis');
      return;
    }
    if (formData.imageIds.length === 0) {
      Alert.alert('Erreur', 'Au moins une photo est requise');
      return;
    }
    if (!formData.category) {
      Alert.alert('Erreur', 'La catégorie est requise');
      return;
    }

    try {
      
      // Convertir le prix en nombre
      const price = parseFloat(formData.price.replace(',', '.'));
      if (isNaN(price) || price <= 0) {
        Alert.alert('Erreur', 'Le prix doit être un nombre positif');
        return;
      }

      // Convertir l'ID de catégorie en nombre
      const categoryId = parseInt(formData.category);
      if (isNaN(categoryId)) {
        Alert.alert('Erreur', 'Catégorie invalide');
        return;
      }

      // Créer le produit via l'API
      const productData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: price,
        brand: formData.brand.trim() || undefined,
        size: formData.size || undefined,
        condition: formData.condition,
        categoryId: categoryId,
        imageIds: formData.imageIds
      };
      
      const result = await ProductService.createProduct(productData);
      
      // Afficher le message de succès
      setSuccessMessage(`"${formData.title}" a été publié avec succès !`);
      setShowSuccess(true);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        brand: '',
        size: '',
        condition: '',
        price: '',
        imageIds: []
      });

      // Masquer le message après 3 secondes
      setTimeout(() => {
        setShowSuccess(false);
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de créer le produit. Vérifiez votre connexion.');
    }
  };

  const updateFormData = (field: keyof ProductForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Mémoriser la fonction getImageUrl pour éviter les re-renders
  const getImageUrlCallback = useCallback((id: number) => {
    return getImageUrl(id);
  }, []);

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Message de succès */}
      {showSuccess && (
        <View style={styles.successContainer}>
          <View style={styles.successContent}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Vends un article</Text>
          <Text style={[styles.headerSubtitle, { color: colors.tabIconDefault }]}>
            Remplis les informations ci-dessous
          </Text>
        </View>

        {/* Photos */}
        <ProductImagePicker
          imageIds={formData.imageIds}
          onChange={(ids) => updateFormData('imageIds', ids)}
          uploadUrl={getUploadUrl()}
          getImageUrl={getImageUrlCallback}
        />

        {/* Titre */}
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Titre *</Text>
          <TextInput
            style={[styles.textInput, { 
              backgroundColor: colors.card,
              color: colors.text,
              borderColor: colors.border
            }]}
            value={formData.title}
            onChangeText={(text) => updateFormData('title', text)}
            placeholder="Ex: Robe d'été fleurie"
            placeholderTextColor={colors.tabIconDefault}
            maxLength={100}
          />
          <Text style={[styles.charCount, { color: colors.tabIconDefault }]}>
            {formData.title.length}/100
          </Text>
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Description</Text>
          <TextInput
            style={[styles.textArea, { 
              backgroundColor: colors.card,
              color: colors.text,
              borderColor: colors.border
            }]}
            value={formData.description}
            onChangeText={(text) => updateFormData('description', text)}
            placeholder="Décris ton article en détail..."
            placeholderTextColor={colors.tabIconDefault}
            multiline
            numberOfLines={4}
            maxLength={500}
          />
          <Text style={[styles.charCount, { color: colors.tabIconDefault }]}>
            {formData.description.length}/500
          </Text>
        </View>

        {/* Catégorie */}
        <CategoryPicker
          value={formData.category}
          onValueChange={(value) => updateFormData('category', value)}
          label="Catégorie"
        />

        {/* Marque */}
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Marque</Text>
          <TextInput
            style={[styles.textInput, { 
              backgroundColor: colors.card,
              color: colors.text,
              borderColor: colors.border
            }]}
            value={formData.brand}
            onChangeText={(text) => updateFormData('brand', text)}
            placeholder="Ex: Zara, H&M, Nike..."
            placeholderTextColor={colors.tabIconDefault}
          />
        </View>

        {/* Taille */}
        <SimplePicker
          value={formData.size}
          onValueChange={(value) => updateFormData('size', value)}
          options={SIZES}
          label="Taille"
          placeholder="Sélectionner une taille"
          title="Sélectionner une taille"
        />

        {/* État */}
        <SimplePicker
          value={formData.condition}
          onValueChange={(value) => updateFormData('condition', value)}
          options={CONDITIONS}
          label="État"
          placeholder="Sélectionner un état"
          title="Sélectionner un état"
        />

        {/* Prix */}
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Prix *</Text>
          <View style={styles.priceContainer}>
            <TextInput
              style={[styles.priceInput, { 
                backgroundColor: colors.card,
                color: colors.text,
                borderColor: colors.border
              }]}
              value={formData.price}
              onChangeText={(text) => updateFormData('price', text.replace(/[^0-9,]/g, ''))}
              placeholder="0,00"
              placeholderTextColor={colors.tabIconDefault}
              keyboardType="numeric"
            />
            <Text style={[styles.currency, { color: colors.text }]}>€</Text>
          </View>
        </View>

        {/* Bouton de soumission */}
        <TouchableOpacity 
          style={[styles.submitButton, { 
            backgroundColor: formData.title && formData.price && formData.imageIds.length > 0 
              ? '#008080' 
              : '#ccc'
          }]}
          onPress={handleSubmit}
          disabled={!formData.title || !formData.price || formData.imageIds.length === 0}
        >
          <Text style={styles.submitButtonText}>Publier l'article</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
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
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    marginRight: 8,
  },
  currency: {
    fontSize: 18,
    fontWeight: '600',
  },
  submitButton: {
    height: 56,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  successContainer: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 1000,
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 3.84px rgba(0,0,0,0.25)',
    } : {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    }),
  },
  successContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  successText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    flex: 1,
  },
}); 