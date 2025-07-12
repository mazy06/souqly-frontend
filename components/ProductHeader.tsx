import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface ProductHeaderProps {
  title: string;
  isFavorite?: boolean;
  favoritesCount?: number;
  onToggleFavorite?: () => void;
  onShare?: () => void;
}

export default function ProductHeader({ title, isFavorite, favoritesCount = 0, onToggleFavorite, onShare }: ProductHeaderProps) {
  const navigation = useNavigation();
  

  
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.iconBtn} onPress={() => {
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          navigation.navigate('Accueil'); // ou 'Home' selon le nom de ta route principale
        }
      }}>
        <Ionicons name="arrow-back" size={24} color="#181A20" />
      </TouchableOpacity>
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.iconBtn} onPress={onShare}>
          <Ionicons name="share-outline" size={22} color="#181A20" />
        </TouchableOpacity>
        <View style={styles.favoriteContainer}>
          <TouchableOpacity style={styles.iconBtn} onPress={onToggleFavorite}>
            <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={22} color={isFavorite ? '#e74c3c' : '#181A20'} />
            <View style={styles.favoritesBadge}>
              <Text style={styles.favoritesCount}>{favoritesCount}</Text>
            </View>
          </TouchableOpacity>
        </View>
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
  favoriteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  favoritesCount: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    minWidth: 16,
  },
  favoritesBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#008080',
    borderRadius: 8,
    paddingHorizontal: 3,
    paddingVertical: 1,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
}); 