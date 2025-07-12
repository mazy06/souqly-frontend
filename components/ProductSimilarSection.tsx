import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SimilarProduct {
  id: number;
  title: string;
  price: number;
  imageUrl: string;
  isFavorite: boolean;
}

interface ProductSimilarSectionProps {
  products?: SimilarProduct[];
  onProductPress: (productId: number) => void;
  onFavoritePress: (productId: number) => void;
}

export default function ProductSimilarSection({ 
  products, 
  onProductPress, 
  onFavoritePress 
}: ProductSimilarSectionProps) {
  // Données mockées pour les produits similaires
  const mockProducts: SimilarProduct[] = [
    {
      id: 1,
      title: "iPhone 14 Pro Max - 256GB - État neuf",
      price: 4500,
      imageUrl: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=300&fit=crop",
      isFavorite: false,
    },
    {
      id: 2,
      title: "Samsung Galaxy S23 Ultra - 512GB - Excellent état",
      price: 3800,
      imageUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=300&h=300&fit=crop",
      isFavorite: true,
    },
    {
      id: 3,
      title: "MacBook Pro M2 - 16 pouces - 512GB SSD",
      price: 8500,
      imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop",
      isFavorite: false,
    },
    {
      id: 4,
      title: "iPad Pro 12.9 - 2023 - 256GB - WiFi + Cellular",
      price: 4200,
      imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&h=300&fit=crop",
      isFavorite: false,
    },
    {
      id: 5,
      title: "AirPods Pro 2ème génération - Neufs",
      price: 1200,
      imageUrl: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=300&h=300&fit=crop",
      isFavorite: true,
    },
    {
      id: 6,
      title: "Apple Watch Series 8 - GPS + Cellular - 45mm",
      price: 1800,
      imageUrl: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=300&h=300&fit=crop",
      isFavorite: false,
    },
  ];

  // Utiliser les données mockées si aucune donnée n'est fournie
  const displayProducts = products && products.length > 0 ? products : mockProducts;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Produits similaires</Text>
        <TouchableOpacity style={styles.seeAllButton}>
          <Text style={styles.seeAllText}>Voir tout</Text>
          <Ionicons name="chevron-forward" size={16} color="#008080" />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.productsContainer}
      >
        {displayProducts.map((product) => (
          <TouchableOpacity
            key={product.id}
            style={styles.productCard}
            onPress={() => onProductPress(product.id)}
          >
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: product.imageUrl }}
                style={styles.productImage}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.favoriteButton}
                onPress={() => onFavoritePress(product.id)}
              >
                <Ionicons
                  name={product.isFavorite ? "heart" : "heart-outline"}
                  size={20}
                  color={product.isFavorite ? "#ff4757" : "#fff"}
                />
              </TouchableOpacity>
            </View>
            
            <View style={styles.productInfo}>
              <Text style={styles.productTitle} numberOfLines={2}>
                {product.title}
              </Text>
              <Text style={styles.productPrice}>
                {product.price.toLocaleString('fr-FR')} SAR
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
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
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  productsContainer: {
    paddingHorizontal: 16,
  },
  productCard: {
    width: 160,
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 120,
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 4,
  },
  productInfo: {
    padding: 12,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
    lineHeight: 18,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#008080',
  },
}); 