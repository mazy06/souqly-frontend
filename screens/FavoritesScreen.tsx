import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProductCard from '../components/ProductCard';
import Skeleton from '../components/Skeleton';
import Colors from '../constants/Colors';
import { useColorScheme } from 'react-native';

interface FavoriteProduct {
  id: number;
  title: string;
  brand: string;
  size: string;
  condition: string;
  price: string;
  priceWithFees: string;
  image: string;
  isFavorite: boolean;
}

export default function FavoritesScreen({ navigation }: { navigation: any }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);

  // Mock data for favorites - in a real app this would come from a context or API
  const mockFavorites: FavoriteProduct[] = [
    {
      id: 1,
      title: "Top fleuri rouge",
      brand: "Bershka",
      size: "S / 36 / 8",
      condition: "Très bon état",
      price: "9,90",
      priceWithFees: "11,10",
      image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f",
      isFavorite: true
    },
    {
      id: 4,
      title: "Robe soirée violette",
      brand: "Pro",
      size: "L / 40 / 12",
      condition: "Comme neuf",
      price: "19,00",
      priceWithFees: "21,50",
      image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca",
      isFavorite: true
    },
    {
      id: 7,
      title: "Casque Bluetooth JBL",
      brand: "JBL",
      size: "One Size",
      condition: "Très bon état",
      price: "60,00",
      priceWithFees: "65,00",
      image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308",
      isFavorite: true
    },
  ];

  useEffect(() => {
    // Simulate loading favorites from storage/API
    const timer = setTimeout(() => {
      setFavorites(mockFavorites);
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const removeFromFavorites = (productId: number) => {
    setFavorites(prev => prev.filter(item => item.id !== productId));
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Mes Favoris</Text>
          <Text style={[styles.subtitle, { color: colors.text, opacity: 0.7 }]}>Chargement...</Text>
        </View>
        <View style={styles.skeletonContainer}>
          <View style={styles.skeletonGrid}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <View key={i} style={styles.skeletonCard}>
                <View style={styles.skeletonImageContainer}>
                  <Skeleton width="100%" height={160} borderRadius={16} />
                </View>
                <View style={styles.skeletonContent}>
                  <Skeleton width="70%" height={14} />
                  <Skeleton width="90%" height={16} />
                  <Skeleton width="60%" height={12} />
                  <Skeleton width="50%" height={14} />
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  }

  if (favorites.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={80} color="#e74c3c" style={styles.emptyIcon} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Aucun favori</Text>
          <Text style={[styles.emptySubtitle, { color: colors.text, opacity: 0.7 }]}>
            Vous n'avez pas encore ajouté d'articles à vos favoris
          </Text>
          <TouchableOpacity 
            style={[styles.browseButton, { backgroundColor: colors.button }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.browseButtonText}>Parcourir les articles</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Mes Favoris</Text>
        <Text style={[styles.subtitle, { color: colors.text, opacity: 0.7 }]}>
          {favorites.length} article{favorites.length > 1 ? 's' : ''}
        </Text>
      </View>
      
      <FlatList
        data={favorites}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.gridContent}
        renderItem={({ item, index }) => (
          <ProductCard
            title={item.title}
            brand={item.brand}
            size={item.size}
            condition={item.condition}
            price={item.price}
            priceWithFees={item.priceWithFees}
            image={item.image}
            onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
            likes={index % 3 === 0 ? 13 : index % 3 === 1 ? 7 : 0}
            isPro={index % 4 === 0}
            isFavorite={true}
            onFavoritePress={() => removeFromFavorites(item.id)}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  gridContent: {
    padding: 8,
    paddingBottom: 32,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  browseButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  skeletonContainer: {
    padding: 8,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skeletonCard: {
    width: '50%',
    padding: 8,
  },
  skeletonImageContainer: {
    width: '100%',
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  skeletonContent: {
    padding: 8,
  },
}); 