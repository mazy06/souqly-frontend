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
    <View style={[styles.badge, { backgroundColor: colors.card + '99' }]}> 
      <Ionicons name="person-circle-outline" size={16} color="#bbb" style={{ marginRight: 4 }} />
      <Text style={[styles.text, { color: colors.text + '99', fontSize: 12, marginRight: 6 }]}>Mode visiteur</Text>
      <TouchableOpacity onPress={onSignup}>
        <Text style={[styles.link, { color: colors.primary + 'cc', fontWeight: '400', fontSize: 12 }]}>Créer un compte</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: 8,
  },
  text: {
    fontSize: 12,
    marginRight: 6,
  },
  link: {
    fontSize: 12,
    fontWeight: '400',
  },
}); 