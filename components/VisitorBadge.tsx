import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import Colors from '../constants/Colors';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function VisitorBadge({ onSignup }: { onSignup: () => void }) {
  const { isGuest } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  if (!isGuest) return null;

  return (
    <View style={[styles.badge, { backgroundColor: colors.card + 'cc' }]}> 
      <Ionicons name="person-circle-outline" size={20} color="#bbb" style={{ marginRight: 6 }} />
      <Text style={[styles.text, { color: '#888' }]}>Mode visiteur</Text>
      <TouchableOpacity onPress={onSignup}>
        <Text style={styles.link}>Créer un compte</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginVertical: 6,
    marginBottom: 2,
  },
  text: {
    fontSize: 13,
    marginRight: 8,
  },
  link: {
    color: '#3ba6a6',
    textDecorationLine: 'underline',
    fontSize: 13,
    fontWeight: '500',
  },
}); 