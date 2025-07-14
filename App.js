import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LoaderProvider } from './contexts/LoaderContext';
import { ToastProvider } from './contexts/ToastContext';
import AppNavigator from './navigation/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { UnreadConversationsProvider } from './contexts/UnreadConversationsContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <LoaderProvider>
            <ToastProvider>
              <UnreadConversationsProvider>
                <AppNavigator />
              </UnreadConversationsProvider>
            </ToastProvider>
          </LoaderProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
} 