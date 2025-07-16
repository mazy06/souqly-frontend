import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatAmount } from '../utils/formatters';

interface ProductInfoSectionProps {
  price: number;
  priceWithFees?: number;
  description: string;
  condition: string;
  brand?: string;
  size?: string;
  shippingInfo?: string;
}

export default function ProductInfoSection({
  price,
  priceWithFees,
  description,
  condition,
  brand,
  size,
  shippingInfo,
}: ProductInfoSectionProps) {
  const [showFullDescription, setShowFullDescription] = useState(false);

  return (
    <View style={styles.container}>
      {/* Prix */}
      <View style={styles.priceSection}>
        <Text style={styles.price}>{formatAmount(price)}</Text>
        {priceWithFees && (
          <View style={styles.priceProtectionRow}>
            <Text style={styles.priceWithProtection}>
              {formatAmount(priceWithFees)} Inclut la Protection acheteurs
            </Text>
            <Ionicons name="shield-checkmark" size={16} color="#00BFA6" style={styles.shieldIcon} />
          </View>
        )}
      </View>

      {/* Métadonnées */}
      <View style={styles.metadataRow}>
        <Text style={styles.metadata}>
          {size || 'Taille non spécifiée'} • {condition}
          {brand && <Text style={styles.brand}> • {brand}</Text>}
        </Text>
      </View>

      {/* Livraison */}
      <View style={styles.shippingBadgeBrown}>
        <Ionicons name="car-outline" size={16} color="#fff" style={styles.carIcon} />
        <Text style={styles.shippingTextBrown}>
          Livraison : {shippingInfo || 'Non renseigné'}
        </Text>
      </View>

      {/* Description */}
      <View style={styles.descriptionSection}>
        <Text style={styles.descriptionTitle}>Description</Text>
        <Text style={styles.descriptionText} numberOfLines={showFullDescription ? undefined : 13}>
          {description}
        </Text>
        {description.length > 100 && (
          <TouchableOpacity 
            onPress={() => setShowFullDescription(!showFullDescription)}
            style={styles.showMoreButton}
          >
            <Text style={styles.showMoreText}>
              {showFullDescription ? 'Voir moins' : 'Voir plus'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  priceSection: {
    marginBottom: 12,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  priceProtectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceWithProtection: {
    fontSize: 14,
    color: '#666',
  },
  shieldIcon: {
    marginLeft: 4,
  },
  metadataRow: {
    marginBottom: 12,
  },
  metadata: {
    fontSize: 16,
    color: '#666',
  },
  brand: {
    fontWeight: '600',
    color: '#008080',
  },
  shippingBadgeBrown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#A0522D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 20,
    marginTop: 4,
  },
  carIcon: {
    marginRight: 4,
  },
  shippingTextBrown: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  descriptionSection: {
    marginTop: 8,
  },
  descriptionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  showMoreButton: {
    marginTop: 8,
  },
  showMoreText: {
    color: '#008080',
    fontSize: 16,
    fontWeight: '500',
  },
}); 