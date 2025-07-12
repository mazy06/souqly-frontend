import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

// Fonction utilitaire pour afficher les étoiles
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

// Props : avatar (url), name (string), averageRating (number)
type SellerReviewsProps = {
  avatar?: string;
  name: string;
  averageRating?: number;
};

// Mock reviews data
const mockReviews = [
  { id: 1, author: 'Amina', rating: 5, comment: 'Vendeur très sérieux, livraison rapide !', date: '2024-06-01' },
  { id: 2, author: 'Youssef', rating: 4, comment: 'Bon échange, produit conforme à la description.', date: '2024-05-20' },
  { id: 3, author: 'Sara', rating: 5, comment: 'Super vendeur, je recommande !', date: '2024-05-10' },
  { id: 4, author: 'Ali', rating: 3, comment: 'Livraison un peu lente mais bon contact.', date: '2024-04-28' },
  { id: 5, author: 'Fatima', rating: 4, comment: 'Produit conforme, vendeur réactif.', date: '2024-04-15' },
];
const PAGE_SIZE = 2;

export default function SellerReviews({ avatar, name, averageRating }: SellerReviewsProps) {
  const [showReviews, setShowReviews] = useState(false);
  const [page, setPage] = useState(1);
  const paginatedReviews = mockReviews.slice(0, page * PAGE_SIZE);
  const hasMore = mockReviews.length > paginatedReviews.length;

  return (
    <View style={styles.container}>
      <Image
        source={avatar ? { uri: avatar } : require('../assets/images/splash-icon.png')}
        style={styles.avatar}
      />
      <View style={styles.infoCol}>
        <View style={styles.ratingRow}>
          <Text style={styles.name}>{name}</Text>
          <Text style={{ color: '#FFD700', fontSize: 18, marginLeft: 8, marginRight: 4 }}>★</Text>
          {averageRating !== undefined && averageRating !== null && (
            <Text style={styles.yellowScore}>{averageRating.toFixed(1)}</Text>
          )}
          <Text style={styles.countText}>({mockReviews.length})</Text>
        </View>
        {/* Intitulé déroulant */}
        <TouchableOpacity onPress={() => setShowReviews(v => !v)} style={styles.toggleRow}>
          <Text style={styles.toggleText}>
            {showReviews ? 'Masquer les avis ▲' : 'Voir les avis du vendeur ▼'}
          </Text>
        </TouchableOpacity>
        {/* Liste des avis paginée */}
        {showReviews && (
          <View style={styles.reviewsList}>
            {paginatedReviews.map(item => (
              <View key={item.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  {renderStars(item.rating)}
                  <Text style={styles.reviewAuthor}>{item.author}</Text>
                  <Text style={styles.reviewDate}>{item.date}</Text>
                </View>
                <Text style={styles.reviewComment}>{item.comment}</Text>
              </View>
            ))}
            {hasMore && (
              <TouchableOpacity style={styles.moreBtn} onPress={() => setPage(p => p + 1)}>
                <Text style={styles.moreBtnText}>Voir plus</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    backgroundColor: '#eee',
  },
  infoCol: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
    marginRight: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  yellowScore: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleRow: {
    marginTop: 2,
    marginBottom: 2,
  },
  toggleText: {
    color: '#008080',
    fontWeight: '600',
    fontSize: 14,
  },
  reviewsList: {
    marginTop: 6,
    marginBottom: 2,
  },
  reviewCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewAuthor: {
    marginLeft: 8,
    fontWeight: '600',
    color: '#008080',
    fontSize: 14,
  },
  reviewDate: {
    marginLeft: 8,
    color: '#aaa',
    fontSize: 12,
  },
  reviewComment: {
    color: '#333',
    fontSize: 15,
    marginTop: 2,
  },
  moreBtn: {
    alignSelf: 'center',
    backgroundColor: '#008080',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginTop: 4,
  },
  moreBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  countText: {
    color: '#aaa',
    fontSize: 12,
  },
}); 