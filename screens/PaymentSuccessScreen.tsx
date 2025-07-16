import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { formatAmount } from '../utils/formatters';

type PaymentSuccessRouteProp = {
  productTitle: string;
  productPrice: number;
  transactionId: string;
  productId?: string;
  sellerId?: number;
  sellerName?: string;
};

export default function PaymentSuccessScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { productTitle, productPrice, transactionId, productId, sellerId, sellerName } = route.params as PaymentSuccessRouteProp;
  const { colors } = useTheme();

  const handleContinueShopping = () => {
    console.log('[DEBUG] handleContinueShopping appelé avec:', { productId, sellerId, sellerName });
    
    if (productId) {
      // Si on a au moins l'ID du produit, on peut naviguer vers l'écran de notation
      navigation.navigate('Review', {
        productId,
        productTitle,
        sellerId: sellerId || 1, // Valeur par défaut si pas d'ID vendeur
        sellerName: sellerName || 'Vendeur', // Valeur par défaut si pas de nom
        transactionId
      });
    } else {
      navigation.navigate('HomeMain');
    }
  };

  const handleViewOrders = () => {
    // Navigation vers l'écran des commandes
    navigation.navigate('Orders');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Icône de succès */}
        <View style={styles.successIconContainer}>
          <View style={[styles.successIcon, { backgroundColor: colors.primary }]}>
            <Ionicons name="checkmark" size={48} color="#fff" />
          </View>
        </View>

        {/* Titre */}
        <Text style={[styles.title, { color: colors.text }]}>
          Paiement réussi !
        </Text>

        {/* Message */}
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          Votre achat a été effectué avec succès. Vous recevrez bientôt un email de confirmation avec les détails de votre commande.
        </Text>

        {/* Détails de la transaction */}
        <View style={[styles.detailsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.detailsTitle, { color: colors.text }]}>
            Détails de la transaction
          </Text>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              Produit :
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]} numberOfLines={2}>
              {productTitle}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              Montant :
            </Text>
            <Text style={[styles.detailValue, { color: colors.primary }]}>
              {formatAmount(productPrice)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              Transaction ID :
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {transactionId}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              Date :
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {new Date().toLocaleDateString('fr-FR')}
            </Text>
          </View>
        </View>

        {/* Prochaines étapes */}
        <View style={[styles.nextStepsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.nextStepsTitle, { color: colors.text }]}>
            Prochaines étapes
          </Text>
          
          <View style={styles.stepRow}>
            <View style={[styles.stepIcon, { backgroundColor: colors.primary }]}>
              <Ionicons name="mail" size={16} color="#fff" />
            </View>
            <Text style={[styles.stepText, { color: colors.text }]}>
              Email de confirmation envoyé
            </Text>
          </View>
          
          <View style={styles.stepRow}>
            <View style={[styles.stepIcon, { backgroundColor: colors.primary }]}>
              <Ionicons name="time" size={16} color="#fff" />
            </View>
            <Text style={[styles.stepText, { color: colors.text }]}>
              Le vendeur sera notifié de votre achat
            </Text>
          </View>
          
          <View style={styles.stepRow}>
            <View style={[styles.stepIcon, { backgroundColor: colors.primary }]}>
              <Ionicons name="car" size={16} color="#fff" />
            </View>
            <Text style={[styles.stepText, { color: colors.text }]}>
              Livraison organisée par le vendeur
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Boutons d'action */}
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: colors.primary }]}
          onPress={handleContinueShopping}
        >
          <Text style={styles.primaryButtonText}>
            {productId ? 'Évaluer l\'achat' : 'Continuer les achats'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.secondaryButton, { borderColor: colors.border }]}
          onPress={handleViewOrders}
        >
          <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
            Voir mes commandes
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 80, // Réduire l'espacement en bas du contenu
  },
  successIconContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 24,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  detailsCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  nextStepsCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  nextStepsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepText: {
    fontSize: 14,
    flex: 1,
  },
  footer: {
    padding: 16,
    paddingBottom: 8, // Réduire l'espacement en bas
    borderTopWidth: 1,
    gap: 12,
  },
  primaryButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  secondaryButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 