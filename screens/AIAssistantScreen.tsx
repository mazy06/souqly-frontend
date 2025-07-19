import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import AIConversationService from '../services/AIConversationService';
import Colors from '../constants/Colors';

const { width } = Dimensions.get('window');

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: number;
  metadata?: {
    intent?: string;
    confidence?: number;
    suggestions?: string[];
  };
}

interface AIResponse {
  message: string;
  confidence: number;
  intent: string;
  suggestions: string[];
  actions?: {
    type: 'navigate' | 'search' | 'filter' | 'recommend' | 'help';
    data: any;
  }[];
  metadata?: {
    productRecommendations?: any[];
    categorySuggestions?: string[];
    searchQueries?: string[];
  };
}

export default function AIAssistantScreen() {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const typingAnimation = useRef(new Animated.Value(0)).current;
  const aiService = AIConversationService.getInstance();

  useEffect(() => {
    initializeAI();
    addWelcomeMessage();
  }, []);

  const initializeAI = async () => {
    try {
      if (user?.id) {
        await aiService.initialize(user.id);
        console.log('✅ Assistant IA initialisé');
      }
    } catch (error) {
      console.error('❌ Erreur initialisation IA:', error);
      Alert.alert('Erreur', 'Impossible d\'initialiser l\'assistant IA');
    }
  };

  const addWelcomeMessage = () => {
    const welcomeMessage: Message = {
      id: 'welcome',
      type: 'assistant',
      content: 'Bonjour ! Je suis votre assistant Souqly. Comment puis-je vous aider aujourd\'hui ?',
      timestamp: Date.now(),
      metadata: {
        intent: 'greeting',
        confidence: 0.95,
        suggestions: ['Rechercher un produit', 'Voir les catégories', 'Aide']
      }
    };
    setMessages([welcomeMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputText.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsProcessing(true);

    try {
      // Simuler la frappe de l'IA
      setIsTyping(true);
      startTypingAnimation();

      // Traiter le message avec l'IA
      const response = await aiService.processMessage(userMessage.content);

      // Arrêter l'animation de frappe
      setIsTyping(false);
      stopTypingAnimation();

      // Ajouter la réponse de l'IA
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.message,
        timestamp: Date.now(),
        metadata: {
          intent: response.intent,
          confidence: response.confidence,
          suggestions: response.suggestions
        }
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Traiter les actions si nécessaire
      if (response.actions && response.actions.length > 0) {
        handleAIActions(response.actions);
      }

    } catch (error) {
      console.error('❌ Erreur traitement message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Désolé, je rencontre un problème. Pouvez-vous réessayer ?',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
      setIsTyping(false);
    }
  };

  const startTypingAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(typingAnimation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(typingAnimation, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopTypingAnimation = () => {
    typingAnimation.stopAnimation();
    typingAnimation.setValue(0);
  };

  const handleAIActions = (actions: AIResponse['actions']) => {
    actions?.forEach(action => {
      switch (action.type) {
        case 'navigate':
          console.log('🧭 Navigation vers:', action.data.screen);
          break;
        case 'search':
          console.log('🔍 Recherche:', action.data.query);
          break;
        case 'recommend':
          console.log('💡 Recommandations:', action.data.type);
          break;
        case 'help':
          console.log('❓ Aide demandée');
          break;
      }
    });
  };

  const handleSuggestionPress = (suggestion: string) => {
    setInputText(suggestion);
    inputRef.current?.focus();
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.type === 'user';
    const isAssistant = item.type === 'assistant';

    return (
      <View style={[
        styles.messageContainer,
        isUser ? styles.userMessage : styles.assistantMessage
      ]}>
        <View style={[
          styles.messageBubble,
          {
            backgroundColor: isUser ? colors.primary : colors.card,
            borderColor: isUser ? colors.primary : colors.border
          }
        ]}>
          <Text style={[
            styles.messageText,
            { color: isUser ? 'white' : colors.text }
          ]}>
            {item.content}
          </Text>
          
          {isAssistant && item.metadata?.suggestions && (
            <View style={styles.suggestionsContainer}>
              {item.metadata.suggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.suggestionButton, { borderColor: colors.primary }]}
                  onPress={() => handleSuggestionPress(suggestion)}
                >
                  <Text style={[styles.suggestionText, { color: colors.primary }]}>
                    {suggestion}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        
        <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
          {new Date(item.timestamp).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!isTyping) return null;

    return (
      <View style={[styles.messageContainer, styles.assistantMessage]}>
        <View style={[styles.messageBubble, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.typingIndicator}>
            <Animated.View
              style={[
                styles.typingDot,
                {
                  backgroundColor: colors.primary,
                  opacity: typingAnimation
                }
              ]}
            />
            <Animated.View
              style={[
                styles.typingDot,
                {
                  backgroundColor: colors.primary,
                  opacity: typingAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 1]
                  })
                }
              ]}
            />
            <Animated.View
              style={[
                styles.typingDot,
                {
                  backgroundColor: colors.primary,
                  opacity: typingAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.1, 1]
                  })
                }
              ]}
            />
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <Ionicons name="chatbubble-ellipses" size={24} color={colors.primary} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Assistant IA
          </Text>
        </View>
        <TouchableOpacity style={styles.headerRight}>
          <Ionicons name="settings-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <FlatList
          ref={flatListRef}
          data={[...messages, ...(isTyping ? [{ id: 'typing' }] : [])]}
          renderItem={({ item }) => 
            item.id === 'typing' ? renderTypingIndicator() : renderMessage({ item })
          }
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      </KeyboardAvoidingView>

      {/* Input */}
      <View style={[styles.inputContainer, { borderTopColor: colors.border }]}>
        <View style={[styles.inputWrapper, { backgroundColor: colors.card }]}>
          <TextInput
            ref={inputRef}
            style={[styles.textInput, { color: colors.text }]}
            placeholder="Tapez votre message..."
            placeholderTextColor={colors.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!isProcessing}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor: inputText.trim() ? colors.primary : colors.border,
                opacity: isProcessing ? 0.5 : 1
              }
            ]}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="send" size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  headerRight: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messageContainer: {
    marginVertical: 8,
    maxWidth: width * 0.8,
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    maxWidth: '100%',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  suggestionsContainer: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  suggestionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  inputContainer: {
    padding: 16,
    borderTopWidth: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 48,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
}); 