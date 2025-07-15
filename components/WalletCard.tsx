import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface WalletCardProps {
  balance: number;
  onPress: () => void;
}

export default function WalletCard({ balance, onPress }: WalletCardProps) {
  const { colors } = useTheme();

  const formatBalance = (amount: number) => {
    return amount.toFixed(2).replace('.', ',');
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="wallet-outline" size={24} color={colors.primary} />
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: colors.text }]}>Porte-monnaie</Text>
            <Text style={[styles.balance, { color: colors.text }]}>
              {formatBalance(balance)} €
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Solde disponible
            </Text>
          </View>
        </View>
        <View style={styles.rightSection}>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  balance: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
  },
  rightSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 