import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SearchBar({ value, onChangeText, onPressFavorite, placeholder }: { value: string; onChangeText: (t: string) => void; onPressFavorite?: () => void; placeholder?: string }) {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={20} color="#888" style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder || "Rechercher un article ou un membre"}
        placeholderTextColor="#888"
        value={value}
        onChangeText={onChangeText}
      />
      <TouchableOpacity onPress={onPressFavorite} style={styles.heartButton}>
        <Ionicons name="heart-outline" size={22} color="#e74c3c" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#23242a',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginVertical: 10,
    marginHorizontal: 8,
    height: 44,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  heartButton: {
    marginLeft: 8,
    padding: 4,
  },
}); 