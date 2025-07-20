import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import RecommendationService from '../services/RecommendationService';
import ProductService from '../services/ProductService';
import ProductCard from './ProductCard';
import { Product } from '../services/ProductService';

interface RecommendationSectionProps {
  title?: string;
  subtitle?: string;
  limit?: number;
  showBoostedBadge?: boolean;
  onProductPress?: (productId: number) => void;
  onFavoritePress?: (productId: number) => void;
  onViewAllPress?: () => void;
}

export default function RecommendationSection({
  title = "Recommandés pour vous",
  subtitle = "Basé sur vos préférences",
  limit = 5,
  showBoostedBadge = true,
  onProductPress,
  onFavoritePress,
  onViewAllPress
}: RecommendationSectionProps) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [boostedProducts, setBoostedProducts] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recommendationService = RecommendationService.getInstance();

  useEffect(() => {
    loadRecommendations();
  }, [user?.id]);

  const loadRecommendations = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { products, boostedProducts: boosted } = await recommendationService.getBoostedRecommendations(
        parseInt(user.id),
        limit
      );

      setRecommendations(products);
      setBoostedProducts(boosted);
    } catch (err) {
      console.error('Erreur lors du chargement des recommandations:', err);
      setError('Impossible de charger les recommandations');
    } finally {
      setLoading(false);
    }
  };

  const handleProductPress = (productId: number) => {
    if (onProductPress) {
      onProductPress(productId);
    }
  };

  const handleFavoritePress = (productId: number) => {
    if (onFavoritePress) {
      onFavoritePress(productId);
    }
  };

  const handleViewAllPress = () => {
    if (onViewAllPress) {
      onViewAllPress();
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            {subtitle && (
              <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>{subtitle}</Text>
            )}
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        </View>
      </View>
    );
  }

  if (error || recommendations.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            {subtitle && (
              <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>{subtitle}</Text>
            )}
          </View>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="information-circle-outline" size={24} color={colors.tabIconDefault} />
          <Text style={[styles.errorText, { color: colors.tabIconDefault }]}>
            {error || 'Aucune recommandation disponible'}
          </Text>
        </View>
      </View>
    );
  }

  const displayProducts = recommendations
    .filter(product => product && product.id && product.title) // Filtrer les produits invalides
    .slice(0, 6); // Limiter à 6 produits

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productContainer}>
      <ProductCard
        title={item.title || 'Produit sans titre'}
        brand={item.brand || ''}
        size={item.size || ''}
        condition={item.condition || ''}
        price={item.price ? item.price.toString() : '0'}
        priceWithFees={item.priceWithFees?.toString()}
        image={item.images && item.images.length > 0 ? 
          ProductService.getImageUrl(item.images[0].id) : null}
        likes={item.favoriteCount || 0}
        isPro={false}
        isFavorite={false}
        status={item.status}
        productId={item.id}
        onPress={() => handleProductPress(item.id)}
        onFavoritePress={() => handleFavoritePress(item.id)}
      />
      {showBoostedBadge && boostedProducts.includes(item.id) && (
        <View style={[styles.boostedBadge, { backgroundColor: '#FF9800' }]}>
          <Ionicons name="trending-up" size={12} color="#fff" />
          <Text style={styles.boostedText}>Boosté</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={[styles.specialIcon, { backgroundColor: '#FF9800' + '20' }]}>
            <Ionicons 
              name="star" 
              size={24} 
              color="#FF9800" 
            />
          </View>
          <View style={styles.titleText}>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            {subtitle && (
              <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>{subtitle}</Text>
            )}
          </View>
        </View>
        {onViewAllPress && (
          <TouchableOpacity onPress={handleViewAllPress} style={styles.viewAllButton}>
            <Text style={[styles.viewAllText, { color: '#FF9800' }]}>Voir tout</Text>
            <Ionicons name="chevron-forward" size={16} color="#FF9800" />
          </TouchableOpacity>
        )}
      </View>
      
      <FlatList
        data={displayProducts}
        keyExtractor={item => item.id.toString()}
        renderItem={renderProduct}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },

  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  loadingContainer: {
    paddingHorizontal: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  errorText: {
    fontSize: 14,
    marginLeft: 8,
    textAlign: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  specialIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleText: {
    flex: 1,
  },
  list: {
    paddingLeft: 16,
  },
  productContainer: {
    marginRight: 12,
  },
  boostedBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    zIndex: 10,
  },
  boostedText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 2,
  },
}); 