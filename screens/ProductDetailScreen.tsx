import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { useColorScheme } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamList } from './HomeScreen';
import ProductService, { Product } from '../services/ProductService';

const { width: screenWidth } = Dimensions.get('window');

// --- ProductHeader component ---
function ProductHeader({ title, isFavorite, onBack, onToggleFavorite, onMenu }: {
  title: string;
  isFavorite: boolean;
  onBack: () => void;
  onToggleFavorite: () => void;
  onMenu: () => void;
}) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  return (
    <View
      style={[
        headerStyles.header,
        {
          backgroundColor: isDark
            ? 'rgba(24,26,32,0.85)'
            : 'rgba(255,255,255,0.85)',
          borderBottomColor: isDark ? '#23242a' : '#e0e0e0',
        },
      ]}
    >
      <TouchableOpacity onPress={onBack} style={headerStyles.headerBtn}>
        <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#181A20'} />
      </TouchableOpacity>
      <Text
        style={[
          headerStyles.headerTitle,
          { color: isDark ? '#fff' : '#181A20' },
        ]}
        numberOfLines={1}
      >
        {title}
      </Text>
      <View style={headerStyles.headerRight}>
        <TouchableOpacity onPress={onToggleFavorite} style={headerStyles.headerBtn}>
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorite ? '#e74c3c' : isDark ? '#fff' : '#181A20'}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={onMenu} style={headerStyles.headerBtn}>
          <MaterialIcons name="more-vert" size={24} color={isDark ? '#fff' : '#181A20'} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const headerStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 48 : 20,
    paddingHorizontal: 8,
    paddingBottom: 8,
    borderBottomWidth: 0.5,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 18,
    marginHorizontal: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
// --- End ProductHeader ---

export default function ProductDetailScreen() {
  const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
  const route = useRoute<RouteProp<HomeStackParamList, 'ProductDetail'>>();
  const { productId } = route.params;
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [tab, setTab] = useState<'dressing' | 'similaires'>('dressing');
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await ProductService.getProduct(parseInt(productId));
        setProduct(data);
        setIsFavorite(false);
      } catch (e) {
        console.error('Error fetching product:', e);
        setError('Erreur lors de la récupération du produit');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handleContactSeller = () => {
    const sellerName = product?.seller ? 
      `${product.seller.firstName} ${product.seller.lastName}` : 
      'le vendeur';
    
    Alert.alert(
      "Contacter le vendeur",
      `Voulez-vous ouvrir une conversation avec ${sellerName} ?`,
      [
        { text: "Annuler", style: "cancel" },
        { text: "Ouvrir", onPress: () => navigation.goBack() }
      ]
    );
  };

  const renderDot = (index: number) => (
    <View
      key={index}
      style={[
        styles.dot,
        {
          backgroundColor: index === currentImageIndex ? colors.button : 'rgba(255,255,255,0.5)',
        },
      ]}
    />
  );

  // Add mock data for dressingItems and similarItems
  const dressingItems = [
    { id: 1, image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f', brand: 'H&M', likes: 3 },
    { id: 2, image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308', brand: 'Mango', likes: 5 },
  ];
  const similarItems = [
    { id: 3, image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb', brand: 'Zara', likes: 2 },
    { id: 4, image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca', brand: 'Kaporal', likes: 1 },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.button} />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Produit non trouvé'}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.retryBtnText}>Retourner</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ProductHeader
        title={product.title}
        isFavorite={isFavorite}
        onBack={() => navigation.goBack()}
        onToggleFavorite={toggleFavorite}
        onMenu={() => {}}
      />

      <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.galleryContainer}>
          {product.images && product.images.length > 0 ? (
            <>
              <FlatList
                data={product.images}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={e => {
                  const index = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
                  setCurrentImageIndex(index);
                }}
                renderItem={({ item }) => (
                  <Image 
                    source={{ uri: ProductService.getImageUrl(item.id) }} 
                    style={styles.galleryImage} 
                    resizeMode="cover" 
                  />
                )}
                keyExtractor={(item) => item.id.toString()}
              />
              <View style={styles.galleryDots}>
                {product.images.map((_, i: number) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      currentImageIndex === i && styles.dotActive
                    ]}
                  />
                ))}
              </View>
            </>
          ) : (
            <View style={styles.noImageContainer}>
              <Ionicons name="image-outline" size={64} color="#ccc" />
              <Text style={styles.noImageText}>Aucune image disponible</Text>
            </View>
          )}
        </View>

        {/* Price & Main Info Block */}
        <View style={styles.priceBlock}>
          <Text style={styles.price}>{product.price.toFixed(2)} €</Text>
          {product.priceWithFees && (
            <View style={styles.priceProtectionRow}>
              <Text style={styles.priceWithProtection}>
                {product.priceWithFees.toFixed(2)} € Inclut la Protection acheteurs
              </Text>
              <Ionicons name="shield-checkmark" size={16} color="#00BFA6" style={{ marginLeft: 4 }} />
            </View>
          )}
          <View style={styles.shippingBadge}>
            <Ionicons name="car-outline" size={16} color="#fff" style={{ marginRight: 4 }} />
            <Text style={styles.shippingText}>
              Frais de port : {product.shippingInfo || "à définir"}
            </Text>
          </View>
          <Text style={styles.productMeta}>
            {product.size || 'Taille non spécifiée'} · {product.condition} ·
            {product.brand && <Text style={styles.brandLink}> {product.brand}</Text>}
          </Text>
        </View>

        {/* Seller Info */}
        <View style={styles.sellerBlock}>
          <View style={styles.sellerAvatar}>
            <Ionicons name="person" size={32} color="#ccc" />
          </View>
          <View style={styles.sellerInfo}>
            <Text style={styles.sellerName}>
              {product.seller ? 
                `${product.seller.firstName} ${product.seller.lastName}` : 
                'Vendeur'
              }
            </Text>
            <Text style={styles.sellerLocation}>Localisation non spécifiée</Text>
            <Text style={styles.sellerMemberSince}>Membre depuis récemment</Text>
          </View>
          <TouchableOpacity style={styles.contactButton} onPress={handleContactSeller}>
            <Text style={styles.contactButtonText}>Contacter</Text>
          </TouchableOpacity>
        </View>

        {/* Description */}
        <View style={styles.descriptionBlock}>
          <Text style={styles.descriptionTitle}>Description</Text>
          <Text style={styles.descriptionText} numberOfLines={showFullDesc ? undefined : 3}>
            {product.description}
          </Text>
          <TouchableOpacity onPress={() => setShowFullDesc(!showFullDesc)}>
            <Text style={styles.showMoreText}>
              {showFullDesc ? 'Voir moins' : 'Voir plus'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Category */}
        <View style={styles.tagsBlock}>
          <Text style={styles.tagsTitle}>Catégorie</Text>
          <View style={styles.tagsContainer}>
            {product.category && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{product.category.label}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tabBtn, tab === 'dressing' && styles.tabBtnActive]}
            onPress={() => setTab('dressing')}
          >
            <Text style={[styles.tabText, tab === 'dressing' && styles.tabTextActive]}>Dressing du membre</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, tab === 'similaires' && styles.tabBtnActive]}
            onPress={() => setTab('similaires')}
          >
            <Text style={[styles.tabText, tab === 'similaires' && styles.tabTextActive]}>Articles similaires</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={tab === 'dressing' ? dressingItems : similarItems}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.flatListContent}
          renderItem={({ item }) => (
            <View style={styles.miniCard}>
              <Image source={{ uri: item.image }} style={styles.miniCardImage} resizeMode="cover" />
              <Text style={styles.miniCardBrand}>{item.brand}</Text>
              <View style={styles.miniCardLikes}>
                <Ionicons name="heart-outline" size={14} color="#fff" />
                <Text style={styles.miniCardLikesText}>{item.likes}</Text>
              </View>
            </View>
          )}
        />
        {tab === 'dressing' && (
          <TouchableOpacity style={styles.createLotBtn}>
            <Text style={styles.createLotBtnText}>Créer un lot</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <View style={styles.footerBar}>
        <TouchableOpacity style={styles.offerBtn}>
          <Text style={styles.offerBtnText}>Faire une offre</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buyBtn}>
          <Text style={styles.buyBtnText}>Acheter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  galleryContainer: {
    width: '100%',
    height: 400,
    backgroundColor: '#181A20',
    position: 'relative',
    marginBottom: 8,
  },
  galleryImage: {
    width: screenWidth,
    height: 400,
  },
  galleryDots: {
    position: 'absolute',
    bottom: 18,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#00BFA6',
  },
  content: {
    padding: 16,
  },
  priceBlock: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: 'transparent',
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  priceProtectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceWithProtection: {
    fontSize: 15,
    color: '#00BFA6',
    fontWeight: '600',
  },
  shippingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3a2d2d',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  shippingText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  productMeta: {
    color: '#bbb',
    fontSize: 15,
    marginTop: 2,
  },
  brandLink: {
    color: '#00BFA6',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 28,
  },
  brandSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  brand: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 12,
  },
  conditionBadge: {
    backgroundColor: '#00BFA6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  conditionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  size: {
    fontSize: 16,
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  measurementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  measurementLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  measurementValue: {
    fontSize: 16,
  },
  sellerBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#23242a',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    marginTop: 8,
  },
  sellerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  sellerRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  sellerRating: {
    color: '#FFD700',
    fontWeight: '600',
    marginLeft: 4,
    marginRight: 8,
    fontSize: 14,
  },
  sellerReviews: {
    color: '#FFD700',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },
  sellerLocation: {
    color: '#bbb',
    fontSize: 13,
  },
  sellerMemberSince: {
    color: '#bbb',
    fontSize: 13,
    opacity: 0.7,
  },
  contactButton: {
    backgroundColor: '#00BFA6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginLeft: 10,
  },
  contactButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  footerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 12,
    backgroundColor: '#181A20',
    borderTopWidth: 1,
    borderTopColor: '#23242a',
  },
  offerBtn: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#00BFA6',
    borderRadius: 10,
    paddingVertical: 14,
    marginRight: 10,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  offerBtnText: {
    color: '#00BFA6',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buyBtn: {
    flex: 1,
    backgroundColor: '#00BFA6',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buyBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  showMoreText: {
    color: '#00BFA6',
    fontWeight: 'bold',
    marginTop: 4,
    fontSize: 15,
  },
  descriptionBlock: {
    marginBottom: 24,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  tagsBlock: {
    marginBottom: 24,
  },
  tagsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  tabsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#23242a',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: '#00BFA6',
  },
  tabText: {
    color: '#bbb',
    fontWeight: '600',
    fontSize: 15,
  },
  tabTextActive: {
    color: '#00BFA6',
  },
  flatListContent: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  miniCard: {
    width: 120,
    marginRight: 12,
    backgroundColor: '#23242a',
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    paddingBottom: 8,
  },
  miniCardImage: {
    width: 120,
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  miniCardBrand: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 6,
  },
  miniCardLikes: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  miniCardLikesText: {
    color: '#fff',
    marginLeft: 4,
    fontSize: 13,
  },
  createLotBtn: {
    backgroundColor: '#00BFA6',
    borderRadius: 8,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 10,
    marginTop: 10,
    marginBottom: 16,
  },
  createLotBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    color: '#fff',
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: '#00BFA6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  retryBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  noImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  noImageText: {
    marginTop: 8,
    color: '#666',
    fontSize: 16,
  },
}); 