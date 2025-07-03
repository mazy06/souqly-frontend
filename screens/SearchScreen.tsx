import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import SearchBar from '../components/SearchBar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import CategoryService, { Category } from '../services/CategoryService';
import { useTheme } from '../contexts/ThemeContext';

// Types pour la navigation
export type SearchStackParamList = {
  SearchMain: undefined;
  Category: { categoryKey: string; categoryLabel: string };
};

interface CategoryListItemProps {
  item: Category;
  onPress: () => void;
  style?: any;
}

function CategoryListItem({ item, onPress, style }: CategoryListItemProps) {
  const { colors } = useTheme();
  
  // Fonction pour obtenir l'icône MaterialCommunityIcons
  const getIcon = (iconName?: string) => {
    if (!iconName) {
      return <MaterialCommunityIcons name="tag-outline" size={26} color={colors.primary} />;
    }
    return <MaterialCommunityIcons name={iconName as any} size={26} color={colors.primary} />;
  };

  return (
    <TouchableOpacity style={[styles.item, { borderBottomColor: colors.border }, style]} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.icon}>{getIcon(item.iconName)}</View>
      <Text style={[styles.label, { color: colors.text }]}>{item.label}</Text>
      {item.badgeText && (
        <View style={[styles.badge, { backgroundColor: colors.primary }]}> 
          <Text style={[styles.badgeText, { color: 'white' }]}>{item.badgeText}</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={22} color={colors.text + '99'} style={styles.chevron} />
    </TouchableOpacity>
  );
}

export default function SearchScreen() {
  const { colors } = useTheme();
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<StackNavigationProp<SearchStackParamList>>();

  useEffect(() => {
    loadCategories();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [])
  );

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await CategoryService.getCategoryTree();
      setCategories(data);
    } catch (error) {
      // En cas d'erreur, on peut utiliser des catégories par défaut ou afficher un message
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryPress = (category: Category) => {
    navigation.navigate('Category', { 
      categoryKey: category.key, 
      categoryLabel: category.label 
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <View style={styles.header}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Rechercher un article ou un membre" />
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Chargement des catégories...</Text>
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={item => item.key}
          renderItem={({ item }) => (
            <CategoryListItem 
              item={item} 
              onPress={() => handleCategoryPress(item)} 
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  list: {
    paddingBottom: 24,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    backgroundColor: 'transparent',
  },
  icon: {
    width: 36,
    alignItems: 'center',
    marginRight: 12,
  },
  label: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
  },
  badge: {
    backgroundColor: '#008080',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginRight: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 13,
  },
  chevron: {
    marginLeft: 4,
  },
}); 