import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import ProductService, { Product } from '../services/ProductService';
import { useFavorites } from '../hooks/useFavorites';
import GuestMessage from '../components/GuestMessage';
import SectionHeader from '../components/SectionHeader';
import { SafeAreaView } from 'react-native-safe-area-context';


// Types pour la navigation
export type FavoritesStackParamList = {
  FavoritesMain: undefined;
  ProductDetail: { productId: string };
};

export default function FavoritesScreen() {
  const navigation = useNavigation<StackNavigationProp<FavoritesStackParamList>>();
  const { isAuthenticated, isGuest, logout } = useAuth();
  const { colors } = useTheme();
  const { isFavorite, toggleFavorite, refreshFavorites } = useFavorites();
  
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [imageUrls, setImageUrls] = useState<{[key: number]: string}>({});

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const favoritesList = await ProductService.getFavorites();
      setFavorites(favoritesList);
      
      // Charger les URLs des images pour chaque produit
      const urls: {[key: number]: string} = {};
      for (const product of favoritesList) {
        try {
          const imageUrl = await ProductService.getProductImageUrl(product);
          if (imageUrl) {
            urls[product.id] = imageUrl;
          }
        } catch (error) {
          // Erreur silencieuse pour le chargement d'image
        }
      }
      setImageUrls(urls);
    } catch (error) {
      console.error('[FavoritesScreen] Erreur lors du chargement des favoris:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  };

  // Ajout : si invité, ne pas charger les favoris
  useEffect(() => {
    if (isGuest) {
      setFavorites([]);
      setLoading(false);
      return;
    }
    if (isAuthenticated) {
      loadFavorites();
    }
  }, [isAuthenticated, isGuest]);

  useFocusEffect(
    useCallback(() => {
      if (!isGuest) {
        loadFavorites();
        refreshFavorites();
      }
    }, [isGuest])
  );

  const handleProductPress = (productId: number) => {
    navigation.navigate('ProductDetail', { productId: productId.toString() });
  };

  const handleFavoritePress = async (productId: number) => {
    try {
      const result = await ProductService.toggleFavorite(productId);
      // Retirer le produit de la liste des favoris
      setFavorites(prev => prev.filter(product => product.id !== productId));
    } catch (error) {
      console.error('[FavoritesScreen] Erreur lors du toggle des favoris:', error);
    }
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <ProductCard
      title={item.title}
      brand={item.brand}
      size={item.size}
      condition={item.condition}
      price={item.price.toString()}
      priceWithFees={item.priceWithFees?.toString()}
      image={imageUrls[item.id] || 'https://via.placeholder.com/120'}
      onPress={() => handleProductPress(item.id)}
      likes={item.favoriteCount}
      isFavorite={true}
      onFavoritePress={() => handleFavoritePress(item.id)}
    />
  );

  // Si l'utilisateur n'est pas connecté, afficher un message d'authentification
  if (!isAuthenticated && !isGuest) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.authContainer}>
          <Ionicons name="heart-outline" size={80} color={colors.primary} style={styles.authIcon} />
          <Text style={[styles.authTitle, { color: colors.text }]}>
            Vos favoris
          </Text>
          <Text style={[styles.authSubtitle, { color: colors.text }]}>
            Connectez-vous pour voir et gérer vos articles favoris
          </Text>
          
          <TouchableOpacity
            style={[styles.authButton, { backgroundColor: colors.primary }]}
            onPress={() => (navigation as any).navigate('Auth')}
          >
            <Text style={styles.authButtonText}>Se connecter</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.authButtonOutline, { borderColor: colors.primary }]}
            onPress={() => (navigation as any).navigate('Login')}
          >
            <Text style={[styles.authButtonTextOutline, { color: colors.primary }]}>
              J'ai déjà un compte
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Chargement de vos favoris...
          </Text>
        </View>
      </View>
    );
  }

  // Affichage principal (header toujours visible)
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background, flex: 1 }]} edges={['top','left','right']}> 
      {isGuest ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <GuestMessage
            iconName="heart-outline"
            iconColor={colors.primary}
            title="Connectez-vous pour accéder à vos favoris"
            color={colors.primary}
            textColor={colors.text}
            backgroundColor={colors.background}
            onPress={() => logout()}
          />
        </View>
      ) : (
        // ... FlatList des favoris comme avant
        <FlatList
          data={favorites}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.gridContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={renderProduct}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="heart-outline" size={64} color={colors.tabIconDefault} />
              <Text style={[styles.emptyText, { color: colors.text }]}>Aucun favori pour le moment</Text>
              <Text style={[styles.emptySubtext, { color: colors.tabIconDefault }]}>Ajoutez des articles à vos favoris pour les retrouver ici</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  authIcon: {
    marginBottom: 20,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  authSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  authButton: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  authButtonOutline: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  authButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  authButtonTextOutline: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
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
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
}); 