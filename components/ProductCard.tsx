import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AdaptiveImage from './AdaptiveImage';
import { useTheme } from '../contexts/ThemeContext';

type Props = {
  title: string;
  brand?: string;
  size?: string;
  condition?: string;
  price: string;
  priceWithFees?: string;
  image: string;
  onPress?: () => void;
  likes?: number;
  isPro?: boolean;
  isFavorite?: boolean;
  onFavoritePress?: () => void;
};

export default function ProductCard({ 
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
  onFavoritePress
}: Props) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: colors.card }]} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.imageContainer, { backgroundColor: colors.border }]}>
        <AdaptiveImage source={{ uri: image }} style={styles.image} alt={title} />
        {isPro && (
          <View style={[styles.proBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.proText}>Pro</Text>
          </View>
        )}
        <TouchableOpacity 
          style={styles.likesBadgeTopRight}
          onPress={(e) => {
            e.stopPropagation();
            if (onFavoritePress) onFavoritePress();
          }}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={isFavorite ? 'heart' : 'heart-outline'} 
            size={16} 
            color={isFavorite ? colors.danger : '#fff'} 
          />
          <Text style={styles.likesText}>{likes}</Text>
        </TouchableOpacity>
      </View>
      {brand && <Text style={[styles.brand, { color: colors.text }]} numberOfLines={1}>{brand}</Text>}
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{title}</Text>
      <Text style={[styles.details, { color: colors.tabIconDefault }]} numberOfLines={1}>
        {size ? size + ' · ' : ''}{condition}
      </Text>
      <View style={styles.priceRow}>
        <Text style={[styles.price, { color: colors.text }]}>{price} €</Text>
        {priceWithFees && <Text style={[styles.priceWithFees, { color: colors.primary }]}>{priceWithFees} € incl.</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 8,
    borderRadius: 16,
    overflow: 'hidden',
    minWidth: 160,
    maxWidth: '48%',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    } : {
      elevation: 2,
    }),
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 4/5,
  },
  image: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  proBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  proText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  likesBadgeTopRight: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    zIndex: 2,
  },
  likesText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 4,
    fontSize: 13,
  },
  brand: {
    fontWeight: '500',
    fontSize: 13,
    marginTop: 8,
    marginHorizontal: 8,
    marginBottom: 0,
    opacity: 0.85,
  },
  title: {
    fontWeight: '600',
    fontSize: 15,
    marginTop: 2,
    marginHorizontal: 8,
    marginBottom: 0,
  },
  details: {
    fontSize: 13,
    marginHorizontal: 8,
    marginBottom: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginBottom: 10,
  },
  price: {
    fontWeight: 'bold',
    fontSize: 15,
    marginRight: 8,
  },
  priceWithFees: {
    fontWeight: 'bold',
    fontSize: 14,
  },
}); 