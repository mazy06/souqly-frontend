import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import ProductService from '../services/ProductService';
import ApiService from '../services/ApiService';

export default function MyProductDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { productId } = route.params;
  const { colors } = useTheme();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await ApiService.get(`/products/${productId}`);
      setProduct(response);
    } catch (error) {
      console.error('Erreur lors du chargement du produit:', error);
      Alert.alert('Erreur', 'Impossible de charger les détails du produit');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      setActionLoading(true);
      const newStatus = product.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await ApiService.put(`/products/${productId}/status`, { status: newStatus });
      setProduct({ ...product, status: newStatus });
      Alert.alert('Succès', `Produit ${newStatus === 'ACTIVE' ? 'activé' : 'désactivé'} avec succès`);
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      Alert.alert('Erreur', 'Impossible de modifier le statut du produit');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = () => {
    navigation.navigate('EditProduct', { productId: productId });
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmer la suppression',
      'Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: confirmDelete }
      ]
    );
  };

  const confirmDelete = async () => {
    try {
      setActionLoading(true);
      await ApiService.delete(`/products/${productId}`);
      Alert.alert('Succès', 'Produit supprimé avec succès', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      Alert.alert('Erreur', 'Impossible de supprimer le produit');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Chargement...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>
            Produit non trouvé
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Gérer mon produit
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image
            source={
              product.images && product.images.length > 0
                ? { uri: ProductService.getProductImageUrl(product) }
                : require('../assets/images/icon.png')
            }
            style={styles.productImage}
            resizeMode="cover"
          />
          <View style={[
            styles.statusBadge,
            { backgroundColor: product.status === 'ACTIVE' ? '#4CAF50' : '#FF9800' }
          ]}>
            <Text style={styles.statusText}>
              {product.status === 'ACTIVE' ? 'Actif' : 'Inactif'}
            </Text>
          </View>
        </View>

        {/* Product Info */}
        <View style={styles.infoSection}>
          <Text style={[styles.productTitle, { color: colors.text }]}>
            {product.title}
          </Text>
          <Text style={[styles.productPrice, { color: colors.primary }]}>
            {product.price} €
          </Text>
          <Text style={[styles.productDescription, { color: colors.textSecondary }]}>
            {product.description}
          </Text>
          
          <View style={styles.detailsRow}>
            <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              Publié le {formatDate(product.createdAt)}
            </Text>
          </View>
          
          {product.updatedAt && product.updatedAt !== product.createdAt && (
            <View style={styles.detailsRow}>
              <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                Modifié le {formatDate(product.updatedAt)}
              </Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Actions
          </Text>

          {/* Toggle Status */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: colors.card, borderColor: colors.border }
            ]}
            onPress={handleToggleStatus}
            disabled={actionLoading}
          >
            <View style={styles.actionContent}>
              <Ionicons 
                name={product.status === 'ACTIVE' ? 'pause-circle-outline' : 'play-circle-outline'} 
                size={24} 
                color={colors.text} 
              />
              <View style={styles.actionTextContainer}>
                <Text style={[styles.actionText, { color: colors.text }]}>
                  {product.status === 'ACTIVE' ? 'Désactiver' : 'Activer'} le produit
                </Text>
                <Text style={[styles.actionSubtext, { color: colors.textSecondary }]}>
                  {product.status === 'ACTIVE' 
                    ? 'Le produit ne sera plus visible' 
                    : 'Le produit sera visible par tous'
                  }
                </Text>
              </View>
            </View>
            {actionLoading && <ActivityIndicator size="small" color={colors.primary} />}
          </TouchableOpacity>

          {/* Edit */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: colors.card, borderColor: colors.border }
            ]}
            onPress={handleEdit}
          >
            <View style={styles.actionContent}>
              <Ionicons name="create-outline" size={24} color={colors.text} />
              <View style={styles.actionTextContainer}>
                <Text style={[styles.actionText, { color: colors.text }]}>
                  Modifier le produit
                </Text>
                <Text style={[styles.actionSubtext, { color: colors.textSecondary }]}>
                  Modifier les informations du produit
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text + '60'} />
          </TouchableOpacity>

          {/* Delete */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.deleteButton,
              { backgroundColor: '#FFEBEE', borderColor: '#FFCDD2' }
            ]}
            onPress={handleDelete}
          >
            <View style={styles.actionContent}>
              <Ionicons name="trash-outline" size={24} color="#D32F2F" />
              <View style={styles.actionTextContainer}>
                <Text style={[styles.actionText, { color: '#D32F2F' }]}>
                  Supprimer le produit
                </Text>
                <Text style={[styles.actionSubtext, { color: '#D32F2F' + '80' }]}>
                  Cette action est irréversible
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#D32F2F" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  productImage: {
    width: '100%',
    height: 250,
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  infoSection: {
    padding: 16,
  },
  productTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  productDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
  },
  actionsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  deleteButton: {
    marginTop: 8,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  actionSubtext: {
    fontSize: 14,
    marginTop: 2,
  },
}); 