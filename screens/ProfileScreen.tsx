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
import WalletCard from '../components/WalletCard';
import WalletService from '../services/WalletService';

// Définition du type du stack profil
export type ProfileStackParamList = {
  ProfileMain: undefined;
  AdminCategories: undefined;
  MyProducts: undefined;
  MyProductDetail: { productId: string };
  EditProduct: { productId: string };
  Wallet: undefined;
  EditProfile: undefined;
  MyAnnouncements: undefined;
  Transactions: undefined;
  Orders: undefined;
};

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { user, isGuest, logout } = useAuth();
  const { colors, themeMode, isDark } = useTheme();
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const [securityExpanded, setSecurityExpanded] = useState(false);
  const [helpExpanded, setHelpExpanded] = useState(false);
  const [userStats, setUserStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userProducts, setUserProducts] = useState<any[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    if (user && !isGuest) {
      loadUserStats();
      loadUserProducts();
      loadWalletBalance();
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

  const loadWalletBalance = async () => {
    try {
      if (user?.id) {
        const balanceData = await WalletService.getBalance(user.id);
        setWalletBalance(balanceData.balance);
      }
    } catch (error) {
      console.log('⚠️ Utilisation du solde par défaut pour la démo');
      // Solde par défaut pour la démo
      setWalletBalance(200.50);
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
        <View style={styles.headerLeft} />
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.themeIcon}
            onPress={() => setThemeModalVisible(true)}
          >
            <Ionicons 
              name={getThemeIcon()} 
              size={24} 
              color={colors.text} 
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.logoutIcon}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>

      {/* Profile Info */}
      <View style={styles.profileSection}>
        <TouchableOpacity 
          style={styles.profileHeader}
          onPress={() => navigation.navigate('EditProfile')}
          activeOpacity={0.7}
        >
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
        </TouchableOpacity>
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



      {/* Wallet Card */}
      <WalletCard
        balance={walletBalance}
        onPress={() => navigation.navigate('Wallet')}
      />

      {/* Mes annonces - Design ultra simple */}
      <View style={styles.announcementsSection}>
        <TouchableOpacity
          style={styles.announcementsCard}
          onPress={() => navigation.navigate('MyAnnouncements')}
          activeOpacity={0.7}
        >
          <Ionicons name="list-outline" size={24} color={colors.primary} style={styles.announcementsIcon} />
          <Text style={[styles.announcementsTitle, { color: colors.text }]}>
            Mes annonces ({userProducts.length})
          </Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Transactions - Design ultra simple */}
      <View style={styles.announcementsSection}>
        <TouchableOpacity
          style={styles.announcementsCard}
          onPress={() => navigation.navigate('Transactions')}
          activeOpacity={0.7}
        >
          <Ionicons name="swap-horizontal-outline" size={24} color={colors.primary} style={styles.announcementsIcon} />
          <Text style={[styles.announcementsTitle, { color: colors.text }]}>
            Transactions
          </Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Commandes - Design ultra simple */}
      <View style={styles.announcementsSection}>
        <TouchableOpacity
          style={styles.announcementsCard}
          onPress={() => navigation.navigate('Orders')}
          activeOpacity={0.7}
        >
          <Ionicons name="bag-outline" size={24} color={colors.primary} style={styles.announcementsIcon} />
          <Text style={[styles.announcementsTitle, { color: colors.text }]}>
            Commandes
          </Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Paramètres - Design ultra simple avec accordéon */}
      <View style={styles.announcementsSection}>
        <TouchableOpacity
          style={styles.announcementsCard}
          onPress={() => setSettingsExpanded(!settingsExpanded)}
          activeOpacity={0.7}
        >
          <Ionicons name="settings-outline" size={24} color={colors.primary} style={styles.announcementsIcon} />
          <Text style={[styles.announcementsTitle, { color: colors.text }]}>
            Paramètres
          </Text>
                      <Ionicons 
              name={settingsExpanded ? "chevron-down" : "chevron-forward"} 
              size={20} 
              color={colors.textSecondary} 
            />
        </TouchableOpacity>
        
        {/* Sous-éléments déroulés */}
        {settingsExpanded && (
          <View style={styles.expandedContent}>
            <TouchableOpacity 
              style={styles.subMenuItem} 
              activeOpacity={0.7}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <Ionicons name="person-outline" size={18} color={colors.primary} style={styles.subMenuIcon} />
              <Text style={[styles.subMenuText, { color: colors.text }]}>
                Profil
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} style={styles.subMenuArrow} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.subMenuItem} 
              activeOpacity={0.7}
              onPress={() => navigation.navigate('EmailSettings')}
            >
              <Ionicons name="mail-outline" size={18} color={colors.primary} style={styles.subMenuIcon} />
              <Text style={[styles.subMenuText, { color: colors.text }]}>
                Email
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} style={styles.subMenuArrow} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.subMenuItem} 
              activeOpacity={0.7}
              onPress={() => navigation.navigate('PaymentMethods')}
            >
              <Ionicons name="card-outline" size={18} color={colors.primary} style={styles.subMenuIcon} />
              <Text style={[styles.subMenuText, { color: colors.text }]}>
                Moyens de paiement
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} style={styles.subMenuArrow} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.subMenuItem} 
              activeOpacity={0.7}
              onPress={() => navigation.navigate('NotificationSettings')}
            >
              <Ionicons name="notifications-outline" size={18} color={colors.primary} style={styles.subMenuIcon} />
              <Text style={[styles.subMenuText, { color: colors.text }]}>
                Notifications
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} style={styles.subMenuArrow} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.subMenuItem} 
              activeOpacity={0.7}
              onPress={() => navigation.navigate('BulkDiscount')}
            >
              <Ionicons name="pricetag-outline" size={18} color={colors.primary} style={styles.subMenuIcon} />
              <Text style={[styles.subMenuText, { color: colors.text }]}>
                Réductions sur les lots
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} style={styles.subMenuArrow} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.subMenuItem} activeOpacity={0.7}>
              <Ionicons name="shield-outline" size={18} color={colors.primary} style={styles.subMenuIcon} />
              <Text style={[styles.subMenuText, { color: colors.text }]}>
                Confidentialité
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} style={styles.subMenuArrow} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.subMenuItem} activeOpacity={0.7}>
              <Ionicons name="help-circle-outline" size={18} color={colors.primary} style={styles.subMenuIcon} />
              <Text style={[styles.subMenuText, { color: colors.text }]}>
                Aide
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} style={styles.subMenuArrow} />
            </TouchableOpacity>
          </View>
        )}
      </View>

              {/* Connexion et Sécurité - Menu déroulant */}
        <View style={styles.announcementsSection}>
          <TouchableOpacity
            style={styles.announcementsCard}
            onPress={() => setSecurityExpanded(!securityExpanded)}
            activeOpacity={0.7}
          >
            <Ionicons name="shield-outline" size={24} color={colors.primary} style={styles.announcementsIcon} />
            <Text style={[styles.announcementsTitle, { color: colors.text }]}>
              Connexion et Sécurité
            </Text>
            <Ionicons 
              name={securityExpanded ? "chevron-down" : "chevron-forward"} 
              size={20} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>
          
          {/* Sous-éléments déroulés */}
          {securityExpanded && (
            <View style={styles.expandedContent}>
              <TouchableOpacity style={styles.subMenuItem}>
                <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} style={styles.subMenuIcon} />
                <Text style={[styles.subMenuText, { color: colors.text }]}>
                  Sécurité du compte
                </Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} style={styles.subMenuArrow} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.subMenuItem}>
                <Ionicons name="key-outline" size={18} color={colors.primary} style={styles.subMenuIcon} />
                <Text style={[styles.subMenuText, { color: colors.text }]}>
                  Mot de passe
                </Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} style={styles.subMenuArrow} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.subMenuItem}>
                <Ionicons name="call-outline" size={18} color={colors.primary} style={styles.subMenuIcon} />
                <Text style={[styles.subMenuText, { color: colors.text }]}>
                  Numéro de téléphone
                </Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} style={styles.subMenuArrow} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.subMenuItem}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.primary} style={styles.subMenuIcon} />
                <Text style={[styles.subMenuText, { color: colors.text }]}>
                  Connexion en 2 étapes
                </Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} style={styles.subMenuArrow} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.subMenuItem}>
                <Ionicons name="scan-outline" size={18} color={colors.primary} style={styles.subMenuIcon} />
                <View style={styles.menuItemWithBadge}>
                  <Text style={[styles.subMenuText, { color: colors.text }]}>
                    Face ID
                  </Text>
                  <View style={styles.newBadge}>
                    <Text style={styles.newBadgeText}>Nouveau</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} style={styles.subMenuArrow} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.subMenuItem}>
                <Ionicons name="phone-portrait-outline" size={18} color={colors.primary} style={styles.subMenuIcon} />
                <Text style={[styles.subMenuText, { color: colors.text }]}>
                  Appareils connectés
                </Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} style={styles.subMenuArrow} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Aide - Menu déroulant */}
        <View style={styles.announcementsSection}>
          <TouchableOpacity
            style={styles.announcementsCard}
            onPress={() => setHelpExpanded(!helpExpanded)}
            activeOpacity={0.7}
          >
            <Ionicons name="help-circle-outline" size={24} color={colors.primary} style={styles.announcementsIcon} />
            <Text style={[styles.announcementsTitle, { color: colors.text }]}>
              Aide
            </Text>
            <Ionicons 
              name={helpExpanded ? "chevron-down" : "chevron-forward"} 
              size={20} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>
          
          {/* Sous-éléments déroulés */}
          {helpExpanded && (
            <View style={styles.expandedContent}>
              <TouchableOpacity style={styles.subMenuItem}>
                <Ionicons name="sparkles-outline" size={18} color={colors.primary} style={styles.subMenuIcon} />
                <Text style={[styles.subMenuText, { color: colors.text }]}>
                  Nouveautés
                </Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} style={styles.subMenuArrow} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.subMenuItem}>
                <Ionicons name="document-text-outline" size={18} color={colors.primary} style={styles.subMenuIcon} />
                <Text style={[styles.subMenuText, { color: colors.text }]}>
                  Informations légales
                </Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} style={styles.subMenuArrow} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.subMenuItem}>
                <Ionicons name="information-circle-outline" size={18} color={colors.primary} style={styles.subMenuIcon} />
                <Text style={[styles.subMenuText, { color: colors.text }]}>
                  Centre d'aide
                </Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} style={styles.subMenuArrow} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Admin Section */}
        {user.role === 'admin' && (
          <View style={styles.announcementsSection}>
            <TouchableOpacity
              style={styles.announcementsCard}
              onPress={() => navigation.navigate('AdminCategories')}
              activeOpacity={0.7}
            >
              <Ionicons name="settings-outline" size={24} color={colors.primary} style={styles.announcementsIcon} />
              <Text style={[styles.announcementsTitle, { color: colors.text }]}>
                Gestion des catégories
              </Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}

      <ThemeToggle 
        visible={themeModalVisible} 
        onClose={() => setThemeModalVisible(false)} 
      />
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
    borderBottomColor: '#E0E0E0',
  },
  headerLeft: {
    width: 50,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeIcon: {
    paddingHorizontal: 8,
    marginRight: 8,
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

  announcementsSection: {
    padding: 8,
  },
  announcementsCard: {
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  announcementsIcon: {
    marginRight: 12,
  },
  announcementsTitle: {
    fontSize: 20,
    fontWeight: '500',
    flex: 1,
  },
  expandedContent: {
    paddingLeft: 44,
    paddingTop: 8,
    paddingRight: 16,
  },
  subMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 4,
    borderRadius: 8,
  },
  subMenuIcon: {
    marginRight: 12,
  },
  subMenuText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  subMenuArrow: {
    marginLeft: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuItemWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  newBadge: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  newBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
}); 