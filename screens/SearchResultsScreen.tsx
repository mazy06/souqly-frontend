import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useFavorites } from '../hooks/useFavorites';
import { getProductPlaceholder } from '../utils/imageUtils';
import ProductService, { Product } from '../services/ProductService';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import FilterChips from '../components/FilterChips';

interface SearchResultsRouteParams {
  query: string;
  category?: string;
}

type SearchResultsStackParamList = {
  ProductDetail: { productId: string };
};

export default function SearchResultsScreen() {
  const route = useRoute();
  const navigation = useNavigation<StackNavigationProp<SearchResultsStackParamList>>();
  const { colors } = useTheme();
  const { isFavorite, toggleFavorite } = useFavorites();
  
  const { query: initialQuery, category } = route.params as SearchResultsRouteParams;
  
  const [searchQuery, setSearchQuery] = useState(initialQuery || '');
  const [selectedFilter, setSelectedFilter] = useState('all');
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
        search: searchQuery,
        page: 0,
        pageSize: 20,
      };
      
      // Appliquer le filtre sélectionné
      switch (selectedFilter) {
        case 'recent':
          filters.sortBy = 'createdAt';
          filters.sortOrder = 'desc';
          break;
        case 'popular':
          filters.sortBy = 'favoriteCount';
          filters.sortOrder = 'desc';
          break;
        case 'nearby':
          // Filtrer les produits avec localisation
          break;
        case 'new':
          // Produits créés dans les 7 derniers jours
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          // TODO: Ajouter filtre de date côté backend
          break;
        case 'promo':
          // TODO: Filtrer les produits en promotion
          break;
        case 'verified':
          // TODO: Filtrer les produits de vendeurs vérifiés
          break;
        case 'urgent':
          // TODO: Filtrer les produits urgents
          break;
        default:
          filters.sortBy = 'createdAt';
          filters.sortOrder = 'desc';
      }
      
      // Ajouter le filtre de catégorie si fourni
      if (category) {
        // Si c'est un ID numérique, l'utiliser directement
        if (!isNaN(Number(category))) {
          filters.categoryId = category;
        } else {
          // Sinon, c'est un filtre textuel, l'ajouter à la recherche
          filters.search = searchQuery ? `${searchQuery} ${category}` : category;
        }
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
  }, [searchQuery, selectedFilter]);

  const onRefresh = () => {
    loadSearchResults(true);
  };

  const handleSearchSubmit = () => {
    loadSearchResults();
  };

  const handleFilterSelect = (filter: string) => {
    setSelectedFilter(filter);
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
      image={imageUrls[item.id] || getProductPlaceholder()}
      likes={item.favoriteCount}
      isFavorite={isFavorite(item.id)}
      onPress={() => handleProductPress(item.id)}
      onFavoritePress={() => handleFavoritePress(item.id)}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: colors.text }]}>
        Aucun résultat trouvé pour "{searchQuery}"
      </Text>
      <Text style={[styles.emptySubtext, { color: colors.tabIconDefault }]}>
        Essayez avec d'autres mots-clés
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Résultats pour "{searchQuery}"
          </Text>
        </View>
        <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmit={handleSearchSubmit}
            placeholder="Rechercher..."
          />
          <FilterChips
            selected={selectedFilter}
            onSelect={handleFilterSelect}
          />
        </View>
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
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Résultats pour "{searchQuery}"
        </Text>
      </View>
      <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmit={handleSearchSubmit}
          placeholder="Rechercher..."
        />
        <FilterChips
          selected={selectedFilter}
          onSelect={handleFilterSelect}
        />
      </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  searchContainer: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
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