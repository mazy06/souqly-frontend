import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TransferType } from './TransferSelectionScreen';
import { useAuth } from '../contexts/AuthContext';
import { formatAmount } from '../utils/formatters';
import { ProfileStackParamList } from '../types/navigation';
import { StackNavigationProp } from '@react-navigation/stack';

type TransferAmountRouteProp = RouteProp<ProfileStackParamList, 'TransferAmount'>;

export default function TransferAmountScreen() {
  const navigation = useNavigation<StackNavigationProp<ProfileStackParamList>>();
  const route = useRoute<TransferAmountRouteProp>();
  const { colors } = useTheme();
  const { user } = useAuth();
  
  const { transferType } = route.params;
  const [amount, setAmount] = useState('');
  const [availableBalance, setAvailableBalance] = useState(200.50); // Mock data

  const transferTypeInfo = {
    bank: {
      title: 'Virement bancaire',
      icon: 'business-outline',
      color: '#2196F3',
      fee: 0.50,
      minAmount: 10,
      maxAmount: 10000
    },
    mobile: {
      title: 'Mobile Money',
      icon: 'phone-portrait-outline',
      color: '#4CAF50',
      fee: 0.25,
      minAmount: 5,
      maxAmount: 5000
    },
    card: {
      title: 'Carte bancaire',
      icon: 'card-outline',
      color: '#FF9800',
      fee: 1.00,
      minAmount: 20,
      maxAmount: 5000
    },
    crypto: {
      title: 'Cryptomonnaie',
      icon: 'logo-bitcoin',
      color: '#9C27B0',
      fee: 2.00,
      minAmount: 50,
      maxAmount: 20000
    }
  };

  const currentType = transferTypeInfo[transferType];
  const numericAmount = parseFloat(amount) || 0;
  const fee = currentType.fee;
  const totalAmount = numericAmount + fee;
  const isValidAmount = numericAmount >= currentType.minAmount && numericAmount <= currentType.maxAmount;
  const hasEnoughBalance = totalAmount <= availableBalance;

  const quickAmounts = [50, 100, 200, 500];

  const handleAmountChange = (text: string) => {
    // Only allow numbers and decimal point
    const cleaned = text.replace(/[^0-9.]/g, '');
    // Ensure only one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) return;
    setAmount(cleaned);
  };

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
  };

  const handleContinue = () => {
    if (!isValidAmount) {
      Alert.alert(
        'Montant invalide',
        `Le montant doit être entre ${currentType.minAmount}€ et ${currentType.maxAmount}€`
      );
      return;
    }

    if (!hasEnoughBalance) {
      Alert.alert(
        'Solde insuffisant',
        'Votre solde disponible ne couvre pas le montant du transfert et les frais.'
      );
      return;
    }

    navigation.navigate('TransferConfirmation', {
      transferType,
      amount: numericAmount,
      fee,
      totalAmount
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Montant du transfert
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
                Frais: {fee}€ • Min: {currentType.minAmount}€ • Max: {currentType.maxAmount}€
              </Text>
            </View>
          </View>
        </View>

        {/* Amount Input */}
        <View style={[styles.amountCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.amountLabel, { color: colors.text }]}>
            Montant à transférer
          </Text>
          
          <View style={styles.amountInputContainer}>
            <Text style={[styles.currencySymbol, { color: colors.text }]}>€</Text>
            <TextInput
              style={[styles.amountInput, { color: colors.text }]}
              value={amount}
              onChangeText={handleAmountChange}
              placeholder="0.00"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              autoFocus
            />
          </View>

          {/* Quick Amount Buttons */}
          <View style={styles.quickAmountsContainer}>
            {quickAmounts.map((quickAmount) => (
              <TouchableOpacity
                key={quickAmount}
                style={[
                  styles.quickAmountButton,
                  { backgroundColor: colors.border },
                  amount === quickAmount.toString() && { backgroundColor: colors.primary }
                ]}
                onPress={() => handleQuickAmount(quickAmount)}
              >
                <Text style={[
                  styles.quickAmountText,
                  { color: amount === quickAmount.toString() ? 'white' : colors.text }
                ]}>
                  {quickAmount}€
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Summary */}
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>
            Récapitulatif
          </Text>
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              Montant
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {formatAmount(numericAmount)}
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

        {/* Balance Info */}
        <View style={[styles.balanceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.balanceRow}>
            <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>
              Solde disponible
            </Text>
            <Text style={[styles.balanceAmount, { color: colors.text }]}>
              {formatAmount(availableBalance)}
            </Text>
          </View>
          
          {!hasEnoughBalance && (
            <View style={styles.warningRow}>
              <Ionicons name="warning-outline" size={16} color="#FF9800" />
              <Text style={[styles.warningText, { color: '#FF9800' }]}>
                Solde insuffisant pour ce transfert
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            { backgroundColor: colors.primary },
            (!isValidAmount || !hasEnoughBalance) && { backgroundColor: colors.border }
          ]}
          onPress={handleContinue}
          disabled={!isValidAmount || !hasEnoughBalance}
        >
          <Text style={[
            styles.continueButtonText,
            { color: (!isValidAmount || !hasEnoughBalance) ? colors.textSecondary : 'white' }
          ]}>
            Continuer
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
  },
  amountLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: 'bold',
    marginRight: 8,
  },
  amountInput: {
    fontSize: 32,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  quickAmountsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAmountButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '500',
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
  balanceCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  warningText: {
    fontSize: 12,
    marginLeft: 4,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  continueButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 