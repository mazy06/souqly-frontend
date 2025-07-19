import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, Platform, TouchableOpacity, Image, Alert, Text, Dimensions } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { navigationRef } from '../navigation/RootNavigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProductService, { Product } from '../services/ProductService';
import ConversationService from '../services/ConversationService';
import LocationService, { DistanceData } from '../services/LocationService';
import InteractionTrackingService from '../services/InteractionTrackingService';
import ProductHeader from '../components/ProductHeader';
import ProductActions from '../components/ProductActions';
import ProductSellerCard from '../components/ProductSellerCard';
import ProductInfoSection from '../components/ProductInfoSection';
import ProductSimilarCarousel from '../components/ProductSimilarCarousel';
import ProductSimilarSection from '../components/ProductSimilarSection';
import ProductLocation from '../components/ProductLocation';
import ProductReportLinks from '../components/ProductReportLinks';
import LoadingSpinner from '../components/Skeleton';
import { useAuth } from '../contexts/AuthContext';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import ApiService from '../services/ApiService';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ProductDetailRouteProp = RouteProp<{ ProductDetail: { productId: string } }, 'ProductDetail'>;

// Types pour la navigation
type RootStackParamList = {
  AuthLanding: undefined;
  Payment: {
    productId: string;
    productPrice: number;
    productTitle: string;
    productImage?: string;
  };
  Messages: {
    screen: string;
    params: {
      conversationId: string;
      name: string;
      avatarUrl?: string;
      productId: number;
    };
  };
  ProfileDetail: { userId: string };
  ProductImages: { images: string[] };
};

export default function ProductDetailScreen() {
  const route = useRoute<ProductDetailRouteProp>();
  const navigation = useNavigation<any>();
  const { isAuthenticated, isGuest, user } = useAuth();
  const productId = route.params?.productId;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [distanceData, setDistanceData] = useState<string | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [cityCoords, setCityCoords] = useState<{lat: number, lon: number} | null>(null);
  const { colors } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const [seller, setSeller] = useState<any>(null);
  const insets = useSafeAreaInsets();

  const trackingService = InteractionTrackingService.getInstance();

  useEffect(() => {
    if (!productId) return;
    
    const loadProductData = async () => {
      try {
        setLoading(true);
        
        // Charger le produit
        const productData = await ProductService.getProduct(parseInt(productId));
        setProduct(productData);
        
        // Tracker la vue du produit
        if (user?.id) {
          trackingService.trackProductView(parseInt(productId), parseInt(user.id));
        }
        
        // Incrémenter le compteur de vues seulement si l'utilisateur est connecté
        if (isAuthenticated && !isGuest) {
          try {
            await ProductService.incrementViewCount(parseInt(productId));
          } catch (error) {
            console.log('Erreur lors de l\'incrémentation des vues:', error);
          }
        }
        
        // Charger les favoris seulement si l'utilisateur est connecté
        if (isAuthenticated || isGuest) {
          try {
            const favoriteData = await ProductService.getFavoriteStatus(parseInt(productId));
            setIsFavorite(favoriteData.isFavorite);
            setFavoritesCount(favoriteData.favoriteCount);
          } catch (error) {
            setIsFavorite(false);
            setFavoritesCount(productData.favoriteCount || 0);
          }
        } else {
          setIsFavorite(false);
          setFavoritesCount(productData.favoriteCount || 0);
        }
        
      } catch (error) {
        // En cas d'erreur, on peut afficher un message à l'utilisateur
      } finally {
        setLoading(false);
      }
    };
    
    loadProductData();
  }, [productId, isAuthenticated, isGuest]);

  useEffect(() => {
    if (product && product.seller && product.seller.id) {
      ApiService.get(`/users/${product.seller.id}`)
        .then((res: any) => {
          // Utiliser les vraies données du vendeur
          const sellerWithDefaults = {
            ...res,
            isVerified: res.isVerified ?? true,
            responseTime: res.responseTime ?? 'Réponse en moins d\'1h',
            adsCount: res.adsCount ?? 0,
            isFollowing: res.isFollowing ?? false,
            createdAt: res.createdAt ?? '2023-01-15',
          };
          setSeller(sellerWithDefaults);
        })
        .catch(() => {
          // En cas d'erreur, créer un vendeur avec des valeurs par défaut
          const defaultSeller = {
            id: product.seller!.id,
            firstName: product.seller!.firstName || 'Vendeur',
            lastName: product.seller!.lastName || 'Anonyme',
            profilePicture: undefined,
            isVerified: true,
            responseTime: 'Réponse en moins d\'1h',
            adsCount: 0,
            isFollowing: false,
            createdAt: '2023-01-15',
          };
          setSeller(defaultSeller);
        });
    }
  }, [product]);

  useEffect(() => {
    const fetchDistance = async () => {
      if (!product || !product.city || !product.country) return;
      try {
        // 1. Géocoder la ville du produit
        const city = encodeURIComponent(product.city);
        const country = encodeURIComponent(product.country);
        const url = `https://nominatim.openstreetmap.org/search?city=${city}&country=${country}&format=json&limit=1`;
        const response = await fetch(url, { headers: { 'User-Agent': 'SouqlyApp/1.0' } });
        const data = await response.json();
        if (!data || !data[0]) {
          setGeoError('Ville non trouvée');
          setDistanceData(null);
          setCityCoords(null);
          return;
        }
        const prodLat = parseFloat(data[0].lat);
        const prodLon = parseFloat(data[0].lon);
        setCityCoords({ lat: prodLat, lon: prodLon });

        // 2. Récupérer la position de l'utilisateur
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setGeoError('Permission localisation refusée');
          setDistanceData(null);
          return;
        }
        const userLocation = await Location.getCurrentPositionAsync({});
        const userLat = userLocation.coords.latitude;
        const userLon = userLocation.coords.longitude;

        // 3. Calculer la distance (Haversine)
        const toRad = (value: number) => (value * Math.PI) / 180;
        const R = 6371; // Rayon de la Terre en km
        const dLat = toRad(prodLat - userLat);
        const dLon = toRad(prodLon - userLon);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(toRad(userLat)) * Math.cos(toRad(prodLat)) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        setDistanceData(`${distance.toFixed(1)} km`);
        setGeoError(null);
      } catch (e) {
        setGeoError('Erreur géolocalisation');
        setDistanceData(null);
        setCityCoords(null);
      }
    };
    fetchDistance();
  }, [product]);

  if (loading) return (
    <LoadingSpinner 
      message="Chargement du produit..." 
      containerStyle={styles.loadingContainer}
      heightRatio={0.5} // Plus grand pour le chargement d'un produit détaillé
    />
  );
  if (!product) return null;

  const handleImagePress = () => {
    if (product.images && product.images.length > 0) {
      const imageUrls = product.images.map(img => ProductService.getImageUrl(img.id));
      // @ts-ignore
      navigation.navigate('ProductImages', { images: imageUrls });
    }
  };

  const mainImageUrl = product.images && product.images.length > 0
    ? ProductService.getImageUrl(product.images[0].id)
    : null;
  const totalImages = product.images ? product.images.length : 0;

  const handleProductPress = (productId: number) => {
    // @ts-ignore
    navigation.navigate('ProductDetail', { productId: productId.toString() });
  };

  const handleReportPress = () => {
    if (!isAuthenticated || isGuest) {
      Alert.alert(
        'Connexion requise',
        'Vous devez être connecté pour signaler un produit',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Se connecter', onPress: () => navigation.navigate('AuthLanding') }
        ]
      );
      return;
    }

    if (!product) {
      Alert.alert('Erreur', 'Impossible de signaler ce produit');
      return;
    }

    // Navigation vers l'écran de signalement
    navigation.navigate('ReportProduct', {
      productId: productId!,
      productTitle: product.title
    });
  };

  const handleHelpPress = () => {
    Alert.alert('Aide', 'Centre d\'aide à implémenter');
  };

  const handleTermsPress = () => {
    // Navigation vers les conditions d'utilisation
  };

  const handleOfferPress = () => {
    // Cette fonction n'est plus utilisée directement car le composant ProductActions gère maintenant l'expansion
  };

  const handleSendOffer = async (offerData: { price: number; message: string }) => {
    try {
      if (!product || !product.seller) {
        Alert.alert('Erreur', 'Impossible de contacter le vendeur');
        return;
      }

      // Créer une nouvelle conversation avec le vendeur
      const conversation = await ConversationService.createConversation({
        sellerId: product.seller.id,
        productId: product.id,
        initialMessage: offerData.message,
        offerPrice: offerData.price,
      });

      Alert.alert(
        'Offre envoyée',
        'Votre offre a été envoyée au vendeur. Vous allez être redirigé vers la conversation.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigation vers la conversation créée
              // @ts-ignore
              navigation.navigate('Messages', {
                screen: 'Conversation',
                params: {
                  conversationId: conversation.id,
                  name: `${product.seller?.firstName} ${product.seller?.lastName}`,
                  avatarUrl: undefined,
                  productId: product.id,
                }
              });
            }
          }
        ]
      );
    } catch (error) {
      console.error('[ProductDetailScreen] Erreur lors de la création de conversation:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer l\'offre pour le moment');
    }
  };

  const handleBuyPress = () => {
    if (!isAuthenticated || isGuest) {
      Alert.alert(
        'Connexion requise',
        'Vous devez être connecté pour effectuer un achat',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Se connecter', onPress: () => navigation.navigate('AuthLanding') }
        ]
      );
      return;
    }

    // Navigation vers l'écran de paiement
    navigation.navigate('Payment', {
      productId: productId!,
      productPrice: product.price,
      productTitle: product.title,
      productImage: product.images && product.images.length > 0 
        ? ProductService.getImageUrl(product.images[0].id)
        : undefined
    });
  };

  const handleToggleFavorite = async () => {
    if (isTogglingFavorite) return;
    
    try {
      setIsTogglingFavorite(true);
      const result = await ProductService.toggleFavorite(parseInt(productId));
      setIsFavorite(result.isFavorite);
      setFavoritesCount(result.favoriteCount);
      
      // Tracker l'action de favori
      if (user?.id) {
        if (result.isFavorite) {
          trackingService.trackInteraction('FAVORITE', parseInt(productId), parseInt(user.id));
        } else {
          trackingService.trackInteraction('UNFAVORITE', parseInt(productId), parseInt(user.id));
        }
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de modifier les favoris pour le moment');
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const handleShare = () => {
    Alert.alert('Partager', 'Fonctionnalité de partage à implémenter');
  };

  const handleSimilarProductFavorite = async (productId: number) => {
    try {
      await ProductService.toggleFavorite(productId);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de modifier les favoris pour le moment');
    }
  };

  // Fonction pour formater la localisation complète
  const getFormattedLocation = (product: Product): string => {
    const city = product.city?.trim();
    const countryCode = product.country?.trim();
    const locationName = product.locationName?.trim();

    let country = countryCode;

    if (locationName) {
      return locationName;
    }
    if (city && country) {
      return `${city}, ${country}`;
    } else if (city) {
      return city;
    } else if (country) {
      return country;
    }
    return "Localisation non spécifiée";
  };

  return (
    <View style={styles.container}>
      {/* Header normal */}
      <View style={styles.header}>
        <ProductHeader 
          title={product.title} 
          isFavorite={isFavorite} 
          favoritesCount={favoritesCount}
          onToggleFavorite={handleToggleFavorite}
          onShare={handleShare}
        />
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
        nestedScrollEnabled={true}
        scrollEnabled={true}
        testID="scroll-view"
      >
        {/* Image principale cliquable */}
        {mainImageUrl && (
          <TouchableOpacity onPress={handleImagePress} activeOpacity={0.8} style={[styles.mainImageWrapper, { width: screenWidth, alignSelf: 'center' }]}>
            <Image
              source={{ uri: mainImageUrl }}
              style={[styles.mainImage, { width: screenWidth, height: screenWidth * 0.75 }]}
              resizeMode="cover"
            />
            {/* Badge nombre de photos en bas à droite */}
            {totalImages > 0 && (
              <View style={[styles.photoBadgeBottomRight, { backgroundColor: colors.primary }]}>
                <Ionicons name="images-outline" size={14} color="#fff" style={{ marginRight: 4 }} />
                <Text style={styles.photoBadgeText}>{totalImages}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* Informations produit */}
        <ProductInfoSection
          price={product.price}
          priceWithFees={product.priceWithFees}
          description={product.description}
          condition={product.condition}
          brand={product.brand}
          size={product.size}
          shippingInfo={product.shippingInfo}
        />

        {/* Localisation */}
        <ProductLocation
          city={product.city}
          country={product.country}
          distance={distanceData || undefined}
          shippingOptions={['Livraison à domicile', 'Point relais', 'Rencontre']}
          latitude={cityCoords?.lat}
          longitude={cityCoords?.lon}
        />
        {geoError && (
          <Text style={{ color: 'orange', marginLeft: 16, marginBottom: 8, fontSize: 12 }}>
            {geoError}
          </Text>
        )}

        {/* Carte vendeur */}
        {seller && (
          <ProductSellerCard
            seller={seller}
            onPress={() => {
              // @ts-ignore
              navigation.navigate('ProfileDetail', { userId: seller.id });
            }}
          />
        )}

        {/* Produits similaires - Section après commentaires */}
        <ProductSimilarSection
          onProductPress={handleProductPress}
          onFavoritePress={handleSimilarProductFavorite}
        />

        {/* Produits similaires - Carousel original */}
        {similarProducts.length > 0 && (
          <ProductSimilarCarousel
            products={similarProducts.map(product => ({
              id: product.id,
              title: product.title,
              price: product.price,
              imageUrl: product.images && product.images.length > 0 
                ? ProductService.getImageUrl(product.images[0].id)
                : 'https://via.placeholder.com/120',
              isFavorite: false, // Par défaut, on ne peut pas savoir si c'est un favori sans être connecté
            }))}
            onProductPress={handleProductPress}
            onFavoritePress={handleSimilarProductFavorite}
          />
        )}

        {/* Liens de signalement et aide */}
        <ProductReportLinks
          onReportPress={handleReportPress}
          onHelpPress={handleHelpPress}
          onTermsPress={handleTermsPress}
        />
      </ScrollView>

      {/* Footer sticky */}
      <View style={[styles.footerSticky, { paddingBottom: insets.bottom + 12 }]}>
        <ProductActions
          onOffer={handleOfferPress}
          onBuy={handleBuyPress}
          sellerName={seller?.firstName || 'Vendeur'}
          productPrice={product.price}
          onSendOffer={handleSendOffer}
          isOwnProduct={!!(isAuthenticated && user && product.seller && parseInt(user.id) === product.seller.id)}
          productStatus={product.status}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    position: 'relative',
  },
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingTop: Platform.OS === 'ios' ? 15 : 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  mainImageWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  mainImage: {
    borderRadius: 0,
  },
  footerSticky: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    justifyContent: 'flex-start',
  },
  photoBadgeBottomRight: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    zIndex: 2,
  },
  photoBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  price: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  shippingBadge: {
    alignSelf: 'flex-start',
    marginTop: 8,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#A0522D', // fallback
  },
  shippingBadgeText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 13,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
  },
}); 