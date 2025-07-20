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

export default function PinterestProductCard({ 
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
    if (!image) {
      console.log(`[DEBUG] PinterestProductCard - Pas d'image pour: ${title}`);
      return null;
    }
    
    console.log(`[DEBUG] PinterestProductCard - Image reçue: ${image} pour: ${title}`);
    
    // Forcer le chargement direct sans cache pour le moment
    setIsImageLoading(true);
    return image;
  }, [image, title]);

  // Debug: Log des valeurs en mode développement
  useEffect(() => {
    if (__DEV__) {
      console.log(`[DEBUG] Product ${title}: isBoosted=${isBoosted}, boostLevel=${boostLevel}`);
    }
  }, [title, isBoosted, boostLevel]);

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
      <View style={[styles.imageContainer, { backgroundColor: colors.border }]}>
        {image ? (
          <AdaptiveImage 
            source={{ uri: image }} 
            style={styles.image} 
            alt={title}
            onLoadStart={() => {
              console.log(`[DEBUG] PinterestProductCard - Début du chargement: ${image} pour: ${title}`);
            }}
            onLoadEnd={() => {
              console.log(`[DEBUG] PinterestProductCard - Fin du chargement: ${image} pour: ${title}`);
              setIsImageLoading(false);
            }}
            onError={(error) => {
              console.log(`[DEBUG] PinterestProductCard - Erreur chargement image: ${image} pour: ${title}`, error);
              setIsImageLoading(false);
            }}
          />
        ) : (
          <View style={[styles.image, { backgroundColor: colors.border, justifyContent: 'center', alignItems: 'center' }]}>
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={24} color={colors.tabIconDefault} />
              <Text style={[styles.placeholderText, { color: colors.tabIconDefault }]}>Image</Text>
            </View>
          </View>
        )}
        
        {/* Badge Boosté */}
        {isBoosted && (
          <View style={[styles.boostedBadge, { backgroundColor: '#FF6B35' }]}>
            <Ionicons name="flame" size={12} color="#fff" />
          </View>
        )}
        
        {/* Debug: Log des valeurs */}
        
        {/* Badge Vendu */}
        {status === 'sold' && (
          <View style={[styles.soldBadge, { backgroundColor: colors.danger }]}>
            <Text style={styles.soldText}>Vendu</Text>
          </View>
        )}
        
        {/* Badge Favoris */}
        <TouchableOpacity 
          style={[styles.likesBadgeTopRight, { backgroundColor: 'rgba(0,0,0,0.7)' }]}
          onPress={handleFavoritePress}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={isFavorite ? 'heart' : 'heart-outline'} 
            size={12} 
            color={isFavorite ? colors.danger : '#fff'} 
          />
          <Text style={styles.likesText}>{likes}</Text>
        </TouchableOpacity>
      </View>
      
      {/* Contenu de la carte */}
      <View style={styles.cardContent}>
        <Text style={[styles.brand, { color: colors.textSecondary }]} numberOfLines={1}>
          {brand || 'Marque'}
        </Text>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {title || 'Titre de l\'article'}
        </Text>
        <Text style={[styles.details, { color: colors.tabIconDefault }]} numberOfLines={1}>
          {size ? size + ' · ' : ''}{condition || 'État non précisé'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '33.33%', // Force 3 colonnes
    margin: 2,
    overflow: 'hidden',
    borderRadius: 8,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    } : {
      elevation: 2,
    }),
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  boostedBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
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
  soldBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  soldText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 7,
  },
  likesBadgeTopRight: {
    position: 'absolute',
    top: 4,
    right: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
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
    marginLeft: 3,
    fontSize: 10,
  },
  brand: {
    fontWeight: '600',
    fontSize: 9,
    marginBottom: 2,
    opacity: 0.8,
    minHeight: 10,
    lineHeight: 10,
  },
  title: {
    fontWeight: '700',
    fontSize: 10,
    marginBottom: 2,
    minHeight: 12,
    lineHeight: 12,
  },
  details: {
    fontSize: 8,
    marginBottom: 3,
    minHeight: 8,
    lineHeight: 8,
    opacity: 0.7,
  },
  cardContent: {
    flex: 1,
    padding: 4,
    justifyContent: 'space-between',
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 10,
    marginTop: 2,
    opacity: 0.7,
  },
}); 