import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = screenWidth * 0.4;

interface SimilarProduct {
  id: number;
  title: string;
  price: number;
  imageUrl: string;
  isFavorite?: boolean;
}

interface ProductSimilarCarouselProps {
  products: SimilarProduct[];
  onProductPress: (productId: number) => void;
  onFavoritePress?: (productId: number) => void;
}

export default function ProductSimilarCarousel({
  products,
  onProductPress,
  onFavoritePress,
}: ProductSimilarCarouselProps) {
  if (products.length === 0) {
    return null;
  }

  const renderProduct = ({ item }: { item: SimilarProduct }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => onProductPress(item.id)}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.productImage}
          resizeMode="cover"
        />
        {onFavoritePress && (
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => onFavoritePress(item.id)}
          >
            <Ionicons
              name={item.isFavorite ? "heart" : "heart-outline"}
              size={20}
              color={item.isFavorite ? "#ff4757" : "#fff"}
            />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.productPrice}>
          {item.price.toFixed(2)} €
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Articles similaires</Text>
        <TouchableOpacity style={styles.seeAllButton}>
          <Text style={styles.seeAllText}>Voir tout</Text>
          <Ionicons name="chevron-forward" size={16} color="#008080" />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
        nestedScrollEnabled={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingVertical: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    color: '#008080',
    fontSize: 16,
    fontWeight: '500',
    marginRight: 4,
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  productCard: {
    width: cardWidth,
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: cardWidth,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    padding: 12,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
    lineHeight: 18,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
}); 