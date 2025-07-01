import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useColorScheme } from 'react-native';
import ProductCard from '../components/ProductCard';
import ProductService, { Product } from '../services/ProductService';
import { useMaintenanceHandler } from '../hooks/useMaintenanceHandler';
import Colors from '../constants/Colors';

// Types pour la navigation
export type HomeStackParamList = {
  HomeMain: undefined;
  ProductDetail: { productId: string };
};

export default function HomeScreen() {
  const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { handleMaintenanceError } = useMaintenanceHandler();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [imageUrls, setImageUrls] = useState<{[key: number]: string}>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async () => {
    try {
      setError(null);
      const response = await ProductService.getProducts({
        page: 0,
        pageSize: 20,
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
      // Vérifier si c'est une erreur de maintenance
      if (!handleMaintenanceError(err)) {
        setError('Impossible de charger les produits');
      }
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

  const handleProductPress = (productId: number) => {
    navigation.navigate('ProductDetail', { productId: productId.toString() });
  };

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
    <ScrollView 
      contentContainerStyle={[styles.scrollContent, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.text }]}>
            Aucun produit disponible pour le moment
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.tabIconDefault }]}>
            Soyez le premier à publier un article !
          </Text>
        </View>
      ) : (
        <View style={styles.productsGrid}>
          {products.map(product => (
            <ProductCard
              key={product.id}
              title={product.title}
              brand={product.brand}
              size={product.size}
              condition={product.condition}
              price={product.price.toString()}
              priceWithFees={product.priceWithFees?.toString()}
              image={imageUrls[product.id] || 'https://via.placeholder.com/120'}
              likes={product.favoriteCount}
              onPress={() => handleProductPress(product.id)}
            />
          ))}
        </View>
      )}
    </ScrollView>
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
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
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
}); 