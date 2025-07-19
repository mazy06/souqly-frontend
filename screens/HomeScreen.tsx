import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, ActivityIndicator, Alert, Text, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useFavorites } from '../hooks/useFavorites';
import ProductService, { Product } from '../services/ProductService';
import CategoryService, { Category } from '../services/CategoryService';
import InteractionTrackingService from '../services/InteractionTrackingService';
import RecommendationService from '../services/RecommendationService';
import HomeHeader from '../components/HomeHeader';
import HorizontalProductList from '../components/HorizontalProductList';
import CategoryProductList from '../components/CategoryProductList';
import SpecialProductList from '../components/SpecialProductList';
import CategoryGrid from '../components/CategoryGrid';
import PromotionalBanner from '../components/PromotionalBanner';
import VisitorBadge from '../components/VisitorBadge';
import RecommendationSection from '../components/RecommendationSection';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

// Types pour la navigation
export type HomeStackParamList = {
  HomeMain: undefined;
  ProductDetail: { productId: string };
  ArticlesList: undefined;
  SearchResults: { query: string; category?: string };
  Category: { categoryKey: string; categoryLabel: string };
  CategoriesGrid: undefined;
  Filters: undefined;
};

export default function HomeScreen() {
  console.log('🏠 [HomeScreen] Nouvelle page d\'accueil chargée');
  const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
  const { logout, isGuest, isAuthenticated, user } = useAuth();
  const { colors } = useTheme();
  const { isFavorite, toggleFavorite, refreshFavorites } = useFavorites();
  
  const trackingService = InteractionTrackingService.getInstance();
  const recommendationService = RecommendationService.getInstance();

  // États pour la recherche et filtres
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  // États pour les données
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [imageUrls, setImageUrls] = useState<{[key: number]: string | null}>({});
  const [favoriteCounts, setFavoriteCounts] = useState<{ [productId: number]: number }>({});
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // États pour les différentes sections
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [recentSearches, setRecentSearches] = useState<Product[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [nearbyProducts, setNearbyProducts] = useState<Product[]>([]);
  const [featuredCategories, setFeaturedCategories] = useState<{
    [category: string]: Product[]
  }>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Fonction pour charger les produits récemment vus
  const loadRecentlyViewed = async (): Promise<Product[]> => {
    try {
      // Pour l'instant, retourner les produits récents
      // TODO: Implémenter un vrai système de produits récemment vus
      const response = await ProductService.getProductsCacheable({ 
        page: 0, 
        pageSize: 5,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      return response.content || [];
    } catch (error) {
      console.log('Erreur chargement produits récemment vus:', error);
      return [];
    }
  };

  // Fonction pour charger les produits basés sur les recherches récentes
  const loadRecentSearches = async (): Promise<Product[]> => {
    try {
      // Pour l'instant, retourner des produits populaires
      // TODO: Implémenter un vrai système de recommandations basé sur les recherches
      const response = await ProductService.getProductsCacheable({ 
        page: 0, 
        pageSize: 5,
        sortBy: 'favoriteCount',
        sortOrder: 'desc'
      });
      return response.content || [];
    } catch (error) {
      console.log('Erreur chargement recherches récentes:', error);
      return [];
    }
  };

  // Fonction pour charger les produits locaux
  const loadNearbyProducts = async (): Promise<Product[]> => {
    try {
      // Pour l'instant, retourner des produits avec localisation
      // TODO: Implémenter un vrai système de géolocalisation
      const response = await ProductService.getProductsCacheable({ 
        page: 0, 
        pageSize: 5,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      
      // Filtrer les produits avec localisation
      const nearbyProducts = (response.content || []).filter(product => 
        product.city || product.locationName
      );
      
      return nearbyProducts;
    } catch (error) {
      console.log('Erreur chargement produits locaux:', error);
      return [];
    }
  };

  // Fonction pour filtrer les produits selon les nouveaux filtres de recherche
  const getFilteredProducts = (products: Product[], filter: string) => {
    if (filter === 'all') return products;
    
    switch (filter) {
      case 'recent':
        // Trier par date de création (plus récents en premier)
        return [...products].sort((a, b) => 
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
      
      case 'popular':
        // Trier par nombre de favoris (plus populaires en premier)
        return [...products].sort((a, b) => 
          (favoriteCounts[b.id] || 0) - (favoriteCounts[a.id] || 0)
        );
      
      case 'nearby':
        // Filtrer les produits avec localisation (pour l'instant, retourner tous)
        return products.filter(product => product.city);
      
      case 'new':
        // Produits créés dans les 7 derniers jours
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return products.filter(product => {
          const createdAt = new Date(product.createdAt || 0);
          return createdAt > oneWeekAgo;
        });
      
      case 'promo':
        // Produits avec prix réduit (pour l'instant, retourner tous)
        return products; // TODO: Implémenter quand originalPrice sera disponible
      
      case 'verified':
        // Produits de vendeurs vérifiés (pour l'instant, retourner tous)
        return products; // TODO: Implémenter quand verified sera disponible
      
      case 'urgent':
        // Produits marqués comme urgents (pour l'instant, retourner tous)
        return products; // TODO: Implémenter quand urgent sera disponible
      
      default:
        return products;
    }
  };

  const loadHomeData = async () => {
    // Éviter les chargements multiples
    if (loading && !isInitialLoad) {
      console.log('[DEBUG] Chargement déjà en cours, ignoré');
      return;
    }

    try {
      setLoading(true);
      setIsInitialLoad(false);
      
      // Charger toutes les données en parallèle pour améliorer les performances
      const [favoritesList, recentResponse, featuredData, categoriesData, recentlyViewedData, recentSearchesData, nearbyData] = await Promise.allSettled([
        // Charger les favoris (si connecté)
        isAuthenticated && !isGuest ? ProductService.getFavorites() : Promise.resolve([]),
        
        // Charger les produits récents (toutes catégories confondues)
        ProductService.getProductsCacheable({ 
          page: 0, 
          pageSize: 10,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        }),
        
        // Charger les catégories mises en avant
        (async () => {
          const categories = ['immobilier', 'emploi', 'services', 'mobilier', 'electromenager'];
          const featuredData: {[category: string]: Product[]} = {};
          
          const categoryPromises = categories.map(async (category) => {
            const products = await loadProductsByCategory(category, 5);
            return { category, products };
          });
          
          const results = await Promise.all(categoryPromises);
          results.forEach(({ category, products }) => {
            featuredData[category] = products;
          });
          
          return featuredData;
        })(),
        
        // Charger les catégories
        CategoryService.getAllCategories(),
        
        // Charger les produits récemment vus
        loadRecentlyViewed(),
        
        // Charger les produits basés sur les recherches récentes
        loadRecentSearches(),
        
        // Charger les produits locaux
        loadNearbyProducts(),
      ]);
      
      // Traiter les résultats
      if (favoritesList.status === 'fulfilled') {
        setFavorites(favoritesList.value);
      }
      
      if (recentResponse.status === 'fulfilled') {
        setRecentProducts(recentResponse.value.content || []);
      }
      
      if (featuredData.status === 'fulfilled') {
        setFeaturedCategories(featuredData.value);
      }
      
      if (categoriesData.status === 'fulfilled') {
        setCategories(categoriesData.value);
        setCategoriesLoading(false);
      }
      
      if (recentlyViewedData.status === 'fulfilled') {
        setRecentlyViewed(recentlyViewedData.value);
      }
      
      if (recentSearchesData.status === 'fulfilled') {
        setRecentSearches(recentSearchesData.value);
      }
      
      if (nearbyData.status === 'fulfilled') {
        setNearbyProducts(nearbyData.value);
      }
      
      // Charger les URLs d'images et compteurs de favoris
      const allProducts = [
        ...(recentResponse.status === 'fulfilled' ? recentResponse.value.content || [] : []),
        ...(favoritesList.status === 'fulfilled' ? favoritesList.value : []),
        ...(recentlyViewedData.status === 'fulfilled' ? recentlyViewedData.value : []),
        ...(recentSearchesData.status === 'fulfilled' ? recentSearchesData.value : []),
        ...(nearbyData.status === 'fulfilled' ? nearbyData.value : []),
      ];
      
      await Promise.all([
        loadImageUrls(allProducts),
        loadFavoriteCounts(allProducts)
      ]);
      
      // Mettre à jour les données de recommandation en arrière-plan
      if (user?.id) {
        recommendationService.updateRecommendationData(parseInt(user.id));
      }
      
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadImageUrls = async (products: Product[]) => {
    const urls: {[key: number]: string | null} = {};
    console.log('[DEBUG] loadImageUrls - Nombre de produits:', products.length);
    
    // Traitement par lots pour améliorer les performances
    const batchSize = 10; // Augmenter la taille du lot
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

  const loadFavoriteCounts = async (products: Product[]) => {
    const ids = products.map(p => p.id);
    if (ids.length > 0) {
      try {
        console.log('[DEBUG] Chargement des compteurs de favoris pour', ids.length, 'produits');
        const counts = await ProductService.getFavoriteCounts(ids);
        console.log('[DEBUG] Compteurs reçus:', counts);
        setFavoriteCounts(counts);
      } catch (error) {
        console.error('[DEBUG] Erreur chargement counts favoris:', error);
        // Utiliser les compteurs par défaut depuis les produits
        const defaultCounts: { [productId: number]: number } = {};
        products.forEach(product => {
          defaultCounts[product.id] = product.favoriteCount || 0;
        });
        setFavoriteCounts(defaultCounts);
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHomeData();
    setRefreshing(false);
  };

  // Charger les données au montage du composant et quand l'utilisateur revient sur l'écran
  useEffect(() => {
    loadHomeData();
  }, []);

  // Précharger les images quand les URLs sont disponibles
  useEffect(() => {
    const preloadImages = async () => {
      const urls = Object.values(imageUrls).filter(url => url !== null) as string[];
      
      // Précharger les images en arrière-plan
      urls.forEach(url => {
        const img = new Image();
        img.src = url;
      });
    };

    if (Object.keys(imageUrls).length > 0) {
      preloadImages();
    }
  }, [imageUrls]);

  // Recharger les données quand l'utilisateur revient sur l'écran
  useFocusEffect(
    useCallback(() => {
      console.log('🏠 [HomeScreen] Focus sur la page d\'accueil');
      // Rafraîchir les favoris si l'utilisateur est connecté
      if (isAuthenticated && !isGuest) {
        refreshFavorites();
      }
    }, [isAuthenticated, isGuest])
  );

  const handleProductPress = (productId: number) => {
    // Tracker le clic sur le produit
    if (user?.id) {
      trackingService.trackInteraction('CLICK', productId, parseInt(user.id));
    }
    
    navigation.navigate('ProductDetail', { productId: productId.toString() });
  };

  const handleFavoritePress = async (productId: number) => {
    try {
      const result = await toggleFavorite(productId);
      
      // Tracker l'action de favori
      if (user?.id) {
        if (result.isFavorite) {
          trackingService.trackInteraction('FAVORITE', productId, parseInt(user.id));
        } else {
          trackingService.trackInteraction('UNFAVORITE', productId, parseInt(user.id));
        }
      }
      
      // Mise à jour optimiste du compteur
      setFavoriteCounts(prev => {
        const current = prev[productId] || 0;
        return {
          ...prev,
          [productId]: result.isFavorite ? current + 1 : Math.max(0, current - 1)
        };
      });
    } catch (error) {
      console.error('Erreur toggle favoris:', error);
      Alert.alert('Erreur', 'Impossible de modifier les favoris pour le moment');
    }
  };

  const handleSearchSubmit = async () => {
    if (search.trim()) {
      try {
        // Tracker la recherche
        if (user?.id) {
          trackingService.trackSearch(search.trim(), parseInt(user.id));
        }
        
        // Navigation vers l'écran de recherche avec le terme
        navigation.navigate('SearchResults', { query: search.trim() });
      } catch (error) {
        console.error('Erreur recherche:', error);
        Alert.alert('Erreur', 'Impossible de lancer la recherche pour le moment');
      }
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
      // TODO: Implémenter la recherche par image
    };

    Alert.alert(
      'Recherche par image',
      'Choisissez une option',
      [
        { text: 'Prendre une photo', onPress: () => pickImage(true) },
        { text: 'Choisir dans la galerie', onPress: () => pickImage(false) },
        { text: 'Annuler', style: 'cancel' },
      ]
    );
  };

  const handleViewAllFavorites = () => {
    (navigation as any).navigate('Favorites');
  };

  const handleViewAllRecent = () => {
    // Navigation vers l'écran de recherche avec le filtre actuel
    navigation.navigate('SearchResults', { 
      query: '', 
      category: selectedFilter !== 'Voir tout' ? selectedFilter : undefined 
    });
  };

  const handleViewAllCategory = (category: string) => {
    // Navigation vers l'écran de recherche avec la catégorie pré-sélectionnée
    navigation.navigate('SearchResults', { 
      query: '', 
      category: category 
    });
  };

  const handleCategoryPress = (category: Category) => {
    // Navigation vers l'écran de recherche avec la catégorie pré-sélectionnée
    navigation.navigate('SearchResults', { 
      query: '', 
      category: category.key 
    });
  };

  // Mapping catégorie -> icône Ionicons
  const categoryIcons: { [key: string]: string } = {
    immobilier: 'home-outline',
    emploi: 'briefcase-outline',
    services: 'construct-outline',
    mobilier: 'bed-outline',
    electromenager: 'tv-outline',
  };

  // Fonction pour charger les produits par catégorie
  const loadProductsByCategory = async (categoryKey: string, limit: number = 5): Promise<Product[]> => {
    try {
      const response = await ProductService.getProductsCacheable({ 
        page: 0, 
        pageSize: limit * 2 // Charger plus pour avoir assez après filtrage
      });
      
      // Filtrer par catégorie
      const filteredProducts = (response.content || []).filter(product => 
        product.category?.categoryKey?.toLowerCase() === categoryKey.toLowerCase() ||
        product.category?.label?.toLowerCase() === categoryKey.toLowerCase()
      );
      
      return filteredProducts.slice(0, limit);
    } catch (error) {
      console.log('Erreur chargement catégorie', categoryKey, ':', error);
      return [];
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top','left','right']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top','left','right']}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <HomeHeader
          search={search}
          onSearchChange={setSearch}
          onSearchSubmit={handleSearchSubmit}
          onCameraPress={handleCameraPress}
          selectedFilter={selectedFilter}
          onFilterSelect={setSelectedFilter}
        />
        
        <VisitorBadge onSignup={() => logout()} />

        {/* Bannière publicitaire */}
        <PromotionalBanner
          title="Découvrez nos nouveautés"
          subtitle="Les meilleures offres vous attendent"
          onPress={() => navigation.navigate('ArticlesList')}
        />

        {/* Section Catégories */}
        {categories.length > 0 && (
          <CategoryGrid
            categories={categories}
            onCategoryPress={handleCategoryPress}
            onViewAllPress={() => navigation.navigate('CategoriesGrid')}
            maxItems={8}
          />
        )}

        {/* Section Recommandations (pour utilisateurs connectés) */}
        {isAuthenticated && !isGuest && user?.id && (
          <RecommendationSection
            title="Recommandés pour vous"
            subtitle="Basé sur vos préférences"
            limit={5}
            showBoostedBadge={true}
            onProductPress={handleProductPress}
            onFavoritePress={handleFavoritePress}
            onViewAllPress={() => navigation.navigate('SearchResults', { 
              query: 'recommandés', 
              category: undefined
            })}
          />
        )}

        {/* Coups de cœur */}
        {isAuthenticated && !isGuest && favorites.length > 0 && (
          <SpecialProductList
            type="favorites"
            products={favorites}
            onProductPress={handleProductPress}
            onFavoritePress={handleFavoritePress}
            onViewAllPress={handleViewAllFavorites}
            imageUrls={imageUrls}
            favoriteCounts={favoriteCounts}
            isFavorite={isFavorite}
            maxItems={5}
          />
        )}

        {/* Dernières recherches */}
        {recentSearches.length > 0 && (
          <SpecialProductList
            type="recommended"
            products={recentSearches}
            onProductPress={handleProductPress}
            onFavoritePress={handleFavoritePress}
            onViewAllPress={() => navigation.navigate('SearchResults', { 
              query: 'recommandés', 
              category: undefined
            })}
            imageUrls={imageUrls}
            favoriteCounts={favoriteCounts}
            isFavorite={isFavorite}
            maxItems={5}
          />
        )}

        {/* Récemment vus */}
        {recentlyViewed.length > 0 && (
          <SpecialProductList
            type="recent"
            products={recentlyViewed}
            onProductPress={handleProductPress}
            onFavoritePress={handleFavoritePress}
            onViewAllPress={() => navigation.navigate('SearchResults', { 
              query: 'récemment vus', 
              category: undefined
            })}
            imageUrls={imageUrls}
            favoriteCounts={favoriteCounts}
            isFavorite={isFavorite}
            maxItems={5}
          />
        )}

        {/* Produits récents */}
        {recentProducts.length > 0 && (
          <SpecialProductList
            type="recent"
            products={recentProducts}
            onProductPress={handleProductPress}
            onFavoritePress={handleFavoritePress}
            onViewAllPress={handleViewAllRecent}
            imageUrls={imageUrls}
            favoriteCounts={favoriteCounts}
            isFavorite={isFavorite}
            maxItems={5}
          />
        )}

        {/* Produits locaux */}
        {nearbyProducts.length > 0 && (
          <SpecialProductList
            type="nearby"
            products={nearbyProducts}
            onProductPress={handleProductPress}
            onFavoritePress={handleFavoritePress}
            onViewAllPress={() => navigation.navigate('SearchResults', { 
              query: 'près de chez vous', 
              category: undefined
            })}
            imageUrls={imageUrls}
            favoriteCounts={favoriteCounts}
            isFavorite={isFavorite}
            maxItems={5}
          />
        )}

        {/* Catégories mises en avant */}
        {Object.entries(featuredCategories).map(([categoryKey, products]) => (
          products.length > 0 && (
            <CategoryProductList
              key={categoryKey}
              category={categoryKey}
              products={products}
              onProductPress={handleProductPress}
              onFavoritePress={handleFavoritePress}
              onViewAllPress={() => handleViewAllCategory(categoryKey)}
              imageUrls={imageUrls}
              favoriteCounts={favoriteCounts}
              isFavorite={isFavorite}
              maxItems={5}
            />
          )
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryIconText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  categoriesScroll: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 2,
  },
  categoryCardHorizontal: {
    width: 90,
    marginRight: 12,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 