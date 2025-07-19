import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TransferType } from './TransferSelectionScreen';
import { formatAmount } from '../utils/formatters';
import { ProfileStackParamList } from '../types/navigation';
import { StackNavigationProp } from '@react-navigation/stack';

type TransferSuccessRouteProp = RouteProp<ProfileStackParamList, 'TransferSuccess'>;

export default function TransferSuccessScreen() {
  const navigation = useNavigation<StackNavigationProp<ProfileStackParamList>>();
  const route = useRoute<TransferSuccessRouteProp>();
  const { colors } = useTheme();
  
  const { transferType, amount, fee, totalAmount, transactionId } = route.params;

  // Animations simples
  const [iconScale] = useState(new Animated.Value(0));
  const [contentOpacity] = useState(new Animated.Value(0));
  const [contentTranslateY] = useState(new Animated.Value(50));

  useEffect(() => {
    // Animation d'entrée
    Animated.sequence([
      Animated.spring(iconScale, {
        toValue: 1.2,
        useNativeDriver: true,
      }),
      Animated.spring(iconScale, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        delay: 200,
      }),
      Animated.spring(contentTranslateY, {
        toValue: 0,
        useNativeDriver: true,
        delay: 300,
      }),
    ]).start();
  }, []);

  const transferTypeInfo = {
    bank: {
      title: 'Virement bancaire',
      icon: 'business-outline',
      color: '#2196F3',
      description: 'Vers votre compte bancaire',
      time: '1-3 jours ouvrables'
    },
    mobile: {
      title: 'Mobile Money',
      icon: 'phone-portrait-outline',
      color: '#4CAF50',
      description: 'Orange Money, MTN Mobile Money, etc.',
      time: 'Instantané'
    },
    card: {
      title: 'Carte bancaire',
      icon: 'card-outline',
      color: '#FF9800',
      description: 'Vers votre carte Visa/Mastercard',
      time: '2-5 jours ouvrables'
    },
    crypto: {
      title: 'Cryptomonnaie',
      icon: 'logo-bitcoin',
      color: '#9C27B0',
      description: 'Bitcoin, Ethereum, etc.',
      time: '10-30 minutes'
    }
  };

  const currentType = transferTypeInfo[transferType];

  const handleViewWallet = () => {
    navigation.navigate('Wallet');
  };

  const handleViewTransactions = () => {
    navigation.navigate('Transactions');
  };

  const handleDone = () => {
    navigation.navigate('Wallet');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Success Icon */}
        <View style={styles.successContainer}>
          <Animated.View style={[styles.successIconContainer, { transform: [{ scale: iconScale }] }]}>
            <View style={[styles.successIcon, { backgroundColor: '#4CAF50' }]}>
              <Ionicons name="checkmark" size={48} color="white" />
            </View>
          </Animated.View>
          
          <Animated.View style={[
            styles.successTextContainer, 
            { 
              opacity: contentOpacity,
              transform: [{ translateY: contentTranslateY }]
            }
          ]}>
            <Text style={[styles.successTitle, { color: colors.text }]}>
              Transfert initié !
            </Text>
            <Text style={[styles.successSubtitle, { color: colors.textSecondary }]}>
              Votre transfert a été traité avec succès
            </Text>
          </Animated.View>
        </View>

        {/* Transfer Details */}
        <Animated.View style={[
          styles.detailsCard, 
          { backgroundColor: colors.card, borderColor: colors.border },
          { 
            opacity: contentOpacity,
            transform: [{ translateY: contentTranslateY }]
          }
        ]}>
          <View style={styles.transferTypeHeader}>
            <View style={[styles.transferTypeIcon, { backgroundColor: currentType.color + '20' }]}>
              <Ionicons name={currentType.icon as any} size={24} color={currentType.color} />
            </View>
            <View style={styles.transferTypeInfo}>
              <Text style={[styles.transferTypeTitle, { color: colors.text }]}>
                {currentType.title}
              </Text>
              <Text style={[styles.transferTypeDescription, { color: colors.textSecondary }]}>
                {currentType.description}
              </Text>
            </View>
          </View>

          <View style={styles.amountSection}>
            <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>
              Montant transféré
            </Text>
            <Text style={[styles.amountValue, { color: colors.text }]}>
              {formatAmount(amount)}
            </Text>
          </View>

          <View style={styles.summarySection}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Montant
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {formatAmount(amount)}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Frais
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {formatAmount(fee)}
              </Text>
            </View>
            
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={[styles.summaryLabel, styles.totalLabel, { color: colors.text }]}>
                Total
              </Text>
              <Text style={[styles.summaryValue, styles.totalValue, { color: colors.text }]}>
                {formatAmount(totalAmount)}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Transaction Info */}
        <Animated.View style={[
          styles.infoCard, 
          { backgroundColor: colors.card, borderColor: colors.border },
          { 
            opacity: contentOpacity,
            transform: [{ translateY: contentTranslateY }]
          }
        ]}>
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Délai de traitement
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {currentType.time}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="document-text-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Référence
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {transactionId}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Confirmation
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                Email envoyé
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Next Steps */}
        <Animated.View style={[
          styles.stepsCard, 
          { backgroundColor: colors.card, borderColor: colors.border },
          { 
            opacity: contentOpacity,
            transform: [{ translateY: contentTranslateY }]
          }
        ]}>
          <Text style={[styles.stepsTitle, { color: colors.text }]}>
            Prochaines étapes
          </Text>
          
          <View style={styles.stepsList}>
            <View style={styles.stepItem}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={[styles.stepText, { color: colors.textSecondary }]}>
                Vous recevrez une confirmation par email
              </Text>
            </View>
            
            <View style={styles.stepItem}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={[styles.stepText, { color: colors.textSecondary }]}>
                Le montant sera crédité selon le délai indiqué
              </Text>
            </View>
            
            <View style={styles.stepItem}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={[styles.stepText, { color: colors.textSecondary }]}>
                Vous pouvez suivre le statut dans vos transactions
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.footerContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <Animated.View style={[
          styles.footer, 
          { 
            opacity: contentOpacity,
            transform: [{ translateY: contentTranslateY }]
          }
        ]}>
          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: colors.border }]}
            onPress={handleViewTransactions}
          >
            <Ionicons name="list-outline" size={20} color={colors.text} />
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
              Voir les transactions
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={handleDone}
          >
            <Text style={styles.primaryButtonText}>
              Terminé
            </Text>
          </TouchableOpacity>
        </Animated.View>
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
    paddingHorizontal: 16,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  successIconContainer: {
    marginBottom: 24,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTextContainer: {
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  detailsCard: {
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  transferTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  transferTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  transferTypeInfo: {
    flex: 1,
  },
  transferTypeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  transferTypeDescription: {
    fontSize: 14,
  },
  amountSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  amountLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  summarySection: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoSection: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  stepsCard: {
    marginBottom: 32,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  stepsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  stepsList: {
    gap: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  stepText: {
    fontSize: 14,
    flex: 1,
  },
  footerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    backgroundColor: 'white',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
}); 