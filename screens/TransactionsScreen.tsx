import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import ApiService from '../services/ApiService';
import ProductService from '../services/ProductService';

type TabType = 'purchases' | 'sales';

interface Transaction {
  id: number;
  productId: number;
  productTitle: string;
  productImage?: string;
  price: number;
  type: 'purchase' | 'sale';
  status: 'completed' | 'pending' | 'cancelled';
  date: string;
  counterpartName: string;
  counterpartId: number;
}

export default function TransactionsScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<TabType>('purchases');
  const [purchases, setPurchases] = useState<Transaction[]>([]);
  const [sales, setSales] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      if (user?.id) {
        console.log('[TransactionsScreen] Chargement des transactions pour user:', user.id);
        
        // Récupérer les achats
        console.log('[TransactionsScreen] Appel API pour les achats...');
        const purchasesResponse = await ApiService.get(`/transactions/purchases`) as Transaction[];
        console.log('[TransactionsScreen] Achats reçus:', purchasesResponse?.length || 0);
        setPurchases(purchasesResponse || []);
        
        // Récupérer les ventes
        console.log('[TransactionsScreen] Appel API pour les ventes...');
        const salesResponse = await ApiService.get(`/transactions/sales`) as Transaction[];
        console.log('[TransactionsScreen] Ventes reçues:', salesResponse?.length || 0);
        setSales(salesResponse || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des transactions:', error);
      // En cas d'erreur, afficher des listes vides
      setPurchases([]);
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'cancelled':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Terminée';
      case 'pending':
        return 'En cours';
      case 'cancelled':
        return 'Annulée';
      default:
        return 'Inconnue';
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TouchableOpacity
      style={[styles.transactionItem, { borderColor: colors.border }]}
      onPress={() => (navigation as any).navigate('ProductDetail', { productId: item.productId.toString() })}
    >
      <View style={styles.transactionLeft}>
        <Image
          source={
            item.productImage
              ? { uri: item.productImage }
              : require('../assets/images/icon.png')
          }
          style={styles.transactionImage}
          resizeMode="cover"
        />
        <View style={styles.transactionInfo}>
          <Text style={[styles.transactionTitle, { color: colors.text }]} numberOfLines={2}>
            {item.productTitle}
          </Text>
          <Text style={[styles.transactionPrice, { color: colors.primary }]}>
            {item.price} €
          </Text>
          <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>
            {formatDate(item.date)}
          </Text>
          <Text style={[styles.counterpartName, { color: colors.textSecondary }]}>
            {item.type === 'purchase' ? 'Vendeur' : 'Acheteur'}: {item.counterpartName}
          </Text>
        </View>
      </View>
      <View style={styles.transactionRight}>
        <View style={[styles.statusBadge, { 
          backgroundColor: getStatusColor(item.status)
        }]}>
          <Text style={styles.statusText}>
            {getStatusText(item.status)}
          </Text>
        </View>
        <View style={styles.typeBadge}>
          <Ionicons 
            name={item.type === 'purchase' ? 'arrow-down-outline' : 'arrow-up-outline'} 
            size={16} 
            color={item.type === 'purchase' ? '#4CAF50' : '#FF9800'} 
          />
          <Text style={[styles.typeText, { 
            color: item.type === 'purchase' ? '#4CAF50' : '#FF9800' 
          }]}>
            {item.type === 'purchase' ? 'Achat' : 'Vente'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = (type: TabType) => (
    <View style={styles.emptyContainer}>
      <Ionicons 
        name={type === 'purchases' ? 'bag-outline' : 'cart-outline'} 
        size={64} 
        color={colors.textSecondary} 
      />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        {type === 'purchases' ? 'Aucun achat' : 'Aucune vente'}
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        {type === 'purchases' 
          ? 'Vos achats apparaîtront ici'
          : 'Vos ventes apparaîtront ici'
        }
      </Text>
    </View>
  );

  const getCurrentTransactions = () => {
    return activeTab === 'purchases' ? purchases : sales;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Transactions
        </Text>
        <View style={styles.headerRight} />
      </View>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'purchases' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }
          ]}
          onPress={() => setActiveTab('purchases')}
        >
          <Text style={[
            styles.tabText,
            { color: activeTab === 'purchases' ? colors.primary : colors.textSecondary }
          ]}>
            Achats ({purchases.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'sales' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }
          ]}
          onPress={() => setActiveTab('sales')}
        >
          <Text style={[
            styles.tabText,
            { color: activeTab === 'sales' ? colors.primary : colors.textSecondary }
          ]}>
            Ventes ({sales.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <FlatList
        data={getCurrentTransactions()}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => renderEmptyState(activeTab)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerRight: {
    width: 40,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginHorizontal: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    marginBottom: 2,
  },
  counterpartName: {
    fontSize: 12,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '500',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
}); 