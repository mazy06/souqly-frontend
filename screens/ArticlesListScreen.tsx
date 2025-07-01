import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, FlatList, Text, RefreshControl, ActivityIndicator } from 'react-native';
import ProductCard from '../components/ProductCard';
import PrimaryButton from '../components/PrimaryButton';
import { useAuth } from '../contexts/AuthContext';
import Colors from '../constants/Colors';
import { useColorScheme } from 'react-native';
import VisitorBadge from '../components/VisitorBadge';
import Skeleton from '../components/Skeleton';
import SearchBar from '../components/SearchBar';
import FilterChips from '../components/FilterChips';
import ProductService, { Product } from '../services/ProductService';

function FavoritesScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>Vos articles favoris apparaîtront ici.</Text>
    </View>
  );
}

export default function ArticlesListScreen({ navigation }: { navigation: any }) {
  const { logout, isGuest } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Voir tout');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [imageUrls, setImageUrls] = useState<{[key: number]: string}>({});

  const loadProducts = async () => {
    try {
      setError(null);
      const response = await ProductService.getProducts({
        page: 0,
        pageSize: 20,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      setProducts(response.content);
      
      // Charger les URLs des images pour chaque produit
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
      setImageUrls(urls);
    } catch (err) {
      setError('Impossible de charger les produits');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const toggleFavorite = (productId: number) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

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
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
        <Text style={[styles.retryText, { color: colors.tabIconDefault }]}>
          Tire vers le bas pour réessayer
        </Text>
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
        renderItem={({ item, index }) => (
          <ProductCard
            title={item.title}
            brand={item.brand}
            size={item.size}
            condition={item.condition}
            price={item.price.toString()}
            priceWithFees={item.priceWithFees?.toString()}
            image={imageUrls[item.id] || 'https://via.placeholder.com/120'}
            onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
            likes={item.favoriteCount}
            isPro={index % 4 === 0}
            isFavorite={favorites.includes(item.id)}
            onFavoritePress={() => toggleFavorite(item.id)}
          />
        )}
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
  retryText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
}); 