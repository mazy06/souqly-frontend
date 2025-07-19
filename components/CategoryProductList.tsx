import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import ProductCard from './ProductCard';
import { Product } from '../services/ProductService';
import { formatAmount } from '../utils/formatters';

interface CategoryProductListProps {
  category: string;
  products: Product[];
  onProductPress: (productId: number) => void;
  onFavoritePress: (productId: number) => void;
  onViewAllPress?: () => void;
  imageUrls: {[key: number]: string | null};
  favoriteCounts: { [productId: number]: number };
  isFavorite: (productId: number) => boolean;
  maxItems?: number;
}

// Mapping des catégories vers les icônes et couleurs
const categoryConfig = {
  immobilier: {
    icon: 'home-outline',
    color: '#4CAF50',
    title: 'Immobilier',
    subtitle: 'Appartements, maisons, terrains'
  },
  emploi: {
    icon: 'briefcase-outline',
    color: '#2196F3',
    title: 'Emploi',
    subtitle: 'Offres d\'emploi, services'
  },
  services: {
    icon: 'construct-outline',
    color: '#FF9800',
    title: 'Services',
    subtitle: 'Prestations, cours, réparations'
  },
  mobilier: {
    icon: 'bed-outline',
    color: '#9C27B0',
    title: 'Mobilier',
    subtitle: 'Meubles, décoration'
  },
  electromenager: {
    icon: 'tv-outline',
    color: '#F44336',
    title: 'Électroménager',
    subtitle: 'Appareils, électronique'
  },
  vehicules: {
    icon: 'car-outline',
    color: '#607D8B',
    title: 'Véhicules',
    subtitle: 'Voitures, motos, pièces'
  },
  mode: {
    icon: 'shirt-outline',
    color: '#E91E63',
    title: 'Mode',
    subtitle: 'Vêtements, accessoires'
  },
  sport: {
    icon: 'football-outline',
    color: '#795548',
    title: 'Sport',
    subtitle: 'Équipements, loisirs'
  }
};

export default function CategoryProductList({
  category,
  products,
  onProductPress,
  onFavoritePress,
  onViewAllPress,
  imageUrls,
  favoriteCounts,
  isFavorite,
  maxItems = 5
}: CategoryProductListProps) {
  const { colors } = useTheme();
  const config = categoryConfig[category as keyof typeof categoryConfig] || {
    icon: 'grid-outline',
    color: colors.primary,
    title: category.charAt(0).toUpperCase() + category.slice(1),
    subtitle: 'Produits de cette catégorie'
  };

  const displayProducts = products.slice(0, maxItems);

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productContainer}>
      <ProductCard
        title={item.title}
        brand={item.brand}
        size={item.size}
        condition={item.condition}
        price={formatAmount(item.price)}
        priceWithFees={item.priceWithFees ? formatAmount(item.priceWithFees) : undefined}
        image={imageUrls[item.id]}
        likes={favoriteCounts[item.id] || 0}
        isFavorite={isFavorite(item.id)}
        onPress={() => onProductPress(item.id)}
        onFavoritePress={() => onFavoritePress(item.id)}
        status={item.status}
      />
    </View>
  );

  if (displayProducts.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={[styles.categoryIcon, { backgroundColor: config.color + '20' }]}>
            <MaterialCommunityIcons 
              name={config.icon as any} 
              size={24} 
              color={config.color} 
            />
          </View>
          <View style={styles.titleText}>
            <Text style={[styles.title, { color: colors.text }]}>{config.title}</Text>
            <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>{config.subtitle}</Text>
          </View>
        </View>
        {onViewAllPress && (
          <TouchableOpacity onPress={onViewAllPress} style={styles.viewAllButton}>
            <Text style={[styles.viewAllText, { color: config.color }]}>Voir tout</Text>
            <Ionicons name="chevron-forward" size={16} color={config.color} />
          </TouchableOpacity>
        )}
      </View>
      
      <FlatList
        data={displayProducts}
        keyExtractor={item => item.id.toString()}
        renderItem={renderProduct}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />
      
      {displayProducts.length === 0 && (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons 
            name={config.icon as any} 
            size={48} 
            color={colors.tabIconDefault} 
          />
          <Text style={[styles.emptyText, { color: colors.tabIconDefault }]}>
            Aucun produit dans cette catégorie
          </Text>
        </View>
      )}
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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    opacity: 0.7,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  list: {
    paddingLeft: 16,
  },
  productContainer: {
    marginRight: 12,
    width: 160,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
}); 