import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { useColorScheme, View, Text } from 'react-native';
import { useUnreadConversations } from '../contexts/UnreadConversationsContext';

type TabBarIconProps = {
  route: string;
  color: string;
  focused: boolean;
};

export default function TabBarIcon({ route, color, focused }: TabBarIconProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { unreadCount } = useUnreadConversations();

  let iconName;
  switch (route) {
    case 'Accueil':
      iconName = focused ? 'home' : 'home-outline';
      break;
    case 'Favoris':
      iconName = focused ? 'heart' : 'heart-outline';
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

  return (
    <View>
      <Ionicons name={iconName as any} size={24} color={color} />
      {route === 'Messages' && unreadCount > 0 && (
        <View style={{
          position: 'absolute',
          right: -6,
          top: -3,
          backgroundColor: 'red',
          borderRadius: 8,
          minWidth: 16,
          height: 16,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 3,
        }}>
          <Text style={{ color: 'white', fontSize: 11, fontWeight: 'bold' }}>{unreadCount}</Text>
        </View>
      )}
    </View>
  );
} 