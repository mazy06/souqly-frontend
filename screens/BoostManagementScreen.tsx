import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
  SafeAreaView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

// Type pour la navigation
type ProfileStackParamList = {
  ProfileMain: undefined;
  BoostManagement: undefined;
};

interface BoostProduct {
  id: string;
  title: string;
  price: number;
  boostType: 'premium' | 'urgent' | 'featured';
  status: 'active' | 'pending' | 'expired';
  startDate: string;
  endDate: string;
  views: number;
  clicks: number;
  ctr: number;
}

const BoostManagementScreen = () => {
  const navigation = useNavigation<StackNavigationProp<ProfileStackParamList>>();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [boostProducts, setBoostProducts] = useState<BoostProduct[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'expired'>('all');

  useEffect(() => {
    loadBoostProducts();
  }, []);

  const loadBoostProducts = async () => {
    setLoading(true);
    try {
      // Simulation de données de boosts
      const mockData: BoostProduct[] = [
        {
          id: '1',
          title: 'iPhone 13 Pro Max',
          price: 899,
          boostType: 'premium',
          status: 'active',
          startDate: '2024-01-15',
          endDate: '2024-02-15',
          views: 1250,
          clicks: 89,
          ctr: 7.1
        },
        {
          id: '2',
          title: 'MacBook Air M2',
          price: 1299,
          boostType: 'urgent',
          status: 'active',
          startDate: '2024-01-20',
          endDate: '2024-01-27',
          views: 890,
          clicks: 67,
          ctr: 7.5
        },
        {
          id: '3',
          title: 'AirPods Pro',
          price: 249,
          boostType: 'featured',
          status: 'pending',
          startDate: '2024-02-01',
          endDate: '2024-03-01',
          views: 0,
          clicks: 0,
          ctr: 0
        },
        {
          id: '4',
          title: 'iPad Air',
          price: 599,
          boostType: 'premium',
          status: 'expired',
          startDate: '2023-12-01',
          endDate: '2024-01-01',
          views: 2100,
          clicks: 156,
          ctr: 7.4
        }
      ];
      
      setBoostProducts(mockData);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les boosts');
    } finally {
      setLoading(false);
    }
  };

  const getBoostTypeColor = (type: string) => {
    switch (type) {
      case 'premium': return '#FFD700';
      case 'urgent': return '#FF6B6B';
      case 'featured': return '#4ECDC4';
      default: return colors.primary;
    }
  };

  const getBoostTypeLabel = (type: string) => {
    switch (type) {
      case 'premium': return 'Premium';
      case 'urgent': return 'Urgent';
      case 'featured': return 'En Vedette';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'expired': return '#F44336';
      default: return colors.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'pending': return 'En attente';
      case 'expired': return 'Expiré';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('fr-FR')} €`;
  };

  const filteredProducts = boostProducts.filter(product => {
    if (filter === 'all') return true;
    return product.status === filter;
  });

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Chargement des boosts...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Gestion des Boosts
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Overview */}
        <View style={styles.statsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Vue d'ensemble
          </Text>
          
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <Ionicons name="rocket-outline" size={24} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.text }]}>
                {boostProducts.filter(p => p.status === 'active').length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Boosts actifs
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <Ionicons name="eye-outline" size={24} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.text }]}>
                {boostProducts.reduce((sum, p) => sum + p.views, 0).toLocaleString()}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Vues totales
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <Ionicons name="trending-up-outline" size={24} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.text }]}>
                {boostProducts.reduce((sum, p) => sum + p.clicks, 0).toLocaleString()}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Clics totaux
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <Ionicons name="analytics-outline" size={24} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.text }]}>
                {(boostProducts.reduce((sum, p) => sum + p.ctr, 0) / boostProducts.length).toFixed(1)}%
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                CTR moyen
              </Text>
            </View>
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filtersSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Filtres
          </Text>
          
          <View style={[styles.filterButtons, { backgroundColor: colors.card }]}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                filter === 'all' && { backgroundColor: colors.primary }
              ]}
              onPress={() => setFilter('all')}
            >
              <Text style={[
                styles.filterButtonText,
                { color: filter === 'all' ? 'white' : colors.text }
              ]}>
                Tous
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterButton,
                filter === 'active' && { backgroundColor: colors.primary }
              ]}
              onPress={() => setFilter('active')}
            >
              <Text style={[
                styles.filterButtonText,
                { color: filter === 'active' ? 'white' : colors.text }
              ]}>
                Actifs
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterButton,
                filter === 'pending' && { backgroundColor: colors.primary }
              ]}
              onPress={() => setFilter('pending')}
            >
              <Text style={[
                styles.filterButtonText,
                { color: filter === 'pending' ? 'white' : colors.text }
              ]}>
                En attente
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterButton,
                filter === 'expired' && { backgroundColor: colors.primary }
              ]}
              onPress={() => setFilter('expired')}
            >
              <Text style={[
                styles.filterButtonText,
                { color: filter === 'expired' ? 'white' : colors.text }
              ]}>
                Expirés
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Boost Products List */}
        <View style={styles.productsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Produits boostés ({filteredProducts.length})
          </Text>
          
          {filteredProducts.map((product) => (
            <View key={product.id} style={[styles.productCard, { backgroundColor: colors.card }]}>
              <View style={styles.productHeader}>
                <View style={styles.productInfo}>
                  <Text style={[styles.productTitle, { color: colors.text }]}>
                    {product.title}
                  </Text>
                  <Text style={[styles.productPrice, { color: colors.primary }]}>
                    {formatCurrency(product.price)}
                  </Text>
                </View>
                
                <View style={styles.productBadges}>
                  <View style={[
                    styles.boostTypeBadge,
                    { backgroundColor: getBoostTypeColor(product.boostType) }
                  ]}>
                    <Text style={styles.boostTypeText}>
                      {getBoostTypeLabel(product.boostType)}
                    </Text>
                  </View>
                  
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(product.status) }
                  ]}>
                    <Text style={styles.statusText}>
                      {getStatusLabel(product.status)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.productStats}>
                <View style={styles.statItem}>
                  <Ionicons name="eye-outline" size={16} color={colors.textSecondary} />
                  <Text style={[styles.statText, { color: colors.textSecondary }]}>
                    {product.views.toLocaleString()} vues
                  </Text>
                </View>
                
                <View style={styles.statItem}>
                  <Ionicons name="hand-left-outline" size={16} color={colors.textSecondary} />
                  <Text style={[styles.statText, { color: colors.textSecondary }]}>
                    {product.clicks.toLocaleString()} clics
                  </Text>
                </View>
                
                <View style={styles.statItem}>
                  <Ionicons name="trending-up-outline" size={16} color={colors.textSecondary} />
                  <Text style={[styles.statText, { color: colors.textSecondary }]}>
                    {product.ctr.toFixed(1)}% CTR
                  </Text>
                </View>
              </View>

              <View style={styles.productDates}>
                <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                  Du {formatDate(product.startDate)} au {formatDate(product.endDate)}
                </Text>
              </View>

              <View style={styles.productActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="create-outline" size={16} color={colors.primary} />
                  <Text style={[styles.actionText, { color: colors.primary }]}>
                    Modifier
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="analytics-outline" size={16} color={colors.primary} />
                  <Text style={[styles.actionText, { color: colors.primary }]}>
                    Détails
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="stop-circle-outline" size={16} color="#FF6B6B" />
                  <Text style={[styles.actionText, { color: '#FF6B6B' }]}>
                    Arrêter
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40, // Placeholder for the right side of the header
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    marginTop: 10,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  statCard: {
    width: '48%', // Two columns
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  filtersSection: {
    marginBottom: 20,
  },
  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderRadius: 12,
    padding: 5,
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  productsSection: {
    marginTop: 10,
  },
  productCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
  },
  productBadges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  boostTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  boostTypeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  productStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    marginLeft: 5,
  },
  productDates: {
    marginBottom: 12,
  },
  dateText: {
    fontSize: 12,
  },
  productActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  actionText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default BoostManagementScreen; 