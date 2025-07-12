import React from 'react';
import { View, StyleSheet } from 'react-native';
import SellerReviews from './SellerReviews';

interface ProductReviewsProps {
  seller?: {
    avatarUrl?: string;
    firstName?: string;
    lastName?: string;
    averageRating?: number;
  };
}

export default function ProductReviews({ seller }: ProductReviewsProps) {
  return (
    <View style={styles.container}>
      <SellerReviews
        avatar={seller?.avatarUrl}
        name={seller ? `${seller.firstName ?? ''} ${seller.lastName ?? ''}`.trim() : 'Ahmed Al-Saud'}
        averageRating={seller?.averageRating ?? 4.3}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingVertical: 16,
  },
}); 