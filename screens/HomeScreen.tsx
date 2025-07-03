import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl, ActivityIndicator, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import ProductCard from '../components/ProductCard';
import ProductService, { Product } from '../services/ProductService';
import { useTheme } from '../contexts/ThemeContext';

// Types pour la navigation
export type HomeStackParamList = {
  HomeMain: undefined;
  ProductDetail: { productId: string };
};

export default function HomeScreen() {
  console.log('[HomeScreen] Composant monté');
  const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
  const { colors } = useTheme();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [imageUrls, setImageUrls] = useState<{[key: number]: string}>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(0);

  const loadProducts = async (page: number = 0, append: boolean = false) => {
    console.log(`[HomeScreen] loadProducts appelé avec page=${page}, append=${append}`);
    try {
      if (page === 0) {
        setError(null);
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await ProductService.getProducts({
        page: page,
        pageSize: 10, // Réduire la taille de page pour plus de fluidité
        sortBy: 'createdAt',
        sortOrder: 'desc'
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
    console.log('[HomeScreen] useEffect déclenché');
    setLoading(true);
    setError(null);
    ProductService.getProducts({
      page: 0,
      pageSize: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })
      .then((response) => {
        console.log('[HomeScreen] Réponse API reçue:', response);
        setProducts(response.content || []);
        setTotalPages(response.totalPages || 1);
        setCurrentPage(0);
        setHasMore((response.currentPage || 0) < (response.totalPages || 1) - 1);
      })
      .catch((err) => {
        console.error('[HomeScreen] Erreur lors du chargement des produits:', err, err?.message, err?.stack);
        setError('Impossible de charger les produits. Veuillez réessayer plus tard.');
      })
      .finally(() => {
        setLoading(false);
        console.log('[HomeScreen] Chargement terminé');
      });
  }, []);

  const handleProductPress = (productId: number) => {
    navigation.navigate('ProductDetail', { productId: productId.toString() });
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <ProductCard
      title={item.title}
      brand={item.brand}
      size={item.size}
      condition={item.condition}
      price={item.price.toString()}
      priceWithFees={item.priceWithFees?.toString()}
      image={imageUrls[item.id] || 'https://via.placeholder.com/120'}
      likes={item.favoriteCount}
      onPress={() => handleProductPress(item.id)}
    />
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadingMoreContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.loadingMoreText, { color: colors.text }]}>
          Chargement...
        </Text>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: colors.text }]}>
        Aucun produit disponible pour le moment
      </Text>
      <Text style={[styles.emptySubtext, { color: colors.tabIconDefault }]}>
        Soyez le premier à publier un article !
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Chargement des produits...</Text>
      </View>
    );
  }

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
    <FlatList
      data={products}
      renderItem={renderProduct}
      keyExtractor={(item) => item.id.toString()}
      numColumns={2}
      columnWrapperStyle={styles.productRow}
      contentContainerStyle={[styles.scrollContent, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      onEndReached={loadMoreProducts}
      onEndReachedThreshold={0.1}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
}); 