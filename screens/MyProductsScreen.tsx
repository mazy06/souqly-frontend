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
import { Ionicons } from '@expo/vector-icons';
import ProductService, { Product } from '../services/ProductService';
import { useNavigation } from '@react-navigation/native';
import CustomHeader from '../components/CustomHeader';
import { useTheme } from '../contexts/ThemeContext';

export default function MyProductsScreen() {
  const { colors } = useTheme();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

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

  const handleDeleteProduct = (productId: number) => {
    Alert.alert(
      'Supprimer le produit',
      'Es-tu sûr de vouloir supprimer ce produit ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer', style: 'destructive',
          onPress: async () => {
            try {
              await ProductService.deleteProduct(productId);
              setProducts(prev => prev.filter(p => p.id !== productId));
              Alert.alert('Succès', 'Produit supprimé avec succès');
            } catch (err) {
              Alert.alert('Erreur', 'Impossible de supprimer le produit');
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    loadMyProducts();
  }, []);

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={[styles.productCard, { backgroundColor: colors.card }]}
      // @ts-ignore
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
      activeOpacity={0.85}
    >
      <View style={styles.productInfo}>
        <Text style={[styles.productTitle, { color: colors.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[styles.productPrice, { color: colors.primary }]}>
          {item.price} €
        </Text>
        {item.seller && (
          <View style={styles.ownerBlock}>
            <Text style={styles.ownerLabel}>Propriétaire :</Text>
            <Text style={styles.ownerName}>{item.seller.firstName} {item.seller.lastName}</Text>
            {item.seller.email && <Text style={styles.ownerEmail}>{item.seller.email}</Text>}
          </View>
        )}
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: item.status === 'ACTIVE' ? colors.primary : '#FF9800' }
          ]}>
            <Text style={styles.statusText}>
              {item.status === 'ACTIVE' ? 'Actif' : 'Inactif'}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.actionsCol}>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: colors.primary }]}
          // @ts-ignore
          onPress={() => navigation.navigate('ProductEdit', { productId: item.id })}
        >
          <Ionicons name="create-outline" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: colors.danger || '#e74c3c' }]}
          onPress={() => handleDeleteProduct(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.iconButton,
            { backgroundColor: item.status === 'ACTIVE' ? '#FF9800' : colors.primary }
          ]}
          onPress={() => toggleProductStatus(item.id)}
        >
          <Ionicons
            name={item.status === 'ACTIVE' ? 'eye-off' : 'eye'}
            size={20}
            color="#fff"
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
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
      <CustomHeader title="Mes produits" onBack={() => navigation.goBack()} />
      <Text style={[styles.title, { color: colors.text, marginTop: 60 }]}>Mes Produits</Text>
      
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
  ownerBlock: {
    marginTop: 4,
    marginBottom: 4,
  },
  ownerLabel: {
    fontSize: 12,
    color: '#888',
  },
  ownerName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  ownerEmail: {
    fontSize: 12,
    color: '#666',
  },
  actionsCol: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
}); 