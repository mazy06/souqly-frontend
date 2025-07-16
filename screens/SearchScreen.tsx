import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import EnhancedSearchBar from '../components/EnhancedSearchBar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import CategoryService, { Category } from '../services/CategoryService';
import { useTheme } from '../contexts/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

// Types pour la navigation
export type SearchStackParamList = {
  SearchMain: undefined;
  Category: { categoryKey: string; categoryLabel: string };
  SearchResults: { query: string };
  ArticlesList: undefined;
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

  const handleAllProductsPress = () => {
    // Navigation vers ArticlesList dans le même stack
    navigation.navigate('ArticlesList');
  };

  const handleSearchSubmit = async () => {
    if (search.trim()) {
      console.log('[SearchScreen] Recherche soumise:', search);
      navigation.navigate('SearchResults', { query: search.trim() });
      setSearch(''); // Vider le champ de recherche
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top','left','right']}>
      <View style={styles.header}>
        <EnhancedSearchBar 
          value={search} 
          onChangeText={setSearch} 
          onSubmit={handleSearchSubmit}
          placeholder="Rechercher un article ou un membre" 
        />
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
          ListHeaderComponent={
            <TouchableOpacity 
              style={[styles.allProductsItem, { borderBottomColor: colors.border }]} 
              onPress={handleAllProductsPress}
              activeOpacity={0.7}
            >
              <View style={styles.icon}>
                <MaterialCommunityIcons name="view-grid" size={26} color={colors.primary} />
              </View>
              <Text style={[styles.allProductsLabel, { color: colors.text }]}>
                Tous les biens
              </Text>
              <Ionicons name="chevron-forward" size={22} color={colors.text + '99'} style={styles.chevron} />
            </TouchableOpacity>
          }
        />
      )}
    </SafeAreaView>
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
  allProductsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    backgroundColor: 'transparent',
  },
  allProductsLabel: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
  },
}); 