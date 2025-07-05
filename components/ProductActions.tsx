import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface ProductActionsProps {
  onOffer?: () => void;
  onBuy?: () => void;
  isDisabled?: boolean;
}

export default function ProductActions({ onOffer, onBuy, isDisabled }: ProductActionsProps) {
  return (
    <View style={styles.actionsBar}>
      <TouchableOpacity
        style={[styles.offerBtn, isDisabled && styles.disabledBtn]}
        onPress={onOffer}
        disabled={isDisabled}
      >
        <Text style={[styles.offerBtnText, isDisabled && styles.disabledText]}>Faire une offre</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.buyBtn, isDisabled && styles.disabledBtn]}
        onPress={onBuy}
        disabled={isDisabled}
      >
        <Text style={styles.buyBtnText}>Acheter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  offerBtn: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#008080',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginRight: 8,
  },
  offerBtnText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#008080',
  },
  buyBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#ff5a36',
  },
  buyBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  disabledText: {
    color: '#aaa',
  },
}); 