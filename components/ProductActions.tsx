import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, TextInput, Animated, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProductActionsProps {
  onOffer?: () => void;
  onBuy?: () => void;
  isDisabled?: boolean;
  sellerName?: string;
  productPrice?: number;
  onSendOffer?: (offerData: { price: number; message: string }) => void;
  isOwnProduct?: boolean;
}

const { height: screenHeight } = Dimensions.get('window');

export default function ProductActions({ 
  onOffer, 
  onBuy, 
  isDisabled, 
  sellerName = 'Vendeur',
  productPrice = 0,
  onSendOffer,
  isOwnProduct = false
}: ProductActionsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const [message, setMessage] = useState('');
  const [slideAnim] = useState(new Animated.Value(0));

  const handleOfferPress = () => {
    if (isExpanded) {
      // Fermer le formulaire
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        setIsExpanded(false);
      });
    } else {
      // Ouvrir le formulaire
      setIsExpanded(true);
      setOfferPrice(productPrice.toString());
      setMessage(`Bonjour ${sellerName}, je vous propose ${productPrice}€ pour votre article.`);
      
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleSendOffer = () => {
    const price = parseFloat(offerPrice);
    if (price > 0 && message.trim()) {
      onSendOffer?.({ price, message: message.trim() });
      // Fermer le formulaire après envoi
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        setIsExpanded(false);
      });
    }
  };

  const handleCancel = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setIsExpanded(false);
    });
  };

  const COMPACT_HEIGHT = 64;
  const containerHeight = isExpanded
    ? slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [COMPACT_HEIGHT, screenHeight * 0.5],
      })
    : COMPACT_HEIGHT;

  return (
    <Animated.View style={[styles.container, { height: containerHeight }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {!isExpanded ? (
          // Boutons normaux
          <View style={styles.actionsBar}>
            {!isOwnProduct ? (
              <>
                <TouchableOpacity
                  style={[styles.offerBtn, isDisabled && styles.disabledBtn]}
                  onPress={handleOfferPress}
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
              </>
            ) : (
              <View style={styles.ownProductMessage}>
                <Text style={styles.ownProductText}>Votre annonce</Text>
              </View>
            )}
          </View>
        ) : (
          // Formulaire d'offre
          <View style={styles.offerForm}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Faire une offre</Text>
              <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.formContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Prix proposé (€)</Text>
                <TextInput
                  style={styles.priceInput}
                  value={offerPrice}
                  onChangeText={setOfferPrice}
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor="#999"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Message au vendeur</Text>
                <TextInput
                  style={styles.messageInput}
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  numberOfLines={4}
                  placeholder="Votre message..."
                  placeholderTextColor="#999"
                />
              </View>
              
              <View style={styles.formActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                  <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sendButton} onPress={handleSendOffer}>
                  <Text style={styles.sendButtonText}>Envoyer l'offre</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingHorizontal: 16,
  },
  keyboardView: {
    flex: 1,
  },
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    height: 56,
    paddingTop: 0,
    paddingBottom: 0,
  },
  offerBtn: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#008080',
    borderRadius: 14,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginRight: 8,
  },
  offerBtnText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#008080',
  },
  buyBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#008080',
  },
  buyBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  disabledText: {
    color: '#aaa',
  },
  offerForm: {
    flex: 1,
    paddingTop: 16,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#181A20',
  },
  closeButton: {
    padding: 4,
  },
  formContent: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#181A20',
    marginBottom: 8,
  },
  priceInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    backgroundColor: '#f8f8f8',
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f8f8f8',
    textAlignVertical: 'top',
    minHeight: 100,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 'auto',
    paddingBottom: 20,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#666',
  },
  sendButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#008080',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  ownProductMessage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  ownProductText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    fontStyle: 'italic',
  },
}); 