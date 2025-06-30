import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Colors from '../constants/Colors';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: image }} style={styles.image} />
        {isPro && (
          <View style={styles.proBadge}>
            <Text style={styles.proText}>Pro</Text>
          </View>
        )}
        {likes > 0 && (
          <View style={styles.likesBadge}>
            <Ionicons name="heart-outline" size={16} color="#fff" />
            <Text style={styles.likesText}>{likes}</Text>
          </View>
        )}
        {onFavoritePress && (
          <TouchableOpacity 
            style={styles.favoriteButton} 
            onPress={(e) => {
              e.stopPropagation();
              onFavoritePress();
            }}
          >
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={20} 
              color={isFavorite ? "#e74c3c" : "#fff"} 
            />
          </TouchableOpacity>
        )}
      </View>
      {brand && <Text style={[styles.brand, { color: colors.text }]} numberOfLines={1}>{brand}</Text>}
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{title}</Text>
      <Text style={styles.details} numberOfLines={1}>
        {size ? size + ' · ' : ''}{condition}
      </Text>
      <View style={styles.priceRow}>
        <Text style={[styles.price, { color: colors.text }]}>{price} €</Text>
        {priceWithFees && <Text style={styles.priceWithFees}>{priceWithFees} € incl.</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: '#181A20',
    borderRadius: 16,
    overflow: 'hidden',
    minWidth: 160,
    maxWidth: '48%',
    elevation: 2,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 4/5,
    backgroundColor: '#222',
  },
  image: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    resizeMode: 'cover',
  },
  proBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#00BFA6',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  proText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  likesBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  likesText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 4,
    fontSize: 13,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
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
    color: '#aaa',
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
    color: '#00BFA6',
    fontWeight: 'bold',
    fontSize: 14,
  },
}); 