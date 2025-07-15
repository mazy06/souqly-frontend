import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SellerReviews from './SellerReviews';

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
  onPress?: () => void;
}

// Mock reviews data (repris de SellerReviews)
const mockReviews = [
  { id: 1, author: 'Amina', rating: 5, comment: 'Vendeur très sérieux, livraison rapide !', date: '2024-06-01' },
  { id: 2, author: 'Youssef', rating: 4, comment: 'Bon échange, produit conforme à la description.', date: '2024-05-20' },
  { id: 3, author: 'Sara', rating: 5, comment: 'Super vendeur, je recommande !', date: '2024-05-10' },
  { id: 4, author: 'Ali', rating: 3, comment: 'Livraison un peu lente mais bon contact.', date: '2024-04-28' },
  { id: 5, author: 'Fatima', rating: 4, comment: 'Produit conforme, vendeur réactif.', date: '2024-04-15' },
];
const PAGE_SIZE = 2;

function renderStars(rating: number) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <Text key={i} style={{ color: i <= rating ? '#FFD700' : '#ccc', fontSize: 18 }}>
        ★
      </Text>
    );
  }
  return <View style={{ flexDirection: 'row', marginLeft: 6 }}>{stars}</View>;
}

export default function ProductSellerCard({ seller, onFollow, onPress }: ProductSellerCardProps) {
  const [showReviews, setShowReviews] = useState(false);
  const [page, setPage] = useState(1);
  const paginatedReviews = mockReviews.slice(0, page * PAGE_SIZE);
  const hasMore = mockReviews.length > paginatedReviews.length;

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.row} onPress={onPress} disabled={!onPress}>
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
          <Text style={styles.stats}>{`${seller.adsCount ?? 0} annonces`}</Text>
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
          {/* Lien déroulant juste sous la réponse */}
          <TouchableOpacity onPress={() => setShowReviews(v => !v)} style={{ marginTop: 6, marginBottom: 2 }}>
            <Text style={{ color: '#008080', fontWeight: '600', fontSize: 14 }}>
              {showReviews ? 'Masquer les avis ▲' : 'Voir les avis du vendeur ▼'}
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.followBtn} onPress={onFollow}>
          <Text style={styles.followBtnText}>{seller.isFollowing ? 'Suivi' : 'Suivre'}</Text>
        </TouchableOpacity>
      </TouchableOpacity>
      {/* Liste des avis paginée, en dehors du bloc principal */}
      {showReviews && (
        <View style={{ marginTop: 12 }}>
          {/* SUPPRIME le header nom/étoile/note ici */}
          {paginatedReviews.map(item => (
            <View key={item.id} style={{ backgroundColor: '#f8f9fa', borderRadius: 8, padding: 10, marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                {renderStars(item.rating)}
                <Text style={{ marginLeft: 8, fontWeight: '600', color: '#008080', fontSize: 14 }}>{item.author}</Text>
                <Text style={{ marginLeft: 8, color: '#aaa', fontSize: 12 }}>{item.date}</Text>
              </View>
              <Text style={{ color: '#333', fontSize: 15, marginTop: 2 }}>{item.comment}</Text>
            </View>
          ))}
          {hasMore && (
            <TouchableOpacity style={{ alignSelf: 'center', backgroundColor: '#008080', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 6, marginTop: 4 }} onPress={() => setPage(p => p + 1)}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>Voir plus</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
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