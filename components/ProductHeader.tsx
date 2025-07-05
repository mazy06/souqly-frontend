import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface ProductHeaderProps {
  title: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onShare?: () => void;
}

export default function ProductHeader({ title, isFavorite, onToggleFavorite, onShare }: ProductHeaderProps) {
  const navigation = useNavigation();
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#181A20" />
      </TouchableOpacity>
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.iconBtn} onPress={onShare}>
          <Ionicons name="share-outline" size={22} color="#181A20" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={onToggleFavorite}>
          <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={22} color={isFavorite ? '#e74c3c' : '#181A20'} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 44 : 16,
    paddingBottom: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    minHeight: 64,
  },
  iconBtn: {
    padding: 6,
    borderRadius: 20,
    marginHorizontal: 2,
  },
  title: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 18,
    marginHorizontal: 8,
    color: '#181A20',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
}); 