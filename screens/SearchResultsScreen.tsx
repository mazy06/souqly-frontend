import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useFavorites } from '../hooks/useFavorites';
import ProductService, { Product } from '../services/ProductService';
import ProductCard from '../components/ProductCard';
import SearchHeader from '../components/SearchHeader';

interface SearchResultsRouteParams {
  query: string;
  category?: string;
}

export default function SearchResultsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { isFavorite, toggleFavorite } = useFavorites();
  
  const { query, category } = route.params as SearchResultsRouteParams;
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<{[key: number]: string}>({});

  const loadSearchResults = async (refresh: boolean = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const filters: any = {
        search: query,
        page: 0,
        pageSize: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };
      
      // Ajouter le filtre de catégorie si fourni
      if (category) {
        filters.categoryId = category;
      }
      
      const response = await ProductService.getProducts(filters);

      // Charger les URLs des images
      const urls: {[key: number]: string} = {};
      for (const product of response.content) {
        try {
          if (product.images && product.images.length > 0) {
            urls[product.id] = ProductService.getImageUrl(product.images[0].id);
          }
        } catch (error) {
          // Erreur silencieuse
        }
      }

      setProducts(response.content);
      setImageUrls(urls);
    } catch (error) {
      console.error('Erreur recherche:', error);
      setError('Impossible de charger les résultats de recherche');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSearchResults();
  }, [query]);

  const onRefresh = () => {
    loadSearchResults(true);
  };

  const handleProductPress = (productId: number) => {
    navigation.navigate('ProductDetail', { productId: productId.toString() });
  };

  const handleFavoritePress = async (productId: number) => {
    try {
      await toggleFavorite(productId);
      // Mettre à jour l'état local si nécessaire
    } catch (error) {
      console.error('Erreur toggle favoris:', error);
    }
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
      isFavorite={isFavorite(item.id)}
      onPress={() => handleProductPress(item.id)}
      onFavoritePress={() => handleFavoritePress(item.id)}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: colors.text }]}>
        Aucun résultat trouvé pour "{query}"
      </Text>
      <Text style={[styles.emptySubtext, { color: colors.tabIconDefault }]}>
        Essayez avec d'autres mots-clés
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <SearchHeader title={category ? `${category} - ${query || 'Tous les produits'}` : `Résultats pour "${query}"`} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Recherche en cours...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <SearchHeader title={`Résultats pour "${query}"`} />
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  productRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
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
}); 