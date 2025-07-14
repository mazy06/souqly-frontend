import React, { createContext, useContext, useState } from 'react';
import ConversationService from '../services/ConversationService';
import { useAuth } from './AuthContext';

// Type du contexte
type UnreadContextType = {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  refreshUnreadCount: () => Promise<void>;
};

const UnreadConversationsContext = createContext<UnreadContextType | undefined>(undefined);

export const UnreadConversationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  // Fonction pour rafraîchir le compteur depuis l'API
  const refreshUnreadCount = async () => {
    try {
      const conversations = await ConversationService.getConversations();
      const unread = conversations.filter(c => c.unreadCount > 0).length;
      setUnreadCount(unread);
    } catch {
      setUnreadCount(0);
    }
  };

  // Charger le nombre de conversations non lues dès que l'utilisateur est connecté
  React.useEffect(() => {
    if (user) {
      refreshUnreadCount();
    }
  }, [user]);

  return (
    <UnreadConversationsContext.Provider value={{ unreadCount, setUnreadCount, refreshUnreadCount }}>
      {children}
    </UnreadConversationsContext.Provider>
  );
};

export function useUnreadConversations() {
  const ctx = useContext(UnreadConversationsContext);
  if (!ctx) throw new Error('useUnreadConversations must be used within UnreadConversationsProvider');
  return ctx;
} 