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
import HomeHeader from '../components/HomeHeader';
import HorizontalProductList from '../components/HorizontalProductList';
import PromotionalBanner from '../components/PromotionalBanner';
import VisitorBadge from '../components/VisitorBadge';
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
  const { logout, isGuest, isAuthenticated } = useAuth();
  const { colors } = useTheme();
  const { isFavorite, toggleFavorite, refreshFavorites } = useFavorites();
  
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
  const [featuredCategories, setFeaturedCategories] = useState<{
    [category: string]: Product[]
  }>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

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
      const [favoritesList, recentResponse, featuredData, categoriesData] = await Promise.allSettled([
        // Charger les favoris (si connecté)
        isAuthenticated && !isGuest ? ProductService.getFavorites() : Promise.resolve([]),
        
        // Charger les produits récents
        ProductService.getProductsCacheable({ page: 0, pageSize: 10 }),
        
        // Charger les catégories mises en avant
        (async () => {
          const categories = ['immobilier', 'emploi', 'services', 'mobilier', 'electromenager'];
          const featuredData: {[category: string]: Product[]} = {};
          
          const categoryPromises = categories.map(async (category) => {
            try {
              const response = await ProductService.getProductsCacheable({ 
                page: 0, 
                pageSize: 5
              });
              return { category, products: response.content || [] };
            } catch (error) {
              console.log('Erreur chargement catégorie', category, ':', error);
              return { category, products: [] };
            }
          });
          
          const results = await Promise.all(categoryPromises);
          results.forEach(({ category, products }) => {
            featuredData[category] = products;
          });
          
          return featuredData;
        })(),
        
        // Charger les catégories
        CategoryService.getCategoryTree()
      ]);
      
      // Traiter les résultats
      if (favoritesList.status === 'fulfilled') {
        setFavorites(favoritesList.value.slice(0, 10));
      }
      
      if (recentResponse.status === 'fulfilled') {
        setRecentProducts(recentResponse.value.content || []);
      }
      
      if (featuredData.status === 'fulfilled') {
        setFeaturedCategories(featuredData.value);
      }

      if (categoriesData.status === 'fulfilled') {
        setCategories(categoriesData.value);
      }

      // Charger les URLs des images et les compteurs de favoris en parallèle
      const allProducts = [
        ...(favoritesList.status === 'fulfilled' ? favoritesList.value : []),
        ...(recentResponse.status === 'fulfilled' ? recentResponse.value.content || [] : []),
        ...(featuredData.status === 'fulfilled' ? Object.values(featuredData.value).flat() : [])
      ];
      
      console.log('[DEBUG] Total produits à traiter:', allProducts.length);
      
      // Charger les images et compteurs en parallèle
      await Promise.all([
        loadImageUrls(allProducts),
        loadFavoriteCounts(allProducts)
      ]);

    } catch (error) {
      console.error('Erreur chargement données accueil:', error);
    } finally {
      setLoading(false);
      setCategoriesLoading(false);
    }
  };

  const loadImageUrls = async (products: Product[]) => {
    const urls: {[key: number]: string | null} = {};
    console.log('[DEBUG] loadImageUrls - Nombre de produits:', products.length);
    
    // Traitement par lots pour améliorer les performances
    const batchSize = 5;
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      
      // Traiter le lot en parallèle
      const batchPromises = batch.map(async (product) => {
        try {
          console.log('[DEBUG] Traitement produit ID:', product.id, 'Titre:', product.title);
          
          // Vérifier d'abord si l'image est déjà dans le produit
          if (product.images && product.images.length > 0) {
            const imageId = product.images[0].id;
            const imageUrl = ProductService.getImageUrl(imageId);
            console.log('[DEBUG] Image trouvée dans le produit', product.id, ':', imageUrl);
            return { productId: product.id, imageUrl };
          }
          
          // Si pas d'image dans le produit, essayer de la récupérer depuis l'API
          console.log('[DEBUG] Aucune image dans le produit, récupération depuis l\'API...');
          try {
            const productImages = await ProductService.getProductImages(product.id);
            console.log('[DEBUG] Images récupérées depuis l\'API pour produit', product.id, ':', productImages);
            
            if (productImages && productImages.length > 0) {
              const imageId = productImages[0].id;
              const imageUrl = ProductService.getImageUrl(imageId);
              console.log('[DEBUG] URL générée via API pour produit', product.id, ':', imageUrl);
              return { productId: product.id, imageUrl };
            } else {
              console.log('[DEBUG] Aucune image trouvée pour le produit', product.id);
              return { productId: product.id, imageUrl: null };
            }
          } catch (apiError) {
            console.error('[DEBUG] Erreur API pour produit', product.id, ':', apiError);
            return { productId: product.id, imageUrl: null };
          }
        } catch (error) {
          console.error('[DEBUG] Erreur lors du chargement de l\'image pour le produit', product.id, ':', error);
          return { productId: product.id, imageUrl: null };
        }
      });
      
      // Attendre que tous les produits du lot soient traités
      const batchResults = await Promise.all(batchPromises);
      
      // Ajouter les résultats au dictionnaire
      batchResults.forEach(({ productId, imageUrl }) => {
        urls[productId] = imageUrl;
      });
    }
    
    // Mettre à jour l'état une seule fois à la fin
    console.log('[DEBUG] URLs finales:', urls);
    setImageUrls(prev => ({ ...prev, ...urls }));
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
    navigation.navigate('ProductDetail', { productId: productId.toString() });
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
    } catch (error) {
      console.error('Erreur toggle favoris:', error);
      Alert.alert('Erreur', 'Impossible de modifier les favoris pour le moment');
    }
  };

  const handleSearchSubmit = async () => {
    if (search.trim()) {
      try {
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

  // Mapping catégorie -> icône Ionicons
  const categoryIcons: { [key: string]: string } = {
    immobilier: 'home-outline',
    emploi: 'briefcase-outline',
    services: 'construct-outline',
    mobilier: 'bed-outline',
    electromenager: 'tv-outline',
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
          <View style={styles.categoriesSection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Catégories</Text>
              <TouchableOpacity onPress={() => navigation.navigate('CategoriesGrid')}>
                <Text style={[styles.viewAllText, { color: colors.primary }]}>Voir tout</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
              {categories.slice(0, 6).map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[styles.categoryCardHorizontal, { backgroundColor: colors.card }]}
                  onPress={() => navigation.navigate('Category', {
                    categoryKey: category.key,
                    categoryLabel: category.label
                  })}
                  activeOpacity={0.7}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: colors.background }]}> 
                    <MaterialCommunityIcons 
                      name={category.iconName as any || 'tag-outline'} 
                      size={28} 
                      color={colors.primary} 
                    />
                  </View>
                  <Text 
                    style={[styles.categoryLabel, { color: colors.text, maxWidth: 80 }]} 
                    numberOfLines={1} 
                    ellipsizeMode="tail"
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Coups de cœur */}
        {isAuthenticated && !isGuest && favorites.length > 0 && (
          <HorizontalProductList
            title="Vos coups de cœur"
            products={favorites}
            onProductPress={handleProductPress}
            onFavoritePress={handleFavoritePress}
            onViewAllPress={handleViewAllFavorites}
            imageUrls={imageUrls}
            favoriteCounts={favoriteCounts}
            isFavorite={isFavorite}
            icon="heart"
          />
        )}

        {/* Dernières recherches */}
        {recentSearches.length > 0 && (
          <HorizontalProductList
            title="D'après vos dernières recherches"
            products={recentSearches}
            onProductPress={handleProductPress}
            onFavoritePress={handleFavoritePress}
            imageUrls={imageUrls}
            favoriteCounts={favoriteCounts}
            isFavorite={isFavorite}
            icon="search"
          />
        )}

        {/* Récemment vus */}
        {recentlyViewed.length > 0 && (
          <HorizontalProductList
            title="Récemment vus"
            products={recentlyViewed}
            onProductPress={handleProductPress}
            onFavoritePress={handleFavoritePress}
            imageUrls={imageUrls}
            favoriteCounts={favoriteCounts}
            isFavorite={isFavorite}
            icon="time"
          />
        )}

        {/* Annonces récentes */}
        {recentProducts.length > 0 && (
          <HorizontalProductList
            title="Annonces récentes"
            products={getFilteredProducts(recentProducts, selectedFilter)}
            onProductPress={handleProductPress}
            onFavoritePress={handleFavoritePress}
            onViewAllPress={handleViewAllRecent}
            imageUrls={imageUrls}
            favoriteCounts={favoriteCounts}
            isFavorite={isFavorite}
            icon="trending-up"
          />
        )}
        


        {/* Catégories mises en avant */}
        {Object.entries(featuredCategories).map(([category, products]) => {
          if (products.length > 0) {
            return (
              <HorizontalProductList
                key={category}
                title={category.charAt(0).toUpperCase() + category.slice(1)}
                products={getFilteredProducts(products, selectedFilter)}
                onProductPress={handleProductPress}
                onFavoritePress={handleFavoritePress}
                onViewAllPress={() => handleViewAllCategory(category)}
                imageUrls={imageUrls}
                favoriteCounts={favoriteCounts}
                isFavorite={isFavorite}
                icon={categoryIcons[category] || 'grid'}
                category={category}
              />
            );
          }
          return null;
        })}
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