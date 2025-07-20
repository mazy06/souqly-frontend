import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: any;
}

export default function SearchBar({ 
  value, 
  onChangeText, 
  placeholder = "Rechercher...",
  style 
}: SearchBarProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.searchContainer, style]}>
      <View style={[styles.searchInput, { backgroundColor: colors.card }]}>
        <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchTextInput, { color: colors.text }]}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          value={value}
          onChangeText={onChangeText}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    marginBottom: 8,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  searchTextInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
}); 