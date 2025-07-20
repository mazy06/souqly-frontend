import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import ProductCard from './ProductCard';

interface BoostedProductCardProps {
  title: string;
  brand?: string;
  size?: string;
  condition?: string;
  price: string;
  priceWithFees?: string;
  image: string | null;
  onPress?: () => void;
  likes?: number;
  isPro?: boolean;
  isFavorite?: boolean;
  onFavoritePress?: () => void;
  status?: string;
  productId?: number;
  boostLevel?: number;
  boostType?: 'premium' | 'standard' | 'urgent';
}

export default function BoostedProductCard({
  title,
  brand,
  size,
  condition,
  price,
  priceWithFees,
  image,
  onPress,
  likes = 0,
  isPro = false,
  isFavorite = false,
  onFavoritePress,
  status,
  productId,
  boostLevel = 1,
  boostType = 'standard'
}: BoostedProductCardProps) {
  const { colors } = useTheme();

  const getBoostBadgeStyle = () => {
    switch (boostType) {
      case 'premium':
        return { backgroundColor: '#FFD700', color: '#000' };
      case 'urgent':
        return { backgroundColor: '#FF6B6B', color: '#fff' };
      default:
        return { backgroundColor: colors.primary, color: '#fff' };
    }
  };

  const getBoostIcon = () => {
    switch (boostType) {
      case 'premium':
        return 'star';
      case 'urgent':
        return 'flash';
      default:
        return 'flame';
    }
  };

  const boostBadgeStyle = getBoostBadgeStyle();

  return (
    <View style={styles.container}>
      <ProductCard
        title={title}
        brand={brand}
        size={size}
        condition={condition}
        price={price}
        priceWithFees={priceWithFees}
        image={image}
        onPress={onPress}
        likes={likes}
        isPro={isPro}
        isFavorite={isFavorite}
        onFavoritePress={onFavoritePress}
        status={status}
        productId={productId}
      />
      
      {/* Badge de boost */}
      <View style={[styles.boostBadge, { backgroundColor: boostBadgeStyle.backgroundColor }]}>
        <Ionicons 
          name={getBoostIcon() as any} 
          size={14} 
          color={boostBadgeStyle.color} 
        />
      </View>
      
      {/* Indicateur de niveau de boost */}
      {boostLevel > 1 && (
        <View style={[styles.boostLevel, { backgroundColor: colors.primary }]}>
          <Text style={styles.boostLevelText}>Niveau {boostLevel}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flex: 1,
    minWidth: '48%',
    maxWidth: '48%',
  },
  boostBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  boostLevel: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 10,
  },
  boostLevelText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
}); 