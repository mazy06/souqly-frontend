import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, Platform, TouchableOpacity, Image, Alert, Text, Dimensions } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProductService, { Product } from '../services/ProductService';
import ProductHeader from '../components/ProductHeader';
import ProductActions from '../components/ProductActions';
import ProductSellerCard from '../components/ProductSellerCard';
import ProductInfoSection from '../components/ProductInfoSection';
import ProductSimilarCarousel from '../components/ProductSimilarCarousel';
import ProductLocation from '../components/ProductLocation';
import ProductReportLinks from '../components/ProductReportLinks';
import { useAuth } from '../contexts/AuthContext';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

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
  const { colors } = useTheme();
  const screenWidth = Dimensions.get('window').width;

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
            console.log('[ProductDetailScreen] Données favoris chargées - isFavorite:', favoriteData.isFavorite, 'favoritesCount:', favoriteData.favoriteCount);
          } catch (error) {
            console.log('[ProductDetailScreen] Erreur lors du chargement des favoris (utilisateur non connecté ou erreur):', error);
            // En cas d'erreur, on garde les valeurs par défaut
            setIsFavorite(false);
            setFavoritesCount(productData.favoriteCount || 0);
          }
        } else {
          // Utilisateur non connecté, utiliser les données du produit
          setIsFavorite(false);
          setFavoritesCount(productData.favoriteCount || 0);
        }
        
      } catch (error) {
        console.error('Erreur lors du chargement des données du produit:', error);
        // En cas d'erreur, on peut afficher un message à l'utilisateur
      } finally {
        setLoading(false);
      }
    };
    
    loadProductData();
  }, [productId, isAuthenticated, isGuest]);

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
    console.log('Terms pressed');
  };

  const handleOfferPress = () => {
    // Navigation vers l'écran de faire une offre
    console.log('Offer pressed');
    // TODO: Navigate to offer screen
  };

  const handleBuyPress = () => {
    // Navigation vers l'écran d'achat
    console.log('Buy pressed');
    // TODO: Navigate to buy screen
  };

  const handleToggleFavorite = async () => {
    try {
      console.log('[ProductDetailScreen] Toggle favorite pour produit:', product.id);
      console.log('[ProductDetailScreen] État actuel - isFavorite:', isFavorite, 'favoritesCount:', favoritesCount);
      
      // Vérifier si l'utilisateur est connecté
      if (!isAuthenticated && !isGuest) {
        Alert.alert('Connexion requise', 'Vous devez être connecté pour ajouter des articles à vos favoris');
        return;
      }
      
      if (isTogglingFavorite) return;
      setIsTogglingFavorite(true);
      
      const result = await ProductService.toggleFavorite(product.id);
      
      console.log('[ProductDetailScreen] Réponse du backend:', result);
      
      // Mettre à jour l'état avec les nouvelles valeurs
      setIsFavorite(result.isFavorite);
      setFavoritesCount(result.favoriteCount);
      
      console.log('[ProductDetailScreen] Nouvel état - isFavorite:', result.isFavorite, 'favoritesCount:', result.favoriteCount);
    } catch (error) {
      console.error('Erreur lors du toggle des favoris:', error);
      // En cas d'erreur, on peut afficher un message à l'utilisateur
      Alert.alert('Erreur', 'Impossible de modifier les favoris pour le moment');
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const handleShare = () => {
    // TODO: Implémenter le partage
    console.log('Share pressed');
  };

  const handleSimilarProductFavorite = async (productId: number) => {
    try {
      const result = await ProductService.toggleFavorite(productId);
      // Mettre à jour l'état du produit similaire dans la liste
      setSimilarProducts(prev => 
        prev.map(product => 
          product.id === productId 
            ? { ...product, isFavorite: result.isFavorite }
            : product
        )
      );
    } catch (error) {
      console.error('Erreur lors du toggle des favoris du produit similaire:', error);
      Alert.alert('Erreur', 'Impossible de modifier les favoris pour le moment');
    }
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

        {/* Carte vendeur */}
        {product.seller && (
          <ProductSellerCard
            seller={{
              firstName: product.seller.firstName,
              lastName: product.seller.lastName,
              avatarUrl: undefined,
              rating: undefined,
              reviewsCount: undefined,
              since: undefined,
              adsCount: undefined,
              isFollowing: undefined,
            }}
          />
        )}

        {/* Localisation */}
        <ProductLocation
          location="Paris, France"
          distance="2.5 km"
          shippingOptions={['Livraison à domicile', 'Point relais', 'Rencontre']}
        />

        {/* Produits similaires */}
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

        {/* Liens de signalement et aide */}
        <ProductReportLinks
          onReportPress={handleReportPress}
          onHelpPress={handleHelpPress}
          onTermsPress={handleTermsPress}
        />
      </ScrollView>

      {/* Footer sticky */}
      <SafeAreaView style={styles.footerSticky}>
        <ProductActions
          onOffer={handleOfferPress}
          onBuy={handleBuyPress}
        />
      </SafeAreaView>
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
    paddingTop: Platform.OS === 'ios' ? 44 : 0,
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
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 80,
    paddingBottom: Platform.OS === 'ios' ? 34 : 12,
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
}); 