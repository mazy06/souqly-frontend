import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

interface Seller {
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  rating?: number;
  reviewsCount?: number;
  since?: string;
  adsCount?: number;
  isFollowing?: boolean;
}

interface ProductSellerCardProps {
  seller: Seller;
  onFollow?: () => void;
}

export default function ProductSellerCard({ seller, onFollow }: ProductSellerCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Image
          source={seller.avatarUrl ? { uri: seller.avatarUrl } : require('../assets/images/icon.png')}
          style={styles.avatar}
        />
        <View style={styles.info}>
          <Text style={styles.name}>{seller.firstName} {seller.lastName}</Text>
          <Text style={styles.stats}>{seller.adsCount ?? 0} annonces</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.rating}>★ {seller.rating?.toFixed(1) ?? '5.0'}</Text>
            <Text style={styles.reviews}>({seller.reviewsCount ?? 0})</Text>
          </View>
          <Text style={styles.since}>Membre depuis {seller.since ?? 'N/A'}</Text>
        </View>
        <TouchableOpacity style={styles.followBtn} onPress={onFollow}>
          <Text style={styles.followBtnText}>{seller.isFollowing ? 'Suivi' : 'Suivre'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#eee',
    marginRight: 16,
  },
  info: {
    flex: 1,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 17,
    marginBottom: 2,
  },
  stats: {
    color: '#888',
    fontSize: 14,
    marginBottom: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  rating: {
    color: '#FFD700',
    fontWeight: '600',
    marginRight: 4,
    fontSize: 15,
  },
  reviews: {
    color: '#888',
    fontSize: 13,
  },
  since: {
    fontSize: 13,
    color: '#aaa',
  },
  followBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#008080',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 6,
    marginLeft: 12,
  },
  followBtnText: {
    color: '#008080',
    fontWeight: 'bold',
    fontSize: 15,
  },
}); 