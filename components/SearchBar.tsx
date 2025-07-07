import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

export default function SearchBar({ value, onChangeText, onPressCamera, onSubmit, placeholder }: { value: string; onChangeText: (t: string) => void; onPressCamera?: () => void; onSubmit?: () => void; placeholder?: string }) {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <Ionicons name="search" size={20} color={colors.tabIconDefault} style={styles.icon} />
      <TextInput
        style={[styles.input, { color: colors.text }]}
        placeholder={placeholder || "Rechercher un article ou un membre"}
        placeholderTextColor={colors.tabIconDefault}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
      />
      <TouchableOpacity onPress={onPressCamera} style={styles.heartButton}>
        <Ionicons name="camera-outline" size={22} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginHorizontal: 8,
    marginBottom: 10,
    height: 44,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  heartButton: {
    marginLeft: 8,
    padding: 4,
  },
}); 