import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import ConversationService, { Message, Conversation } from '../services/ConversationService';
import ConversationProductCard from '../components/ConversationProductCard';
import ProductService, { Product } from '../services/ProductService';
import OfferMessage from '../components/OfferMessage';
import { connectChatSocket, disconnectChatSocket, sendChatMessage } from '../services/ChatSocketService';
import TokenService from '../services/TokenService';
import { useUnreadConversations } from '../contexts/UnreadConversationsContext';

interface ConversationRouteParams {
  conversationId: string;
  name: string;
  avatarUrl?: string;
  productId?: number;
}

export default function ConversationScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [otherUserName, setOtherUserName] = useState<string>('');
  const { refreshUnreadCount } = useUnreadConversations();

  const params = route.params as ConversationRouteParams;

  useEffect(() => {
    const loadConversationData = async () => {
      try {
        setLoading(true);

        // Charger la conversation complète
        if (params?.conversationId) {
          const conv = await ConversationService.getConversation(params.conversationId);
          setConversation(conv);

          // Déterminer l'autre participant avec les nouveaux champs
          let otherName = '';
          if (user && conv) {
            if (user.id?.toString() === conv.sellerId?.toString()) {
              // Je suis vendeur, l'autre est l'acheteur
              otherName = conv.buyerName || 'Acheteur';
            } else {
              // Je suis acheteur, l'autre est le vendeur
              otherName = conv.sellerName || conv.name || 'Vendeur';
            }
          }
          setOtherUserName(otherName);
        }

        // Charger les messages
        if (params?.conversationId) {
          const conversationMessages = await ConversationService.getMessages(params.conversationId);
          // Mapper les messages pour isFromMe
          const mapped = conversationMessages.map(msg => ({
            ...msg,
            isFromMe: !!(user && (msg.sender === user.email || msg.sender === user.id)),
          }));
          setMessages(mapped);
          
          // Marquer la conversation comme lue
          try {
            await ConversationService.markAsRead(params.conversationId);
            await refreshUnreadCount();
            console.log('[ConversationScreen] Conversation marquée comme lue');
          } catch (error) {
            console.error('[ConversationScreen] Erreur lors du marquage comme lu:', error);
          }
        }

        // Charger le produit
        if (params?.productId) {
          try {
            const productData = await ProductService.getProduct(params.productId);
            setProduct(productData);
          } catch (error) {
            console.error('[ConversationScreen] Erreur lors du chargement du produit:', error);
          }
        }
      } catch (error) {
        console.error('[ConversationScreen] Erreur lors du chargement de la conversation:', error);
        Alert.alert('Erreur', 'Impossible de charger la conversation');
      } finally {
        setLoading(false);
      }
    };

    loadConversationData();

    // Connecter au WebSocket pour les messages temps réel
    if (params?.conversationId && user) {
      TokenService.getAccessToken().then(token => {
        if (token) {
          connectChatSocket(token, params.conversationId, (newMessage) => {
            // Vérifier si le message vient d'un autre utilisateur
            const isFromOtherUser = !!(user && newMessage.sender !== user.email && newMessage.sender !== user.id);

            if (!isFromOtherUser) {
              // C'est moi qui ai envoyé ce message, ne rien faire
              return;
            }

            // Ajouter le nouveau message à la liste
            setMessages(prev => [...prev, {
              ...newMessage,
              isFromMe: false,
            }]);

            // Notification locale si le message vient d'un autre utilisateur
            // Vibration ou son pour notifier l'utilisateur
            console.log('[ConversationScreen] Nouveau message de', newMessage.sender);
            // TODO: Ajouter une vraie notification push ici
            // Marquer comme lu immédiatement si on est dans la conversation
            ConversationService.markAsRead(params.conversationId).then(() => {
              refreshUnreadCount();
            });
          });
        }
      });
    }

    // Cleanup: déconnecter le WebSocket
    return () => {
      disconnectChatSocket();
    };
  }, [params?.conversationId, params?.productId, user]);

  const sendMessage = async () => {
    if (newMessage.trim() && params?.conversationId) {
      try {
        // Envoyer via WebSocket pour un affichage immédiat
        const messageData = {
          sender: user?.email || user?.id,
          content: newMessage.trim(),
          conversationId: params.conversationId,
        };
        
        // Envoyer via WebSocket (temps réel)
        sendChatMessage(params.conversationId, messageData);
        
        // Envoyer via API REST (persistance)
        const message = await ConversationService.sendMessage({
          conversationId: params.conversationId,
          text: newMessage.trim(),
          productId: params.productId,
        });
        
        // Ajouter le message à la liste (si pas déjà ajouté par WebSocket)
        setMessages(prev => {
          const messageExists = prev.some(msg => 
            msg.text === newMessage.trim() && msg.isFromMe
          );
          if (!messageExists) {
            return [...prev, {
              ...message,
              isFromMe: true,
            }];
          }
          return prev;
        });
        
        setNewMessage('');
      } catch (error) {
        console.error('[ConversationScreen] Erreur lors de l\'envoi du message:', error);
        Alert.alert('Erreur', 'Impossible d\'envoyer le message');
      }
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    // Si le message contient une offre, utiliser le composant OfferMessage
    if (item.offerPrice) {
      return (
        <OfferMessage
          price={item.offerPrice}
          message={item.text}
          timestamp={item.timestamp}
          isFromMe={item.isFromMe}
          onAccept={() => {
            // TODO: Implémenter l'acceptation de l'offre
            console.log('Offre acceptée:', item.offerPrice);
          }}
          onDecline={() => {
            // TODO: Implémenter le refus de l'offre
            console.log('Offre refusée:', item.offerPrice);
          }}
        />
      );
    }

    // Message normal
    return (
      <View style={[
        styles.messageContainer,
        item.isFromMe ? styles.myMessage : styles.theirMessage
      ]}>
        <View style={[
          styles.messageBubble,
          item.isFromMe 
            ? { backgroundColor: colors.primary, alignSelf: 'flex-end' }
            : { backgroundColor: colors.card, alignSelf: 'flex-start' }
        ]}>
          <Text style={[
            styles.messageText,
            { color: item.isFromMe ? 'white' : colors.text }
          ]}>
            {item.text}
          </Text>
          <Text style={[
            styles.messageTime,
            { color: item.isFromMe ? 'rgba(255,255,255,0.7)' : colors.tabIconDefault }
          ]}>
            {item.timestamp}
          </Text>
        </View>
      </View>
    );
  };

  const renderProductCard = () => {
    if (!product) return null;
    return (
      <View style={styles.productCardContainer}>
        <Text style={[styles.productCardTitle, { color: colors.text }]}>Article en discussion</Text>
        <ConversationProductCard product={product} compact={true} showPrice={true} />
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top','left','right','bottom']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}> 
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={[styles.headerName, { color: colors.text }]} numberOfLines={1}>
            {otherUserName || 'Conversation'}
          </Text>
          <Text style={[styles.headerStatus, { color: colors.tabIconDefault }]}>En ligne</Text>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>
      {/* Messages */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.tabIconDefault }]}>Chargement...</Text>
        </View>
      ) : (
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={[styles.messagesList, { paddingBottom: 8 }]}
          inverted={false}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderProductCard}
        />
      )}
      {/* Input */}
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={[styles.inputContainer, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, 8) }]}
        >
          <View style={[styles.inputWrapper, { backgroundColor: colors.card }]}> 
            <TextInput
              style={[styles.textInput, { color: colors.text }]}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Tapez votre message..."
              placeholderTextColor={colors.tabIconDefault}
              multiline
              maxLength={500}
            />
            <TouchableOpacity 
              onPress={sendMessage}
              style={[styles.sendButton, { backgroundColor: colors.card }]}
              disabled={!newMessage.trim()}
            >
              <Ionicons name="send" size={22} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 8,
  },
  headerName: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerStatus: {
    fontSize: 14,
    marginTop: 2,
  },
  moreButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageContainer: {
    marginVertical: 4,
  },
  myMessage: {
    alignItems: 'flex-end',
  },
  theirMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 4,
    minHeight: 40,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  productCardContainer: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  productCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.8,
  },
}); 