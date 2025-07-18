import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

export default function SearchBar({ 
  value, 
  onChangeText, 
  onPressCamera, 
  onSubmit, 
  onClear, 
  placeholder,
  onPressBell,
  bellBadgeCount
}: { 
  value: string; 
  onChangeText: (t: string) => void; 
  onPressCamera?: () => void; 
  onSubmit?: () => void; 
  onClear?: () => void; 
  placeholder?: string;
  onPressBell?: () => void;
  bellBadgeCount?: number;
}) {
  const { colors, isDark } = useTheme();
  
  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: isDark ? '#2a2a2a' : '#f8f9fa',
        borderColor: colors.border + '40',
        shadowColor: colors.text + '15',
      }
    ]}>
      <Ionicons name="search" size={20} color={colors.tabIconDefault} style={styles.icon} />
      <TextInput
        style={[styles.input, { color: colors.text }]}
        placeholder={placeholder || "Rechercher un article ou un membre"}
        placeholderTextColor={colors.tabIconDefault}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
      />
      {value.length > 0 && onClear && (
        <TouchableOpacity onPress={onClear} style={styles.clearButton}>
          <Ionicons name="close-circle" size={20} color={colors.tabIconDefault} />
        </TouchableOpacity>
      )}
      {onPressBell && (
        <TouchableOpacity onPress={onPressBell} style={styles.bellButton}>
          <Ionicons name="notifications-outline" size={22} color={colors.primary} />
          {bellBadgeCount && bellBadgeCount > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={styles.badgeText}>
                {bellBadgeCount > 99 ? '99+' : bellBadgeCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )}
      {onPressCamera && (
        <TouchableOpacity onPress={onPressCamera} style={styles.heartButton}>
          <Ionicons name="camera-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginHorizontal: 0,
    marginBottom: 10,
    height: 48,
    flex: 1,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  heartButton: {
    marginLeft: 8,
    padding: 4,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  bellButton: {
    marginLeft: 8,
    padding: 4,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
}); 