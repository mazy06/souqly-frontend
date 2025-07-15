import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import ApiService from '../services/ApiService';
import ProductService from '../services/ProductService';

type TabType = 'active' | 'expired';

interface Announcement {
  id: number;
  title: string;
  price: number;
  status: string; // Utiliser string pour accepter tous les statuts possibles
  createdAt: string;
  images?: ProductImage[];
  favoriteCount: number;
  viewCount: number;
}

interface ProductImage {
  id: number;
  fileName: string;
  contentType: string;
}

export default function MyAnnouncementsScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [activeAnnouncements, setActiveAnnouncements] = useState<Announcement[]>([]);
  const [expiredAnnouncements, setExpiredAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      if (user?.id) {
        console.log('[MyAnnouncementsScreen] Chargement des annonces pour user:', user.id);
        
        // Récupérer les annonces actives
        console.log('[MyAnnouncementsScreen] Appel API pour les annonces actives...');
        const activeResponse = await ApiService.get(`/products/my-products/filtered?status=ACTIVE`) as Announcement[];
        console.log('[MyAnnouncementsScreen] Annonces actives reçues:', activeResponse?.length || 0);
        setActiveAnnouncements(activeResponse || []);
        
        // Récupérer les annonces terminées (INACTIVE, SOLD, DELETED)
        console.log('[MyAnnouncementsScreen] Appel API pour les annonces terminées...');
        const terminatedResponse = await ApiService.get(`/products/my-products/filtered?status=TERMINATED`) as Announcement[];
        console.log('[MyAnnouncementsScreen] Annonces terminées reçues:', terminatedResponse?.length || 0);
        setExpiredAnnouncements(terminatedResponse || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des annonces:', error);
      // En cas d'erreur, afficher des listes vides au lieu de données de test
      setActiveAnnouncements([]);
      setExpiredAnnouncements([]);
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

  const renderAnnouncement = ({ item }: { item: Announcement }) => (
    <TouchableOpacity
      style={[styles.announcementItem, { borderColor: colors.border }]}
      onPress={() => (navigation as any).navigate('MyProductDetail', { productId: item.id.toString() })}
    >
      <View style={styles.announcementLeft}>
        <Image
          source={
            item.images && item.images.length > 0
              ? { uri: `http://localhost:8080/api/products/image/${item.images[0].id}` }
              : require('../assets/images/icon.png')
          }
          style={styles.announcementImage}
          resizeMode="cover"
        />
        <View style={styles.announcementInfo}>
          <Text style={[styles.announcementTitle, { color: colors.text }]} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={[styles.announcementPrice, { color: colors.primary }]}>
            {item.price} €
          </Text>
          <Text style={[styles.announcementDate, { color: colors.textSecondary }]}>
            Publié le {formatDate(item.createdAt)}
          </Text>
        </View>
      </View>
      <View style={styles.announcementRight}>
        <View style={[styles.statusBadge, { 
          backgroundColor: item.status === 'ACTIVE' ? '#4CAF50' : 
                         item.status === 'SOLD' ? '#FF9800' : 
                         item.status === 'INACTIVE' ? '#9E9E9E' : '#F44336' 
        }]}>
          <Text style={styles.statusText}>
            {item.status === 'ACTIVE' ? 'Active' : 
             item.status === 'SOLD' ? 'Vendue' : 
             item.status === 'INACTIVE' ? 'Inactive' : 'Supprimée'}
          </Text>
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="heart" size={12} color={colors.textSecondary} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {item.favoriteCount || 0}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="eye" size={12} color={colors.textSecondary} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {item.viewCount || 0}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = (type: TabType) => (
    <View style={styles.emptyContainer}>
      <Ionicons 
        name={type === 'active' ? 'list-outline' : 'time-outline'} 
        size={64} 
        color={colors.textSecondary} 
      />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        {type === 'active' ? 'Aucune annonce active' : 'Aucune annonce terminée'}
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        {type === 'active' 
          ? 'Vous n\'avez pas encore publié d\'annonces actives'
          : 'Vos annonces vendues, inactives ou supprimées apparaîtront ici'
        }
      </Text>
    </View>
  );

  const getCurrentAnnouncements = () => {
    return activeTab === 'active' ? activeAnnouncements : expiredAnnouncements;
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
          Mes annonces
        </Text>
        <View style={styles.headerRight} />
      </View>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'active' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }
          ]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[
            styles.tabText,
            { color: activeTab === 'active' ? colors.primary : colors.textSecondary }
          ]}>
            Actives ({activeAnnouncements.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'expired' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }
          ]}
          onPress={() => setActiveTab('expired')}
        >
          <Text style={[
            styles.tabText,
            { color: activeTab === 'expired' ? colors.primary : colors.textSecondary }
          ]}>
            Terminées ({expiredAnnouncements.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <FlatList
        data={getCurrentAnnouncements()}
        renderItem={renderAnnouncement}
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
  announcementItem: {
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
  announcementLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  announcementImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  announcementInfo: {
    flex: 1,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  announcementPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  announcementDate: {
    fontSize: 12,
  },
  announcementRight: {
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
  statsContainer: {
    alignItems: 'flex-end',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  statText: {
    fontSize: 12,
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