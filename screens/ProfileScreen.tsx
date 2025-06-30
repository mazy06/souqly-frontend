import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth, AuthUser } from '../contexts/AuthContext';

// Définition du type du stack profil
export type ProfileStackParamList = {
  ProfileMain: undefined;
  AdminCategories: undefined;
};

export default function ProfileScreen() {
  const navigation = useNavigation<StackNavigationProp<ProfileStackParamList>>();
  const { user } = useAuth(); // user: AuthUser | null

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Profil</Text>
      <Text style={{ marginTop: 8, color: '#888' }}>Rôle : {user?.role || 'user'}</Text>
      {user?.role === 'admin' && (
        <TouchableOpacity
          style={{ marginTop: 24, backgroundColor: '#008080', padding: 12, borderRadius: 8 }}
          onPress={() => navigation.navigate('AdminCategories')}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Gestion des catégories</Text>
        </TouchableOpacity>
      )}
    </View>
  );
} 