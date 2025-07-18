import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AdaptiveImage from './AdaptiveImage';
import { useTheme } from '../contexts/ThemeContext';
import InteractionTrackingService from '../services/InteractionTrackingService';
import { useAuth } from '../contexts/AuthContext';

type Props = {
  title: string;
  brand?: string;
  size?: string;
  condition?: string;
  price: string;
  priceWithFees?: string;
  image: string | null;
  onPress?: () => void;
  likes?: number;
  isPro?: boolean;
  isFavorite?: boolean;
  onFavoritePress?: () => void;
  status?: string;
  productId?: number; // Ajout de l'ID du produit pour le tracking
};

// Cache global pour les images déjà chargées
const imageCache = new Map<string, string | null>();
const loadingCache = new Set<string>();

export default function ProductCard({ 
  title, 
  brand, 
  size, 
  condition, 
  price, 
  priceWithFees, 
  image, 
  onPress, 
  likes = 0, 
  isPro = false,
  isFavorite = false,
  onFavoritePress,
  status,
  productId
}: Props) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [currentImage, setCurrentImage] = useState<string | null>(image);
  const [isImageLoading, setIsImageLoading] = useState(false);

  const trackingService = InteractionTrackingService.getInstance();

  // Mettre à jour l'image quand elle change
  useEffect(() => {
    if (image !== currentImage) {
      setCurrentImage(image);
      setIsImageLoading(false);
    }
  }, [image]);

  // Utiliser le cache pour éviter de recharger les mêmes images
  const cachedImage = useMemo(() => {
    if (!image) return null;
    
    // Vérifier si l'image est en cours de chargement
    if (loadingCache.has(image)) {
      setIsImageLoading(true);
      return null;
    }
    
    if (imageCache.has(image)) {
      const cached = imageCache.get(image);
      setIsImageLoading(false);
      return cached;
    }
    
    // Marquer comme en cours de chargement
    loadingCache.add(image);
    setIsImageLoading(true);
    
    // Ajouter au cache
    imageCache.set(image, image);
    return image;
  }, [image]);

  // Fonction pour tracker le clic sur le produit
  const handleProductPress = () => {
    // Tracker le clic sur le produit
    if (productId && user?.id) {
      trackingService.trackInteraction('CLICK', productId, parseInt(user.id));
    }
    
    // Appeler la fonction onPress originale
    if (onPress) {
      onPress();
    }
  };

  // Fonction pour tracker les favoris
  const handleFavoritePress = (e: any) => {
    e.stopPropagation();
    
    // Tracker l'action de favori
    if (productId && user?.id) {
      if (isFavorite) {
        trackingService.trackInteraction('UNFAVORITE', productId, parseInt(user.id));
      } else {
        trackingService.trackInteraction('FAVORITE', productId, parseInt(user.id));
      }
    }
    
    // Appeler la fonction onFavoritePress originale
    if (onFavoritePress) {
      onFavoritePress();
    }
  };

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: colors.card }]} onPress={handleProductPress} activeOpacity={0.85}>
      <View style={[styles.imageContainer, { backgroundColor: colors.border }]}>
        {cachedImage ? (
          <AdaptiveImage 
            source={{ uri: cachedImage }} 
            style={styles.image} 
            alt={title}
            onLoadEnd={() => {
              setIsImageLoading(false);
              loadingCache.delete(cachedImage);
            }}
            onError={(error) => {
              console.log('[DEBUG] Erreur chargement image:', cachedImage, error);
              // Marquer comme échoué dans le cache
              imageCache.set(cachedImage, null);
              loadingCache.delete(cachedImage);
              setIsImageLoading(false);
            }}
          />
        ) : isImageLoading ? (
          <View style={[styles.image, { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={{ color: '#999', fontSize: 12 }}>Chargement...</Text>
          </View>
        ) : (
          <View style={[styles.image, { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={{ color: '#999', fontSize: 12 }}>Pas d'image</Text>
          </View>
        )}
        {isPro && (
          <View style={[styles.proBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.proText}>Pro</Text>
          </View>
        )}
        {status === 'sold' && (
          <View style={[styles.soldBadge, { backgroundColor: '#ff6b6b' }]}>
            <Text style={styles.soldText}>Vendu</Text>
          </View>
        )}
        <TouchableOpacity 
          style={styles.likesBadgeTopRight}
          onPress={handleFavoritePress}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={isFavorite ? 'heart' : 'heart-outline'} 
            size={16} 
            color={isFavorite ? colors.danger : '#fff'} 
          />
          <Text style={styles.likesText}>{likes}</Text>
        </TouchableOpacity>
      </View>
      {brand && <Text style={[styles.brand, { color: colors.text }]} numberOfLines={1}>{brand}</Text>}
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{title}</Text>
      <Text style={[styles.details, { color: colors.tabIconDefault }]} numberOfLines={1}>
        {size ? size + ' · ' : ''}{condition}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 8,
    overflow: 'hidden',
    minWidth: 160,
    maxWidth: '48%',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    } : {
      elevation: 2,
    }),
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 4/5,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  proBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  proText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  soldBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  soldText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  likesBadgeTopRight: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    zIndex: 2,
  },
  likesText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 4,
    fontSize: 13,
  },
  brand: {
    fontWeight: '500',
    fontSize: 13,
    marginTop: 8,
    marginHorizontal: 8,
    marginBottom: 0,
    opacity: 0.85,
  },
  title: {
    fontWeight: '600',
    fontSize: 15,
    marginTop: 2,
    marginHorizontal: 8,
    marginBottom: 0,
  },
  details: {
    fontSize: 13,
    marginHorizontal: 8,
    marginBottom: 2,
  },
}); 