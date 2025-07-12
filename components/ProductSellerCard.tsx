import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Seller {
  id: number;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  rating?: number;
  reviewsCount?: number;
  createdAt?: string;
  adsCount?: number;
  isFollowing?: boolean;
  isVerified: boolean;
  responseTime: string;
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
          source={seller.profilePicture ? { uri: seller.profilePicture } : require('../assets/images/icon.png')}
          style={styles.avatar}
        />
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{seller.firstName} {seller.lastName}</Text>
            {seller.isVerified && (
              <View style={styles.badgeVerified}>
                <Ionicons name="checkmark-circle" size={14} color="#fff" style={{ marginRight: 4 }} />
                <Text style={styles.badgeText}>Vendeur vérifié</Text>
              </View>
            )}
          </View>
          <Text style={styles.stats}>{seller.adsCount ?? 0} annonces</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.rating}>★ {seller.rating?.toFixed(1) ?? '5.0'}</Text>
            <Text style={styles.reviews}>(12)</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={14} color="#aaa" style={{ marginRight: 6 }} />
            <Text style={styles.since}>Membre depuis {seller.createdAt ? new Date(seller.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' }) : 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={14} color="#aaa" style={{ marginRight: 6 }} />
            <Text style={styles.responseTime}>{seller.responseTime}</Text>
          </View>
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
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
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
  badgeVerified: {
    backgroundColor: '#4CAF50',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },

  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  responseTime: {
    color: '#aaa',
    fontSize: 13,
  },
}); 