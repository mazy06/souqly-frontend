import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet, FlatList, Text, RefreshControl, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import ProductCard from '../components/ProductCard';
import PrimaryButton from '../components/PrimaryButton';
import { useAuth } from '../contexts/AuthContext';
import VisitorBadge from '../components/VisitorBadge';
import Skeleton from '../components/Skeleton';
import SearchBar from '../components/SearchBar';
import FilterChips from '../components/FilterChips';
import ProductService, { Product } from '../services/ProductService';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFavorites } from '../hooks/useFavorites';

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
  const navigation = useNavigation<StackNavigationProp<ArticlesListStackParamList>>();
  const route = useRoute();
  const { logout, isGuest, isAuthenticated } = useAuth();
  const { colors } = useTheme();
  const { isFavorite, toggleFavorite, refreshFavorites } = useFavorites();
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

  const loadProducts = async (page: number = 0, append: boolean = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      
      const response = await ProductService.getProducts({
        page,
        pageSize: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      const newProducts = response.content || [];
      
      // Charger les URLs des images pour les nouveaux produits
      const urls: {[key: number]: string} = {};
      for (const product of newProducts) {
        try {
          const imageUrl = await ProductService.getProductImageUrl(product);
          if (imageUrl) {
            urls[product.id] = imageUrl;
          }
        } catch (error) {
          // Erreur silencieuse pour le chargement d'image
        }
      }
      
      if (append) {
        setProducts(prev => [...prev, ...newProducts]);
        setImageUrls(prev => ({ ...prev, ...urls }));
      } else {
        setProducts(newProducts);
        setImageUrls(urls);
      }
      
      setCurrentPage(page);
      setHasMore((response.currentPage || 0) < (response.totalPages || 1) - 1);
      setError(null);
    } catch (err) {
      console.error('[ArticlesListScreen] Erreur lors du chargement des produits:', err);
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

  const handleFavoritePress = async (productId: number) => {
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
                  <Skeleton width="100%" height={160} borderRadius={16} />
                </View>
                <View style={styles.skeletonContent}>
                  <Skeleton width="70%" height={14} />
                  <Skeleton width="90%" height={16} />
                  <Skeleton width="60%" height={12} />
                  <Skeleton width="50%" height={14} />
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={products}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.gridContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={renderProduct}
        ListHeaderComponent={
          <View>
            <VisitorBadge onSignup={() => logout()} />
            <SearchBar 
              value={search} 
              onChangeText={setSearch}
              onPressFavorite={() => navigation.navigate('Favorites')}
            />
            <FilterChips selected={selectedFilter} onSelect={setSelectedFilter} />
            <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 20, margin: 8 }}>Recommandé pour toi</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
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
  gridContent: {
    padding: 8,
    paddingBottom: 32,
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
}); 