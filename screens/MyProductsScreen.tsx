import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  RefreshControl,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import ProductService, { Product } from '../services/ProductService';

export default function MyProductsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMyProducts = async () => {
    try {
      const myProducts = await ProductService.getMyProducts();
      setProducts(myProducts);
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de charger vos produits');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMyProducts();
    setRefreshing(false);
  };

  const toggleProductStatus = async (productId: number) => {
    try {
      const updatedProduct = await ProductService.toggleProductStatus(productId);
      setProducts(prev => 
        prev.map(p => p.id === productId ? updatedProduct : p)
      );
      Alert.alert(
        'Succès', 
        `Produit ${updatedProduct.status === 'ACTIVE' ? 'activé' : 'désactivé'} avec succès`
      );
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de modifier le statut du produit');
    }
  };

  useEffect(() => {
    loadMyProducts();
  }, []);

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={[styles.productCard, { backgroundColor: colors.card }]}>
      <View style={styles.productInfo}>
        <Text style={[styles.productTitle, { color: colors.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[styles.productPrice, { color: colors.primary }]}>
          {item.price} €
        </Text>
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: item.status === 'ACTIVE' ? '#4CAF50' : '#FF9800' }
          ]}>
            <Text style={styles.statusText}>
              {item.status === 'ACTIVE' ? 'Actif' : 'Inactif'}
            </Text>
          </View>
        </View>
      </View>
      
      <TouchableOpacity 
        style={[
          styles.toggleButton, 
          { backgroundColor: item.status === 'ACTIVE' ? '#FF9800' : '#4CAF50' }
        ]}
        onPress={() => toggleProductStatus(item.id)}
      >
        <Ionicons 
          name={item.status === 'ACTIVE' ? 'eye-off' : 'eye'} 
          size={20} 
          color="white" 
        />
        <Text style={styles.toggleButtonText}>
          {item.status === 'ACTIVE' ? 'Désactiver' : 'Activer'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Chargement de vos produits...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Mes Produits</Text>
      
      <FlatList
        data={products}
        keyExtractor={item => item.id.toString()}
        renderItem={renderProduct}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="bag-outline" size={64} color={colors.tabIconDefault} />
            <Text style={[styles.emptyText, { color: colors.text }]}>
              Vous n'avez pas encore de produits
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.tabIconDefault }]}>
              Créez votre premier produit dans l'onglet "Vendre"
            </Text>
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
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  productCard: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    } : {
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    }),
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusContainer: {
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 12,
  },
  toggleButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
}); 