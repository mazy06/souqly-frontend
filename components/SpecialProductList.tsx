import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import ProductCard from './ProductCard';
import { Product } from '../services/ProductService';
import { formatAmount } from '../utils/formatters';

interface SpecialProductListProps {
  type: 'favorites' | 'recent' | 'trending' | 'recommended' | 'nearby';
  products: Product[];
  onProductPress: (productId: number) => void;
  onFavoritePress: (productId: number) => void;
  onViewAllPress?: () => void;
  imageUrls: {[key: number]: string | null};
  favoriteCounts: { [productId: number]: number };
  isFavorite: (productId: number) => boolean;
  maxItems?: number;
}

// Configuration des sections spéciales
const specialConfig = {
  favorites: {
    icon: 'heart',
    title: 'Vos coups de cœur',
    subtitle: 'Produits que vous avez aimés',
    color: '#E91E63',
    gradient: ['#E91E63', '#C2185B']
  },
  recent: {
    icon: 'time',
    title: 'Annonces récentes',
    subtitle: 'Les dernières publications',
    color: '#2196F3',
    gradient: ['#2196F3', '#1976D2']
  },
  trending: {
    icon: 'trending-up',
    title: 'Tendances',
    subtitle: 'Produits populaires',
    color: '#4CAF50',
    gradient: ['#4CAF50', '#388E3C']
  },
  recommended: {
    icon: 'star',
    title: 'Recommandés',
    subtitle: 'Basé sur vos préférences',
    color: '#FF9800',
    gradient: ['#FF9800', '#F57C00']
  },
  nearby: {
    icon: 'location',
    title: 'Près de chez vous',
    subtitle: 'Produits locaux',
    color: '#9C27B0',
    gradient: ['#9C27B0', '#7B1FA2']
  }
};

export default function SpecialProductList({
  type,
  products,
  onProductPress,
  onFavoritePress,
  onViewAllPress,
  imageUrls,
  favoriteCounts,
  isFavorite,
  maxItems = 5
}: SpecialProductListProps) {
  const { colors } = useTheme();
  const config = specialConfig[type];

  const displayProducts = products
    .filter(product => product && product.id && product.title) // Filtrer les produits invalides
    .slice(0, maxItems);

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productContainer}>
      <ProductCard
        title={item.title || 'Produit sans titre'}
        brand={item.brand || ''}
        size={item.size || ''}
        condition={item.condition || ''}
        price={formatAmount(item.price || 0)}
        priceWithFees={item.priceWithFees ? formatAmount(item.priceWithFees) : undefined}
        image={imageUrls[item.id]}
        likes={favoriteCounts[item.id] || 0}
        isFavorite={isFavorite(item.id)}
        onPress={() => onProductPress(item.id)}
        onFavoritePress={() => onFavoritePress(item.id)}
        status={item.status}
      />
    </View>
  );

  if (displayProducts.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={[styles.specialIcon, { backgroundColor: config.color + '20' }]}>
            <Ionicons 
              name={config.icon as any} 
              size={24} 
              color={config.color} 
            />
          </View>
          <View style={styles.titleText}>
            <Text style={[styles.title, { color: colors.text }]}>{config.title}</Text>
            <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>{config.subtitle}</Text>
          </View>
        </View>
        {onViewAllPress && (
          <TouchableOpacity onPress={onViewAllPress} style={styles.viewAllButton}>
            <Text style={[styles.viewAllText, { color: config.color }]}>Voir tout</Text>
            <Ionicons name="chevron-forward" size={16} color={config.color} />
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
      
      {displayProducts.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons 
            name={config.icon as any} 
            size={48} 
            color={colors.tabIconDefault} 
          />
          <Text style={[styles.emptyText, { color: colors.tabIconDefault }]}>
            Aucun produit à afficher
          </Text>
        </View>
      )}
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
  list: {
    paddingLeft: 16,
  },
  productContainer: {
    marginRight: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
}); 