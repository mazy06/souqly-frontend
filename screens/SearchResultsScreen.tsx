import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import EnhancedSearchBar from '../components/EnhancedSearchBar';
import ProductCard from '../components/ProductCard';
import SearchService, { SearchFilters, SearchResult } from '../services/SearchService';
import ProductService from '../services/ProductService';

export default function SearchResultsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { colors } = useTheme();
  
  const [searchQuery, setSearchQuery] = useState(route.params?.query || '');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch();
    }
  }, [searchQuery]);

  const performSearch = async (page: number = 0, append: boolean = false) => {
    try {
      setLoading(true);
      const searchResult = await SearchService.searchProducts(searchQuery, page, 20);
      
      if (append && results) {
        setResults({
          ...searchResult,
          content: [...results.content, ...searchResult.content],
        });
      } else {
        setResults(searchResult);
      }
      
      setCurrentPage(page);
      setHasMore(page < searchResult.totalPages - 1);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await performSearch(0, false);
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      performSearch(currentPage + 1, true);
    }
  };

  const handleSuggestionPress = (suggestion: any) => {
    setSearchQuery(suggestion.title);
    // Optionnel : naviguer vers le détail du produit
    // navigation.navigate('ProductDetail', { productId: suggestion.id });
  };

  const renderProduct = ({ item }: { item: any }) => {
    const condition = (item.condition as string) || 'Non spécifié';
    return (
      <ProductCard
        title={item.title || ''}
        brand={item.brand || undefined}
        size={item.size || undefined}
        condition={condition}
        price={item.price?.toString() || '0'}
        image={item.images && item.images.length > 0 ? ProductService.getProductImageUrl(item) || '' : ''}
        likes={item.favoriteCount || 0}
        onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
      />
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="search-outline" size={64} color={colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        Aucun résultat trouvé
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Essayez de modifier vos critères de recherche
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Chargement...
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Résultats de recherche
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <EnhancedSearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmit={() => performSearch(0, false)}
          onSuggestionPress={handleSuggestionPress}
          placeholder="Rechercher des produits..."
        />
      </View>

      {/* Results */}
      {loading && currentPage === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Recherche en cours...
          </Text>
        </View>
      ) : (
        <FlatList
          data={results?.content || []}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={renderFooter}
          ListHeaderComponent={
            results && results.totalElements > 0 ? (
              <View style={styles.resultsHeader}>
                <Text style={[styles.resultsCount, { color: colors.textSecondary }]}>
                  {results.totalElements} résultat{results.totalElements > 1 ? 's' : ''} trouvé{results.totalElements > 1 ? 's' : ''}
                </Text>
              </View>
            ) : null
          }
        />
      )}
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
  headerSpacer: {
    width: 40,
  },
  searchContainer: {
    paddingTop: 16,
    paddingHorizontal: 16,
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
  listContainer: {
    paddingBottom: 24,
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultsCount: {
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
}); 