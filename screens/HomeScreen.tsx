import React, { useState, useEffect, useCallback, memo } from 'react';
import { View, ScrollView, RefreshControl, ActivityIndicator, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import ProductCard from '../components/ProductCard';
import ProductService, { Product } from '../services/ProductService';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../hooks/useFavorites';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SearchBar from '../components/SearchBar';
import FilterChips from '../components/FilterChips';
import VisitorBadge from '../components/VisitorBadge';
import LoadingSpinner from '../components/Skeleton';
import { SafeAreaView } from 'react-native-safe-area-context';

// Types pour la navigation
export type HomeStackParamList = {
  HomeMain: undefined;
  ProductDetail: { productId: string };
};

// Composant header fixe mémorisé
const FixedHeader = memo(({ 
  search, 
  setSearch, 
  handleSearchSubmit, 
  handleClearSearch, 
  activeSearch, 
  selectedFilter, 
  setSelectedFilter,
  navigation 
}: {
  search: string;
  setSearch: (text: string) => void;
  handleSearchSubmit: () => void;
  handleClearSearch: () => void;
  activeSearch: string;
  selectedFilter: string;
  setSelectedFilter: (filter: string) => void;
  navigation: any;
}) => {
  const { colors } = useTheme();
  
  const handleVisitorSignup = useCallback(() => {
    navigation.navigate('ProfileStack' as never);
  }, [navigation]);
  
  return (
    <View style={[styles.fixedHeader, { backgroundColor: colors.background }]}>
      <VisitorBadge onSignup={handleVisitorSignup} />
      <SearchBar
        value={search}
        onChangeText={setSearch}
        onSubmit={handleSearchSubmit}
        onClear={handleClearSearch}
        placeholder="Rechercher un article ou un membre"
      />
      {activeSearch && (
        <View style={[styles.searchIndicator, { backgroundColor: colors.card }]}>
          <Text style={[styles.searchText, { color: colors.text }]}>
            Recherche : "{activeSearch}"
          </Text>
          <TouchableOpacity onPress={handleClearSearch} style={styles.clearSearchButton}>
            <Text style={[styles.clearSearchText, { color: colors.primary }]}>
              Effacer
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <FilterChips selected={selectedFilter} onSelect={setSelectedFilter} />
    </View>
  );
}, (prevProps, nextProps) => {
  // Comparaison personnalisée pour éviter les re-renders inutiles
  return (
    prevProps.search === nextProps.search &&
    prevProps.activeSearch === nextProps.activeSearch &&
    prevProps.selectedFilter === nextProps.selectedFilter
  );
});

// Composant contenu principal (liste + spinner)
const ContentArea = memo(({ 
  products, 
  imageUrls, 
  isFavorite, 
  handleProductPress, 
  handleFavoritePress, 
  loading, 
  initialLoading, 
  loadingMore, 
  refreshing, 
  onRefresh, 
  loadMoreProducts, 
  colors 
}: {
  products: Product[];
  imageUrls: {[key: number]: string};
  isFavorite: (id: number) => boolean;
  handleProductPress: (id: number) => void;
  handleFavoritePress: (id: number) => void;
  loading: boolean;
  initialLoading: boolean;
  loadingMore: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  loadMoreProducts: () => void;
  colors: any;
}) => {
  const renderProduct = useCallback(({ item }: { item: Product }) => (
    <ProductCard
      title={item.title}
      brand={item.brand}
      size={item.size}
      condition={item.condition}
      price={item.price.toString()}
      priceWithFees={item.priceWithFees?.toString()}
      image={imageUrls[item.id] || 'https://via.placeholder.com/120'}
      likes={item.favoriteCount}
      isFavorite={isFavorite(item.id)}
      onPress={() => handleProductPress(item.id)}
      onFavoritePress={() => handleFavoritePress(item.id)}
    />
  ), [imageUrls, isFavorite, handleProductPress, handleFavoritePress]);

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadingMoreContainer}>
        {/* <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.loadingMoreText, { color: colors.text }]}>
          Chargement...
        </Text> */}
        <Text style={[styles.loadingMoreText, { color: colors.text }]}>
          Chargement plus de produits... (spinner commenté)
        </Text>
      </View>
    );
  }, [loadingMore, colors]);

  const renderEmpty = useCallback(() => {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: colors.text }]}>
          Aucun produit disponible pour le moment
        </Text>
        <Text style={[styles.emptySubtext, { color: colors.tabIconDefault }]}>
          Soyez le premier à publier un article !
        </Text>
      </View>
    );
  }, [colors]);

  // Si en cours de chargement initial, afficher le spinner
  if (initialLoading) {
    return (
      <View style={styles.contentLoadingContainer}>
        {/* <LoadingSpinner 
          message="Chargement des produits..." 
          heightRatio={0.4}
        /> */}
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Chargement des produits... (spinner commenté)
        </Text>
      </View>
    );
  }

  // Si en cours de recherche, afficher le spinner
  if (loading) {
    console.log('🔄 [HomeScreen] Affichage du spinner de recherche - loading=true');
    return (
      <View style={styles.contentLoadingContainer}>
        {/* <LoadingSpinner 
          message="Recherche en cours..." 
          heightRatio={0.25}
        /> */}
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Recherche en cours... (spinner commenté) - État loading: {loading}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      renderItem={renderProduct}
      keyExtractor={(item) => item.id.toString()}
      numColumns={2}
      columnWrapperStyle={styles.productRow}
      contentContainerStyle={[styles.scrollContent, { backgroundColor: colors.background }]}
      // refreshControl={
      //   <RefreshControl 
      //     refreshing={refreshing} 
      //     onRefresh={onRefresh}
      //     colors={[colors.primary]}
      //     tintColor={colors.primary}
      //   />
      // }
      onEndReached={loadMoreProducts}
      onEndReachedThreshold={0.1}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={10}
    />
  );
});

export default function HomeScreen() {
  const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
  const { colors } = useTheme();
  const { isAuthenticated, isGuest } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const insets = useSafeAreaInsets();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [imageUrls, setImageUrls] = useState<{[key: number]: string}>({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Voir tout');
  const [isInitialized, setIsInitialized] = useState(false);
  
  console.log('🏠 [HomeScreen] Composant monté - loading:', loading, 'initialLoading:', initialLoading);

  const loadProducts = useCallback(async (page: number = 0, append: boolean = false, searchTerm?: string) => {
    console.log(`🚀 [HomeScreen] loadProducts appelé avec page=${page}, append=${append}, search=${searchTerm}`);
    try {
      if (page === 0 && !append) {
        console.log('🚀 [HomeScreen] Début du chargement - setLoading(true)');
        setError(null);
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await ProductService.getProducts({
        page: page,
        pageSize: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        search: searchTerm
      });

      // Mettre à jour les métadonnées de pagination
      setTotalPages(response.totalPages);
      setCurrentPage(response.currentPage);
      setHasMore(response.currentPage < response.totalPages - 1);

      // Charger les URLs des images pour les nouveaux produits
      const urls: {[key: number]: string} = {};
      for (const product of response.content) {
        try {
          const imageUrl = await ProductService.getProductImageUrl(product);
          if (imageUrl) {
            urls[product.id] = imageUrl;
          }
        } catch (error) {
          // Erreur silencieuse pour le chargement d'image
        }
      }

      // Mettre à jour les produits et images
      if (append) {
        setProducts(prev => [...prev, ...response.content]);
        setImageUrls(prev => ({ ...prev, ...urls }));
      } else {
        setProducts(response.content);
        setImageUrls(urls);
      }
    } catch (err) {
      console.error('[HomeScreen] Erreur lors du chargement des produits:', err);
      setError('Impossible de charger les produits. Veuillez réessayer plus tard.');
    } finally {
      console.log('✅ [HomeScreen] Fin du chargement - setLoading(false)');
      setLoading(false);
      setLoadingMore(false);
      setInitialLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    console.log('[HomeScreen] Refresh manuel déclenché');
    setRefreshing(true);
    setCurrentPage(0);
    setHasMore(true);
    await loadProducts(0, false, activeSearch);
    setRefreshing(false);
  }, [loadProducts, activeSearch]);

  const loadMoreProducts = useCallback(async () => {
    if (!loadingMore && hasMore) {
      const nextPage = currentPage + 1;
      await loadProducts(nextPage, true, activeSearch);
    }
  }, [loadingMore, hasMore, currentPage, loadProducts, activeSearch]);

  // Chargement initial uniquement
  useEffect(() => {
    if (!isInitialized) {
      console.log('[HomeScreen] Chargement initial');
      setIsInitialized(true);
      loadProducts(0, false);
    }
  }, [isInitialized, loadProducts]);

  const handleProductPress = useCallback((productId: number) => {
    navigation.navigate('ProductDetail', { productId: productId.toString() });
  }, [navigation]);

  const handleFavoritePress = useCallback(async (productId: number) => {
    try {
      const result = await toggleFavorite(productId);
      // Mettre à jour l'état du produit dans la liste
      setProducts(prev => 
        prev.map(product => 
          product.id === productId 
            ? { ...product, favoriteCount: result.favoriteCount }
            : product
        )
      );
    } catch (error) {
      console.error('Erreur lors du toggle des favoris:', error);
      Alert.alert('Erreur', 'Impossible de modifier les favoris pour le moment');
    }
  }, [toggleFavorite]);

  const handleSearchSubmit = useCallback(async () => {
    if (search.trim()) {
      console.log('🔍 [HomeScreen] Recherche soumise:', search);
      console.log('🔍 [HomeScreen] État loading avant recherche:', loading);
      setActiveSearch(search.trim());
      await loadProducts(0, false, search.trim());
      console.log('🔍 [HomeScreen] État loading après recherche:', loading);
    }
  }, [search, loadProducts, loading]);

  const handleClearSearch = useCallback(() => {
    console.log('[HomeScreen] Effacement de la recherche');
    setSearch('');
    setActiveSearch('');
    loadProducts(0, false);
  }, [loadProducts]);

  // Mémoriser les props du header pour éviter les re-renders
  const headerProps = useCallback(() => ({
    search,
    setSearch,
    handleSearchSubmit,
    handleClearSearch,
    activeSearch,
    selectedFilter,
    setSelectedFilter,
    navigation
  }), [search, handleSearchSubmit, handleClearSearch, activeSearch, selectedFilter, navigation]);

  // Mémoriser les props de la zone de contenu
  const contentProps = useCallback(() => ({
    products,
    imageUrls,
    isFavorite,
    handleProductPress,
    handleFavoritePress,
    loading,
    initialLoading,
    loadingMore,
    refreshing,
    onRefresh,
    loadMoreProducts,
    colors
  }), [products, imageUrls, isFavorite, handleProductPress, handleFavoritePress, loading, initialLoading, loadingMore, refreshing, onRefresh, loadMoreProducts, colors]);

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
        <Text style={[styles.retryText, { color: colors.tabIconDefault }]}>
          Tire vers le bas pour réessayer
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top','left','right','bottom']}>
      <FixedHeader {...headerProps()} />
      <View style={styles.contentArea}>
        <ContentArea {...contentProps()} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fixedHeader: {
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  contentArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  productRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  retryText: {
    fontSize: 14,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  loadingMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingMoreText: {
    marginLeft: 8,
    fontSize: 14,
  },
  searchIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
    marginBottom: 8,
    borderRadius: 8,
  },
  searchText: {
    fontSize: 14,
    flex: 1,
  },
  clearSearchButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  clearSearchText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listLoadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  contentLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
}); 