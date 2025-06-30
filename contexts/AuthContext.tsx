import React, { createContext, useContext, useState, ReactNode } from 'react';
import AuthService, { AuthUser, AuthResult } from '../services/AuthService';

type AuthContextType = {
  isAuthenticated: boolean;
  isGuest: boolean;
  user: AuthUser | null;
  login: () => void;
  logout: () => void;
  guest: () => void;
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

  const login = () => {
    setIsAuthenticated(true);
    setIsGuest(false);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsGuest(false);
    setUser(null);
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
      setUser({
        ...result.user,
        role: email === 'admin@souqly.com' ? 'admin' : 'user',
      });
      setIsAuthenticated(true);
      setIsGuest(false);
    }
    return result;
  };

  const signUpWithEmail = async (email: string, password: string, name: string): Promise<AuthResult> => {
    const result = await AuthService.signUpWithEmail(email, password, name);
    if (result.success && result.user) {
      setUser({
        ...result.user,
        role: email === 'admin@souqly.com' ? 'admin' : 'user',
      });
      setIsAuthenticated(true);
      setIsGuest(false);
    }
    return result;
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isGuest, 
      user,
      login, 
      logout, 
      guest,
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