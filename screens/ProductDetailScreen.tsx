import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, Platform, TouchableOpacity, Image, Alert, Text } from 'react-native';
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

export default function ProductDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  // @ts-ignore
  const { productId } = route.params || {};
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;
    ProductService.getProduct(productId).then(data => {
      setProduct(data);
      setLoading(false);
    });
  }, [productId]);

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

  // Mock data pour les produits similaires
  const similarProducts = [
    {
      id: 1,
      title: 'Produit similaire 1',
      price: 25.99,
      imageUrl: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f',
      isFavorite: false,
    },
    {
      id: 2,
      title: 'Produit similaire 2',
      price: 19.99,
      imageUrl: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308',
      isFavorite: true,
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header normal */}
      <View style={styles.header}>
        <ProductHeader title={product.title} />
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
          <TouchableOpacity onPress={handleImagePress} activeOpacity={0.8} style={styles.mainImageWrapper}>
            <Image
              source={{ uri: mainImageUrl }}
              style={styles.mainImage}
              resizeMode="cover"
            />
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
          products={similarProducts}
          onProductPress={handleProductPress}
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
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  mainImage: {
    width: '90%',
    aspectRatio: 1,
    borderRadius: 18,
    backgroundColor: '#eee',
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
}); 