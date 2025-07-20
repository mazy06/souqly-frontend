import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Modal,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import ReportService, { Report } from '../services/ReportService';
import ProductService from '../services/ProductService';
import { CommonActions } from '@react-navigation/native';
import FilterChips, { FilterOption } from '../components/FilterChips';

type ProfileStackParamList = {
  ProfileMain: undefined;
  ProductModeration: undefined;
};

interface ProductWithReports {
  id: string;
  title: string;
  description: string;
  price: number;
  seller: {
    name: string;
    email: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  category: string;
  images: string[];
  createdAt: string;
  reportCount: number;
  reportReasons: string[];
  reports?: Report[];
  // Nouvelles propriétés pour les statistiques
  uniqueReporters: number;
  totalReports: number;
  reportStats: {
    byUser: { [userId: number]: number };
    byReason: { [reason: string]: number };
  };
}

const ProductModerationScreen = () => {
  const navigation = useNavigation<StackNavigationProp<ProfileStackParamList>>();
  const { colors } = useTheme();
  
  const [products, setProducts] = useState<ProductWithReports[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'flagged'>('all');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      // Récupérer tous les signalements
      const reports = await ReportService.getAllReports();
      
      // Grouper les signalements par produit
      const productReportsMap = new Map<number, Report[]>();
      reports.forEach(report => {
        if (!productReportsMap.has(report.productId)) {
          productReportsMap.set(report.productId, []);
        }
        productReportsMap.get(report.productId)!.push(report);
      });

      // Créer les produits avec leurs signalements
      const productsWithReports: ProductWithReports[] = Array.from(productReportsMap.entries()).map(([productId, reports]) => {
        const firstReport = reports[0];
        const product = firstReport.product;
        
        // Calculer les statistiques des signalements
        const uniqueUserIds = new Set(reports.map(r => r.userId));
        const byUser: { [userId: number]: number } = {};
        const byReason: { [reason: string]: number } = {};
        
        reports.forEach(report => {
          // Compter par utilisateur
          byUser[report.userId] = (byUser[report.userId] || 0) + 1;
          
          // Compter par raison
          report.reasons.forEach(reason => {
            byReason[reason] = (byReason[reason] || 0) + 1;
          });
        });
        
        if (!product) {
          // Fallback si les données du produit ne sont pas disponibles
          return {
            id: productId.toString(),
            title: `Produit #${productId}`,
            description: 'Description non disponible',
            price: 0,
            seller: {
              name: 'Vendeur inconnu',
              email: 'unknown@email.com'
            },
            status: 'flagged' as const,
            category: 'Non catégorisé',
            images: [],
            createdAt: firstReport.createdAt,
            reportCount: reports.length,
            reportReasons: reports.flatMap(r => r.reasons),
            reports: reports,
            uniqueReporters: uniqueUserIds.size,
            totalReports: reports.length,
            reportStats: { byUser, byReason }
          };
        }

        // Déterminer le statut basé sur le nombre de signalements
        let status: 'pending' | 'approved' | 'rejected' | 'flagged' = 'pending';
        if (reports.length >= 3) {
          status = 'flagged';
        } else if (reports.length >= 1) {
          status = 'pending';
        }

        return {
          id: product.id.toString(),
          title: product.title,
          description: product.description,
          price: product.price,
          seller: {
            name: `${product.seller.firstName} ${product.seller.lastName}`,
            email: product.seller.email
          },
          status,
          category: 'Non catégorisé', // À améliorer avec les vraies catégories
          images: [],
          createdAt: firstReport.createdAt,
          reportCount: reports.length,
          reportReasons: reports.flatMap(r => r.reasons),
          reports: reports,
          uniqueReporters: uniqueUserIds.size,
          totalReports: reports.length,
          reportStats: { byUser, byReason }
        };
      });

      // Ajouter quelques produits de test si aucun signalement n'existe
      if (productsWithReports.length === 0) {
        const mockProducts: ProductWithReports[] = [
          {
            id: '1',
            title: 'iPhone 13 Pro Max - Excellent état',
            description: 'iPhone 13 Pro Max 256GB en excellent état, vendu avec tous ses accessoires.',
            price: 899,
            seller: {
              name: 'Marie Dupont',
              email: 'marie.dupont@email.com'
            },
            status: 'pending',
            category: 'Électronique',
            images: ['https://via.placeholder.com/150'],
            createdAt: '2024-12-20',
            reportCount: 0,
            reportReasons: [],
            uniqueReporters: 0,
            totalReports: 0,
            reportStats: { byUser: {}, byReason: {} }
          },
          {
            id: '2',
            title: 'Nike Air Max 270 - Taille 42',
            description: 'Chaussures Nike Air Max 270 en parfait état, portées seulement quelques fois.',
            price: 89,
            seller: {
              name: 'Jean Martin',
              email: 'jean.martin@email.com'
            },
            status: 'flagged',
            category: 'Chaussures',
            images: ['https://via.placeholder.com/150'],
            createdAt: '2024-12-19',
            reportCount: 3,
            reportReasons: ['Prix suspect', 'Description trompeuse'],
            uniqueReporters: 2,
            totalReports: 3,
            reportStats: { 
              byUser: { 1: 2, 2: 1 }, 
              byReason: { 'Prix suspect': 2, 'Description trompeuse': 1 } 
            }
          }
        ];
        setProducts(mockProducts);
      } else {
        setProducts(productsWithReports);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des signalements:', error);
      Alert.alert('Erreur', 'Impossible de charger les signalements');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
    
    return matchesStatus;
  });

  const handleProductAction = async (product: ProductWithReports, action: 'approve' | 'reject' | 'flag') => {
    const actionText = {
      approve: 'approuver',
      reject: 'rejeter',
      flag: 'signaler'
    };

    if (action === 'reject' && !rejectionReason.trim()) {
      Alert.alert('Erreur', 'Veuillez indiquer une raison de rejet');
      return;
    }

    Alert.alert(
      'Confirmation',
      `Voulez-vous ${actionText[action]} le produit "${product.title}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          style: action === 'reject' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              // Mettre à jour le statut du produit
              const newProductStatus = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'flagged';
              
              // Mettre à jour le statut du produit via l'API
              await ProductService.updateProductStatus(parseInt(product.id), newProductStatus);
              
              // Mettre à jour les statuts des signalements
              if (product.reports && product.reports.length > 0) {
                const reportStatus = action === 'approve' ? 'resolved' : action === 'reject' ? 'resolved' : 'reviewed';
                
                // Mettre à jour chaque signalement
                for (const report of product.reports) {
                  try {
                    await ReportService.updateReportStatus(report.id, reportStatus);
                  } catch (error) {
                    console.error(`Erreur lors de la mise à jour du signalement ${report.id}:`, error);
                  }
                }
              }
              
              Alert.alert('Succès', `Produit ${actionText[action]} avec succès`);
              loadProducts(); // Recharger les données
              setRejectionReason('');
            } catch (error) {
              console.error('Erreur lors de l\'action sur le produit:', error);
              Alert.alert('Erreur', 'Une erreur est survenue lors de l\'action');
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'approved': return '#4CAF50';
      case 'rejected': return '#F44336';
      case 'flagged': return '#E91E63';
      default: return '#9E9E9E';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'approved': return 'Approuvé';
      case 'rejected': return 'Rejeté';
      case 'flagged': return 'Signalé';
      default: return 'Inconnu';
    }
  };

  const renderProduct = ({ item }: { item: ProductWithReports }) => (
    <TouchableOpacity
      style={[styles.productCard, { backgroundColor: colors.card }]}
      onPress={() => {
        // Naviguer vers l'écran de détail du produit via le HomeStack
        navigation.dispatch(
          CommonActions.navigate({
            name: 'Accueil',
            params: {
              screen: 'ProductDetail',
              params: { productId: parseInt(item.id) }
            }
          })
        );
      }}
    >
      <View style={styles.productHeader}>
        <View style={styles.productInfo}>
          <Text style={[styles.productTitle, { color: colors.text }]} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={[styles.productPrice, { color: colors.primary }]}>
            {item.price}€
          </Text>
        </View>
        <View style={styles.productStats}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
          {item.totalReports > 0 && (
            <View style={[styles.reportBadge, { backgroundColor: '#E91E63' }]}>
              <Text style={styles.reportText}>
                {item.totalReports} signalement{item.totalReports > 1 ? 's' : ''}
              </Text>
              {item.uniqueReporters > 1 && (
                <Text style={[styles.reportSubText, { color: 'rgba(255,255,255,0.8)' }]}>
                  par {item.uniqueReporters} utilisateur{item.uniqueReporters > 1 ? 's' : ''}
                </Text>
              )}
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.productDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="person-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>
            {item.seller.name}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="folder-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>
            {item.category}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
      
      <Text style={[styles.productDescription, { color: colors.textSecondary }]} numberOfLines={2}>
        {item.reports && item.reports.length > 0 && item.reports.some(report => report.description) 
          ? item.reports.find(report => report.description)?.description || item.description
          : item.description}
      </Text>
      
      <View style={styles.productActions}>
        {item.status === 'pending' && (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => handleProductAction(item, 'approve')}
              activeOpacity={0.8}
            >
              <View style={styles.buttonContent}>
                <View style={styles.buttonIconContainer}>
                  <Ionicons name="checkmark-circle" size={16} color="white" />
                </View>
                <Text style={styles.actionButtonText}>Approuver</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleProductAction(item, 'reject')}
              activeOpacity={0.8}
            >
              <View style={styles.buttonContent}>
                <View style={styles.buttonIconContainer}>
                  <Ionicons name="close-circle" size={16} color="white" />
                </View>
                <Text style={styles.actionButtonText}>Rejeter</Text>
              </View>
            </TouchableOpacity>
          </>
        )}
        {item.status === 'flagged' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.examineButton]}
            onPress={() => handleProductAction(item, 'flag')}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
                              <View style={styles.buttonIconContainer}>
                  <Ionicons name="flag" size={16} color="white" />
                </View>
              <Text style={styles.actionButtonText}>Examiner</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

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
          Modération des Produits
        </Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>


        {/* Filters */}
        <FilterChips
          filters={[
            { key: 'all', label: 'Tous', count: products.length },
            { key: 'pending', label: 'En attente', count: products.filter(p => p.status === 'pending').length },
            { key: 'flagged', label: 'Signalés', count: products.filter(p => p.status === 'flagged').length },
            { key: 'approved', label: 'Approuvés', count: products.filter(p => p.status === 'approved').length },
            { key: 'rejected', label: 'Rejetés', count: products.filter(p => p.status === 'rejected').length },
          ]}
          selectedFilter={filterStatus}
          onFilterSelect={(filterKey) => setFilterStatus(filterKey as any)}
          title="Filtrer par statut"
          showTitle={false}
        />

        {/* Products List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Chargement des produits...
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredProducts}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>
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
    paddingBottom: 10,
    backgroundColor: 'transparent',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 0,
  },
  filtersContainer: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  filtersScrollView: {
    flexGrow: 0,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minWidth: 80,
    alignItems: 'center',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  productCard: {
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    marginHorizontal: 16,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  productStats: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 4,
    minWidth: 60,
    alignItems: 'center',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  reportBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 60,
    alignItems: 'center',
  },
  reportText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  reportSubText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 2,
  },
  productDetails: {
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 2,
  },
  detailText: {
    marginLeft: 10,
    fontSize: 14,
    flex: 1,
  },
  productDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  productActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    minHeight: 36,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  approveButton: {
    backgroundColor: '#10B981',
    borderWidth: 1,
    borderColor: '#059669',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  examineButton: {
    backgroundColor: '#F59E0B',
    borderWidth: 1,
    borderColor: '#D97706',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIconContainer: {
    marginRight: 6,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },

  // Styles pour les détails des signalements
  reportDetail: {
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reportDate: {
    fontSize: 11,
    fontWeight: '500',
  },
  reportStatus: {
    fontSize: 11,
    fontWeight: '600',
  },
  reportReasons: {
    marginBottom: 4,
  },
  reportReasonsTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  reportCustomReason: {
    marginBottom: 4,
  },
  reportCustomReasonTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  reportCustomReasonText: {
    fontSize: 12,
    lineHeight: 16,
  },
  reportDescription: {
    marginBottom: 4,
  },
  reportDescriptionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  reportDescriptionText: {
    fontSize: 12,
    lineHeight: 16,
  },
  reportReporter: {
    marginBottom: 4,
  },
  reportReporterTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  reportReporterText: {
    fontSize: 12,
  },
  reportStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  reportStatusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  reportCommentCard: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#E91E63',
  },
  reportCommentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reportCommentDate: {
    fontSize: 11,
    fontWeight: '500',
  },
  reportCommentAuthor: {
    fontSize: 11,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  reportCommentText: {
    fontSize: 12,
    lineHeight: 16,
    fontStyle: 'italic',
  },
});

export default ProductModerationScreen; 