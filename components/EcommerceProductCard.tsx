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
  productId?: number;
  isBoosted?: boolean;
  boostLevel?: number;
};

// Cache global pour les images déjà chargées
const imageCache = new Map<string, string | null>();
const loadingCache = new Set<string>();

export default function EcommerceProductCard({ 
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
  productId,
  isBoosted = false,
  boostLevel = 1
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
    
    if (loadingCache.has(image)) {
      setIsImageLoading(true);
      return null;
    }
    
    if (imageCache.has(image)) {
      const cached = imageCache.get(image);
      setIsImageLoading(false);
      return cached;
    }
    
    loadingCache.add(image);
    setIsImageLoading(true);
    
    imageCache.set(image, image);
    return image;
  }, [image]);

  // Fonction pour tracker le clic sur le produit
  const handleProductPress = () => {
    if (productId && user?.id) {
      trackingService.trackInteraction('CLICK', productId, parseInt(user.id));
    }
    
    if (onPress) {
      onPress();
    }
  };

  // Fonction pour tracker les favoris
  const handleFavoritePress = (e: any) => {
    e.stopPropagation();
    
    if (productId && user?.id) {
      if (isFavorite) {
        trackingService.trackInteraction('UNFAVORITE', productId, parseInt(user.id));
      } else {
        trackingService.trackInteraction('FAVORITE', productId, parseInt(user.id));
      }
    }
    
    if (onFavoritePress) {
      onFavoritePress();
    }
  };

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: colors.card }]} onPress={handleProductPress} activeOpacity={0.85}>
      <View style={styles.cardContent}>
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
                imageCache.set(cachedImage, null);
                loadingCache.delete(cachedImage);
                setIsImageLoading(false);
              }}
            />
          ) : isImageLoading ? (
            <View style={[styles.image, { backgroundColor: colors.border, justifyContent: 'center', alignItems: 'center' }]}>
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={32} color={colors.tabIconDefault} />
                <Text style={[styles.placeholderText, { color: colors.tabIconDefault }]}>Image</Text>
              </View>
            </View>
          ) : (
            <View style={[styles.image, { backgroundColor: colors.border, justifyContent: 'center', alignItems: 'center' }]}>
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={32} color={colors.tabIconDefault} />
                <Text style={[styles.placeholderText, { color: colors.tabIconDefault }]}>Image</Text>
              </View>
            </View>
          )}
          
          {/* Badge Vendu (reste sur l'image) */}
          {status === 'sold' && (
            <View style={[styles.soldBadge, { backgroundColor: colors.danger }]}>
              <Text style={styles.soldText}>Vendu</Text>
            </View>
          )}
        </View>
        
        {/* Contenu de la carte avec badges */}
        <View style={styles.infoContainer}>
          {/* Header avec badges */}
          <View style={styles.infoHeader}>
            <View style={styles.brandContainer}>
              <Text style={[styles.brand, { color: colors.textSecondary }]} numberOfLines={1}>
                {brand || 'Marque'}
              </Text>
            </View>
            
            {/* Badges dans le header */}
            <View style={styles.badgesContainer}>
              {/* Badge Boosté */}
              {isBoosted && (
                <View style={[styles.boostedBadgeInfo, { backgroundColor: '#FF6B35' }]}>
                  <Ionicons name="flame" size={12} color="#fff" />
                </View>
              )}
              
              {/* Badge Favoris */}
              <TouchableOpacity 
                style={[styles.likesBadgeInfo, { backgroundColor: 'rgba(0,0,0,0.7)' }]}
                onPress={handleFavoritePress}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={isFavorite ? 'heart' : 'heart-outline'} 
                  size={14} 
                  color={isFavorite ? colors.danger : '#fff'} 
                />
                <Text style={styles.likesTextInfo}>{likes}</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Contenu principal */}
          <View style={styles.infoContent}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
              {title || 'Titre de l\'article'}
            </Text>
            <Text style={[styles.details, { color: colors.tabIconDefault }]} numberOfLines={1}>
              {size ? size + ' · ' : ''}{condition || 'État non précisé'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderRadius: 12,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    } : {
      elevation: 3,
    }),
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
  },
  imageContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  boostedBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  soldBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  soldText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 10,
  },
  likesBadgeTopRight: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  likesText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 4,
    fontSize: 13,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  brand: {
    fontWeight: '600',
    fontSize: 12,
    marginBottom: 0,
    opacity: 0.8,
    minHeight: 16,
    lineHeight: 16,
  },
  title: {
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 6,
    minHeight: 18,
    lineHeight: 18,
  },
  details: {
    fontSize: 12,
    marginBottom: 0,
    minHeight: 16,
    lineHeight: 16,
    opacity: 0.7,
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  brandContainer: {
    flex: 1,
    marginRight: 8,
  },
  badgesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  boostedBadgeInfo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  likesBadgeInfo: {
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  likesTextInfo: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 3,
    fontSize: 11,
  },
  infoContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
}); 