import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet, FlatList, Text, RefreshControl, ActivityIndicator, TouchableOpacity, Alert, ActionSheetIOS, Platform } from 'react-native';
import ProductCard from '../components/ProductCard';
import PrimaryButton from '../components/PrimaryButton';
import { useAuth } from '../contexts/AuthContext';
import VisitorBadge from '../components/VisitorBadge';
import Skeleton from '../components/Skeleton';
import ProductService, { Product } from '../services/ProductService';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFavorites } from '../hooks/useFavorites';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { getImageUrl } from '../constants/Config';
import SearchBar from '../components/SearchBar';
import FilterChips from '../components/FilterChips';
import { Ionicons } from '@expo/vector-icons';
import AdaptiveImage from '../components/AdaptiveImage';

// Types pour la navigation
export type ArticlesListStackParamList = {
  ArticlesListMain: { categoryId?: number; categoryName?: string };
  ProductDetail: { productId: string };
};

function FavoritesScreen() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20, color: colors.text }}>Vos articles favoris apparaîtront ici.</Text>
    </View>
  );
}

export default function ArticlesListScreen() {
  console.log('[ArticlesListScreen] rendu');
  const navigation = useNavigation<StackNavigationProp<ArticlesListStackParamList>>();
  const route = useRoute();
  const { logout, isGuest, isAuthenticated } = useAuth();
  const { colors } = useTheme();
  const { isFavorite, toggleFavorite, refreshFavorites } = useFavorites();
  
  // Récupérer les paramètres de route
  const routeParams = route.params as { category?: string; categoryName?: string } | undefined;
  const selectedCategory = routeParams?.category;
  const categoryName = routeParams?.categoryName;
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Voir tout');
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [imageUrls, setImageUrls] = useState<{[key: number]: string}>({});
  const [favoriteCounts, setFavoriteCounts] = useState<{ [productId: number]: number }>({});
  const [displayStyle, setDisplayStyle] = useState<'pinterest' | 'ecommerce'>('pinterest');

  const loadProducts = async (page: number = 0, append: boolean = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      
      const response = await ProductService.getProductsCacheable({
        page,
        pageSize: 10
      });

      let newProducts = response.content || [];
      
      // Filtrer par catégorie si une catégorie est sélectionnée
      if (selectedCategory) {
        newProducts = newProducts.filter(product => 
          product.category?.categoryKey?.toLowerCase() === selectedCategory.toLowerCase() ||
          product.category?.label?.toLowerCase() === selectedCategory.toLowerCase()
        );
      }
      
      // Charger les URLs des images pour les nouveaux produits
      const urls: {[key: number]: string} = {};
      for (const product of newProducts) {
        try {
          // On prend la première image si dispo
          if (product.images && product.images.length > 0) {
            urls[product.id] = ProductService.getImageUrl(product.images[0].id);
          }
        } catch (error) {
          // Erreur silencieuse pour le chargement d'image
        }
      }

      // Récupérer les counts de favoris pour cette page
      const ids = newProducts.map(p => p.id);
      let counts: { [productId: number]: number } = {};
      if (ids.length > 0) {
        try {
          counts = await ProductService.getFavoriteCounts(ids);
        } catch (e) {
          counts = {};
        }
      }
      if (append) {
        setProducts(prev => [...prev, ...newProducts]);
        setImageUrls(prev => ({ ...prev, ...urls }));
        setFavoriteCounts(prev => ({ ...prev, ...counts }));
      } else {
        setProducts(newProducts);
        setImageUrls(urls);
        setFavoriteCounts(counts);
      }
      setCurrentPage(page);
      setHasMore((response.currentPage || 0) < (response.totalPages || 1) - 1);
      setError(null);
    } catch (err) {
      setError('Impossible de charger les produits. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setCurrentPage(0);
    setHasMore(true);
    await loadProducts(0, false);
    setRefreshing(false);
  };

  const loadMoreProducts = async () => {
    if (!loadingMore && hasMore) {
      const nextPage = currentPage + 1;
      await loadProducts(nextPage, true);
    }
  };

  useEffect(() => {
    loadProducts(0, false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProducts(0, false);
      refreshFavorites();
    }, [])
  );

  const handleProductPress = (productId: number) => {
    navigation.navigate('ProductDetail', { productId: productId.toString() });
  };

  // Rafraîchir le count de favoris pour un seul produit
  const refreshFavoriteCount = async (productId: number) => {
    try {
      const counts = await ProductService.getFavoriteCounts([productId]);
      setFavoriteCounts(prev => ({ ...prev, ...counts }));
    } catch (e) {
      // Optionnel : gestion d'erreur
    }
  };

  const handleFavoritePress = async (productId: number) => {
    try {
      const result = await toggleFavorite(productId);

      // Mise à jour optimiste du compteur
      setFavoriteCounts(prev => {
        const current = prev[productId] || 0;
        return {
          ...prev,
          [productId]: result.isFavorite ? current + 1 : Math.max(0, current - 1)
        };
      });

      // Rafraîchir le count global pour ce produit (pour la cohérence)
      await refreshFavoriteCount(productId);
    } catch (error) {
      console.error('Erreur lors du toggle des favoris:', error);
      Alert.alert('Erreur', 'Impossible de modifier les favoris pour le moment');
    }
  };

  const handleSearchSubmit = async () => {
    try {
      setLoading(true);
      const response = await ProductService.getProducts({ search });
      setProducts(response.content || []);
      setError(null);
    } catch (err) {
      setError('Erreur lors de la recherche.');
    } finally {
      setLoading(false);
    }
  };

  const handleCameraPress = async () => {
    const pickImage = async (fromCamera: boolean) => {
      let result;
      if (fromCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission refusée', "L'application a besoin de la permission d'utiliser la caméra.");
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          quality: 0.7,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission refusée', "L'application a besoin de la permission d'accéder à la galerie.");
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          quality: 0.7,
        });
      }
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const photoUri = result.assets[0].uri;
        try {
          setLoading(true);
          const formData = new FormData();
          formData.append('image', {
            uri: photoUri,
            name: 'photo.jpg',
            type: 'image/jpeg',
          } as any);
          // TODO: Recherche par similarité d'image
          // À terme, l'URL ci-dessous devra pointer vers un microservice Python (Flask/FastAPI)
          // qui :
          //   1. Extrait les features de l'image envoyée (embedding via un modèle CNN)
          //   2. Compare cet embedding à ceux des images produits en base
          //   3. Retourne les produits les plus similaires (par distance)
          // Le backend Java devra relayer la requête et retourner la liste des produits similaires
          const response = await fetch('https://ton-backend/api/products/search-by-image', {
            method: 'POST',
            headers: {
              'Content-Type': 'multipart/form-data',
              // Ajoute l'auth si besoin
            },
            body: formData,
          });
          if (!response.ok) throw new Error('Erreur lors de la recherche par image');
          const data = await response.json();
          setProducts(data.products || []);
          setError(null);
        } catch (err) {
          setError('Erreur lors de la recherche par image.');
        } finally {
          setLoading(false);
        }
      }
    };

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Annuler', 'Prendre une photo', 'Choisir dans la galerie'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) pickImage(true);
          else if (buttonIndex === 2) pickImage(false);
        }
      );
    } else {
      Alert.alert(
        'Recherche par image',
        'Choisissez une option',
        [
          { text: 'Prendre une photo', onPress: () => pickImage(true) },
          { text: 'Choisir dans la galerie', onPress: () => pickImage(false) },
          { text: 'Annuler', style: 'cancel' },
        ]
      );
    }
  };

  const renderProductPinterest = ({ item }: { item: Product }) => (
    <View style={styles.pinterestCard}>
      <TouchableOpacity 
        style={[styles.pinterestCardContent, { backgroundColor: colors.card }]}
        onPress={() => handleProductPress(item.id)}
        activeOpacity={0.85}
      >
        <View style={styles.pinterestImageContainer}>
          <AdaptiveImage
            source={{ uri: imageUrls[item.id] || (item.images && item.images.length > 0 ? getImageUrl(item.images[0].id) : 'https://via.placeholder.com/120') }}
            style={styles.pinterestImage}
          />
          <TouchableOpacity 
            style={styles.pinterestFavoriteButton}
            onPress={() => handleFavoritePress(item.id)}
          >
            <Ionicons 
              name={isFavorite(item.id) ? "heart" : "heart-outline"} 
              size={14} 
              color={isFavorite(item.id) ? "#ff4757" : colors.textSecondary} 
            />
          </TouchableOpacity>
          {favoriteCounts[item.id] > 0 && (
            <View style={styles.pinterestLikesBadge}>
              <Text style={styles.pinterestLikesText}>{favoriteCounts[item.id]}</Text>
            </View>
          )}
        </View>
        <View style={styles.pinterestInfo}>
          <Text style={[styles.pinterestBrand, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.brand || 'Marque'}
          </Text>
          <Text style={[styles.pinterestTitle, { color: colors.text }]} numberOfLines={1}>
            {item.title || 'Titre du produit'}
          </Text>
          <Text style={[styles.pinterestCondition, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.condition || 'État non précisé'}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderProductEcommerce = ({ item }: { item: Product }) => (
    <View style={styles.ecommerceCard}>
      <TouchableOpacity 
        style={[styles.ecommerceCardContent, { backgroundColor: colors.card }]}
        onPress={() => handleProductPress(item.id)}
      >
        <View style={styles.ecommerceImageContainer}>
          <AdaptiveImage
            source={{ uri: imageUrls[item.id] || (item.images && item.images.length > 0 ? getImageUrl(item.images[0].id) : 'https://via.placeholder.com/120') }}
            style={styles.ecommerceImage}
          />
          <TouchableOpacity 
            style={styles.ecommerceFavoriteButton}
            onPress={() => handleFavoritePress(item.id)}
          >
            <Ionicons 
              name={isFavorite(item.id) ? "heart" : "heart-outline"} 
              size={20} 
              color={isFavorite(item.id) ? "#ff4757" : colors.textSecondary} 
            />
          </TouchableOpacity>
          {favoriteCounts[item.id] > 0 && (
            <View style={styles.ecommerceLikesBadge}>
              <Text style={styles.ecommerceLikesText}>{favoriteCounts[item.id]}</Text>
            </View>
          )}
        </View>
        <View style={styles.ecommerceInfo}>
          <Text style={[styles.ecommerceBrand, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.brand || 'Marque'}
          </Text>
          <Text style={[styles.ecommerceTitle, { color: colors.text }]} numberOfLines={2}>
            {item.title || 'Titre du produit'}
          </Text>
          <Text style={[styles.ecommerceCondition, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.condition || 'État non précisé'}
          </Text>
          <Text style={[styles.ecommercePrice, { color: colors.primary }]} numberOfLines={1}>
            {item.price ? `${item.price}€` : 'Prix non précisé'}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderProduct = displayStyle === 'pinterest' ? renderProductPinterest : renderProductEcommerce;

  // Si l'utilisateur n'est pas connecté, afficher un message d'authentification
  if (!isAuthenticated && !isGuest) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.authContainer}>
          <Text style={[styles.authTitle, { color: colors.text }]}>
            Bienvenue sur Souqly
          </Text>
          <Text style={[styles.authSubtitle, { color: colors.text }]}>
            Connectez-vous pour découvrir des articles uniques et commencer à acheter ou vendre
          </Text>
          <TouchableOpacity
            style={[styles.authButton, { backgroundColor: colors.primary }]}
            onPress={() => (navigation as any).navigate('Auth')}
          >
            <Text style={styles.authButtonText}>Se connecter</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.authButtonOutline, { borderColor: colors.primary }]}
            onPress={() => (navigation as any).navigate('Login')}
          >
            <Text style={[styles.authButtonTextOutline, { color: colors.primary }]}>
              J'ai déjà un compte
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.skeletonContainer}>
          <View style={styles.skeletonGrid}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <View key={i} style={styles.skeletonCard}>
                <View style={styles.skeletonImageContainer}>
                  <Skeleton containerStyle={{ width: '100%', height: 160, borderRadius: 16 }} />
                </View>
                <View style={styles.skeletonContent}>
                  <Skeleton containerStyle={{ width: '70%', height: 14 }} />
                  <Skeleton containerStyle={{ width: '90%', height: 16 }} />
                  <Skeleton containerStyle={{ width: '60%', height: 12 }} />
                  <Skeleton containerStyle={{ width: '50%', height: 14 }} />
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top','left','right']}>
      <FlatList
        key={displayStyle} // Force re-render when style changes
        data={products}
        keyExtractor={item => item.id.toString()}
        numColumns={displayStyle === 'pinterest' ? 3 : 1}
        contentContainerStyle={styles.unifiedContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={renderProduct}
        ListHeaderComponent={
          <View>
            {/* Header avec retour et switch */}
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={24} color={colors.text} />
              </TouchableOpacity>
              
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                {categoryName || 'Tous les articles'}
              </Text>
              
              <TouchableOpacity 
                style={styles.switchButton}
                onPress={() => setDisplayStyle(displayStyle === 'pinterest' ? 'ecommerce' : 'pinterest')}
              >
                <Ionicons 
                  name={displayStyle === 'pinterest' ? "grid-outline" : "list-outline"} 
                  size={20} 
                  color={colors.primary} 
                />
              </TouchableOpacity>
            </View>
            
            <View style={styles.headerSpacer} />
            <VisitorBadge onSignup={() => logout()} />
            <SearchBar 
              value={search} 
              onChangeText={setSearch}
            />
            <View style={styles.filtersContainer}>
              <FilterChips 
                filters={[
                  { key: 'Voir tout', label: 'Voir tout' },
                  { key: 'Nouveaux', label: 'Nouveaux' },
                  { key: 'Populaires', label: 'Populaires' },
                  { key: 'Prix bas', label: 'Prix bas' },
                  { key: 'Prix haut', label: 'Prix haut' }
                ]}
                selectedFilter={selectedFilter}
                onFilterSelect={setSelectedFilter}
                showTitle={false}
              />
            </View>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  authSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  authButton: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  authButtonOutline: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  authButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  authButtonTextOutline: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  unifiedContent: {
    padding: 16,
  },
  skeletonContainer: {
    flex: 1,
    padding: 8,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skeletonCard: {
    width: '50%',
    padding: 8,
  },
  skeletonImageContainer: {
    width: '100%',
    height: 160,
    borderRadius: 16,
    marginBottom: 8,
  },
  skeletonContent: {
    paddingHorizontal: 8,
  },
  errorText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  retryButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Styles Pinterest
  pinterestCard: {
    width: '33.33%',
    padding: 4,
  },
  pinterestCardContent: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  pinterestImageContainer: {
    position: 'relative',
    width: '100%',
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
  },
  pinterestImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  pinterestFavoriteButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinterestLikesBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  pinterestLikesText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  pinterestInfo: {
    padding: 6,
  },
  pinterestBrand: {
    fontSize: 12,
    marginBottom: 4,
  },
  pinterestTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
    lineHeight: 16,
  },
  pinterestCondition: {
    fontSize: 10,
    marginTop: 2,
  },
  // Styles E-commerce
  ecommerceCard: {
    marginBottom: 16,
  },
  ecommerceCardContent: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ecommerceImageContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
  },
  ecommerceImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  ecommerceFavoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ecommerceLikesBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  ecommerceLikesText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  ecommerceInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  ecommerceBrand: {
    fontSize: 12,
    marginBottom: 4,
  },
  ecommerceTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 20,
  },
  ecommerceCondition: {
    fontSize: 12,
    marginBottom: 4,
  },
  ecommercePrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  // Bouton de switch
  switchButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  // Conteneur des filtres
  filtersContainer: {
    marginBottom: 16,
  },
  // Espace après le header
  headerSpacer: {
    height: 12,
  },
}); 