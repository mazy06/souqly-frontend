import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { useColorScheme } from 'react-native';

type TabBarIconProps = {
  route: string;
  color: string;
  focused: boolean;
};

export default function TabBarIcon({ route, color, focused }: TabBarIconProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  let iconName;
  switch (route) {
    case 'Accueil':
      iconName = focused ? 'home' : 'home-outline';
      break;
    case 'Rechercher':
      iconName = focused ? 'search' : 'search-outline';
      break;
    case 'Vendre':
      iconName = focused ? 'add-circle' : 'add-circle-outline';
      break;
    case 'Messages':
      iconName = focused ? 'mail' : 'mail-outline';
      break;
    case 'Profil':
      iconName = focused ? 'person' : 'person-outline';
      break;
    default:
      iconName = 'ellipse';
  }
  return <Ionicons name={iconName as any} size={24} color={color} />;
} 