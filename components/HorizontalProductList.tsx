import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import ProductCard from './ProductCard';
import { Product } from '../services/ProductService';
import { formatAmount } from '../utils/formatters';

interface HorizontalProductListProps {
  title: string;
  products: Product[];
  onProductPress: (productId: number) => void;
  onFavoritePress: (productId: number) => void;
  onViewAllPress?: () => void;
  imageUrls: {[key: number]: string | null};
  favoriteCounts: { [productId: number]: number };
  isFavorite: (productId: number) => boolean;
  icon?: string;
  category?: string;
}

export default function HorizontalProductList({
  title,
  products,
  onProductPress,
  onFavoritePress,
  onViewAllPress,
  imageUrls,
  favoriteCounts,
  isFavorite,
  icon,
  category
}: HorizontalProductListProps) {
  const { colors } = useTheme();

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productContainer}>
      <ProductCard
        title={item.title}
        brand={item.brand}
        size={item.size}
        condition={item.condition}
        price={formatAmount(item.price)}
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          {icon && (
            <Ionicons 
              name={icon as any} 
              size={20} 
              color={colors.primary} 
              style={styles.titleIcon}
            />
          )}
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        </View>
        {onViewAllPress && (
          <TouchableOpacity onPress={onViewAllPress} style={styles.viewAllButton}>
            <Text style={[styles.viewAllText, { color: colors.primary }]}>Voir tout</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={products}
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
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleIcon: {
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
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
    width: 160,
  },
}); 