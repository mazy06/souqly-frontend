import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LoaderProvider } from './contexts/LoaderContext';
import { ToastProvider } from './contexts/ToastContext';
import AppNavigator from './navigation/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <LoaderProvider>
            <ToastProvider>
              <AppNavigator />
            </ToastProvider>
          </LoaderProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
} 