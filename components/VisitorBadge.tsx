import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function VisitorBadge({ onSignup }: { onSignup: () => void }) {
  const { isGuest } = useAuth();
  const { colors } = useTheme();

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
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  text: {
    fontSize: 14,
    marginRight: 8,
  },
  link: {
    fontSize: 14,
    color: '#00BFA6',
    fontWeight: '600',
  },
}); 