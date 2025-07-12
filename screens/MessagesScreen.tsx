import React from 'react';
import { View, Text } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import GuestMessage from '../components/GuestMessage';
import SectionHeader from '../components/SectionHeader';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function MessagesScreen() {
  const { isGuest, logout } = useAuth();

  if (isGuest) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top','left','right']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <GuestMessage
            iconName="chatbubble-ellipses-outline"
            iconColor="#008080"
            title="Connectez-vous pour accéder à vos messages"
            color="#008080"
            textColor="#222"
            backgroundColor="#fff"
            onPress={() => logout()}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Messages</Text>
    </View>
  );
} 