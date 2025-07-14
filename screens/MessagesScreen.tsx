import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
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

type MessagesStackParamList = {
  MessagesMain: undefined;
  Conversation: {
    conversationId: string;
    name: string;
    avatarUrl?: string;
    productId?: number;
  };
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
  const navigation = useNavigation<MessagesScreenNavigationProp>();

  const loadConversations = async () => {
    try {
      setLoading(true);
      const conversationsData = await ConversationService.getConversations();
      console.log('[MessagesScreen] Conversations chargées:', conversationsData);
      setConversations(conversationsData);
    } catch (error) {
      console.error('[MessagesScreen] Erreur lors du chargement des conversations:', error);
      // En cas d'erreur, utiliser les données mockées
      setConversations(MOCK_CONVERSATIONS);
    } finally {
      setLoading(false);
    }
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
      {/* Barre de recherche réutilisée */}
      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Rechercher une conversation"
        onPressCamera={undefined}
      />

      {/* Loader/squelette */}
      {loading ? (
        <View style={{ flex: 1, padding: 16 }}>
          {[1,2,3].map((_, i) => (
            <View key={i} style={[styles.skeletonRow, { backgroundColor: colors.card, borderColor: colors.border }]}> 
              <View style={[styles.skeletonAvatar, { backgroundColor: colors.border }]} />
              <View style={{ flex: 1, marginLeft: 16 }}>
                <View style={[styles.skeletonLine, { width: '60%', backgroundColor: colors.border }]} />
                <View style={[styles.skeletonLine, { width: '40%', backgroundColor: colors.border, marginTop: 8 }]} />
              </View>
            </View>
          ))}
        </View>
      ) : conversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubble-ellipses-outline" size={48} color={colors.tabIconDefault} style={{ marginBottom: 12 }} />
          <Text style={[styles.emptyText, { color: colors.text }]}>Aucune conversation</Text>
          <Text style={[styles.emptySubtext, { color: colors.tabIconDefault }]}>Contactez un vendeur depuis une fiche produit pour démarrer une discussion.</Text>
        </View>
      ) : (
        <FlatList
          data={conversations.filter(c => {
            // Recherche sur les deux noms possibles
            const otherName = user && c.sellerId?.toString() === user.id?.toString()
              ? c.buyerName || ''
              : c.sellerName || c.name || '';
            return (
              otherName.toLowerCase().includes(search.toLowerCase()) ||
              c.lastMessage.toLowerCase().includes(search.toLowerCase())
            );
          })}
          keyExtractor={item => item.id}
          renderItem={({ item }) => {
            // Déterminer le nom à afficher
            const otherName = user && item.sellerId?.toString() === user.id?.toString()
              ? item.buyerName || 'Acheteur'
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
          contentContainerStyle={{ paddingBottom: 24, marginTop: 12 }}
          style={{ flex: 1, marginHorizontal: 8 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  skeletonAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
}); 