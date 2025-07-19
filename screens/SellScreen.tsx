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
  Dimensions
  // SafeAreaView supprimé ici
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProductImagePicker from '../components/ProductImagePicker';
import CategoryPicker from '../components/CategoryPicker';
import SimplePicker from '../components/SimplePicker';
import ProductService from '../services/ProductService';
import KafkaNotificationService from '../services/KafkaNotificationService';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getImageUrl, getUploadUrl } from '../constants/Config';
import { Picker } from '@react-native-picker/picker';
// @ts-ignore
import citiesRaw from '../assets/cities.json';
import countries from 'i18n-iso-countries';
import DropdownSelector from '../components/DropdownSelector';
import CategoryService, { Category } from '../services/CategoryService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GuestMessage from '../components/GuestMessage';
import SectionHeader from '../components/SectionHeader';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import * as Localization from 'expo-localization';
import * as Notifications from 'expo-notifications';
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
  boost?: string;
  boostDuration?: string;
  boostPrice?: number;
  extraPhotosQuantity?: number;
  extraPhotosPrice?: number;
  handoverMethods?: {
    inPerson: boolean;
    delivery: boolean;
    pickup: boolean;
  };
  handoverAddress?: string;
  packageFormat?: string;
  packageWeight?: number;
}

// Options de boost disponibles
interface BoostOption {
  id: string;
  title: string;
  description: string;
  duration: string;
  price: number;
  popular?: boolean;
}

const BOOST_OPTIONS: BoostOption[] = [
  {
    id: '7days',
    title: 'Remontez votre annonce',
    description: 'Remontez automatiquement votre annonce dans les résultats de recherche de votre catégorie.',
    duration: 'Chaque jour pendant 7 jours',
    price: 6.49,
    popular: true
  },
  {
    id: '30days',
    title: 'Remontez votre annonce',
    description: 'Remontez automatiquement votre annonce dans les résultats de recherche de votre catégorie.',
    duration: 'Chaque jour pendant 30 jours',
    price: 25.00
  },
  {
    id: '8weeks',
    title: 'Remontez votre annonce',
    description: 'Remontez automatiquement votre annonce dans les résultats de recherche de votre catégorie.',
    duration: 'Chaque semaine pendant 8 semaines',
    price: 7.00
  }
];

const URGENT_OPTIONS: BoostOption[] = [
  {
    id: 'urgent',
    title: 'Annonce urgente',
    description: 'Ressortez dans les résultats et profitez du filtre pour être trouvé facilement.',
    duration: 'Pendant toute la durée de votre annonce',
    price: 2.99
  }
];

// Étapes du processus de vente
enum SellStep {
  ESSENTIALS = 0,    // Titre et catégorie
  DETAILS = 1,       // Description et caractéristiques
  PHOTOS = 2,        // Photos
  PRICE = 3,         // Prix
  HANDOVER = 4,      // Remise du bien (caractéristiques + livraison)
  LOCATION = 5,      // Localisation
  BOOST = 6,         // Boost d'annonce
  REVIEW = 7         // Récapitulatif
}

// Configuration des étapes par catégorie
interface StepConfig {
  title: string;
  description: string;
  fields: string[];
  required: string[];
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

// Formats de colis disponibles
const PACKAGE_FORMATS = [
  { id: 'small', name: 'Petit colis', weight: '1-2 kg', maxWeight: 2 },
  { id: 'medium', name: 'Colis moyen', weight: '2-5 kg', maxWeight: 5 },
  { id: 'large', name: 'Gros colis', weight: '5-10 kg', maxWeight: 10 },
  { id: 'xlarge', name: 'Très gros colis', weight: '10-30 kg', maxWeight: 30 },
  { id: 'heavy', name: 'Colis lourd', weight: '30-130 kg', maxWeight: 130 }
];

// Liste des pays à partir du fichier cities.json (unique country code et nom)
const countryList = Array.from(new Set(cities.map((c: any) => c.country)))
  .map((code: string) => {
    const name = countries.getName(code, 'fr') || code;
    return { code, name };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

// Configuration des étapes
const stepConfigs: Record<SellStep, StepConfig> = {
  [SellStep.ESSENTIALS]: {
    title: "Commençons par l'essentiel",
    description: "Un titre précis et la bonne catégorie, c'est le meilleur moyen pour que vos futurs acheteurs voient votre annonce !",
    fields: ['title', 'category'],
    required: ['title', 'category']
  },
  [SellStep.DETAILS]: {
    title: "Dites-nous en plus",
    description: "Mettez en valeur votre annonce ! Plus il y a de détails, plus vos futurs contacts vous trouveront rapidement.",
    fields: ['description', 'brand', 'size', 'condition'],
    required: ['description']
  },
  [SellStep.PHOTOS]: {
    title: "Ajoutez des photos",
    description: "Ajoutez des photos pour mettre en valeur votre annonce (optionnel)",
    fields: ['imageIds'],
    required: [] // Plus obligatoire
  },
  [SellStep.PRICE]: {
    title: "Quel est votre prix ?",
    description: "Vous le savez, le prix est important. Soyez juste, mais ayez en tête une marge de négociation si besoin.",
    fields: ['price'],
    required: ['price']
  },
  [SellStep.HANDOVER]: {
    title: "Remise du bien",
    description: "Détaillez la façon dont vous souhaitez remettre votre bien à l'acheteur.",
    fields: ['handoverMethods', 'handoverAddress'],
    required: ['handoverMethods']
  },
  [SellStep.LOCATION]: {
    title: "Où se situe votre bien ?",
    description: "Indiquez votre localisation pour faciliter les échanges",
    fields: ['country', 'city'],
    required: ['country', 'city']
  },
  [SellStep.BOOST]: {
    title: "Boostez votre annonce",
    description: "Votre annonce est-elle urgente ? Vous pouvez la mettre en avant pour un prix supplémentaire.",
    fields: ['boost'],
    required: ['boost']
  },
  [SellStep.REVIEW]: {
    title: "Récapitulatif",
    description: "Vérifiez toutes les informations avant de publier votre annonce",
    fields: ['title', 'description', 'category', 'price', 'imageIds', 'country', 'city', 'boost'],
    required: ['title', 'description', 'category', 'price', 'country', 'city'] // imageIds plus obligatoire
  }
};

// Table de correspondance pays -> région carte
const COUNTRY_MAP_REGION: Record<string, { latitude: number, longitude: number, latitudeDelta: number, longitudeDelta: number }> = {
  FR: { latitude: 46.603354, longitude: 1.888334, latitudeDelta: 7, longitudeDelta: 7 }, // France
  SA: { latitude: 23.8859, longitude: 45.0792, latitudeDelta: 10, longitudeDelta: 10 }, // Arabie Saoudite
  MA: { latitude: 31.7917, longitude: -7.0926, latitudeDelta: 5, longitudeDelta: 5 }, // Maroc
  DZ: { latitude: 28.0339, longitude: 1.6596, latitudeDelta: 8, longitudeDelta: 8 }, // Algérie
  TN: { latitude: 28.0339, longitude: 1.6596, latitudeDelta: 3, longitudeDelta: 3 }, // Tunisie
  // Ajoute d'autres pays si besoin
};
function getCountryRegion(countryCode: string) {
  return COUNTRY_MAP_REGION[countryCode] || { latitude: 20, longitude: 0, latitudeDelta: 40, longitudeDelta: 40 }; // fallback monde
}

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
    boost: 'false',
    boostDuration: '',
    boostPrice: 0,
    extraPhotosQuantity: 0,
    extraPhotosPrice: 0,
    handoverMethods: {
      inPerson: false,
      delivery: false,
      pickup: false,
    },
    handoverAddress: '',
    packageFormat: 'small',
    packageWeight: 1.5,
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<SellStep>(SellStep.ESSENTIALS);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [cityQuery, setCityQuery] = useState('');
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [showCountrySuggestions, setShowCountrySuggestions] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [cityCoords, setCityCoords] = useState<{lat: number, lon: number} | null>(null);
  const [defaultRegion, setDefaultRegion] = useState<{latitude: number, longitude: number, latitudeDelta: number, longitudeDelta: number} | null>(null);
  const [defaultCountry, setDefaultCountry] = useState<string>('');
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const screenWidth = Dimensions.get('window').width;

  // Charger les catégories et initialiser les notifications au montage
  useEffect(() => {
    const initializeScreen = async () => {
      // Charger les catégories
      setCategoriesLoading(true);
      try {
        const cats = await CategoryService.getAllCategories();
        setCategoryOptions(cats.map(cat => `${cat.id} - ${cat.label}`));
      } catch (e) {
        console.error('Erreur lors du chargement des catégories:', e);
        setCategoryOptions([]);
      } finally {
        setCategoriesLoading(false);
      }
      
      // Initialiser Kafka et les notifications
      try {
        // Initialiser la connexion Kafka
        await KafkaNotificationService.initializeKafkaConnection();
        
        // Configurer les notifications push
        await KafkaNotificationService.registerForPushNotificationsAsync();
        
        // Configurer les listeners de notifications
        KafkaNotificationService.setupNotificationListener();
        
      } catch (error) {
        console.log('Erreur lors de l\'initialisation des notifications:', error);
      }
    };
    
    initializeScreen();
  }, []);

  // Détecter quand on revient du paiement
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Si on revient du paiement et qu'un boost était sélectionné
      if (paymentCompleted && formData.boost === 'true') {
        const boostMessage = formData.boost === 'true' 
          ? ` avec boost (${formData.boostPrice?.toFixed(2)} €)`
          : '';
        setSuccessMessage(`"${formData.title}" a été publié avec succès${boostMessage} !`);
        setShowSuccess(true);
        setPaymentCompleted(false);
        
        // Reset form complet
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
          boost: 'false',
          boostDuration: '',
          boostPrice: 0,
          extraPhotosQuantity: 0,
          extraPhotosPrice: 0,
          handoverMethods: {
            inPerson: false,
            delivery: false,
            pickup: false,
          },
          handoverAddress: '',
          packageFormat: 'small',
          packageWeight: 1.5,
        });
        setCurrentStep(SellStep.ESSENTIALS);
        // Réinitialiser tous les états de localisation
        setSelectedCountry('');
        setSelectedCity('');
        setCityQuery('');
        setCitySearch('');
        setCountrySearch('');
        setFilteredCities([]);
        setShowCitySuggestions(false);
        setShowCountrySuggestions(false);
        setCityCoords(null);
        setDefaultCountry('');
        setDefaultRegion(null);

        // Masquer le message après 3 secondes
        setTimeout(() => {
          setShowSuccess(false);
          setSuccessMessage('');
        }, 3000);
      }
    });

    return unsubscribe;
  }, [navigation, paymentCompleted, formData.boost, formData.boostPrice, formData.title]);

  // Récupérer la position par défaut de l'utilisateur et son pays
  useEffect(() => {
    const getDefaultLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        const locales = Localization.getLocales();
        let countryCode = (locales && locales[0] && locales[0].regionCode) ? locales[0].regionCode : 'FR';
        setDefaultCountry(countryCode);
        setDefaultRegion(getCountryRegion(countryCode));
      } catch (error) {
        setDefaultRegion(getCountryRegion('FR'));
        setDefaultCountry('FR');
      }
    };
    // Ne récupérer la position par défaut que si elle n'est pas déjà définie
    if (!defaultCountry) {
      getDefaultLocation();
    }
  }, [defaultCountry]);

  const handleSubmit = async () => {
    
    // Vérifier l'authentification
    if (!isAuthenticated) {
      Alert.alert('Erreur', 'Vous devez être connecté pour publier un produit');
      return;
    }
    
    // Validation
    if (!formData.title.trim()) {
      setErrorMessage('Le titre est requis');
      return;
    }
    if (!formData.description.trim()) {
      setErrorMessage('La description est requise');
      return;
    }
    if (!formData.price.trim()) {
      setErrorMessage('Le prix est requis');
      return;
    }
    // Les photos ne sont plus obligatoires - une image par défaut sera utilisée si aucune photo n'est ajoutée
    if (!formData.category) {
      setErrorMessage('La catégorie est requise');
      return;
    }

    try {
      
      // Convertir le prix en nombre
      const price = parseFloat(formData.price.replace(',', '.'));
      if (isNaN(price) || price < 0) {
        setErrorMessage('Le prix doit être un nombre positif ou 0 pour un don');
        return;
      }

      // Convertir l'ID de catégorie en nombre
      const categoryId = parseInt(formData.category);
      if (isNaN(categoryId)) {
        setErrorMessage('Catégorie invalide');
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
        imageIds: formData.imageIds.length > 0 ? formData.imageIds : [1], // Image par défaut (ID 1) si aucune photo
        city: formData.city,
        country: formData.country,
        boost: formData.boost === 'true',
        boostDuration: formData.boostDuration,
        boostPrice: formData.boostPrice,
        extraPhotosQuantity: formData.extraPhotosQuantity,
        extraPhotosPrice: formData.extraPhotosPrice,
        handoverMethod: formData.handoverMethods,
        handoverAddress: formData.handoverAddress,
        packageFormat: formData.packageFormat,
        packageWeight: formData.packageWeight,
      };
      
      const result = await ProductService.createProduct(productData);
      
      // Vérifier si l'annonce a été publiée sans photos et envoyer une notification
      if (formData.imageIds.length === 0) {
        try {
          // Demander les permissions si nécessaire
          const hasPermissions = await KafkaNotificationService.areNotificationsEnabled();
          if (!hasPermissions) {
            await KafkaNotificationService.requestPermissions();
          }
          
          // Envoyer la notification immédiate
          await KafkaNotificationService.notifyNoPhotosInAd(formData.title);
          
          // Programmer un rappel pour plus tard (30 minutes)
          await KafkaNotificationService.schedulePhotoReminder(formData.title, 30);
          
        } catch (error) {
          console.log('Erreur lors de l\'envoi de la notification:', error);
        }
      }
      
      // Afficher le message de succès
      const boostMessage = formData.boost === 'true' 
        ? ` avec boost (${formData.boostPrice?.toFixed(2)} €)`
        : '';
      setSuccessMessage(`"${formData.title}" a été publié avec succès${boostMessage} !`);
      setShowSuccess(true);
      
      // Reset form complet
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
        boost: 'false',
        boostDuration: '',
        boostPrice: 0,
        extraPhotosQuantity: 0,
        extraPhotosPrice: 0,
        handoverMethods: {
          inPerson: false,
          delivery: false,
          pickup: false,
        },
        handoverAddress: '',
        packageFormat: 'small',
        packageWeight: 1.5,
      });
      // Réinitialiser tous les états de localisation
      setSelectedCountry('');
      setSelectedCity('');
      setCityQuery('');
      setCitySearch('');
      setCountrySearch('');
      setFilteredCities([]);
      setShowCitySuggestions(false);
      setShowCountrySuggestions(false);
      setCityCoords(null);
      setDefaultCountry('');
      setDefaultRegion(null);
      setCurrentStep(SellStep.ESSENTIALS);

      // Masquer le message après 3 secondes
      setTimeout(() => {
        setShowSuccess(false);
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      setErrorMessage('Impossible de créer le produit. Vérifiez votre connexion.');
    }
  };

  const updateFormData = (field: keyof ProductForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Effacer le message d'erreur quand l'utilisateur modifie le formulaire
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const handleExtraPhotosPurchase = (quantity: number, price: number) => {
    setFormData(prev => ({
      ...prev,
      extraPhotosQuantity: (prev.extraPhotosQuantity || 0) + quantity,
      extraPhotosPrice: (prev.extraPhotosPrice || 0) + price,
    }));
  };

  // Navigation entre les étapes
  const nextStep = () => {
    // Logique spéciale pour l'étape REVIEW
    if (currentStep === SellStep.REVIEW) {
      // Le paiement est maintenant géré directement dans le bouton
      // Cette fonction n'est plus appelée pour l'étape REVIEW
      return;
    }

    if (currentStep < SellStep.REVIEW) {
      setCurrentStep(currentStep + 1);
      setErrorMessage('');
    }
  };

  const prevStep = () => {
    if (currentStep > SellStep.ESSENTIALS) {
      setCurrentStep(currentStep - 1);
      setErrorMessage('');
    }
  };

  const goToStep = (step: SellStep) => {
    setCurrentStep(step);
    setErrorMessage('');
  };

  // Vérifier si l'étape actuelle est complète
  const isStepComplete = () => {
    const currentConfig = stepConfigs[currentStep];
    const isComplete = currentConfig.required.every(field => {
      const value = formData[field as keyof ProductForm];
      const isValid = value && (typeof value === 'string' ? value.trim() : true) && 
             (Array.isArray(value) ? value.length > 0 : true);
      // Debug pour l'étape LOCATION
      // (On retire le log du JSX, on le laisse ici si besoin)
      if (currentStep === SellStep.LOCATION) {
        // console.log(`Validation ${field}:`, value, '->', isValid);
      }
      return isValid;
    });
    // Debug pour l'étape LOCATION
    if (currentStep === SellStep.LOCATION) {
      // console.log('Étape LOCATION complète:', isComplete, 'formData:', { country: formData.country, city: formData.city });
    }
    return isComplete;
  };

  // Rendre le contenu selon l'étape
  const renderStepContent = () => {
    switch (currentStep) {
      case SellStep.ESSENTIALS:
        return (
          <>
            {/* Titre */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Titre de l'annonce *</Text>
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

            {/* Catégorie */}
            {categoriesLoading ? (
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Catégorie *</Text>
                <View style={[styles.textInput, { backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center' }]}>
                  <Text style={{ color: colors.tabIconDefault }}>Chargement des catégories...</Text>
                </View>
              </View>
            ) : (
              <DropdownSelector
                label="Catégorie *"
                data={categoryOptions}
                selectedValue={(() => {
                  if (!formData.category) return '';
                  const found = categoryOptions.find(opt => opt.startsWith(formData.category + ' - '));
                  return found || '';
                })()}
                onSelect={(value: string) => {
                  if (value) {
                    const id = value.split(' - ')[0];
                    updateFormData('category', id);
                  }
                }}
                placeholder="Sélectionner une catégorie"
                disabled={categoriesLoading}
              />
            )}
          </>
        );

      case SellStep.DETAILS:
        return (
          <>
            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Description *</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: '#fff', color: colors.text, borderColor: colors.border }]}
                value={formData.description}
                onChangeText={(text) => updateFormData('description', text)}
                placeholder="Décris ton article en détail..."
                placeholderTextColor={colors.tabIconDefault}
                multiline
                numberOfLines={5}
                maxLength={4000}
              />
              <Text style={[styles.charCount, { color: colors.tabIconDefault }]}>
                {formData.description.length}/4000
              </Text>
            </View>

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
            <DropdownSelector
              label="Taille"
              data={SIZES}
              selectedValue={formData.size}
              onSelect={(value: string) => updateFormData('size', value)}
              placeholder="Sélectionner une taille"
            />

            {/* État */}
            <DropdownSelector
              label="État"
              data={CONDITIONS}
              selectedValue={formData.condition}
              onSelect={(value: string) => updateFormData('condition', value)}
              placeholder="Sélectionner un état"
            />
          </>
        );

      case SellStep.PHOTOS:
        return (
          <ProductImagePicker
            imageIds={formData.imageIds}
            onChange={(ids) => updateFormData('imageIds', ids)}
            uploadUrl={getUploadUrl()}
            getImageUrl={getImageUrlCallback}
            onExtraPhotosPurchase={handleExtraPhotosPurchase}
            extraPhotosPurchased={formData.extraPhotosQuantity || 0}
            maxFreePhotos={5}
          />
        );

      case SellStep.PRICE:
        return (
          <>
            {/* Option de don */}
            <View style={styles.inputGroup}>
              <TouchableOpacity
                style={[
                  styles.donationOption,
                  formData.price === '0' && styles.donationOptionSelected
                ]}
                onPress={() => {
                  // Si le don est déjà sélectionné, on le désélectionne
                  if (formData.price === '0') {
                    updateFormData('price', '');
                  } else {
                    // Sinon on sélectionne le don
                    updateFormData('price', '0');
                  }
                }}
              >
                <View style={styles.donationContent}>
                  <Ionicons 
                    name="gift-outline" 
                    size={24} 
                    color={formData.price === '0' ? '#fff' : colors.primary} 
                  />
                  <View style={styles.donationText}>
                    <Text style={[
                      styles.donationTitle,
                      { color: formData.price === '0' ? '#fff' : colors.text }
                    ]}>
                      Faire un don
                    </Text>
                    <Text style={[
                      styles.donationSubtitle,
                      { color: formData.price === '0' ? '#fff' : colors.tabIconDefault }
                    ]}>
                      Offrir votre article gratuitement
                    </Text>
                  </View>
                  {formData.price === '0' && (
                    <Ionicons name="checkmark-circle" size={24} color="#fff" />
                  )}
                </View>
              </TouchableOpacity>
            </View>

            {/* Prix personnalisé */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Ou définir un prix personnalisé
              </Text>
              <View style={styles.priceInputContainer}>
                <TextInput
                  style={[
                    styles.priceInput, 
                    { 
                      backgroundColor: '#fff', 
                      color: colors.text, 
                      borderColor: colors.border,
                      opacity: formData.price === '0' ? 0.5 : 1
                    }
                  ]}
                  value={formData.price === '0' ? '' : formData.price}
                  onChangeText={(text) => {
                    const cleanText = text.replace(/[^0-9,]/g, '');
                    updateFormData('price', cleanText);
                  }}
                  placeholder="0,00 €"
                  placeholderTextColor={colors.tabIconDefault}
                  keyboardType="numeric"
                  editable={formData.price !== '0'}
                />
                <Text style={[styles.currency, { color: colors.text }]}>€</Text>
              </View>
            </View>
          </>
        );

      case SellStep.HANDOVER:
        return (
          <View style={styles.handoverStepContainer}>
            <Text style={[styles.handoverTitle, { color: colors.text }]}>Méthodes de remise</Text>
            <Text style={[styles.handoverDescription, { color: colors.tabIconDefault }]}>
              Sélectionnez les méthodes de remise que vous acceptez pour votre bien.
            </Text>

            {/* Option 1: En main propre */}
            <TouchableOpacity
              style={[
                styles.handoverOption,
                { backgroundColor: colors.card, borderColor: colors.border },
                formData.handoverMethods?.inPerson && styles.handoverOptionSelected
              ]}
              onPress={() => updateFormData('handoverMethods', {
                ...formData.handoverMethods,
                inPerson: !formData.handoverMethods?.inPerson
              })}
            >
                              <View style={styles.handoverOptionContent}>
                  <View style={styles.handoverOptionHeader}>
                    <Text style={[
                      styles.handoverOptionTitle, 
                      { color: formData.handoverMethods?.inPerson ? '#fff' : colors.text }
                    ]}>
                      En main propre
                    </Text>
                    {formData.handoverMethods?.inPerson && (
                      <View style={[styles.activeBadge, { backgroundColor: '#fff' }]}>
                        <Text style={[styles.activeBadgeText, { color: '#008080' }]}>Activé</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[
                    styles.handoverOptionDescription, 
                    { color: formData.handoverMethods?.inPerson ? '#fff' : colors.tabIconDefault }
                  ]}>
                    Convenez d'un rendez-vous avec l'acheteur pour lui remettre l'article.
                  </Text>
                </View>
            </TouchableOpacity>

            {/* Option 2: En livraison */}
            <TouchableOpacity
              style={[
                styles.handoverOption,
                { backgroundColor: colors.card, borderColor: colors.border },
                formData.handoverMethods?.delivery && styles.handoverOptionSelected
              ]}
              onPress={() => updateFormData('handoverMethods', {
                ...formData.handoverMethods,
                delivery: !formData.handoverMethods?.delivery
              })}
            >
                              <View style={styles.handoverOptionContent}>
                  <View style={styles.handoverOptionHeader}>
                    <Text style={[
                      styles.handoverOptionTitle, 
                      { color: formData.handoverMethods?.delivery ? '#fff' : colors.text }
                    ]}>
                      En livraison
                    </Text>
                    {formData.handoverMethods?.delivery && (
                      <View style={[styles.activeBadge, { backgroundColor: '#fff' }]}>
                        <Text style={[styles.activeBadgeText, { color: '#008080' }]}>Activé</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[
                    styles.handoverOptionDescription, 
                    { color: formData.handoverMethods?.delivery ? '#fff' : colors.tabIconDefault }
                  ]}>
                    Envoyez l'article à votre acheteur gratuitement via nos partenaires de livraison.
                  </Text>
                  <View style={styles.deliveryPartners}>
                    <View style={styles.deliveryPartnerIcon}>
                      <Text style={[
                        styles.deliveryPartnerText,
                        { color: '#008080' }
                      ]}>P</Text>
                    </View>
                    <View style={styles.deliveryPartnerIcon}>
                      <Ionicons 
                        name="cube-outline" 
                        size={18} 
                        color="#008080" 
                      />
                    </View>
                    <View style={styles.deliveryPartnerIcon}>
                      <Ionicons 
                        name="car-outline" 
                        size={18} 
                        color="#008080" 
                      />
                    </View>
                    <View style={styles.deliveryPartnerIcon}>
                      <Ionicons 
                        name="mail-outline" 
                        size={18} 
                        color="#008080" 
                      />
                    </View>
                  </View>
                </View>
            </TouchableOpacity>

            {/* Option 3: Point relais */}
            <TouchableOpacity
              style={[
                styles.handoverOption,
                { backgroundColor: colors.card, borderColor: colors.border },
                formData.handoverMethods?.pickup && styles.handoverOptionSelected
              ]}
              onPress={() => updateFormData('handoverMethods', {
                ...formData.handoverMethods,
                pickup: !formData.handoverMethods?.pickup
              })}
            >
                              <View style={styles.handoverOptionContent}>
                  <View style={styles.handoverOptionHeader}>
                    <Text style={[
                      styles.handoverOptionTitle, 
                      { color: formData.handoverMethods?.pickup ? '#fff' : colors.text }
                    ]}>
                      Point relais
                    </Text>
                    {formData.handoverMethods?.pickup && (
                      <View style={[styles.activeBadge, { backgroundColor: '#fff' }]}>
                        <Text style={[styles.activeBadgeText, { color: '#008080' }]}>Activé</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[
                    styles.handoverOptionDescription, 
                    { color: formData.handoverMethods?.pickup ? '#fff' : colors.tabIconDefault }
                  ]}>
                    Déposez votre article dans un point relais pour que l'acheteur puisse le récupérer.
                  </Text>
                </View>
            </TouchableOpacity>

            {/* Adresse de remise (si en main propre ou point relais activé) */}
            {(formData.handoverMethods?.inPerson || formData.handoverMethods?.pickup) && (
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Adresse de remise</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: '#fff', color: colors.text, borderColor: colors.border }]}
                  value={formData.handoverAddress || ''}
                  onChangeText={(text) => updateFormData('handoverAddress', text)}
                  placeholder="Ex: 123 Rue de la Paix, 75001 Paris"
                  placeholderTextColor={colors.tabIconDefault}
                  multiline
                  numberOfLines={3}
                  maxLength={200}
                />
                <Text style={[styles.charCount, { color: colors.tabIconDefault }]}>
                  {(formData.handoverAddress || '').length}/200
                </Text>
              </View>
            )}

            {/* Informations sur le colis (toujours visible) */}
            <View style={styles.packageInfoContainer}>
              <Text style={[styles.packageInfoTitle, { color: colors.text }]}>
                Informations sur le colis
              </Text>
              
              {/* Format du colis par défaut */}
              <View style={styles.packageFormatContainer}>
                <View style={styles.packageFormatInfo}>
                  <Text style={[styles.packageFormatLabel, { color: colors.text }]}>
                    Format par défaut
                  </Text>
                  <Text style={[styles.packageFormatValue, { color: colors.tabIconDefault }]}>
                    {PACKAGE_FORMATS.find(f => f.id === formData.packageFormat)?.name} ({PACKAGE_FORMATS.find(f => f.id === formData.packageFormat)?.weight})
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.modifyButton, { backgroundColor: colors.primary }]}
                  onPress={() => {
                    // Afficher les options de format disponibles
                    Alert.alert(
                      'Modifier le format du colis',
                      'Sélectionnez le format approprié selon la taille et le poids de votre article :',
                      [
                        { 
                          text: 'Petit colis (1-2kg)', 
                          onPress: () => {
                            updateFormData('packageFormat', 'small');
                            updateFormData('packageWeight', 1.5);
                          }
                        },
                        { 
                          text: 'Colis moyen (2-5kg)', 
                          onPress: () => {
                            updateFormData('packageFormat', 'medium');
                            updateFormData('packageWeight', 3.5);
                          }
                        },
                        { 
                          text: 'Gros colis (5-10kg)', 
                          onPress: () => {
                            updateFormData('packageFormat', 'large');
                            updateFormData('packageWeight', 7.5);
                          }
                        },
                        { 
                          text: 'Très gros colis (10-30kg)', 
                          onPress: () => {
                            updateFormData('packageFormat', 'xlarge');
                            updateFormData('packageWeight', 20);
                          }
                        },
                        { 
                          text: 'Colis lourd (30-130kg)', 
                          onPress: () => {
                            updateFormData('packageFormat', 'heavy');
                            updateFormData('packageWeight', 80);
                          }
                        },
                        { text: 'Annuler', style: 'cancel' }
                      ]
                    );
                  }}
                >
                  <Text style={styles.modifyButtonText}>Modifier</Text>
                </TouchableOpacity>
              </View>

              {/* Poids estimé */}
              <View style={styles.packageWeightContainer}>
                <Text style={[styles.packageWeightLabel, { color: colors.text }]}>
                  Poids estimé
                </Text>
                <Text style={[styles.packageWeightValue, { color: colors.tabIconDefault }]}>
                  {formData.packageWeight} kg
                </Text>
              </View>

              {/* Note sur les formats */}
              <View style={styles.packageNoteContainer}>
                <Text style={[styles.packageNote, { color: colors.tabIconDefault }]}>
                  <Ionicons name="cube-outline" size={16} color={colors.tabIconDefault} /> Formats disponibles : Petit (1-2kg), Moyen (2-5kg), Gros (5-10kg), Très gros (10-30kg), Lourd (30-130kg)
                </Text>
              </View>
            </View>
          </View>
        );

      case SellStep.LOCATION:
        return (
          <View style={styles.locationStepContainer}>
            {/* Pays */}
            <View style={styles.locationSelectorsContainer}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Pays *</Text>
                <View style={styles.searchContainer}>
                  <TextInput
                    style={[styles.searchInput, { backgroundColor: '#fff', color: colors.text, borderColor: colors.border }]}
                    value={countrySearch}
                    onChangeText={(text) => {
                      setCountrySearch(text);
                      setShowCountrySuggestions(text.length > 0);
                    }}
                    placeholder="Tapez le nom du pays..."
                    placeholderTextColor={colors.tabIconDefault}
                  />
                  {showCountrySuggestions && (
                    <View style={styles.suggestionsContainer}>
                      <ScrollView style={styles.suggestionsList} nestedScrollEnabled={true}>
                        {countryList
                          .filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase()))
                          .slice(0, 5)
                          .map((country, index) => (
                            <TouchableOpacity
                              key={index}
                              style={styles.suggestionItem}
                              onPress={() => {
                                setCountrySearch(country.name);
                                setShowCountrySuggestions(false);
                                handleCountryChange(country.code);
                              }}
                            >
                              <Text style={[styles.suggestionText, { color: colors.text }]}>
                                {country.name}
                              </Text>
                            </TouchableOpacity>
                          ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
              </View>

              {/* Ville */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Ville *</Text>
                <View style={styles.searchContainer}>
                  <View style={styles.inputWithIcon}>
                    <TextInput
                      style={[
                        styles.searchInput, 
                        { backgroundColor: '#fff', color: colors.text, borderColor: colors.border },
                        !selectedCountry && { opacity: 0.5 }
                      ]}
                      value={citySearch}
                      onChangeText={(text) => {
                        setCitySearch(text);
                        setShowCitySuggestions(text.length > 0);
                      }}
                      placeholder={selectedCountry ? "Tapez le nom de la ville..." : "Sélectionnez d'abord un pays"}
                      placeholderTextColor={colors.tabIconDefault}
                      editable={!!selectedCountry}
                    />
                    {selectedCity && (
                      <TouchableOpacity
                        style={styles.clearButton}
                        onPress={() => {
                          setCitySearch('');
                          setSelectedCity('');
                          setFormData(prev => ({ ...prev, city: '' }));
                          setCityCoords(null);
                        }}
                      >
                        <Ionicons name="close" size={20} color="#999" />
                      </TouchableOpacity>
                    )}
                  </View>
                  {showCitySuggestions && selectedCountry && (
                    <View style={styles.suggestionsContainer}>
                      <ScrollView style={styles.suggestionsList} nestedScrollEnabled={true}>
                        {filteredCities
                          .filter(city => city.toLowerCase().includes(citySearch.toLowerCase()))
                          .slice(0, 5)
                          .map((city, index) => (
                            <TouchableOpacity
                              key={index}
                              style={styles.suggestionItem}
                              onPress={() => {
                                setCitySearch(city);
                                setShowCitySuggestions(false);
                                
                                // Test direct avec des coordonnées fixes pour Strasbourg
                                if (city.toLowerCase().includes('strasbourg')) {
                                  setCityCoords({ lat: 480.5734, lon: 7.7521 });
                                } else {
                                  handleCityChange(city);
                                }
                              }}
                            >
                              <Text style={[styles.suggestionText, { color: colors.text }]}>
                                {city}
                              </Text>
                            </TouchableOpacity>
                          ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Carte de localisation */}
            {(cityCoords || defaultRegion) && (
              <View style={styles.mapContainer}>
                {Platform.OS === 'web' ? (
                  <View style={styles.webMapPlaceholder}>
                    <Ionicons name="map-outline" size={40} color="#008080" />
                    <Text style={styles.webMapText}>
                      Carte non disponible sur web
                    </Text>
                    <Text style={styles.webMapCoordinates}>
                      Coordonnées : {cityCoords ?
                        `${cityCoords.lat.toFixed(4)}, ${cityCoords.lon.toFixed(4)}` :
                        defaultRegion ?
                          `${defaultRegion.latitude.toFixed(4)}, ${defaultRegion.longitude.toFixed(4)}` :
                          'Non disponibles'
                      }
                    </Text>
                  </View>
                ) : (
                  <MapView
                    key={cityCoords
                      ? `${cityCoords.lat},${cityCoords.lon}`
                      : defaultRegion
                        ? `${defaultRegion.latitude},${defaultRegion.longitude}`
                        : 'default'
                    }
                    style={styles.map}
                    region={cityCoords
                      ? {
                          latitude: cityCoords.lat,
                          longitude: cityCoords.lon,
                          latitudeDelta: 0.08,
                          longitudeDelta: 0.08,
                        }
                      : defaultRegion || { latitude: 20, longitude: 0, latitudeDelta: 40, longitudeDelta: 40 }
                    }
                    pointerEvents="none"
                  >
                    {cityCoords && (
                      <Marker
                        coordinate={{
                          latitude: cityCoords.lat,
                          longitude: cityCoords.lon,
                        }}
                        title={selectedCity}
                      />
                    )}
                  </MapView>
                )}
              </View>
            )}
          </View>
        );

      case SellStep.BOOST:
        return (
          <>
            <View style={styles.boostStepContainer}>
              <Text style={[styles.boostTitle, { color: colors.text }]}>Boostez votre annonce</Text>
              <Text style={[styles.boostDescription, { color: colors.tabIconDefault }]}>
                Votre annonce est-elle urgente ? Vous pouvez la mettre en avant pour un prix supplémentaire.
              </Text>
              
              <View style={styles.boostOptionsContainer}>
                
                {/* Option sans boost */}
                <TouchableOpacity
                  style={[
                    styles.boostOptionCard,
                    formData.boost === 'false' && styles.boostOptionCardSelected
                  ]}
                  onPress={() => {
                    updateFormData('boost', 'false');
                    updateFormData('boostDuration', '');
                    updateFormData('boostPrice', 0);
                  }}
                >
                  <View style={styles.boostOptionContent}>
                    <Ionicons name="close-outline" size={24} color={formData.boost === 'false' ? '#fff' : colors.primary} />
                    <View style={styles.boostOptionText}>
                      <Text style={[
                        styles.boostOptionTitle,
                        { color: formData.boost === 'false' ? '#fff' : colors.text }
                      ]}>
                        Sans boost
                      </Text>
                      <Text style={[
                        styles.boostOptionSubtitle,
                        { color: formData.boost === 'false' ? '#fff' : colors.tabIconDefault }
                      ]}>
                        Publier sans boost
                      </Text>
                    </View>
                    <View style={styles.boostOptionPrice}>
                      <Text style={[
                        styles.boostPriceText,
                        { color: formData.boost === 'false' ? '#fff' : colors.text }
                      ]}>
                        Gratuit
                      </Text>
                    </View>
                    {formData.boost === 'false' && (
                      <Ionicons name="checkmark-circle" size={24} color="#fff" />
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Section Remonter l'annonce */}
            <View style={styles.boostSectionRemontez}>
              <Text style={[styles.boostSectionTitle, { color: colors.text }]}>Remontez votre annonce</Text>
              <Text style={[styles.boostSectionDescription, { color: colors.tabIconDefault }]}>
                Remontez automatiquement votre annonce dans les résultats de recherche de votre catégorie.
              </Text>
              {BOOST_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.boostOptionCard,
                    formData.boost === 'true' && formData.boostDuration === option.duration && styles.boostOptionCardSelected
                  ]}
                  onPress={() => {
                    updateFormData('boost', 'true');
                    updateFormData('boostDuration', option.duration);
                    updateFormData('boostPrice', option.price);
                  }}
                >
                  <View style={styles.boostOptionHeader}>
                    {option.popular && (
                      <View style={styles.popularBadge}>
                        <Text style={styles.popularText}>Recommandé</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.boostOptionContent}>
                    <Ionicons name="star-outline" size={24} color={formData.boost === 'true' && formData.boostDuration === option.duration ? '#fff' : colors.primary} />
                    <View style={styles.boostOptionText}>
                      <Text style={[
                        styles.boostOptionTitle,
                        { color: formData.boost === 'true' && formData.boostDuration === option.duration ? '#fff' : colors.text }
                      ]}>
                        {option.title}
                      </Text>
                      <Text style={[
                        styles.boostOptionSubtitle,
                        { color: formData.boost === 'true' && formData.boostDuration === option.duration ? '#fff' : colors.tabIconDefault }
                      ]}>
                        {option.description}
                      </Text>
                      <Text style={[
                        styles.boostOptionDuration,
                        { color: formData.boost === 'true' && formData.boostDuration === option.duration ? '#fff' : colors.primary }
                      ]}>
                        {option.duration}
                      </Text>
                    </View>
                    <View style={styles.boostOptionPrice}>
                      <Text style={[
                        styles.boostPriceText,
                        { color: formData.boost === 'true' && formData.boostDuration === option.duration ? '#fff' : colors.text }
                      ]}>
                        {option.price.toFixed(2)} €
                      </Text>
                    </View>
                    {formData.boost === 'true' && formData.boostDuration === option.duration && (
                      <Ionicons name="checkmark-circle" size={24} color="#fff" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Section Annonce urgente */}
            <View style={styles.boostSectionUrgente}>
              <Text style={[styles.boostSectionTitle, { color: colors.text }]}>Annonce urgente</Text>
              <Text style={[styles.boostSectionDescription, { color: colors.tabIconDefault }]}>
                Ressortez dans les résultats et profitez du filtre pour être trouvé facilement.
              </Text>
              {URGENT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.boostOptionCard,
                    formData.boost === 'true' && formData.boostDuration === option.duration && styles.boostOptionCardSelected
                  ]}
                  onPress={() => {
                    updateFormData('boost', 'true');
                    updateFormData('boostDuration', option.duration);
                    updateFormData('boostPrice', option.price);
                  }}
                >
                  <View style={styles.boostOptionContent}>
                    <Ionicons name="flash-outline" size={24} color={formData.boost === 'true' && formData.boostDuration === option.duration ? '#fff' : colors.primary} />
                    <View style={styles.boostOptionText}>
                      <Text style={[
                        styles.boostOptionTitle,
                        { color: formData.boost === 'true' && formData.boostDuration === option.duration ? '#fff' : colors.text }
                      ]}>
                        {option.title}
                      </Text>
                      <Text style={[
                        styles.boostOptionSubtitle,
                        { color: formData.boost === 'true' && formData.boostDuration === option.duration ? '#fff' : colors.tabIconDefault }
                      ]}>
                        {option.description}
                      </Text>
                      <Text style={[
                        styles.boostOptionDuration,
                        { color: formData.boost === 'true' && formData.boostDuration === option.duration ? '#fff' : colors.primary }
                      ]}>
                        {option.duration}
                      </Text>
                    </View>
                    <View style={styles.boostOptionPrice}>
                      <Text style={[
                        styles.boostPriceText,
                        { color: formData.boost === 'true' && formData.boostDuration === option.duration ? '#fff' : colors.text }
                      ]}>
                        {option.price.toFixed(2)} €
                      </Text>
                    </View>
                    {formData.boost === 'true' && formData.boostDuration === option.duration && (
                      <Ionicons name="checkmark-circle" size={24} color="#fff" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        );

      case SellStep.REVIEW:
        return (
          <View style={styles.reviewContainer}>
            {/* En-tête avec titre principal */}
            <View style={styles.reviewHeader}>
              <Text style={[styles.reviewMainTitle, { color: colors.text }]}>
                Votre annonce est prête !
              </Text>
              <Text style={[styles.reviewSubtitle, { color: colors.tabIconDefault }]}>
                Vérifiez les informations ci-dessous avant de publier
              </Text>
            </View>

            {/* Carte principale avec toutes les infos */}
            <View style={styles.reviewMainCard}>
              {/* Titre et catégorie */}
              <View style={styles.reviewMainInfo}>
                <Text style={[styles.reviewItemTitle, { color: colors.text }]} numberOfLines={2}>
                  {formData.title}
                </Text>
                <View style={styles.reviewItemMeta}>
                  <Text style={[styles.reviewItemCategory, { color: colors.primary }]}>
                    {categoryOptions.find(opt => opt.startsWith(formData.category + ' - '))?.split(' - ')[1] || ''}
                  </Text>
                  <Text style={[styles.reviewItemPrice, { color: colors.text }]}>
                    {formData.price === '0' ? 'Don gratuit' : `${formData.price} €`}
                  </Text>
                </View>
              </View>

              {/* Séparateur */}
              <View style={styles.reviewDivider} />

              {/* Détails en grille */}
              <View style={styles.reviewDetailsGrid}>
                {/* Localisation */}
                <View style={styles.reviewDetailItem}>
                  <Ionicons name="location-outline" size={18} color={colors.tabIconDefault} />
                  <View style={styles.reviewDetailContent}>
                    <Text style={[styles.reviewDetailLabel, { color: colors.tabIconDefault }]}>Localisation</Text>
                    <Text style={[styles.reviewDetailValue, { color: colors.text }]}>
                      {formData.city && formData.country ? `${formData.city}, ${countries.getName(formData.country, 'fr') || formData.country || 'Pays inconnu'}` : 'Non spécifiée'}
                    </Text>
                  </View>
                </View>

                {/* Méthodes de remise */}
                <View style={styles.reviewDetailItem}>
                  <Ionicons name="car-outline" size={18} color={colors.tabIconDefault} />
                  <View style={styles.reviewDetailContent}>
                    <Text style={[styles.reviewDetailLabel, { color: colors.tabIconDefault }]}>Remise</Text>
                    <Text style={[styles.reviewDetailValue, { color: colors.text }]}>
                      {(() => {
                        const methods = [];
                        if (formData.handoverMethods?.inPerson) methods.push('En main propre');
                        if (formData.handoverMethods?.delivery) methods.push('En livraison');
                        if (formData.handoverMethods?.pickup) methods.push('Point relais');
                        return methods.length > 0 ? methods.join(', ') : 'Non spécifié';
                      })()}
                    </Text>
                  </View>
                </View>

                {/* Photos */}
                <View style={styles.reviewDetailItem}>
                  <Ionicons name="camera-outline" size={18} color={colors.tabIconDefault} />
                  <View style={styles.reviewDetailContent}>
                    <Text style={[styles.reviewDetailLabel, { color: colors.tabIconDefault }]}>Photos</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                      <Text style={[styles.reviewDetailValue, { color: colors.text }]}> 
                        {formData.imageIds.length > 0 
                          ? `${formData.imageIds.length} photo(s)`
                          : 'Image par défaut'
                        }
                      </Text>
                      {(formData.extraPhotosQuantity || 0) > 0 && (
                        <Text style={[styles.reviewDetailValue, { color: colors.primary }]}> 
                          {` (+${formData.extraPhotosQuantity || 0} extras)`}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>

                {/* Boost */}
                <View style={styles.reviewDetailItem}>
                  <Ionicons name="rocket-outline" size={18} color={colors.tabIconDefault} />
                  <View style={styles.reviewDetailContent}>
                    <Text style={[styles.reviewDetailLabel, { color: colors.tabIconDefault }]}>Boost</Text>
                    <Text style={[styles.reviewDetailValue, { color: colors.text }]}>
                      {formData.boost === 'true' 
                        ? `${formData.boostDuration || 'Boost sélectionné'}`
                        : 'Annonce normale'
                      }
                    </Text>
                  </View>
                </View>
              </View>

              {/* Adresse de remise si applicable */}
              {formData.handoverAddress && (formData.handoverMethods?.inPerson || formData.handoverMethods?.pickup) && (
                <>
                  <View style={styles.reviewDivider} />
                  <View style={styles.reviewAddressSection}>
                    <Ionicons name="location-outline" size={16} color={colors.tabIconDefault} />
                    <Text style={[styles.reviewAddressText, { color: colors.text }]} numberOfLines={2}>
                      {formData.handoverAddress}
                    </Text>
                  </View>
                </>
              )}
            </View>

            {/* Résumé des coûts */}
            {(formData.boost === 'true' || ((formData.extraPhotosQuantity || 0) > 0)) && (
              <View style={styles.reviewCostsCard}>
                <Text style={[styles.reviewCostsTitle, { color: colors.text }]}>Résumé des coûts</Text>
                <View style={styles.reviewCostsList}>
                  {formData.boost === 'true' && (
                    <View style={styles.reviewCostItem}>
                      <Text style={[styles.reviewCostLabel, { color: colors.tabIconDefault }]}>Boost d'annonce</Text>
                      <Text style={[styles.reviewCostValue, { color: colors.text }]}>
                        {formData.boostPrice?.toFixed(2)} €
                      </Text>
                    </View>
                  )}
                  {(formData.extraPhotosQuantity || 0) > 0 && (
                    <View style={styles.reviewCostItem}>
                      <Text style={[styles.reviewCostLabel, { color: colors.tabIconDefault }]}>Photos supplémentaires</Text>
                      <Text style={[styles.reviewCostValue, { color: colors.text }]}>
                        {formData.extraPhotosPrice?.toFixed(2)} €
                      </Text>
                    </View>
                  )}
                  <View style={styles.reviewCostTotal}>
                    <Text style={[styles.reviewCostTotalLabel, { color: colors.text }]}>Total</Text>
                    <Text style={[styles.reviewCostTotalValue, { color: colors.primary }]}>
                      {((formData.boostPrice || 0) + (formData.extraPhotosPrice || 0)).toFixed(2)} €
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        );



      default:
        return null;
    }
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
    setCitySearch(''); // Réinitialiser le champ ville
    
    // Mettre à jour le champ de recherche du pays
    const country = countryList.find(c => c.code === countryCode);
    if (country) {
      setCountrySearch(country.name);
    }
    
    if (countryCode) {
      const citiesForCountry = cities.filter((c: any) => c.country === countryCode).map((c: any) => c.name);
      setFilteredCities(citiesForCountry);
    } else {
      setFilteredCities([]);
    }
  };

  const handleCityChange = async (cityName: string) => {
    setSelectedCity(cityName);
    setFormData(prev => ({ ...prev, city: cityName }));
    setCityQuery(cityName);
    setCitySearch(cityName); // Mettre à jour le champ de recherche
    
    // Debug (commenté pour éviter les erreurs)
    // console.log('handleCityChange appelé avec:', cityName);
    // console.log('formData après mise à jour:', { country: formData.country, city: cityName });
    
    // Récupérer les coordonnées de la ville
    if (cityName && selectedCountry) {
      try {
        const city = encodeURIComponent(cityName);
        const country = encodeURIComponent(selectedCountry);
        const url = `https://nominatim.openstreetmap.org/search?city=${city}&country=${country}&format=json&limit=1`;
        const response = await fetch(url, { headers: { 'User-Agent': 'SouqlyApp/1.0' } });
        const data = await response.json();
        if (data && data[0]) {
          const coords = { 
            lat: parseFloat(data[0].lat), 
            lon: parseFloat(data[0].lon) 
          };
          // console.log('Coordonnées récupérées pour', cityName, ':', coords);
          setCityCoords(coords);
        } else {
          // console.log('Aucune coordonnée trouvée pour', cityName);
          setCityCoords(null);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des coordonnées:', error);
        setCityCoords(null);
      }
    } else {
      setCityCoords(null);
    }
  };

  // Fonction pour reset complètement le formulaire
  const resetForm = () => {
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
      boost: 'false',
      boostDuration: '',
      boostPrice: 0,
      extraPhotosQuantity: 0,
      extraPhotosPrice: 0,
      handoverMethods: {
        inPerson: false,
        delivery: false,
        pickup: false,
      },
      handoverAddress: '',
      packageFormat: 'small',
      packageWeight: 1.5,
    });
    setCurrentStep(SellStep.ESSENTIALS);
    setSelectedCountry('');
    setSelectedCity('');
    setCityQuery('');
    setCitySearch('');
    setCountrySearch('');
    setFilteredCities([]);
    setShowCitySuggestions(false);
    setShowCountrySuggestions(false);
    setCityCoords(null);
    setErrorMessage('');
    setSuccessMessage('');
    setShowSuccess(false);
    setPaymentCompleted(false);
    // Réinitialiser aussi les valeurs par défaut de localisation
    setDefaultCountry('');
    setDefaultRegion(null);
  };

  // Affichage pour invité ou non connecté : header + message, pas de formulaire
  if (isGuest || !isAuthenticated) {
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
        {/* Header avec barre de progression */}
        <View style={styles.headerContainer}>
          <View style={styles.headerTop}>
            {currentStep !== SellStep.ESSENTIALS ? (
              <TouchableOpacity onPress={prevStep} style={styles.backButton}>
                <Ionicons name="chevron-back" size={24} color={colors.text} />
              </TouchableOpacity>
            ) : (
              <View style={styles.backButton} />
            )}
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {stepConfigs[currentStep].title}
            </Text>
            <TouchableOpacity onPress={resetForm} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          {/* Barre de progression */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${((currentStep + 1) / (Object.keys(SellStep).length + 1)) * 100}%`,
                    backgroundColor: colors.primary 
                  }
                ]} 
              />
            </View>
          </View>
        </View>

        {/* Message de succès */}
        {showSuccess && (
          <View style={styles.successContainer}>
            <View style={styles.successContent}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          </View>
        )}

        {/* Message d'erreur */}
        {errorMessage && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorMessage}>{errorMessage}</Text>
            <TouchableOpacity onPress={() => setErrorMessage('')} style={styles.closeErrorBtn}>
              <Ionicons name="close" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {/* Bouton de test pour les notifications (à supprimer en production) */}
        <TouchableOpacity
          style={[styles.testButton, { backgroundColor: colors.primary }]}
          onPress={async () => {
            try {
              await KafkaNotificationService.sendTestNotification();
              Alert.alert('Test', 'Notification de test envoyée !');
            } catch (error) {
              Alert.alert('Erreur', 'Erreur lors de l\'envoi de la notification de test');
            }
          }}
        >
          <Text style={styles.testButtonText}>Test Notification</Text>
        </TouchableOpacity>

        <ScrollView contentContainerStyle={{ ...styles.scrollContent, paddingHorizontal: 16 }}>
          {/* Contenu de l'étape - masqué pour l'étape REVIEW */}
          {currentStep !== SellStep.REVIEW && (
            <View style={[
              styles.stepContent,
              currentStep === SellStep.LOCATION && styles.locationStepContent
            ]}>
              <Text style={[styles.stepTitle, { color: colors.text }]}>
                {stepConfigs[currentStep].title}
              </Text>
              <Text style={[
                styles.stepDescription, 
                { color: colors.tabIconDefault },
                currentStep === SellStep.LOCATION && styles.locationStepDescription
              ]}>
                {stepConfigs[currentStep].description}
              </Text>
            </View>
          )}

          {/* Contenu selon l'étape */}
          {renderStepContent()}
        </ScrollView>

        {/* Boutons de navigation en bas de l'écran */}
        <View style={styles.bottomNavigationContainer}>
          <TouchableOpacity 
            style={[
              styles.navigationButton, 
              styles.prevButton,
              currentStep === SellStep.ESSENTIALS && styles.disabledButton
            ]} 
            onPress={prevStep}
            disabled={currentStep === SellStep.ESSENTIALS}
          >
            <Text style={[
              styles.navigationButtonText, 
              { color: currentStep === SellStep.ESSENTIALS ? '#999' : colors.text }
            ]}>
              Précédent
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.navigationButton, 
              styles.nextButton, 
              { 
                backgroundColor: isStepComplete() ? colors.primary : '#ccc'
              }
            ]} 
            onPress={currentStep === SellStep.REVIEW 
              ? (formData.boost === 'true' ? () => {
                  // Marquer que le paiement va être effectué
                  setPaymentCompleted(true);
                  
                  // Calculer le prix total (boost + photos supplémentaires)
                  const totalPrice = (formData.boostPrice || 0) + (formData.extraPhotosPrice || 0);
                  
                  // Navigation vers l'écran de paiement pour le boost
                  (navigation as any).navigate('Payment', {
                    productId: 'boost', // Identifiant spécial pour le boost
                    productPrice: totalPrice,
                    productTitle: `Boost pour "${formData.title}"`,
                    productImage: undefined,
                    isBoost: true,
                    boostData: {
                      title: formData.title,
                      description: formData.description,
                      category: formData.category,
                      brand: formData.brand,
                      size: formData.size,
                      condition: formData.condition,
                      price: formData.price,
                      imageIds: formData.imageIds,
                      city: formData.city,
                      country: formData.country,
                      boost: formData.boost,
                      boostDuration: formData.boostDuration,
                      boostPrice: formData.boostPrice,
                      extraPhotosQuantity: formData.extraPhotosQuantity,
                      extraPhotosPrice: formData.extraPhotosPrice,
                      handoverMethod: formData.handoverMethods,
                      handoverAddress: formData.handoverAddress,
                    }
                  });
                } : handleSubmit)
              : nextStep
            }
            disabled={!isStepComplete()}
          >
            <Text style={styles.navigationButtonText}>
              {currentStep === SellStep.REVIEW 
                ? (formData.boost === 'true' ? `Payer et publier (${((formData.boostPrice || 0) + (formData.extraPhotosPrice || 0)).toFixed(2)} €)` : 'Publier l\'article')
                : 'Continuer'
              }
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 100,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backButton: {
    padding: 8,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  stepContent: {
    marginBottom: 12,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
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
  errorContainer: {
    backgroundColor: '#ffebee',
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
    padding: 12,
    marginTop: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorMessage: {
    color: '#d32f2f',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  closeErrorBtn: {
    backgroundColor: '#f44336',
    borderRadius: 12,
    padding: 4,
    marginLeft: 8,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 12,
  },
  bottomNavigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  navigationButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prevButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  disabledButton: {
    backgroundColor: '#f0f0f0',
    borderColor: '#e0e0e0',
  },
  nextButton: {
    backgroundColor: '#008080',
  },
  navigationButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  reviewContainer: {
    marginBottom: 20,
  },
  reviewHeader: {
    marginBottom: 24,
    alignItems: 'center',
  },
  reviewMainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  reviewSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  reviewMainCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  reviewMainInfo: {
    marginBottom: 16,
  },
  reviewItemTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    lineHeight: 26,
  },
  reviewItemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewItemCategory: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f0f8f8',
  },
  reviewItemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  reviewDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  reviewDetailsGrid: {
    marginBottom: 16,
  },
  reviewDetailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  reviewDetailContent: {
    flex: 1,
    marginLeft: 12,
  },
  reviewDetailLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  reviewDetailValue: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  reviewAddressSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  reviewAddressText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  reviewCostsCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  reviewCostsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  reviewCostsList: {
    marginBottom: 8,
  },
  reviewCostItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  reviewCostLabel: {
    fontSize: 14,
    fontWeight: '400',
  },
  reviewCostValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  reviewCostTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 8,
  },
  reviewCostTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  reviewCostTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  reviewSection: {
    marginBottom: 24,
  },
  reviewSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  reviewCardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  reviewCardItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reviewCardLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  reviewCardValue: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  reviewLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  reviewValue: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
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
  donationOption: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  donationOptionSelected: {
    borderColor: '#008080',
    backgroundColor: '#008080',
  },
  donationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  donationText: {
    flex: 1,
    marginLeft: 12,
  },
  donationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  donationSubtitle: {
    fontSize: 14,
    lineHeight: 18,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapContainer: {
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginTop: 2,
    marginBottom: 4,
  },
  map: {
    flex: 1,
  },
  webMapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  webMapText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    marginBottom: 8,
    textAlign: 'center',
  },
  webMapCoordinates: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  locationStepContainer: {
    flex: 1,
  },
  locationSelectorsContainer: {
    marginBottom: 4,
  },
  locationStepContent: {
    marginBottom: 8,
  },
  locationStepDescription: {
    marginBottom: 8,
  },
  searchContainer: {
    position: 'relative',
  },
  searchInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingRight: 40, // Espace pour la croix
    fontSize: 16,
    flex: 1,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionText: {
    fontSize: 16,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    top: 14, // Centrer verticalement
    padding: 4,
    zIndex: 10,
  },
  boostStepContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  boostTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  boostDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  boostSection: {
    marginTop: 24,
    marginBottom: 16,
  },
  boostSectionRemontez: {
    marginTop: 24,
    marginBottom: 16,
  },
  boostSectionUrgente: {
    marginTop: 24,
    marginBottom: 16,
  },
  boostSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  boostSectionDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  boostOptionCard: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  boostOptionCardRemontez: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  boostOptionCardUrgente: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  boostOptionCardSelected: {
    borderColor: '#008080',
    backgroundColor: '#008080',
  },
  boostOptionHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  popularBadge: {
    backgroundColor: '#008080',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  boostOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  boostOptionText: {
    flex: 1,
    marginLeft: 12,
  },
  boostOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  boostOptionSubtitle: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 4,
  },
  boostOptionDuration: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  boostOptionPrice: {
    marginLeft: 'auto',
    alignItems: 'flex-end',
  },
  boostPriceText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  boostOptionsContainer: {
    marginTop: 16,
  },
  paymentContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  paymentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  paymentDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  paymentButton: {
    height: 56,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  reviewActions: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  reviewButton: {
    flex: 1,
    height: 56,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  reviewButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  handoverStepContainer: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  handoverTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  handoverDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  handoverOption: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  handoverOptionSelected: {
    borderColor: '#008080',
    backgroundColor: '#008080',
  },
  handoverOptionContent: {
    marginTop: 0,
  },
  handoverOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  handoverOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  activeBadge: {
    backgroundColor: '#008080',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  activeBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  handoverOptionDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  deliveryPartners: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  deliveryPartnerIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deliveryPartnerText: {
    fontSize: 18,
  },
  packageInfoContainer: {
    marginTop: 8,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  packageInfoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  packageFormatContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  packageFormatInfo: {
    flex: 1,
  },
  packageFormatLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  packageFormatValue: {
    fontSize: 14,
    lineHeight: 18,
  },
  modifyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modifyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  packageWeightContainer: {
    marginBottom: 16,
  },
  packageWeightLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  packageWeightValue: {
    fontSize: 14,
    lineHeight: 18,
  },
  packageNoteContainer: {
    marginBottom: 16,
  },
  packageNote: {
    fontSize: 14,
    lineHeight: 18,
  },
  testButton: {
    margin: 16,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 