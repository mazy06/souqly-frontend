import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet, FlatList, Text, RefreshControl, ActivityIndicator, TouchableOpacity, Alert, ActionSheetIOS, Platform } from 'react-native';
import ProductCard from '../components/ProductCard';
import PinterestProductCard from '../components/PinterestProductCard';
import EcommerceProductCard from '../components/EcommerceProductCard';
import PrimaryButton from '../components/PrimaryButton';
import { useAuth } from '../contexts/AuthContext';
import VisitorBadge from '../components/VisitorBadge';
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
import { getProductPlaceholder } from '../utils/imageUtils';

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
  
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Voir tout');
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [imageUrls, setImageUrls] = useState<{[key: number]: string | null}>({});
  const [favoriteCounts, setFavoriteCounts] = useState<{ [productId: number]: number }>({});
  const [displayStyle, setDisplayStyle] = useState<'pinterest' | 'ecommerce'>('pinterest');

  const loadProducts = async (page: number = 0, append: boolean = false) => {
    console.log(`[DEBUG] loadProducts appelée - page: ${page}, append: ${append}, loading: ${loading}`);
    
    // Éviter les appels multiples pendant le chargement
    if (loading) {
      console.log('[DEBUG] loadProducts - Déjà en cours de chargement, sortie');
      return;
    }
    
    try {
      if (!append) {
        console.log('[DEBUG] loadProducts - Début du chargement');
        setLoading(true);
        setError(null);
      }
      
      console.log('[DEBUG] loadProducts - Appel de ProductService.getProducts');
      const response = await ProductService.getProducts({
        page,
        pageSize: 20,
        ...(selectedCategory && { categoryKey: selectedCategory.toLowerCase() }),
        ...(search && { search }),
        ...(selectedFilter && selectedFilter !== 'Voir tout' && { filter: selectedFilter })
      });
      
      console.log('[DEBUG] loadProducts - Réponse reçue:', response);
      
      if (response && response.content) {
        const newProducts = response.content;
        
        // Debug: Log des produits boostés
        const boostedProducts = newProducts.filter(p => p.isBoosted);
        console.log(`[DEBUG] Loaded ${newProducts.length} products, ${boostedProducts.length} boosted`);
        boostedProducts.forEach(product => {
          console.log(`[DEBUG] Boosted product: ${product.title} (ID: ${product.id}, isBoosted: ${product.isBoosted}, boostLevel: ${product.boostLevel})`);
        });
        
        console.log('[DEBUG] loadProducts - Mise à jour des produits');
        if (append) {
          setProducts(prev => [...prev, ...newProducts]);
        } else {
          setProducts(newProducts);
        }
        
        setHasMore(newProducts.length === 20);
        console.log('[DEBUG] loadProducts - Produits mis à jour avec succès');
        
        // Charger les URLs d'images
        loadImageUrls(newProducts);
      } else {
        console.log('[DEBUG] loadProducts - Réponse invalide:', response);
      }
    } catch (error) {
      console.error('[DEBUG] loadProducts - Erreur:', error);
      setError('Erreur lors du chargement des produits');
    } finally {
      console.log('[DEBUG] loadProducts - Fin du chargement, setLoading(false)');
      setLoading(false);
    }
  };

  const loadImageUrls = async (products: Product[]) => {
    const urls: {[key: number]: string | null} = {};
    console.log('[DEBUG] loadImageUrls - Nombre de produits:', products.length);
    
    // Traitement par lots pour améliorer les performances
    const batchSize = 10;
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      
      // Traiter le lot en parallèle
      const batchPromises = batch.map(async (product) => {
        try {
          // Vérifier d'abord si l'image est déjà dans le produit
          if (product.images && product.images.length > 0) {
            const imageId = product.images[0].id;
            const imageUrl = ProductService.getImageUrl(imageId);
            return { productId: product.id, imageUrl };
          }
          
          // Si pas d'image dans le produit, essayer de la récupérer depuis l'API
          try {
            const productImages = await ProductService.getProductImages(product.id);
            
            if (productImages && productImages.length > 0) {
              const imageId = productImages[0].id;
              const imageUrl = ProductService.getImageUrl(imageId);
              return { productId: product.id, imageUrl };
            } else {
              return { productId: product.id, imageUrl: null };
            }
          } catch (apiError) {
            return { productId: product.id, imageUrl: null };
          }
        } catch (error) {
          return { productId: product.id, imageUrl: null };
        }
      });
      
      // Attendre que tous les produits du lot soient traités
      const batchResults = await Promise.all(batchPromises);
      
      // Mettre à jour l'état progressivement pour améliorer l'UX
      const batchUrls: {[key: number]: string | null} = {};
      batchResults.forEach(({ productId, imageUrl }) => {
        batchUrls[productId] = imageUrl;
      });
      
      // Mettre à jour l'état pour ce lot
      setImageUrls(prev => ({ ...prev, ...batchUrls }));
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
    // Chargement initial seulement
    console.log('[ArticlesListScreen] useEffect - Chargement initial');
    loadProducts(0, false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Recharger seulement si l'écran devient actif et qu'il n'y a pas de données
      console.log(`[ArticlesListScreen] useFocusEffect - products.length: ${products.length}`);
      if (products.length === 0 && !loading) {
        console.log('[ArticlesListScreen] useFocusEffect - Rechargement des données');
        loadProducts(0, false);
      }
      refreshFavorites();
    }, [products.length, loading])
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

  const renderProductPinterest = ({ item }: { item: Product }) => {
    // Debug: Log des informations d'image
    const imageUrl = imageUrls[item.id] || (item.images && item.images.length > 0 ? getImageUrl(item.images[0].id) : null);
    console.log(`[DEBUG] Product ${item.id} (${item.title}):`);
    console.log(`  - imageUrls[${item.id}]: ${imageUrls[item.id]}`);
    console.log(`  - item.images:`, item.images);
    console.log(`  - Final imageUrl: ${imageUrl}`);
    
    return (
      <PinterestProductCard
        title={item.title}
        brand={item.brand}
        size={item.size}
        condition={item.condition}
        price={`${item.price}`}
        priceWithFees={item.priceWithFees ? `${item.priceWithFees}` : undefined}
        image={imageUrl}
        likes={favoriteCounts[item.id] || 0}
        isFavorite={isFavorite(item.id)}
        onPress={() => handleProductPress(item.id)}
        onFavoritePress={() => handleFavoritePress(item.id)}
        status={item.status}
        productId={item.id}
        isBoosted={item.isBoosted}
        boostLevel={item.boostLevel}
      />
    );
  };

  const renderProductEcommerce = ({ item }: { item: Product }) => (
    <EcommerceProductCard
      title={item.title}
      brand={item.brand}
      size={item.size}
      condition={item.condition}
      price={`${item.price}`}
      priceWithFees={item.priceWithFees ? `${item.priceWithFees}` : undefined}
      image={imageUrls[item.id] || (item.images && item.images.length > 0 ? getImageUrl(item.images[0].id) : null)}
      likes={favoriteCounts[item.id] || 0}
      isFavorite={isFavorite(item.id)}
      onPress={() => handleProductPress(item.id)}
      onFavoritePress={() => handleFavoritePress(item.id)}
      status={item.status}
      productId={item.id}
      isBoosted={item.isBoosted}
      boostLevel={item.boostLevel}
    />
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
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top','left','right']}>
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
        
        {/* Spinner centralisé */}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Chargement...
          </Text>
        </View>
      </SafeAreaView>
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
        contentContainerStyle={[
          styles.unifiedContent,
          displayStyle === 'pinterest' && styles.pinterestGrid
        ]}
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
  // Style spécifique pour la grille Pinterest
  pinterestGrid: {
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
}); 