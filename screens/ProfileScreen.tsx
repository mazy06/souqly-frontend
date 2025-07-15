import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Image, FlatList } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import { SafeAreaView } from 'react-native-safe-area-context';
import GuestMessage from '../components/GuestMessage';
import SectionHeader from '../components/SectionHeader';
import ApiService from '../services/ApiService';
import ProductService from '../services/ProductService';

// Définition du type du stack profil
export type ProfileStackParamList = {
  ProfileMain: undefined;
  AdminCategories: undefined;
  MyProducts: undefined;
  MyProductDetail: { productId: string };
  EditProduct: { productId: string };
};

type TabType = 'products' | 'theme';

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { user, isGuest, logout } = useAuth();
  const { colors, themeMode, isDark } = useTheme();
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [userStats, setUserStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('products');
  const [userProducts, setUserProducts] = useState<any[]>([]);

  useEffect(() => {
    if (user && !isGuest) {
      loadUserStats();
      loadUserProducts();
    } else {
      setLoading(false);
    }
  }, [user, isGuest]);

  const loadUserStats = async () => {
    try {
      setLoading(true);
      const response = await ApiService.get(`/users/${user?.id}/profile-detail`);
      setUserStats(response);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      // Utiliser des valeurs par défaut
      setUserStats({
        followersCount: 0,
        followingCount: 0,
        productsCount: 0,
        averageRating: 4.5,
        reviewsCount: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUserProducts = async () => {
    try {
      const response = await ApiService.get(`/products/seller/${user?.id}`);
      setUserProducts(response as any[]);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      setUserProducts([]);
    }
  };

  const handleLogout = async () => {
    console.log('→ [ProfileScreen] handleLogout appelé');
    await logout();
    console.log('→ [ProfileScreen] logout terminé');
  };

  const getThemeIcon = () => {
    switch (themeMode) {
      case 'light':
        return 'sunny';
      case 'dark':
        return 'moon';
      case 'system':
        return 'settings';
      default:
        return 'settings';
    }
  };

  const getThemeLabel = () => {
    switch (themeMode) {
      case 'light':
        return 'Thème clair';
      case 'dark':
        return 'Thème sombre';
      case 'system':
        return 'Thème système';
      default:
        return 'Thème système';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderProductItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.productItem}
      onPress={() => {
        navigation.navigate('MyProductDetail', { productId: item.id.toString() });
      }}
    >
      <Image
        source={
          item.images && item.images.length > 0
            ? { uri: ProductService.getProductImageUrl(item) }
            : require('../assets/images/icon.png')
        }
        style={styles.productImage}
      />
      <View style={styles.productInfo}>
        <Text style={[styles.productTitle, { color: colors.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[styles.productPrice, { color: colors.primary }]}>
          {item.price} €
        </Text>
        <Text style={[styles.productDate, { color: colors.textSecondary }]}>
          {formatDate(item.createdAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderTabContent = () => {
    if (activeTab === 'products') {
      return (
        <View style={styles.tabContentContainer}>
          <FlatList
            data={userProducts}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="bag-outline" size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  Aucun produit publié
                </Text>
              </View>
            }
          />
        </View>
      );
    } else {
      return (
        <View style={styles.themeSection}>
          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setThemeModalVisible(true)}
          >
            <View style={styles.menuItemContent}>
              <Ionicons name={getThemeIcon()} size={24} color={colors.text} style={styles.menuItemIcon} />
              <View style={styles.menuItemTextContainer}>
                <Text style={[styles.menuItemText, { color: colors.text }]}>Thème</Text>
                <Text style={[styles.menuItemSubtext, { color: colors.text + '80' }]}>{getThemeLabel()}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text + '60'} />
          </TouchableOpacity>
        </View>
      );
    }
  };

  if (isGuest) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background, flex: 1 }]} edges={['top','left','right']}> 
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <GuestMessage
            iconName="person-circle-outline"
            iconColor={colors.primary}
            title="Connectez-vous pour accéder à votre profil"
            color={colors.primary}
            textColor={colors.text}
            backgroundColor={colors.background}
            onPress={() => logout()}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>Profil non disponible</Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={logout}
        >
          <Text style={styles.buttonText}>Se connecter</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.logoutIcon}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Profile Info */}
      <View style={styles.profileSection}>
        <View style={styles.profileHeader}>
          <View style={[styles.profileImage, { backgroundColor: colors.primary }]}>
            <Text style={styles.profileImageText}>
              {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={[styles.profileName, { color: colors.text }]}>
                {user.name || 'Utilisateur'}
              </Text>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              </View>
            </View>
            
            {/* Rating */}
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
                {userStats?.averageRating || 4.5} ({userStats?.reviewsCount || 0} avis)
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
              <Text style={[styles.profileDate, { color: colors.textSecondary }]}>
                {' '}Membre depuis {formatDate(userStats?.createdAt || new Date().toISOString())}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>
              {userStats?.followersCount || 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Abonnés
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>
              {userStats?.followingCount || 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Abonnements
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>
              {userStats?.productsCount || 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Articles
            </Text>
          </View>
        </View>

        {/* Role Badge */}
        <View style={[styles.roleBadge, { backgroundColor: user.role === 'admin' ? '#008080' : colors.primary }]}>
          <Text style={styles.roleText}>
            {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
          </Text>
        </View>
      </View>

      {/* Admin Section */}
      {user.role === 'admin' && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Administration</Text>
          
          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => navigation.navigate('AdminCategories')}
          >
            <View style={styles.menuItemContent}>
              <Ionicons name="settings-outline" size={24} color={colors.text} style={styles.menuItemIcon} />
              <View style={styles.menuItemTextContainer}>
                <Text style={[styles.menuItemText, { color: colors.text }]}>Gestion des catégories</Text>
                <Text style={[styles.menuItemSubtext, { color: colors.text + '80' }]}>Administrer les catégories</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text + '60'} />
          </TouchableOpacity>
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'products' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }
          ]}
          onPress={() => setActiveTab('products')}
        >
          <Text style={[
            styles.tabText,
            { color: activeTab === 'products' ? colors.primary : colors.textSecondary }
          ]}>
            Mes produits ({userProducts.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'theme' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }
          ]}
          onPress={() => setActiveTab('theme')}
        >
          <Text style={[
            styles.tabText,
            { color: activeTab === 'theme' ? colors.primary : colors.textSecondary }
          ]}>
            Thème système
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {renderTabContent()}

      <ThemeToggle 
        visible={themeModalVisible} 
        onClose={() => setThemeModalVisible(false)} 
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
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  logoutIcon: {
    paddingHorizontal: 8,
  },
  profileSection: {
    padding: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileImageText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  verifiedBadge: {
    marginLeft: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 14,
    marginLeft: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  profileDate: {
    fontSize: 12,
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roleText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  menuItem: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    marginRight: 12,
  },
  menuItemTextContainer: {
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
  },
  menuItemSubtext: {
    fontSize: 14,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
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
  tabContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  productItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
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
    fontWeight: '600',
    marginBottom: 2,
  },
  productDate: {
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  themeSection: {
    padding: 16,
  },
  tabContentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
}); 