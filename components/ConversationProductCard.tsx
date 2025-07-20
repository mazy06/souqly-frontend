import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { Product } from '../services/ProductService';
import { getProductPlaceholder } from '../utils/imageUtils';

interface ConversationProductCardProps {
  product: Product;
  onPress?: () => void;
  showPrice?: boolean;
  compact?: boolean;
}

const ConversationProductCard: React.FC<ConversationProductCardProps> = ({
  product,
  onPress,
  showPrice = true,
  compact = false,
}) => {
  const { colors } = useTheme();

  if (!product) return null;

  const getImageUrl = () => {
    if (product.images && product.images.length > 0) {
      // Utiliser l'URL de l'image depuis le service
      return `http://192.168.1.153:8080/api/products/image/${product.images[0].id}`;
    }
    return getProductPlaceholder();
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: colors.card, borderColor: colors.border },
        compact && styles.compactContainer,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: getImageUrl() }}
        style={[styles.image, compact && styles.compactImage]}
        resizeMode="cover"
      />
      
      <View style={styles.content}>
        <Text 
          style={[styles.title, { color: colors.text }]} 
          numberOfLines={compact ? 1 : 2}
        >
          {product.title}
        </Text>
        
        {product.brand && (
          <Text style={[styles.brand, { color: colors.tabIconDefault }]}>
            {product.brand}
          </Text>
        )}
        
        {product.size && (
          <Text style={[styles.size, { color: colors.tabIconDefault }]}>
            Taille: {product.size}
          </Text>
        )}
        
        {product.condition && (
          <Text style={[styles.condition, { color: colors.tabIconDefault }]}>
            {product.condition}
          </Text>
        )}
        
        {showPrice && (
          <View style={styles.priceContainer}>
            <Text style={[styles.price, { color: colors.primary }]}>
              {product.price.toFixed(2)} €
            </Text>
            {product.priceWithFees && (
              <Text style={[styles.priceWithFees, { color: colors.tabIconDefault }]}>
                {product.priceWithFees.toFixed(2)} € avec protection
              </Text>
            )}
          </View>
        )}
      </View>
      
      {!compact && (
        <View style={styles.actions}>
          <Ionicons name="chevron-forward" size={16} color={colors.tabIconDefault} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 4,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  compactContainer: {
    padding: 8,
    marginVertical: 2,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  compactImage: {
    width: 40,
    height: 40,
    marginRight: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  brand: {
    fontSize: 14,
    marginBottom: 2,
  },
  size: {
    fontSize: 12,
    marginBottom: 2,
  },
  condition: {
    fontSize: 12,
    marginBottom: 4,
  },
  priceContainer: {
    marginTop: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  priceWithFees: {
    fontSize: 12,
    marginTop: 2,
  },
  actions: {
    justifyContent: 'center',
    paddingLeft: 8,
  },
});

export default ConversationProductCard; 