import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import ApiService from '../services/ApiService';
import ProductService from '../services/ProductService';

export default function EditProductScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { productId } = route.params;
  const { colors } = useTheme();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [brand, setBrand] = useState('');
  const [size, setSize] = useState('');
  const [condition, setCondition] = useState('');
  const [shippingInfo, setShippingInfo] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await ApiService.get(`/products/${productId}`) as any;
      setProduct(response);
      
      // Populate form fields
      setTitle(response.title || '');
      setDescription(response.description || '');
      setPrice(response.price?.toString() || '');
      setBrand(response.brand || '');
      setSize(response.size || '');
      setCondition(response.condition || '');
      setShippingInfo(response.shippingInfo || '');
      setCity(response.city || '');
      setCountry(response.country || '');
    } catch (error) {
      console.error('Erreur lors du chargement du produit:', error);
      Alert.alert('Erreur', 'Impossible de charger les détails du produit');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Erreur', 'Le titre est obligatoire');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Erreur', 'La description est obligatoire');
      return false;
    }
    if (!price.trim() || isNaN(parseFloat(price))) {
      Alert.alert('Erreur', 'Le prix doit être un nombre valide');
      return false;
    }
    if (!condition.trim()) {
      Alert.alert('Erreur', 'L\'état du produit est obligatoire');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      const updateData = {
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price),
        brand: brand.trim() || null,
        size: size.trim() || null,
        condition: condition.trim(),
        shippingInfo: shippingInfo.trim() || null,
        city: city.trim() || null,
        country: country.trim() || null,
      };

      await ApiService.put(`/products/${productId}`, updateData);
      Alert.alert('Succès', 'Produit modifié avec succès', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      Alert.alert('Erreur', 'Impossible de modifier le produit');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Annuler les modifications',
      'Êtes-vous sûr de vouloir annuler ? Toutes les modifications seront perdues.',
      [
        { text: 'Continuer l\'édition', style: 'cancel' },
        { text: 'Annuler', style: 'destructive', onPress: () => navigation.goBack() }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Chargement...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>
            Produit non trouvé
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleCancel}
        >
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Modifier le produit
        </Text>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={[styles.saveButtonText, { color: colors.primary }]}>
              Enregistrer
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Product Image Preview */}
        <View style={styles.imageSection}>
          <Image
            source={
              product.images && product.images.length > 0
                ? { uri: ProductService.getProductImageUrl(product) }
                : require('../assets/images/icon.png')
            }
            style={styles.productImage}
            resizeMode="cover"
          />
          <Text style={[styles.imageNote, { color: colors.textSecondary }]}>
            Les images ne peuvent pas être modifiées ici
          </Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          {/* Title */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              Titre *
            </Text>
            <TextInput
              style={[styles.textInput, { 
                backgroundColor: colors.card, 
                color: colors.text,
                borderColor: colors.border 
              }]}
              value={title}
              onChangeText={setTitle}
              placeholder="Titre du produit"
              placeholderTextColor={colors.textSecondary}
              maxLength={120}
            />
          </View>

          {/* Description */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              Description *
            </Text>
            <TextInput
              style={[styles.textArea, { 
                backgroundColor: colors.card, 
                color: colors.text,
                borderColor: colors.border 
              }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Description détaillée du produit"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
              maxLength={1000}
            />
          </View>

          {/* Price */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              Prix (€) *
            </Text>
            <TextInput
              style={[styles.textInput, { 
                backgroundColor: colors.card, 
                color: colors.text,
                borderColor: colors.border 
              }]}
              value={price}
              onChangeText={setPrice}
              placeholder="0.00"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
          </View>

          {/* Brand */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              Marque
            </Text>
            <TextInput
              style={[styles.textInput, { 
                backgroundColor: colors.card, 
                color: colors.text,
                borderColor: colors.border 
              }]}
              value={brand}
              onChangeText={setBrand}
              placeholder="Marque du produit"
              placeholderTextColor={colors.textSecondary}
              maxLength={50}
            />
          </View>

          {/* Size */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              Taille
            </Text>
            <TextInput
              style={[styles.textInput, { 
                backgroundColor: colors.card, 
                color: colors.text,
                borderColor: colors.border 
              }]}
              value={size}
              onChangeText={setSize}
              placeholder="Taille (S, M, L, XL, etc.)"
              placeholderTextColor={colors.textSecondary}
              maxLength={20}
            />
          </View>

          {/* Condition */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              État *
            </Text>
            <TextInput
              style={[styles.textInput, { 
                backgroundColor: colors.card, 
                color: colors.text,
                borderColor: colors.border 
              }]}
              value={condition}
              onChangeText={setCondition}
              placeholder="Neuf, Très bon état, Bon état, etc."
              placeholderTextColor={colors.textSecondary}
              maxLength={50}
            />
          </View>

          {/* Shipping Info */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              Informations de livraison
            </Text>
            <TextInput
              style={[styles.textArea, { 
                backgroundColor: colors.card, 
                color: colors.text,
                borderColor: colors.border 
              }]}
              value={shippingInfo}
              onChangeText={setShippingInfo}
              placeholder="Informations sur la livraison"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
              maxLength={200}
            />
          </View>

          {/* Location */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              Ville
            </Text>
            <TextInput
              style={[styles.textInput, { 
                backgroundColor: colors.card, 
                color: colors.text,
                borderColor: colors.border 
              }]}
              value={city}
              onChangeText={setCity}
              placeholder="Ville"
              placeholderTextColor={colors.textSecondary}
              maxLength={50}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              Pays
            </Text>
            <TextInput
              style={[styles.textInput, { 
                backgroundColor: colors.card, 
                color: colors.text,
                borderColor: colors.border 
              }]}
              value={country}
              onChangeText={setCountry}
              placeholder="Pays"
              placeholderTextColor={colors.textSecondary}
              maxLength={50}
            />
          </View>
        </View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  saveButton: {
    padding: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
  },
  imageSection: {
    alignItems: 'center',
    padding: 16,
  },
  productImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
  },
  imageNote: {
    fontSize: 14,
    textAlign: 'center',
  },
  formSection: {
    padding: 16,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 80,
  },
}); 