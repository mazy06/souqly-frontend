import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AuthService, { AuthUser, AuthResult } from '../services/AuthService';
import TokenService from '../services/TokenService';
import ApiService from '../services/ApiService';

type AuthContextType = {
  isAuthenticated: boolean;
  isGuest: boolean;
  user: AuthUser | null;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  guest: () => void;
  updateUser: (userData: AuthUser) => void;
  signInWithGoogle: () => Promise<AuthResult>;
  signInWithFacebook: () => Promise<AuthResult>;
  signInWithApple: () => Promise<AuthResult>;
  signInWithEmail: (email: string, password: string) => Promise<AuthResult>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<AuthResult>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Vérifier l'authentification au démarrage de l'app
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      console.log('[AuthContext] Vérification du statut d\'authentification...');
      
      // Vérifier si l'utilisateur a des tokens valides
      const isAuth = await TokenService.isAuthenticated();
      console.log('[AuthContext] isAuthenticated:', isAuth);
      
      if (isAuth) {
        try {
          console.log('[AuthContext] Tokens valides trouvés, récupération des infos utilisateur...');
          // Récupérer les informations complètes de l'utilisateur via l'API
          const userInfo = await ApiService.getCurrentUser() as any;
          console.log('[AuthContext] Informations utilisateur récupérées:', userInfo);
          
          if (userInfo) {
            setUser({
              id: userInfo.id.toString(),
              email: userInfo.email,
              name: `${userInfo.firstName} ${userInfo.lastName}`.trim(),
              provider: 'email',
              role: userInfo.role.toLowerCase(),
            });
            setIsAuthenticated(true);
            setIsGuest(false);
            console.log('[AuthContext] Utilisateur connecté avec succès');
          } else {
            console.log('[AuthContext] Aucune information utilisateur retournée, déconnexion...');
            // Si l'API ne retourne pas d'utilisateur, supprimer les tokens
            await TokenService.clearTokens();
            setIsAuthenticated(false);
            setIsGuest(false);
            setUser(null);
          }
        } catch (error) {
          console.error('[AuthContext] Erreur lors de la récupération des infos utilisateur:', error);
          // Erreur silencieuse lors de la récupération des infos utilisateur
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        console.log('[AuthContext] Aucun token valide trouvé');
        // Pas de tokens valides
        setIsAuthenticated(false);
        setIsGuest(false);
        setUser(null);
      }
    } catch (error) {
      console.error('[AuthContext] Erreur lors de la vérification du statut:', error);
      // En cas d'erreur, on considère que l'utilisateur n'est pas connecté
      await TokenService.clearTokens();
      setIsAuthenticated(false);
      setIsGuest(false);
      setUser(null);
    } finally {
      setIsLoading(false);
      console.log('[AuthContext] Vérification terminée');
    }
  };

  const login = () => {
    setIsAuthenticated(true);
    setIsGuest(false);
  };

  const logout = async () => {
    try {
      console.log('→ [AuthContext] Début logout');
      await AuthService.logout();
      console.log('→ [AuthContext] Appel AuthService.logout() terminé');
    } catch (error) {
      console.log('→ [AuthContext] Erreur dans logout:', error);
    } finally {
      setIsAuthenticated(false);
      setIsGuest(false);
      setUser(null);
      console.log('→ [AuthContext] État local réinitialisé');
    }
  };

  const guest = () => {
    setIsGuest(true);
    setIsAuthenticated(false);
    setUser(null);
  };

  const signInWithGoogle = async (): Promise<AuthResult> => {
    const result = await AuthService.signInWithGoogle();
    if (result.success && result.user) {
      setUser(result.user);
      setIsAuthenticated(true);
      setIsGuest(false);
    }
    return result;
  };

  const signInWithFacebook = async (): Promise<AuthResult> => {
    const result = await AuthService.signInWithFacebook();
    if (result.success && result.user) {
      setUser(result.user);
      setIsAuthenticated(true);
      setIsGuest(false);
    }
    return result;
  };

  const signInWithApple = async (): Promise<AuthResult> => {
    const result = await AuthService.signInWithApple();
    if (result.success && result.user) {
      setUser(result.user);
      setIsAuthenticated(true);
      setIsGuest(false);
    }
    return result;
  };

  const signInWithEmail = async (email: string, password: string): Promise<AuthResult> => {
    const result = await AuthService.signInWithEmail(email, password);
    if (result.success && result.user) {
      setUser(result.user);
      setIsAuthenticated(true);
      setIsGuest(false);
    }
    return result;
  };

  const signUpWithEmail = async (email: string, password: string, name: string): Promise<AuthResult> => {
    const result = await AuthService.signUpWithEmail(email, password, name);
    if (result.success && result.user) {
      setUser(result.user);
      setIsAuthenticated(true);
      setIsGuest(false);
    }
    return result;
  };

  const updateUser = (userData: AuthUser) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isGuest, 
      user,
      isLoading,
      login, 
      logout, 
      guest,
      updateUser,
      signInWithGoogle,
      signInWithFacebook,
      signInWithApple,
      signInWithEmail,
      signUpWithEmail
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 