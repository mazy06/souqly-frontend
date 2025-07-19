import AsyncStorage from '@react-native-async-storage/async-storage';

interface ConversationMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: number;
  metadata?: {
    intent?: string;
    confidence?: number;
    entities?: any[];
    suggestions?: string[];
  };
}

interface ConversationContext {
  userId: string;
  sessionId: string;
  preferences: {
    language: string;
    tone: 'formal' | 'casual' | 'friendly';
    expertise: 'beginner' | 'intermediate' | 'expert';
  };
  history: ConversationMessage[];
  currentIntent?: string;
  lastInteraction: number;
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

class AIConversationService {
  private static instance: AIConversationService;
  private context: ConversationContext | null = null;
  private isProcessing = false;
  private conversationHistory: ConversationMessage[] = [];

  private constructor() {}

  static getInstance(): AIConversationService {
    if (!AIConversationService.instance) {
      AIConversationService.instance = new AIConversationService();
    }
    return AIConversationService.instance;
  }

  /**
   * Initialise le service d'IA conversationnelle
   */
  async initialize(userId: string): Promise<void> {
    try {
      console.log('🤖 [AIConversationService] Initialisation...');
      
      // Charger le contexte utilisateur
      await this.loadUserContext(userId);
      
      // Initialiser la session
      await this.initializeSession(userId);
      
      console.log('✅ [AIConversationService] Initialisation terminée');
    } catch (error) {
      console.error('❌ [AIConversationService] Erreur d\'initialisation:', error);
      throw error;
    }
  }

  /**
   * Charge le contexte utilisateur
   */
  private async loadUserContext(userId: string): Promise<void> {
    try {
      const contextData = await AsyncStorage.getItem(`ai_context_${userId}`);
      if (contextData) {
        this.context = JSON.parse(contextData);
      } else {
        // Créer un nouveau contexte
        this.context = {
          userId,
          sessionId: this.generateSessionId(),
          preferences: {
            language: 'fr',
            tone: 'friendly',
            expertise: 'beginner'
          },
          history: [],
          lastInteraction: Date.now()
        };
        await this.saveUserContext();
      }
    } catch (error) {
      console.error('❌ [AIConversationService] Erreur chargement contexte:', error);
      throw error;
    }
  }

  /**
   * Sauvegarde le contexte utilisateur
   */
  private async saveUserContext(): Promise<void> {
    try {
      if (this.context) {
        await AsyncStorage.setItem(`ai_context_${this.context.userId}`, JSON.stringify(this.context));
      }
    } catch (error) {
      console.error('❌ [AIConversationService] Erreur sauvegarde contexte:', error);
      throw error;
    }
  }

  /**
   * Génère un ID de session unique
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Initialise une nouvelle session
   */
  private async initializeSession(userId: string): Promise<void> {
    try {
      if (this.context) {
        this.context.sessionId = this.generateSessionId();
        this.context.lastInteraction = Date.now();
        await this.saveUserContext();
      }
    } catch (error) {
      console.error('❌ [AIConversationService] Erreur initialisation session:', error);
      throw error;
    }
  }

  /**
   * Traite un message utilisateur et génère une réponse IA
   */
  async processMessage(userMessage: string): Promise<AIResponse> {
    try {
      if (this.isProcessing) {
        throw new Error('Traitement déjà en cours');
      }

      this.isProcessing = true;
      console.log('🤖 [AIConversationService] Traitement message:', userMessage);

      // Ajouter le message utilisateur à l'historique
      const userMsg: ConversationMessage = {
        id: this.generateMessageId(),
        type: 'user',
        content: userMessage,
        timestamp: Date.now()
      };

      this.addMessageToHistory(userMsg);

      // Analyser l'intention
      const intent = await this.analyzeIntent(userMessage);
      
      // Générer la réponse IA
      const aiResponse = await this.generateResponse(userMessage, intent);
      
      // Ajouter la réponse IA à l'historique
      const assistantMsg: ConversationMessage = {
        id: this.generateMessageId(),
        type: 'assistant',
        content: aiResponse.message,
        timestamp: Date.now(),
        metadata: {
          intent: aiResponse.intent,
          confidence: aiResponse.confidence,
          suggestions: aiResponse.suggestions
        }
      };

      this.addMessageToHistory(assistantMsg);

      // Mettre à jour le contexte
      if (this.context) {
        this.context.currentIntent = intent;
        this.context.lastInteraction = Date.now();
        await this.saveUserContext();
      }

      this.isProcessing = false;
      return aiResponse;
    } catch (error) {
      this.isProcessing = false;
      console.error('❌ [AIConversationService] Erreur traitement message:', error);
      throw error;
    }
  }

  /**
   * Analyse l'intention du message utilisateur
   */
  private async analyzeIntent(message: string): Promise<string> {
    try {
      const lowerMessage = message.toLowerCase();
      
      // Intents prédéfinis
      const intents = {
        greeting: ['bonjour', 'salut', 'hello', 'hi', 'coucou'],
        search: ['chercher', 'rechercher', 'trouver', 'recherche', 'search'],
        help: ['aide', 'help', 'assistance', 'support'],
        product: ['produit', 'article', 'item', 'objet'],
        category: ['catégorie', 'category', 'type'],
        price: ['prix', 'price', 'coût', 'tarif'],
        location: ['localisation', 'location', 'adresse', 'ville'],
        recommendation: ['recommandation', 'suggestion', 'conseil'],
        complaint: ['plainte', 'problème', 'erreur', 'bug'],
        compliment: ['félicitation', 'merci', 'super', 'génial'],
        goodbye: ['au revoir', 'bye', 'ciao', 'à bientôt']
      };

      // Trouver l'intention correspondante
      for (const [intent, keywords] of Object.entries(intents)) {
        if (keywords.some(keyword => lowerMessage.includes(keyword))) {
          return intent;
        }
      }

      // Intent par défaut
      return 'general';
    } catch (error) {
      console.error('❌ [AIConversationService] Erreur analyse intention:', error);
      return 'general';
    }
  }

  /**
   * Génère une réponse IA basée sur l'intention
   */
  private async generateResponse(message: string, intent: string): Promise<AIResponse> {
    try {
      const responses = {
        greeting: {
          message: "Bonjour ! Je suis votre assistant Souqly. Comment puis-je vous aider aujourd'hui ?",
          confidence: 0.95,
          suggestions: ["Rechercher un produit", "Voir les catégories", "Aide"]
        },
        search: {
          message: "Je vais vous aider à rechercher. Que cherchez-vous exactement ?",
          confidence: 0.90,
          suggestions: ["Électronique", "Vêtements", "Maison", "Sport"]
        },
        help: {
          message: "Je suis là pour vous aider ! Voici ce que je peux faire : rechercher des produits, donner des recommandations, vous guider dans les catégories, et bien plus encore.",
          confidence: 0.95,
          suggestions: ["Comment rechercher", "Comment acheter", "Comment vendre"]
        },
        product: {
          message: "Parfait ! Je peux vous aider à trouver des produits. Quel type de produit recherchez-vous ?",
          confidence: 0.85,
          suggestions: ["Téléphones", "Ordinateurs", "Livres", "Vêtements"]
        },
        category: {
          message: "Excellente idée ! Voici nos principales catégories : Électronique, Vêtements, Maison & Jardin, Sport, Livres, et bien d'autres.",
          confidence: 0.90,
          suggestions: ["Électronique", "Vêtements", "Maison", "Sport"]
        },
        price: {
          message: "Je comprends que le prix est important. Je peux vous aider à trouver des produits dans votre budget. Quel est votre budget approximatif ?",
          confidence: 0.80,
          suggestions: ["Moins de 50€", "50-200€", "200-500€", "Plus de 500€"]
        },
        location: {
          message: "Je peux vous aider à trouver des produits près de chez vous. Dans quelle ville ou région cherchez-vous ?",
          confidence: 0.85,
          suggestions: ["Paris", "Lyon", "Marseille", "Toulouse"]
        },
        recommendation: {
          message: "J'adore faire des recommandations ! Basé sur vos préférences, je peux vous suggérer des produits. Voulez-vous voir mes suggestions ?",
          confidence: 0.90,
          suggestions: ["Voir les recommandations", "Personnaliser les préférences", "Découvrir de nouveaux produits"]
        },
        complaint: {
          message: "Je suis désolé d'entendre cela. Je vais faire de mon mieux pour résoudre votre problème. Pouvez-vous me donner plus de détails ?",
          confidence: 0.95,
          suggestions: ["Contacter le support", "Signaler un problème", "Demander un remboursement"]
        },
        compliment: {
          message: "Merci beaucoup ! Je suis ravi de vous avoir aidé. Y a-t-il autre chose que je peux faire pour vous ?",
          confidence: 0.95,
          suggestions: ["Continuer à explorer", "Voir mes recommandations", "Partager Souqly"]
        },
        goodbye: {
          message: "Au revoir ! N'hésitez pas à revenir si vous avez besoin d'aide. Bonne journée !",
          confidence: 0.95,
          suggestions: ["Revenir plus tard", "Partager Souqly", "Laisser un avis"]
        },
        general: {
          message: "Je comprends votre demande. Laissez-moi vous aider au mieux. Que souhaitez-vous faire sur Souqly ?",
          confidence: 0.75,
          suggestions: ["Rechercher", "Explorer les catégories", "Voir les nouveautés", "Aide"]
        }
      };

      const response = responses[intent as keyof typeof responses] || responses.general;
      
      return {
        message: response.message,
        confidence: response.confidence,
        intent,
        suggestions: response.suggestions,
        actions: this.generateActions(intent, message),
        metadata: await this.generateMetadata(intent, message)
      };
    } catch (error) {
      console.error('❌ [AIConversationService] Erreur génération réponse:', error);
      return {
        message: "Je suis désolé, je n'ai pas compris. Pouvez-vous reformuler votre demande ?",
        confidence: 0.5,
        intent: 'general',
        suggestions: ["Aide", "Rechercher", "Catégories"]
      };
    }
  }

  /**
   * Génère des actions basées sur l'intention
   */
  private generateActions(intent: string, message: string): AIResponse['actions'] {
    const actions = [];
    
    switch (intent) {
      case 'search':
        actions.push({
          type: 'search',
          data: { query: message }
        });
        break;
      case 'category':
        actions.push({
          type: 'navigate',
          data: { screen: 'CategoryScreen' }
        });
        break;
      case 'recommendation':
        actions.push({
          type: 'recommend',
          data: { type: 'personalized' }
        });
        break;
      case 'help':
        actions.push({
          type: 'navigate',
          data: { screen: 'HelpScreen' }
        });
        break;
    }
    
    return actions;
  }

  /**
   * Génère des métadonnées pour la réponse
   */
  private async generateMetadata(intent: string, message: string): Promise<AIResponse['metadata']> {
    try {
      const metadata: AIResponse['metadata'] = {};
      
      if (intent === 'search' || intent === 'product') {
        // Simuler des recommandations de produits
        metadata.productRecommendations = [
          { id: '1', title: 'iPhone 13 Pro', price: 899, category: 'Électronique' },
          { id: '2', title: 'MacBook Air', price: 1299, category: 'Électronique' },
          { id: '3', title: 'AirPods Pro', price: 249, category: 'Électronique' }
        ];
      }
      
      if (intent === 'category') {
        metadata.categorySuggestions = ['Électronique', 'Vêtements', 'Maison', 'Sport', 'Livres'];
      }
      
      if (intent === 'search') {
        metadata.searchQueries = [message, 'produit similaire', 'meilleur prix'];
      }
      
      return metadata;
    } catch (error) {
      console.error('❌ [AIConversationService] Erreur génération métadonnées:', error);
      return {};
    }
  }

  /**
   * Ajoute un message à l'historique
   */
  private addMessageToHistory(message: ConversationMessage): void {
    this.conversationHistory.push(message);
    
    // Limiter l'historique à 50 messages
    if (this.conversationHistory.length > 50) {
      this.conversationHistory = this.conversationHistory.slice(-50);
    }
  }

  /**
   * Génère un ID de message unique
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Obtient l'historique de conversation
   */
  getConversationHistory(): ConversationMessage[] {
    return [...this.conversationHistory];
  }

  /**
   * Efface l'historique de conversation
   */
  async clearHistory(): Promise<void> {
    try {
      this.conversationHistory = [];
      if (this.context) {
        this.context.history = [];
        await this.saveUserContext();
      }
      console.log('✅ [AIConversationService] Historique effacé');
    } catch (error) {
      console.error('❌ [AIConversationService] Erreur effacement historique:', error);
      throw error;
    }
  }

  /**
   * Met à jour les préférences utilisateur
   */
  async updatePreferences(preferences: Partial<ConversationContext['preferences']>): Promise<void> {
    try {
      if (this.context) {
        this.context.preferences = { ...this.context.preferences, ...preferences };
        await this.saveUserContext();
        console.log('✅ [AIConversationService] Préférences mises à jour');
      }
    } catch (error) {
      console.error('❌ [AIConversationService] Erreur mise à jour préférences:', error);
      throw error;
    }
  }

  /**
   * Obtient les statistiques de conversation
   */
  getConversationStats(): {
    totalMessages: number;
    userMessages: number;
    assistantMessages: number;
    averageResponseTime: number;
    mostCommonIntent: string;
  } {
    const userMessages = this.conversationHistory.filter(m => m.type === 'user').length;
    const assistantMessages = this.conversationHistory.filter(m => m.type === 'assistant').length;
    
    // Calculer l'intention la plus commune
    const intentCounts: Record<string, number> = {};
    this.conversationHistory.forEach(msg => {
      if (msg.metadata?.intent) {
        intentCounts[msg.metadata.intent] = (intentCounts[msg.metadata.intent] || 0) + 1;
      }
    });
    
    const mostCommonIntent = Object.entries(intentCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'general';
    
    return {
      totalMessages: this.conversationHistory.length,
      userMessages,
      assistantMessages,
      averageResponseTime: 1500, // Simulé
      mostCommonIntent
    };
  }

  /**
   * Nettoie les données
   */
  async cleanup(): Promise<void> {
    try {
      console.log('🧹 [AIConversationService] Nettoyage des données...');
      
      this.conversationHistory = [];
      this.context = null;
      this.isProcessing = false;
      
      console.log('✅ [AIConversationService] Nettoyage terminé');
    } catch (error) {
      console.error('❌ [AIConversationService] Erreur nettoyage:', error);
      throw error;
    }
  }
}

export default AIConversationService; 