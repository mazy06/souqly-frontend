import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { View, ActivityIndicator, Text } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import AuthLandingScreen from '../screens/AuthLandingScreen';
import LoginScreen from '../screens/LoginScreen';
import TabNavigator from './TabNavigator';

const Stack = createStackNavigator();

const linking = {
  prefixes: ['souqly://', 'https://souqly.com'],
  config: {
    screens: {
      Main: {
        screens: {
          Accueil: {
            screens: {
              ProductDetail: 'product/:productId',
            },
          },
        },
      },
      Auth: '*',
    },
  },
};

// Composant de chargement
function LoadingScreen() {
  const { colors } = useTheme();
  
  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: colors.background 
    }}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={{ 
        marginTop: 16, 
        color: colors.text,
        fontSize: 16 
      }}>
        Chargement...
      </Text>
    </View>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, isGuest, isLoading } = useAuth();
  const { colors } = useTheme();

  // Afficher l'écran de chargement pendant la vérification de l'authentification
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer linking={linking as any} fallback={null}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated || isGuest ? (
          // Utilisateur connecté - afficher l'écran principal
          <Stack.Screen name="Main" component={TabNavigator} />
        ) : (
          // Utilisateur non connecté - afficher les écrans d'authentification
          <>
            <Stack.Screen name="Auth" component={AuthLandingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
} 