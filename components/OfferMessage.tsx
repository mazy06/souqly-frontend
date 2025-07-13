import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface OfferMessageProps {
  price: number;
  message: string;
  timestamp: string;
  isFromMe: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
}

const OfferMessage: React.FC<OfferMessageProps> = ({
  price,
  message,
  timestamp,
  isFromMe,
  onAccept,
  onDecline,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[
      styles.container,
      isFromMe ? styles.myMessage : styles.theirMessage
    ]}>
      <View style={[
        styles.messageBubble,
        isFromMe 
          ? { backgroundColor: colors.primary, alignSelf: 'flex-end' }
          : { backgroundColor: colors.card, alignSelf: 'flex-start' }
      ]}>
        {/* Prix de l'offre */}
        <View style={styles.offerPriceContainer}>
          <Ionicons 
            name="pricetag" 
            size={16} 
            color={isFromMe ? 'rgba(255,255,255,0.8)' : colors.primary} 
          />
          <Text style={[
            styles.offerPrice,
            { color: isFromMe ? 'white' : colors.primary }
          ]}>
            Offre : {price.toFixed(2)} €
          </Text>
        </View>
        
        {/* Message */}
        <Text style={[
          styles.messageText,
          { color: isFromMe ? 'white' : colors.text }
        ]}>
          {message}
        </Text>
        
        {/* Actions pour le destinataire */}
        {!isFromMe && (onAccept || onDecline) && (
          <View style={styles.actionsContainer}>
            {onAccept && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.acceptButton]} 
                onPress={onAccept}
              >
                <Text style={styles.acceptButtonText}>Accepter</Text>
              </TouchableOpacity>
            )}
            {onDecline && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.declineButton]} 
                onPress={onDecline}
              >
                <Text style={styles.declineButtonText}>Refuser</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        
        {/* Timestamp */}
        <Text style={[
          styles.messageTime,
          { color: isFromMe ? 'rgba(255,255,255,0.7)' : colors.tabIconDefault }
        ]}>
          {timestamp}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  myMessage: {
    alignItems: 'flex-end',
  },
  theirMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  offerPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  offerPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  declineButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  acceptButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  declineButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 14,
  },
  messageTime: {
    fontSize: 12,
    alignSelf: 'flex-end',
  },
});

export default OfferMessage; 