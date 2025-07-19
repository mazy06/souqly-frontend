import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>{subtitle}</Text>
          )}
        </View>
        {onViewAllPress && (
          <TouchableOpacity onPress={handleViewAllPress} style={styles.viewAllButton}>
            <Text style={[styles.viewAllText, { color: colors.primary }]}>Voir tout</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.productsContainer}>
        {recommendations.map((product) => (
          <View key={product.id} style={styles.productWrapper}>
            <ProductCard
              title={product.title}
              brand={product.brand}
              size={product.size}
              condition={product.condition}
              price={product.price.toString()}
              priceWithFees={product.priceWithFees?.toString()}
              image={product.images && product.images.length > 0 ? 
                ProductService.getImageUrl(product.images[0].id) : null}
              likes={product.favoriteCount || 0}
              isPro={false}
              isFavorite={false}
              status={product.status}
              productId={product.id}
              onPress={() => handleProductPress(product.id)}
              onFavoritePress={() => handleFavoritePress(product.id)}
            />
            {showBoostedBadge && boostedProducts.includes(product.id) && (
              <View style={[styles.boostedBadge, { backgroundColor: colors.primary }]}>
                <Ionicons name="trending-up" size={12} color="#fff" />
                <Text style={styles.boostedText}>Boosté</Text>
              </View>
            )}
          </View>
        ))}
      </View>
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
  titleContainer: {
    flex: 1,
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
  productsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  productWrapper: {
    position: 'relative',
    flex: 1,
    minWidth: '48%',
    maxWidth: '48%',
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