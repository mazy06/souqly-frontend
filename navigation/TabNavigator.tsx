import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeStack from './HomeStack';
import FavoritesStack from './FavoritesStack';
import SellStack from './SellStack';
import MessagesStack from './MessagesStack';
import ProfileStack from './ProfileStack';
import TabBarIcon from '../components/TabBarIcon';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size, focused }) => (
          <TabBarIcon route={route.name} color={color} focused={focused} />
        ),
        tabBarShowLabel: true,
        headerShown: false,
        tabBarActiveTintColor: '#008080',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: ((route) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? '';
          if (routeName === 'ProductDetail') {
            return { display: 'none' };
          }
          return {};
        })(route),
      })}
    >
      <Tab.Screen name="Accueil" component={HomeStack} />
      <Tab.Screen name="Favoris" component={FavoritesStack} />
      <Tab.Screen name="Vendre" component={SellStack} />
      <Tab.Screen name="Messages" component={MessagesStack} />
      <Tab.Screen name="Profil" component={ProfileStack} />
    </Tab.Navigator>
  );
} 