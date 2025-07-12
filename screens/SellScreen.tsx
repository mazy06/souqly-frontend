import React, { useState, useCallback, useRef, useEffect } from 'react';
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
  Animated,
  FlatList,
  Modal,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProductImagePicker from '../components/ProductImagePicker';
import CategoryPicker from '../components/CategoryPicker';
import SimplePicker from '../components/SimplePicker';
import ProductService from '../services/ProductService';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getImageUrl, getUploadUrl } from '../constants/Config';
import { Picker } from '@react-native-picker/picker';
// @ts-ignore
import citiesRaw from '../assets/cities.json';
import countries from 'i18n-iso-countries';
import ModalSelector from '../components/ModalSelector';
import CategoryService, { Category } from '../services/CategoryService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GuestMessage from '../components/GuestMessage';
import SectionHeader from '../components/SectionHeader';
import { useNavigation } from '@react-navigation/native';
countries.registerLocale(require('i18n-iso-countries/langs/fr.json'));
const cities: { name: string; country: string }[] = citiesRaw as any;

interface ProductForm {
  title: string;
  description: string;
  category: string;
  brand: string;
  size: string;
  condition: string;
  price: string;
  imageIds: number[];
  city?: string;
  country?: string;
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

// Liste des pays à partir du fichier cities.json (unique country code et nom)
const countryList = Array.from(new Set(cities.map((c: any) => c.country)))
  .map((code: string) => {
    const name = countries.getName(code, 'fr') || code;
    return { code, name };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

export default function SellScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { isAuthenticated, isGuest, user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  
  const [formData, setFormData] = useState<ProductForm>({
    title: '',
    description: '',
    category: '',
    brand: '',
    size: '',
    condition: '',
    price: '',
    imageIds: [],
    city: '',
    country: '',
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [cityQuery, setCityQuery] = useState('');
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);

  // Charger les catégories au montage
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await CategoryService.getAllCategories();
        setCategoryOptions(cats.map(cat => `${cat.id} - ${cat.label}`));
      } catch (e) {
        setCategoryOptions([]);
      }
    };
    fetchCategories();
  }, []);

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
        imageIds: formData.imageIds,
        city: formData.city,
        country: formData.country,
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
        imageIds: [],
        city: '',
        country: '',
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

  // Met à jour la liste des villes selon le pays sélectionné
  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode);
    setSelectedCity('');
    setFormData(prev => ({ ...prev, country: countryCode, city: '' }));
    setCityQuery('');
    if (countryCode) {
      const citiesForCountry = cities.filter((c: any) => c.country === countryCode).map((c: any) => c.name);
      setFilteredCities(citiesForCountry);
    } else {
      setFilteredCities([]);
    }
  };

  const handleCityChange = (cityName: string) => {
    setSelectedCity(cityName);
    setFormData(prev => ({ ...prev, city: cityName }));
    setCityQuery(cityName);
  };

  // Affichage pour invité : header + message, pas de formulaire
  if (isGuest) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top','left','right']}>
        <View style={{ flex: 1, width: '100%' }}>
          <GuestMessage
            iconName="lock-closed-outline"
            iconColor={colors.primary}
            title="Connectez-vous pour publier un ou plusieurs articles"
            color={colors.primary}
            textColor={colors.text}
            backgroundColor={colors.background}
            onPress={() => logout()}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background, flex: 1 }]} edges={['top','left','right']}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
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

        <ScrollView contentContainerStyle={{ ...styles.scrollContent, paddingHorizontal: 0 }}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <GuestMessage
              iconName="lock-closed-outline"
              iconColor={colors.primary}
              title="Connectez-vous pour publier un ou plusieurs articles"
              color={colors.primary}
              textColor={colors.text}
              backgroundColor={colors.background}
              onPress={() => logout()}
            />
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
              style={[styles.textInput, { backgroundColor: '#fff', color: colors.text, borderColor: colors.border }]}
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
              style={[styles.textArea, { backgroundColor: '#fff', color: colors.text, borderColor: colors.border }]}
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
          <ModalSelector
            label="Catégorie"
            data={categoryOptions}
            selectedValue={categoryOptions.find(opt => opt.startsWith(formData.category + ' - ')) || ''}
            onSelect={(value) => {
              const id = value.split(' - ')[0];
              updateFormData('category', id);
            }}
            placeholder="Sélectionner une catégorie"
          />

          {/* Marque */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Marque</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: '#fff', color: colors.text, borderColor: colors.border }]}
              value={formData.brand}
              onChangeText={(text) => updateFormData('brand', text)}
              placeholder="Ex: Zara, H&M, Nike..."
              placeholderTextColor={colors.tabIconDefault}
            />
          </View>

          {/* Taille */}
          <ModalSelector
            label="Taille"
            data={SIZES}
            selectedValue={formData.size}
            onSelect={(value) => updateFormData('size', value)}
            placeholder="Sélectionner une taille"
          />

          {/* État */}
          <ModalSelector
            label="État"
            data={CONDITIONS}
            selectedValue={formData.condition}
            onSelect={(value) => updateFormData('condition', value)}
            placeholder="Sélectionner un état"
          />

          {/* Prix */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Prix *</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: '#fff', color: colors.text, borderColor: colors.border }]}
              value={formData.price}
              onChangeText={(text) => updateFormData('price', text.replace(/[^0-9,]/g, ''))}
              placeholder="0,00 €"
              placeholderTextColor={colors.tabIconDefault}
              keyboardType="numeric"
            />
          </View>

          {/* Pays */}
          <ModalSelector
            label="Pays *"
            data={countryList.map(c => c.name)}
            selectedValue={selectedCountry ? (countryList.find(c => c.code === selectedCountry)?.name || '') : ''}
            onSelect={(name) => {
              const country = countryList.find(c => c.name === name);
              if (country) handleCountryChange(country.code);
            }}
            placeholder="Sélectionner un pays"
          />

          {/* Ville */}
          <ModalSelector
            label="Ville *"
            data={filteredCities}
            selectedValue={selectedCity}
            onSelect={handleCityChange}
            placeholder="Sélectionner une ville"
            disabled={!selectedCountry}
          />

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
    paddingTop: 60,
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
  authTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  authSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  authButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
  },
  authButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
}); 