import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { Category } from '../services/CategoryService';

interface CategoryGridProps {
  categories: Category[];
  onCategoryPress: (category: Category) => void;
  onViewAllPress?: () => void;
  maxItems?: number;
}

// Configuration des couleurs par catégorie
const categoryColors = {
  immobilier: '#4CAF50',
  emploi: '#2196F3',
  services: '#FF9800',
  mobilier: '#9C27B0',
  electromenager: '#F44336',
  vehicules: '#607D8B',
  mode: '#E91E63',
  sport: '#795548',
  loisirs: '#FF5722',
  animaux: '#8BC34A',
  jardinage: '#4CAF50',
  bricolage: '#FF9800',
  multimedia: '#9C27B0',
  livres: '#795548',
  musique: '#E91E63',
  jeux: '#FF5722',
  collection: '#607D8B',
  autres: '#9E9E9E'
};

export default function CategoryGrid({
  categories,
  onCategoryPress,
  onViewAllPress,
  maxItems = 8
}: CategoryGridProps) {
  const { colors } = useTheme();
  const displayCategories = categories.slice(0, maxItems);

  const getCategoryColor = (categoryKey: string): string => {
    // Utiliser une couleur uniforme pour toutes les catégories
    return colors.primary;
    
    // Alternative : utiliser des couleurs subtiles basées sur la clé
    // const colors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336', '#607D8B', '#E91E63', '#795548'];
    // const index = categoryKey.length % colors.length;
    // return colors[index];
  };

  const renderCategory = (category: Category) => {
    const categoryColor = getCategoryColor(category.key);
    
    return (
      <TouchableOpacity
        key={category.id}
        style={[styles.categoryCard, { backgroundColor: colors.card }]}
        onPress={() => onCategoryPress(category)}
        activeOpacity={0.7}
      >
        <View style={[styles.categoryIcon, { backgroundColor: categoryColor + '15' }]}>
          <MaterialCommunityIcons 
            name={category.iconName as any || 'tag-outline'} 
            size={28} 
            color={categoryColor} 
          />
        </View>
        <Text 
          style={[styles.categoryLabel, { color: colors.text }]} 
          numberOfLines={1} 
          ellipsizeMode="tail"
        >
          {category.label}
        </Text>
      </TouchableOpacity>
    );
  };

  if (displayCategories.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Catégories</Text>
        {onViewAllPress && (
          <TouchableOpacity onPress={onViewAllPress}>
            <Text style={[styles.viewAllText, { color: colors.primary }]}>Voir tout</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {displayCategories.map(renderCategory)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoriesContainer: {
    paddingHorizontal: 16,
  },
  categoryCard: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 100,
    marginRight: 12,
    borderRadius: 12,
    padding: 8,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 14,
    maxWidth: 64, // Limiter la largeur pour éviter le débordement
  },
}); 