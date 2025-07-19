import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProfileStackParamList } from '../types/navigation';
import { StackNavigationProp } from '@react-navigation/stack';

export type TransferType = 'bank' | 'mobile' | 'card' | 'crypto';

export default function TransferSelectionScreen() {
  const navigation = useNavigation<StackNavigationProp<ProfileStackParamList>>();
  const { colors } = useTheme();

  const transferOptions = [
    {
      id: 'bank',
      title: 'Virement bancaire',
      description: 'Transférer vers votre compte bancaire',
      icon: 'business-outline',
      color: '#2196F3',
      time: '1-3 jours ouvrables'
    },
    {
      id: 'mobile',
      title: 'Mobile Money',
      description: 'Orange Money, MTN Mobile Money, etc.',
      icon: 'phone-portrait-outline',
      color: '#4CAF50',
      time: 'Instantané'
    },
    {
      id: 'card',
      title: 'Carte bancaire',
      description: 'Vers votre carte Visa/Mastercard',
      icon: 'card-outline',
      color: '#FF9800',
      time: '2-5 jours ouvrables'
    },
    {
      id: 'crypto',
      title: 'Cryptomonnaie',
      description: 'Bitcoin, Ethereum, etc.',
      icon: 'logo-bitcoin',
      color: '#9C27B0',
      time: '10-30 minutes'
    }
  ];

  const handleTransferTypeSelect = (type: TransferType) => {
    navigation.navigate('TransferAmount', { transferType: type });
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
          Transférer de l'argent
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
            <Text style={[styles.infoTitle, { color: colors.text }]}>
              Choisissez votre méthode de transfert
            </Text>
          </View>
          <Text style={[styles.infoDescription, { color: colors.textSecondary }]}>
            Sélectionnez la méthode qui vous convient le mieux. Les frais et délais varient selon l'option choisie.
          </Text>
        </View>

        {/* Transfer Options */}
        <View style={styles.optionsContainer}>
          {transferOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[styles.optionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => handleTransferTypeSelect(option.id as TransferType)}
            >
              <View style={styles.optionLeft}>
                <View style={[styles.optionIcon, { backgroundColor: option.color + '20' }]}>
                  <Ionicons name={option.icon as any} size={24} color={option.color} />
                </View>
                <View style={styles.optionInfo}>
                  <Text style={[styles.optionTitle, { color: colors.text }]}>
                    {option.title}
                  </Text>
                  <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                    {option.description}
                  </Text>
                  <View style={styles.optionTime}>
                    <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
                    <Text style={[styles.timeText, { color: colors.textSecondary }]}>
                      {option.time}
                    </Text>
                  </View>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Fees Info */}
        <View style={[styles.feesCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.feesTitle, { color: colors.text }]}>
            Informations importantes
          </Text>
          <View style={styles.feesList}>
            <View style={styles.feeItem}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={[styles.feeText, { color: colors.textSecondary }]}>
                Transferts sécurisés et cryptés
              </Text>
            </View>
            <View style={styles.feeItem}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={[styles.feeText, { color: colors.textSecondary }]}>
                Frais transparents affichés avant confirmation
              </Text>
            </View>
            <View style={styles.feeItem}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={[styles.feeText, { color: colors.textSecondary }]}>
                Support 24/7 en cas de problème
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
  infoCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  optionsContainer: {
    marginTop: 24,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  optionTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    marginLeft: 4,
  },
  feesCard: {
    marginTop: 24,
    marginBottom: 32,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  feesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  feesList: {
    gap: 8,
  },
  feeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feeText: {
    fontSize: 14,
    marginLeft: 8,
  },
}); 