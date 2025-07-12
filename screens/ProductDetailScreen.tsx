import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, Platform, TouchableOpacity, Image, Alert, Text, Dimensions } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProductService, { Product } from '../services/ProductService';
import LocationService, { DistanceData } from '../services/LocationService';
import ProductHeader from '../components/ProductHeader';
import ProductActions from '../components/ProductActions';
import ProductSellerCard from '../components/ProductSellerCard';
import ProductInfoSection from '../components/ProductInfoSection';
import ProductSimilarCarousel from '../components/ProductSimilarCarousel';
import ProductSimilarSection from '../components/ProductSimilarSection';
import ProductLocation from '../components/ProductLocation';
import ProductReportLinks from '../components/ProductReportLinks';
import { useAuth } from '../contexts/AuthContext';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import ApiService from '../services/ApiService';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ProductDetailRouteProp = RouteProp<{ ProductDetail: { productId: string } }, 'ProductDetail'>;

export default function ProductDetailScreen() {
  const route = useRoute<ProductDetailRouteProp>();
  const navigation = useNavigation();
  const { isAuthenticated, isGuest } = useAuth();
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

  useEffect(() => {
    if (!productId) return;
    
    const loadProductData = async () => {
      try {
        setLoading(true);
        
        // Charger le produit
        const productData = await ProductService.getProduct(parseInt(productId));
        setProduct(productData);
        
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
          // Ajouter des données mock pour les badges si elles ne sont pas présentes
          const sellerWithBadges = {
            ...res,
            isVerified: res.isVerified ?? true, // Mock: vendeur vérifié
            responseTime: res.responseTime ?? 'Réponse en moins d\'1h', // Mock: temps de réponse
            rating: res.rating ?? 4.8, // Mock: note moyenne
            reviewsCount: res.reviewsCount ?? 127, // Mock: nombre d'avis
            adsCount: res.adsCount ?? 23, // Mock: nombre d'annonces
            isFollowing: res.isFollowing ?? false, // Mock: pas encore suivi
          };
          setSeller(sellerWithBadges);
        })
        .catch(() => {
          // En cas d'erreur, créer un vendeur mock complet
          const mockSeller = {
            id: product.seller!.id,
            firstName: product.seller!.firstName || 'Vendeur',
            lastName: product.seller!.lastName || 'Anonyme',
            profilePicture: undefined, // Pas de photo de profil par défaut
            isVerified: true, // Mock: vendeur vérifié
            responseTime: 'Réponse en moins d\'1h', // Mock: temps de réponse
            rating: 4.8, // Mock: note moyenne
            reviewsCount: 127, // Mock: nombre d'avis
            adsCount: 23, // Mock: nombre d'annonces
            isFollowing: false, // Mock: pas encore suivi
            createdAt: '2023-01-15', // Mock: date de création
          };
          setSeller(mockSeller);
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

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;
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
    Alert.alert('Signaler', 'Fonctionnalité de signalement à implémenter');
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
      // Pour l'instant, on simule l'envoi et on redirige vers les messages
      Alert.alert(
        'Offre envoyée',
        'Votre offre a été envoyée au vendeur. Vous allez être redirigé vers les messages.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigation vers l'écran des messages
              // @ts-ignore
              navigation.navigate('Messages');
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'envoyer l\'offre pour le moment');
    }
  };

  const handleBuyPress = () => {
    Alert.alert('Achat', 'Fonctionnalité d\'achat à implémenter');
  };

  const handleToggleFavorite = async () => {
    if (isTogglingFavorite) return;
    
    try {
      setIsTogglingFavorite(true);
      const result = await ProductService.toggleFavorite(parseInt(productId));
      setIsFavorite(result.isFavorite);
      setFavoritesCount(result.favoriteCount);
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
}); 