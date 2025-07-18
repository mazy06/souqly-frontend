import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity, TextInput } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import GuestMessage from '../components/GuestMessage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import ConversationItem from '../components/ConversationItem';
import SearchBar from '../components/SearchBar';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import ConversationService, { Conversation } from '../services/ConversationService';
import { useUnreadConversations } from '../contexts/UnreadConversationsContext';

type MessagesStackParamList = {
  MessagesMain: undefined;
  Conversation: {
    conversationId: string;
    name: string;
    avatarUrl?: string;
    productId?: number;
  };
  Notifications: undefined;
};

type MessagesScreenNavigationProp = StackNavigationProp<MessagesStackParamList, 'MessagesMain'>;

// Données mockées pour l'affichage visuel
const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    name: 'Ahmed Benali',
    lastMessage: 'Bonjour, le produit est-il toujours dispo ?',
    time: '14:32',
    unreadCount: 2,
    sellerId: 1,
    productId: 1,
  },
  {
    id: '2',
    avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
    name: 'Sophie Martin',
    lastMessage: 'Merci pour votre réponse rapide !',
    time: 'Hier',
    unreadCount: 0,
    sellerId: 2,
    productId: 2,
  },
  {
    id: '3',
    avatarUrl: '',
    name: 'Ali',
    lastMessage: 'Je peux passer ce soir.',
    time: '13:10',
    unreadCount: 1,
    sellerId: 3,
    productId: 3,
  },
];

export default function MessagesScreen() {
  const { isGuest, logout, user } = useAuth();
  const { colors, isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const navigation = useNavigation<MessagesScreenNavigationProp>();
  const { setUnreadCount } = useUnreadConversations();



  const loadConversations = async () => {
    try {
      setLoading(true);
      console.log('[MessagesScreen] Début du chargement des conversations...');
      
      const conversationsData = await ConversationService.getConversations();
      console.log('[MessagesScreen] Conversations chargées:', conversationsData.length);
      console.log('[MessagesScreen] Données brutes:', JSON.stringify(conversationsData, null, 2));
      
      // Log de debug pour chaque conversation
      conversationsData.forEach((c, index) => {
        console.log(`[DEBUG] Conversation ${index + 1}:`, {
          id: c.id,
          name: c.name,
          lastMessage: c.lastMessage,
          unreadCount: c.unreadCount,
          sellerId: c.sellerId,
          buyerName: c.buyerName,
          sellerName: c.sellerName
        });
      });
      
      setConversations(conversationsData);
      // Met à jour le nombre de conversations non lues
      const unread = conversationsData.filter(c => c.unreadCount > 0).length;
      setUnreadCount(unread);
      setNotificationsCount(unread);
      
      console.log('[MessagesScreen] État final - conversations:', conversationsData.length, 'non lues:', unread);
    } catch (error) {
      console.error('[MessagesScreen] Erreur lors du chargement des conversations:', error);
      setUnreadCount(0); // fallback
      // Utiliser les données mockées en cas d'erreur
      console.log('[MessagesScreen] Utilisation des données mockées');
      setConversations(MOCK_CONVERSATIONS);
    } finally {
      setLoading(false);
      console.log('[MessagesScreen] Chargement terminé, loading = false');
    }
  };

  const handleBellPress = () => {
    navigation.navigate('Notifications' as any);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadConversations();
    }, [])
  );

  // Mettre à jour les conversations quand on reçoit un nouveau message
  useEffect(() => {
    // TODO: Écouter les événements WebSocket pour mettre à jour les pastilles en temps réel
    // Pour l'instant, on recharge les conversations quand on revient sur l'écran
  }, []);

  // Filtrer les conversations pour la recherche
  const filteredConversations = conversations.filter(c => {
    if (!search.trim()) return true;
    
    // Recherche sur les noms
    const otherName = user && c.sellerId?.toString() === user.id?.toString()
      ? c.buyerName || c.name || ''
      : c.sellerName || c.name || '';
    
    // Recherche sur le message
    const messageMatch = c.lastMessage?.toLowerCase().includes(search.toLowerCase()) || false;
    const nameMatch = otherName.toLowerCase().includes(search.toLowerCase());
    
    return messageMatch || nameMatch;
  });

  // Debug: log de l'état actuel
  console.log('[MessagesScreen] État actuel:', {
    loading,
    conversationsCount: conversations.length,
    filteredCount: filteredConversations.length,
    search: search,
    isGuest
  });

  if (isGuest) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top','left','right']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <GuestMessage
            iconName="chatbubble-ellipses-outline"
            iconColor={colors.primary}
            title="Connectez-vous pour accéder à vos messages"
            color={colors.primary}
            textColor={colors.text}
            backgroundColor={colors.background}
            onPress={() => logout()}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top','left','right']}>
      {/* Header simplifié */}
      <View style={[styles.headerContainer, { backgroundColor: colors.background }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Messages</Text>
          <TouchableOpacity 
            style={[styles.bellButton, { backgroundColor: colors.card }]} 
            onPress={handleBellPress}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={20} color={colors.primary} />
            {notificationsCount > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                <Text style={styles.badgeText}>
                  {notificationsCount > 99 ? '99+' : notificationsCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Barre de recherche simple */}
      <View style={[styles.searchSection, { backgroundColor: colors.background }]}>
        <View style={[styles.searchBar, { 
          backgroundColor: isDark ? '#2a2a2a' : '#f8f9fa',
          borderColor: colors.border + '40',
        }]}>
          <Ionicons name="search" size={18} color={colors.tabIconDefault} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Rechercher une conversation"
            placeholderTextColor={colors.tabIconDefault}
            value={search}
            onChangeText={(text) => {
              console.log('[MessagesScreen] Recherche modifiée:', text);
              setSearch(text);
            }}
          />
        </View>
      </View>

      {/* Loader/squelette amélioré */}
      {loading ? (
        <View style={styles.loadingContainer}>
          {[1,2,3,4].map((_, i) => (
            <View 
              key={i} 
              style={[
                styles.skeletonRow, 
                { 
                  backgroundColor: colors.card, 
                  borderColor: colors.border + '20',
                }
              ]}
            > 
              <View style={[styles.skeletonAvatar, { backgroundColor: colors.border + '40' }]} />
              <View style={styles.skeletonContent}>
                <View style={[styles.skeletonLine, { width: '70%', backgroundColor: colors.border + '40' }]} />
                <View style={[styles.skeletonLine, { width: '50%', backgroundColor: colors.border + '40', marginTop: 8 }]} />
              </View>
            </View>
          ))}
        </View>
      ) : filteredConversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconContainer, { backgroundColor: colors.card }]}>
            <Ionicons name="chatbubble-ellipses-outline" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.emptyText, { color: colors.text }]}>
            {search.trim() ? 'Aucune conversation trouvée' : 'Aucune conversation'}
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.tabIconDefault }]}>
            {search.trim() 
              ? 'Essayez de modifier vos critères de recherche.'
              : 'Contactez un vendeur depuis une fiche produit pour démarrer une discussion.'
            }
          </Text>
          {!search.trim() && (
            <TouchableOpacity 
              style={[styles.emptyButton, { backgroundColor: colors.primary }]}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Home' as any)}
            >
              <Text style={styles.emptyButtonText}>Découvrir des produits</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredConversations}
          keyExtractor={item => item.id}
          renderItem={({ item }) => {
            // Déterminer le nom à afficher
            const otherName = user && item.sellerId?.toString() === user.id?.toString()
              ? item.buyerName || item.name || 'Acheteur'
              : item.sellerName || item.name || 'Vendeur';
            return (
              <ConversationItem
                avatarUrl={item.avatarUrl}
                name={otherName}
                lastMessage={item.lastMessage}
                time={item.time}
                unreadCount={item.unreadCount}
                onPress={() => {
                  navigation.navigate('Conversation', {
                    conversationId: item.id,
                    name: otherName,
                    avatarUrl: item.avatarUrl,
                    productId: item.productId,
                  });
                }}
              />
            );
          }}
          contentContainerStyle={styles.listContainer}
          style={styles.list}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  bellButton: {
    position: 'relative',
    padding: 10,
    borderRadius: 10,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  skeletonAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  skeletonContent: {
    flex: 1,
    marginLeft: 16,
  },
  skeletonLine: {
    height: 14,
    borderRadius: 7,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 4,
  },
  list: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
}); 