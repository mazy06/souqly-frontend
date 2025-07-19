import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TransferType } from './TransferSelectionScreen';
import { useAuth } from '../contexts/AuthContext';
import { formatAmount } from '../utils/formatters';
import { ProfileStackParamList } from '../types/navigation';
import { StackNavigationProp } from '@react-navigation/stack';

type TransferConfirmationRouteProp = RouteProp<ProfileStackParamList, 'TransferConfirmation'>;

export default function TransferConfirmationScreen() {
  const navigation = useNavigation<StackNavigationProp<ProfileStackParamList>>();
  const route = useRoute<TransferConfirmationRouteProp>();
  const { colors } = useTheme();
  const { user } = useAuth();
  
  const { transferType, amount, fee, totalAmount } = route.params;
  const [isProcessing, setIsProcessing] = useState(false);

  const transferTypeInfo = {
    bank: {
      title: 'Virement bancaire',
      icon: 'business-outline',
      color: '#2196F3',
      description: 'Vers votre compte bancaire'
    },
    mobile: {
      title: 'Mobile Money',
      icon: 'phone-portrait-outline',
      color: '#4CAF50',
      description: 'Orange Money, MTN Mobile Money, etc.'
    },
    card: {
      title: 'Carte bancaire',
      icon: 'card-outline',
      color: '#FF9800',
      description: 'Vers votre carte Visa/Mastercard'
    },
    crypto: {
      title: 'Cryptomonnaie',
      icon: 'logo-bitcoin',
      color: '#9C27B0',
      description: 'Bitcoin, Ethereum, etc.'
    }
  };

  const currentType = transferTypeInfo[transferType];

  const handleConfirmTransfer = async () => {
    setIsProcessing(true);
    
    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Générer un ID de transaction
      const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      // Naviguer vers l'écran de succès
      navigation.navigate('TransferSuccess', {
        transferType,
        amount,
        fee,
        totalAmount,
        transactionId
      });
    } catch (error) {
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors du transfert. Veuillez réessayer.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Annuler le transfert',
      'Êtes-vous sûr de vouloir annuler ce transfert ?',
      [
        { text: 'Non', style: 'cancel' },
        { text: 'Oui', onPress: () => navigation.goBack() }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleCancel}
          disabled={isProcessing}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Confirmation
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Transfer Type Info */}
        <View style={[styles.typeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.typeHeader}>
            <View style={[styles.typeIcon, { backgroundColor: currentType.color + '20' }]}>
              <Ionicons name={currentType.icon as any} size={24} color={currentType.color} />
            </View>
            <View style={styles.typeInfo}>
              <Text style={[styles.typeTitle, { color: colors.text }]}>
                {currentType.title}
              </Text>
              <Text style={[styles.typeDescription, { color: colors.textSecondary }]}>
                {currentType.description}
              </Text>
            </View>
          </View>
        </View>

        {/* Amount Summary */}
        <View style={[styles.amountCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.amountTitle, { color: colors.text }]}>
            Montant du transfert
          </Text>
          <Text style={[styles.amountValue, { color: colors.text }]}>
            {formatAmount(amount)}
          </Text>
        </View>

        {/* Detailed Summary */}
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>
            Détails du transfert
          </Text>
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              Montant à transférer
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {formatAmount(amount)}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              Frais de transfert
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {formatAmount(fee)}
            </Text>
          </View>
          
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={[styles.summaryLabel, styles.totalLabel, { color: colors.text }]}>
              Total à débiter
            </Text>
            <Text style={[styles.summaryValue, styles.totalValue, { color: colors.text }]}>
              {formatAmount(totalAmount)}
            </Text>
          </View>
        </View>

        {/* Processing Time */}
        <View style={[styles.timeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.timeHeader}>
            <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
            <Text style={[styles.timeTitle, { color: colors.text }]}>
              Délai de traitement
            </Text>
          </View>
          <Text style={[styles.timeDescription, { color: colors.textSecondary }]}>
            {transferType === 'mobile' ? 'Instantané' : 
             transferType === 'crypto' ? '10-30 minutes' :
             transferType === 'card' ? '2-5 jours ouvrables' : '1-3 jours ouvrables'}
          </Text>
        </View>

        {/* Security Info */}
        <View style={[styles.securityCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.securityHeader}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#4CAF50" />
            <Text style={[styles.securityTitle, { color: colors.text }]}>
              Sécurité garantie
            </Text>
          </View>
          <View style={styles.securityList}>
            <View style={styles.securityItem}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={[styles.securityText, { color: colors.textSecondary }]}>
                Transfert crypté et sécurisé
              </Text>
            </View>
            <View style={styles.securityItem}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={[styles.securityText, { color: colors.textSecondary }]}>
                Conformité aux normes bancaires
              </Text>
            </View>
            <View style={styles.securityItem}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={[styles.securityText, { color: colors.textSecondary }]}>
                Protection contre la fraude
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.cancelButton, { borderColor: colors.border }]}
          onPress={handleCancel}
          disabled={isProcessing}
        >
          <Text style={[styles.cancelButtonText, { color: colors.text }]}>
            Annuler
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.confirmButton,
            { backgroundColor: colors.primary },
            isProcessing && { backgroundColor: colors.border }
          ]}
          onPress={handleConfirmTransfer}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.confirmButtonText}>
              Confirmer le transfert
            </Text>
          )}
        </TouchableOpacity>
      </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  typeCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  typeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  typeInfo: {
    flex: 1,
  },
  typeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  typeDescription: {
    fontSize: 14,
  },
  amountCard: {
    marginTop: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  amountTitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  summaryCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
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
  timeCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  timeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  timeDescription: {
    fontSize: 14,
  },
  securityCard: {
    marginTop: 16,
    marginBottom: 32,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  securityList: {
    gap: 8,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  securityText: {
    fontSize: 14,
    marginLeft: 8,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
}); 