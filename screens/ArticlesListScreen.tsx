import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, FlatList, Text } from 'react-native';
import ProductCard from '../components/ProductCard';
import PrimaryButton from '../components/PrimaryButton';
import { useAuth } from '../contexts/AuthContext';
import Colors from '../constants/Colors';
import { useColorScheme } from 'react-native';
import VisitorBadge from '../components/VisitorBadge';
import Skeleton from '../components/Skeleton';
import SearchBar from '../components/SearchBar';
import FilterChips from '../components/FilterChips';

function FavoritesScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>Vos articles favoris apparaîtront ici.</Text>
    </View>
  );
}

export default function ArticlesListScreen({ navigation }: { navigation: any }) {
  const { logout, isGuest } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Voir tout');
  const [favorites, setFavorites] = useState<number[]>([]);

  const products = [
    {
      id: 1,
      title: "Top fleuri rouge",
      brand: "Bershka",
      size: "S / 36 / 8",
      condition: "Très bon état",
      price: "9,90",
      priceWithFees: "11,10",
      image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f"
    },
    {
      id: 2,
      title: "Robe blanche imprimée",
      brand: "Luftige Bluse mit Blumen",
      size: "6XL / 52 / 24",
      condition: "Très bon état",
      price: "4,50",
      priceWithFees: "5,43",
      image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308"
    },
    {
      id: 3,
      title: "Robe bleue à pois",
      brand: "Zara",
      size: "M / 38 / 10",
      condition: "Bon état",
      price: "7,00",
      priceWithFees: "8,20",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb"
    },
    {
      id: 4,
      title: "Robe soirée violette",
      brand: "Pro",
      size: "L / 40 / 12",
      condition: "Comme neuf",
      price: "19,00",
      priceWithFees: "21,50",
      image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca"
    },
    {
      id: 5,
      title: "Vase design minimaliste",
      price: "30",
      image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308"
    },
    {
      id: 6,
      title: "Pull en laine beige",
      price: "40",
      image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f"
    },
    {
      id: 7,
      title: "Casque Bluetooth JBL",
      price: "60",
      image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308"
    },
    {
      id: 8,
      title: "Baskets Adidas Originals",
      price: "55",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb"
    },
    {
      id: 9,
      title: "Jouet pour chien en corde",
      price: "10",
      image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca"
    },
    {
      id: 10,
      title: "Lampe de chevet scandinave",
      price: "35",
      image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f"
    },
  ];

  useEffect(() => {
    // Simule un chargement réseau
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const toggleFavorite = (productId: number) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={products}
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
            isFavorite={favorites.includes(item.id)}
            onFavoritePress={() => toggleFavorite(item.id)}
          />
        )}
        ListHeaderComponent={
          <View>
            <VisitorBadge onSignup={() => logout()} />
            <SearchBar 
              value={search} 
              onChangeText={setSearch}
              onPressFavorite={() => navigation.navigate('Favorites')}
            />
            <FilterChips selected={selectedFilter} onSelect={setSelectedFilter} />
            <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 20, margin: 8 }}>Recommandé pour toi</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gridContent: {
    padding: 8,
    paddingBottom: 32,
  },
  skeletonContainer: {
    flex: 1,
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
    marginBottom: 8,
  },
  skeletonContent: {
    paddingHorizontal: 8,
  },
}); 