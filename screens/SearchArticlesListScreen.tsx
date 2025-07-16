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
import { getImageUrl } from '../constants/Config';
import SearchHeader from '../components/SearchHeader';

// Types pour la navigation
export type SearchArticlesListStackParamList = {
  SearchArticlesList: undefined;
  ProductDetail: { productId: string };
};

export default function SearchArticlesListScreen() {
  console.log('[SearchArticlesListScreen] rendu');
  const navigation = useNavigation<StackNavigationProp<SearchArticlesListStackParamList>>();
  const route = useRoute();
  const { logout, isGuest, isAuthenticated } = useAuth();
  const { colors } = useTheme();
  const { isFavorite, toggleFavorite, refreshFavorites } = useFavorites();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [imageUrls, setImageUrls] = useState<{[key: number]: string}>({});
  const [favoriteCounts, setFavoriteCounts] = useState<{ [productId: number]: number }>({});

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

      const newProducts = response.content || [];
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

  const renderProduct = ({ item }: { item: Product }) => (
    <ProductCard
      title={item.title}
      brand={item.brand}
      size={item.size}
      condition={item.condition}
      price={item.price.toString()}
      priceWithFees={item.priceWithFees?.toString()}
      image={imageUrls[item.id] || (item.images && item.images.length > 0 ? getImageUrl(item.images[0].id) : 'https://via.placeholder.com/120')}
      likes={favoriteCounts[item.id] || 0}
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
            <SearchHeader title="Tous les articles" />
            <VisitorBadge onSignup={() => logout()} />
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
  gridContent: {
    padding: 8,
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