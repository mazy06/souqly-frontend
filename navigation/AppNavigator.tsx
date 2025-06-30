import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
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

export default function AppNavigator() {
  const { isAuthenticated, isGuest } = useAuth();

  return (
    <NavigationContainer linking={linking as any} fallback={null}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {(isAuthenticated || isGuest) ? (
          <Stack.Screen name="Main" component={TabNavigator} />
        ) : (
          <>
            <Stack.Screen name="Auth" component={AuthLandingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
} 