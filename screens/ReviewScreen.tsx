import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import ReviewService from '../services/ReviewService';

type ReviewScreenRouteProp = {
  productId: string;
  productTitle: string;
  sellerId: number;
  sellerName: string;
  transactionId: string;
};

export default function ReviewScreen() {
  const { colors } = useTheme();
  const { isAuthenticated, user } = useAuth();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { productId, productTitle, sellerId = 1, sellerName = 'Vendeur', transactionId } = route.params as ReviewScreenRouteProp;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleStarPress = (starIndex: number) => {
    setRating(starIndex + 1);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Erreur', 'Veuillez donner une note au vendeur');
      return;
    }

    if (comment.trim().length < 10) {
      Alert.alert('Erreur', 'Veuillez écrire un commentaire d\'au moins 10 caractères');
      return;
    }

    try {
      setSubmitting(true);
      
      const result = await ReviewService.submitReview({
        productId: parseInt(productId),
        sellerId,
        rating,
        comment: comment.trim(),
        transactionId
      });

      if (result.success) {
        setSubmitted(true);
        // Navigation après un court délai pour montrer le succès
        setTimeout(() => {
          navigation.navigate('HomeMain');
        }, 1000);
      } else {
        Alert.alert('Erreur', result.message || 'Impossible d\'enregistrer votre avis');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'avis:', error);
      Alert.alert('Erreur', 'Impossible d\'enregistrer votre avis pour le moment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    // Navigation directe sans alerte pour une expérience plus fluide
    navigation.navigate('HomeMain');
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => handleStarPress(i)}
          style={styles.starContainer}
        >
          <Ionicons
            name={i < rating ? 'star' : 'star-outline'}
            size={40}
            color={i < rating ? colors.primary : colors.textSecondary}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  const getRatingText = () => {
    switch (rating) {
      case 1: return 'Très déçu';
      case 2: return 'Déçu';
      case 3: return 'Correct';
      case 4: return 'Satisfait';
      case 5: return 'Très satisfait';
      default: return 'Donnez votre avis';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Évaluer votre achat
          </Text>
          <View style={styles.placeholder} />
        </View>

        {/* Product Info */}
        <View style={[styles.productCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.productTitle, { color: colors.text }]}>
            {productTitle}
          </Text>
          <Text style={[styles.sellerName, { color: colors.textSecondary }]}>
            Vendu par {sellerName}
          </Text>
        </View>

        {/* Rating Section */}
        <View style={[styles.ratingSection, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Comment évaluez-vous votre expérience ?
          </Text>
          
          <View style={styles.starsContainer}>
            {renderStars()}
          </View>
          
          <Text style={[styles.ratingText, { color: colors.primary }]}>
            {getRatingText()}
          </Text>
        </View>

        {/* Comment Section */}
        <View style={[styles.commentSection, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Partagez votre expérience (optionnel)
          </Text>
          
          <TextInput
            style={[
              styles.commentInput,
              {
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.border
              }
            ]}
            placeholder="Décrivez votre expérience d'achat..."
            placeholderTextColor={colors.textSecondary}
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            maxLength={500}
          />
          
          <Text style={[styles.charCount, { color: colors.textSecondary }]}>
            {comment.length}/500 caractères
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.skipButton, { borderColor: colors.border }]}
            onPress={handleSkip}
            disabled={submitting}
          >
            <Text style={[styles.skipButtonText, { color: colors.textSecondary }]}>
              Plus tard
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.submitButton,
              {
                backgroundColor: submitted ? '#4CAF50' : rating > 0 ? colors.primary : colors.textSecondary,
                opacity: submitting ? 0.6 : 1
              }
            ]}
            onPress={handleSubmit}
            disabled={submitting || rating === 0 || submitted}
          >
            <Text style={styles.submitButtonText}>
              {submitted ? 'Envoyé !' : submitting ? 'Envoi...' : 'Envoyer l\'avis'}
            </Text>
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
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  productCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  sellerName: {
    fontSize: 14,
  },
  ratingSection: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  starContainer: {
    marginHorizontal: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
  },
  commentSection: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
  },
  commentInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    marginBottom: 8,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  skipButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 2,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 