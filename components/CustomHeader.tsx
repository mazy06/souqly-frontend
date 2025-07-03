import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CustomHeaderProps {
  title?: string;
  onBack: () => void;
  color?: string;
  backgroundColor?: string;
}

export default function CustomHeader({ title, onBack, color = '#fff', backgroundColor = 'rgba(24,26,32,0.85)' }: CustomHeaderProps) {
  return (
    <View style={[styles.header, { backgroundColor }]}> 
      <TouchableOpacity onPress={onBack} style={styles.headerBtn}>
        <Ionicons name="arrow-back" size={24} color={color} />
      </TouchableOpacity>
      {title && <Text style={[styles.headerTitle, { color }]} numberOfLines={1}>{title}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 48 : 20,
    paddingHorizontal: 8,
    paddingBottom: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  headerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 18,
    marginHorizontal: 8,
  },
}); 