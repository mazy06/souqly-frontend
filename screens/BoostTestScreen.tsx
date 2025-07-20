import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import ProductCard from '../components/ProductCard';
import RecommendationSection from '../components/RecommendationSection';
import { formatAmount } from '../utils/formatters';
import { getImageUrl } from '../constants/Config';
import ProductService from '../services/ProductService';
import RecommendationService from '../services/RecommendationService';

interface TestProduct {
  id: number;
  title: string;
  brand?: string;
  size?: string;
  condition: string;
  price: number;
  priceWithFees?: number;
  favoriteCount: number;
  status: string;
  isBoosted?: boolean;
  boostLevel?: number;
  images?: Array<{ id: number }>;
}

export default function BoostTestScreen() {
  const { colors } = useTheme();
  const [products, setProducts] = useState<TestProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'recommendations'>('products');

  useEffect(() => {
    loadTestData();
  }, []);

  const loadTestData = async () => {
    try {
      setLoading(true);
      
      // Charger les produits avec boost
      const productsResponse = await ProductService.getProducts({ pageSize: 10 });
      
      if (productsResponse && productsResponse.content) {
        setProducts(productsResponse.content as TestProduct[]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données de test:', error);
      Alert.alert('Erreur', 'Impossible de charger les données de test');
    } finally {
      setLoading(false);
    }
  };

  const handleProductPress = (productId: number) => {
    Alert.alert('Produit sélectionné', `ID: ${productId}`);
  };

  const handleFavoritePress = (productId: number) => {
    Alert.alert('Favori', `Ajouté aux favoris: ${productId}`);
  };

  const renderProductCard = (product: TestProduct) => (
    <View key={product.id} style={styles.productCard}>
      <ProductCard
        title={product.title}
        brand={product.brand}
        size={product.size}
        condition={product.condition}
        price={formatAmount(product.price)}
        priceWithFees={product.priceWithFees ? formatAmount(product.priceWithFees) : undefined}
        image={product.images && product.images.length > 0 ? getImageUrl(product.images[0].id) : null}
        likes={product.favoriteCount}
        isFavorite={false}
        onPress={() => handleProductPress(product.id)}
        onFavoritePress={() => handleFavoritePress(product.id)}
        status={product.status}
        productId={product.id}
        isBoosted={product.isBoosted}
        boostLevel={product.boostLevel}
      />
    </View>
  );

  const renderTabButton = (title: string, tab: 'products' | 'recommendations') => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        { backgroundColor: activeTab === tab ? colors.primary : colors.card }
      ]}
      onPress={() => setActiveTab(tab)}
    >
      <Text style={[
        styles.tabButtonText,
        { color: activeTab === tab ? '#fff' : colors.text }
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderStats = () => {
    const boostedProducts = products.filter(p => p.isBoosted);
    const totalProducts = products.length;
    
    return (
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>{totalProducts}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#FF9800' }]}>{boostedProducts.length}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Boostés</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>
            {totalProducts > 0 ? Math.round((boostedProducts.length / totalProducts) * 100) : 0}%
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Taux</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Ionicons name="refresh" size={32} color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Chargement des données de test...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Test des Fonctionnalités Boost
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Démonstration des badges de boost
        </Text>
      </View>

      {/* Stats */}
      {renderStats()}

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {renderTabButton('Produits', 'products')}
        {renderTabButton('Recommandations', 'recommendations')}
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'products' ? (
          <View style={styles.productsGrid}>
            {products.map(renderProductCard)}
          </View>
        ) : (
          <RecommendationSection
            title="Recommandations Boostées"
            subtitle="Produits recommandés avec boost"
            limit={8}
            showBoostedBadge={true}
            showMetrics={true}
            onProductPress={handleProductPress}
            onFavoritePress={handleFavoritePress}
          />
        )}
      </ScrollView>

      {/* Refresh Button */}
      <TouchableOpacity
        style={[styles.refreshButton, { backgroundColor: colors.primary }]}
        onPress={loadTestData}
      >
        <Ionicons name="refresh" size={20} color="#fff" />
        <Text style={styles.refreshButtonText}>Actualiser</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 12,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    margin: 16,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 