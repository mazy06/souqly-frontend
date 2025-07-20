import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import RecommendationService, { BoostedRecommendationResponse } from '../services/RecommendationService';
import ProductCard from './ProductCard';
import Skeleton from './Skeleton';
import { formatAmount } from '../utils/formatters';
import { getImageUrl } from '../constants/Config';

interface RecommendationSectionProps {
  title?: string;
  subtitle?: string;
  limit?: number;
  showBoostedBadge?: boolean;
  showMetrics?: boolean;
  onProductPress?: (productId: number) => void;
  onFavoritePress?: (productId: number) => void;
  onViewAllPress?: () => void;
}

// Configuration pour les recommandations
const recommendationConfig = {
  icon: 'star',
  color: '#FF9800',
  gradient: ['#FF9800', '#F57C00']
};

export default function RecommendationSection({
  title = "Recommandés pour vous",
  subtitle = "Basé sur vos préférences",
  limit = 5,
  showBoostedBadge = true,
  showMetrics = false,
  onProductPress,
  onFavoritePress,
  onViewAllPress
}: RecommendationSectionProps) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<BoostedRecommendationResponse>({
    products: [],
    boostedProducts: [],
    metrics: {
      totalRecommendations: 0,
      boostedCount: 0,
      boostedPercentage: 0,
      avgPrice: 0,
      avgFavorites: 0,
      uniqueBrands: 0,
      diversity: 0
    }
  });
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

      const result = await recommendationService.getBoostedRecommendations(
        parseInt(user.id),
        limit
      );

      setRecommendations(result);
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

  const renderMetrics = () => {
    if (!showMetrics || recommendations.metrics.totalRecommendations === 0) {
      return null;
    }

    return (
      <View style={styles.metricsContainer}>
        <Text style={[styles.metricsText, { color: colors.textSecondary }]}>
          {recommendations.metrics.boostedCount} boostés • 
          {recommendations.metrics.avgPrice.toFixed(0)}€ moyen • 
          {recommendations.metrics.diversity.toFixed(1)} diversité
        </Text>
      </View>
    );
  };

  const renderLoadingSkeleton = () => {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
        {Array.from({ length: limit }).map((_, index) => (
          <View key={index} style={styles.skeletonContainer}>
            <Skeleton containerStyle={{ width: 150, height: 200 }} />
            <Skeleton containerStyle={{ width: 120, height: 16, marginTop: 8 }} />
            <Skeleton containerStyle={{ width: 80, height: 14, marginTop: 4 }} />
          </View>
        ))}
      </ScrollView>
    );
  };

  const renderError = () => {
    return (
      <View style={styles.errorContainer}>
        <Text style={[styles.errorText, { color: colors.danger }]}>
          {error}
        </Text>
        <TouchableOpacity onPress={loadRecommendations} style={styles.retryButton}>
          <Text style={[styles.retryText, { color: colors.primary }]}>
            Réessayer
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderProducts = () => {
    if (recommendations.products.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Aucune recommandation disponible
          </Text>
        </View>
      );
    }

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
        {recommendations.products.map((product) => (
          <View key={product.id} style={styles.productContainer}>
            <ProductCard
              title={product.title}
              brand={product.brand}
              size={product.size}
              condition={product.condition}
              price={formatAmount(product.price)}
              priceWithFees={product.priceWithFees ? formatAmount(product.priceWithFees) : undefined}
              image={product.images && product.images.length > 0 ? getImageUrl(product.images[0].id) : null}
              likes={product.favoriteCount}
              isFavorite={false}
              onPress={() => handleProductPress(product.id)}
              onFavoritePress={() => handleFavoritePress(product.id)}
              status={product.status}
              productId={product.id}
              isBoosted={product.isBoosted}
              boostLevel={product.boostLevel}
            />
          </View>
        ))}
      </ScrollView>
    );
  };

  if (loading) {
    return (
      <View style={styles.section}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <View style={[styles.specialIcon, { backgroundColor: recommendationConfig.color + '20' }]}>
              <Ionicons 
                name={recommendationConfig.icon as any} 
                size={24} 
                color={recommendationConfig.color} 
              />
            </View>
            <View style={styles.titleText}>
              <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
              <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>{subtitle}</Text>
            </View>
          </View>
          {onViewAllPress && (
            <TouchableOpacity onPress={handleViewAllPress} style={styles.viewAllButton}>
              <Text style={[styles.viewAllText, { color: recommendationConfig.color }]}>Voir tout</Text>
              <Ionicons name="chevron-forward" size={16} color={recommendationConfig.color} />
            </TouchableOpacity>
          )}
        </View>
        {renderLoadingSkeleton()}
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.section}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <View style={[styles.specialIcon, { backgroundColor: recommendationConfig.color + '20' }]}>
              <Ionicons 
                name={recommendationConfig.icon as any} 
                size={24} 
                color={recommendationConfig.color} 
              />
            </View>
            <View style={styles.titleText}>
              <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
              <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>{subtitle}</Text>
            </View>
          </View>
        </View>
        {renderError()}
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={[styles.specialIcon, { backgroundColor: recommendationConfig.color + '20' }]}>
            <Ionicons 
              name={recommendationConfig.icon as any} 
              size={24} 
              color={recommendationConfig.color} 
            />
          </View>
          <View style={styles.titleText}>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>{subtitle}</Text>
          </View>
        </View>
        {onViewAllPress && (
          <TouchableOpacity onPress={handleViewAllPress} style={styles.viewAllButton}>
            <Text style={[styles.viewAllText, { color: recommendationConfig.color }]}>Voir tout</Text>
            <Ionicons name="chevron-forward" size={16} color={recommendationConfig.color} />
          </TouchableOpacity>
        )}
      </View>
      {renderMetrics()}
      {renderProducts()}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    opacity: 0.7,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  container: {
    paddingLeft: 16,
  },
  productContainer: {
    marginRight: 12,
    position: 'relative',
  },
  skeletonContainer: {
    marginRight: 12,
    width: 150,
  },
  metricsContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  metricsText: {
    fontSize: 12,
  },
  errorContainer: {
    paddingHorizontal: 16,
    alignItems: 'center',
    paddingVertical: 20,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
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