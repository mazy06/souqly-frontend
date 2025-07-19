import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import ApiService from '../services/ApiService';
import { useAuth } from '../contexts/AuthContext';
import WalletService, { WalletOperation } from '../services/WalletService';
import { formatAmount } from '../utils/formatters';
import { ProfileStackParamList } from '../types/navigation';
import { StackNavigationProp } from '@react-navigation/stack';

type OperationType = 'all' | 'earnings' | 'expenses' | 'transfers';

// Utiliser l'interface WalletOperation du service

export default function WalletScreen() {
  const navigation = useNavigation<StackNavigationProp<ProfileStackParamList>>();
  const { colors } = useTheme();
  const { user } = useAuth();
  
  const [balance, setBalance] = useState(0);
  const [upcomingAmount, setUpcomingAmount] = useState(0);
  const [activeFilter, setActiveFilter] = useState<OperationType>('all');
  const [operations, setOperations] = useState<WalletOperation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      if (user?.id) {
        const balanceData = await WalletService.getBalance(user.id);
        setBalance(balanceData.balance);
        setUpcomingAmount(balanceData.upcomingAmount);
        
        const operationsData = await WalletService.getOperations(user.id);
        setOperations(operationsData);
      }
    } catch (error) {
      console.log('⚠️ Utilisation des données par défaut pour la démo');
      setBalance(200.50);
      setUpcomingAmount(50.00);
      setOperations([]);
    } finally {
      setLoading(false);
    }
  };

  const formatBalance = (amount: number) => {
    return formatAmount(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getOperationIcon = (type: string) => {
    switch (type) {
      case 'earning':
        return 'trending-up';
      case 'expense':
        return 'trending-down';
      case 'transfer':
        return 'swap-horizontal';
      default:
        return 'help-circle';
    }
  };

  const getOperationColor = (type: string) => {
    switch (type) {
      case 'earning':
        return '#4CAF50';
      case 'expense':
        return '#F44336';
      case 'transfer':
        return '#2196F3';
      default:
        return colors.textSecondary;
    }
  };

  const getFilteredOperations = () => {
    if (activeFilter === 'all') return operations;
    return operations.filter(op => {
      switch (activeFilter) {
        case 'earnings':
          return op.type === 'earning';
        case 'expenses':
          return op.type === 'expense';
        case 'transfers':
          return op.type === 'transfer';
        default:
          return true;
      }
    });
  };

  const handleFilterChange = async (filter: OperationType) => {
    setActiveFilter(filter);
    if (user?.id) {
      try {
        const operationsData = await WalletService.getOperations(user.id, filter);
        setOperations(operationsData);
      } catch (error) {
        console.error('Erreur lors du changement de filtre:', error);
      }
    }
  };

  const renderOperation = ({ item }: { item: WalletOperation }) => (
    <View style={[styles.operationItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.operationLeft}>
        <View style={[styles.operationIcon, { backgroundColor: getOperationColor(item.type) + '20' }]}>
          <Ionicons name={getOperationIcon(item.type) as any} size={20} color={getOperationColor(item.type)} />
        </View>
        <View style={styles.operationInfo}>
          <Text style={[styles.operationDescription, { color: colors.text }]}>
            {item.description}
          </Text>
          <Text style={[styles.operationDate, { color: colors.textSecondary }]}>
            {formatDate(item.date)}
          </Text>
        </View>
      </View>
      <View style={styles.operationRight}>
        <Text style={[
          styles.operationAmount,
          { color: item.type === 'earning' ? '#4CAF50' : '#F44336' }
        ]}>
          {item.type === 'earning' ? '+' : '-'}{formatAmount(item.amount)}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'completed' ? '#4CAF50' : '#FF9800' }]}>
          <Text style={styles.statusText}>
            {item.status === 'completed' ? 'Terminé' : 'En attente'}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIllustration}>
        <Ionicons name="wallet-outline" size={80} color={colors.textSecondary} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        Vide... pour le moment !
      </Text>
      <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
        Recevez vos paiements et faites vos achats directement avec votre porte-monnaie. C'est simple, rapide et sécurisé !
      </Text>
    </View>
  );

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
          Mon porte-monnaie
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <View style={[styles.balanceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.balanceLeft}>
            <View style={[styles.balanceIcon, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="wallet-outline" size={32} color={colors.primary} />
            </View>
            <View style={styles.balanceInfo}>
              <Text style={[styles.balanceAmount, { color: colors.text }]}>
                {formatBalance(balance)}
              </Text>
              <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>
                Solde disponible
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={[styles.transferButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('TransferSelection')}
          >
            <Text style={styles.transferButtonText}>Transférer</Text>
          </TouchableOpacity>
        </View>

        {/* Operations Section */}
        <View style={styles.operationsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Liste des opérations
          </Text>

          {/* Filter Buttons */}
          <View style={styles.filterContainer}>
            {[
              { key: 'all', label: 'Tout' },
              { key: 'earnings', label: 'Gains' },
              { key: 'expenses', label: 'Dépenses' },
              { key: 'transfers', label: 'Transferts' }
            ].map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterButton,
                  activeFilter === filter.key && { backgroundColor: colors.primary }
                ]}
                onPress={() => handleFilterChange(filter.key as OperationType)}
              >
                <Text style={[
                  styles.filterButtonText,
                  { color: activeFilter === filter.key ? 'white' : colors.text }
                ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Upcoming Amount */}
          <View style={[styles.upcomingContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.upcomingLeft}>
              <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.upcomingLabel, { color: colors.textSecondary }]}>
                Montant à venir
              </Text>
            </View>
            <Text style={[styles.upcomingAmount, { color: colors.text }]}>
              {formatBalance(upcomingAmount)} €
            </Text>
          </View>
        </View>

        {/* Operations List */}
        {getFilteredOperations().length > 0 ? (
          <FlatList
            data={getFilteredOperations()}
            renderItem={renderOperation}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            style={styles.operationsList}
          />
        ) : (
          renderEmptyState()
        )}
      </ScrollView>
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
  content: {
    flex: 1,
  },
  balanceCard: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  balanceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  balanceIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  balanceInfo: {
    flex: 1,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  balanceLabel: {
    fontSize: 14,
  },
  transferButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  transferButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  operationsSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  upcomingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  upcomingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upcomingLabel: {
    fontSize: 14,
    marginLeft: 8,
  },
  upcomingAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  operationsList: {
    paddingHorizontal: 16,
  },
  operationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  operationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  operationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  operationInfo: {
    flex: 1,
  },
  operationDescription: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  operationDate: {
    fontSize: 12,
  },
  operationRight: {
    alignItems: 'flex-end',
  },
  operationAmount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIllustration: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
}); 