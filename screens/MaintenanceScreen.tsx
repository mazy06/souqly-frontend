import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { useColorScheme } from 'react-native';

interface MaintenanceScreenProps {
  onRetry?: () => void;
  error?: string;
}

export default function MaintenanceScreen({ onRetry, error }: MaintenanceScreenProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: colors.card }]}>
          <Ionicons 
            name="construct-outline" 
            size={80} 
            color={colors.primary} 
          />
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]}>
          Service temporairement indisponible
        </Text>

        {/* Description */}
        <Text style={[styles.description, { color: colors.tabIconDefault }]}>
          Nous effectuons actuellement une maintenance pour améliorer votre expérience.
        </Text>

        {/* Error details (only in development) */}
        {__DEV__ && error && (
          <View style={[styles.errorContainer, { backgroundColor: colors.card }]}>
            <Text style={[styles.errorTitle, { color: colors.text }]}>
              Détails techniques (développement) :
            </Text>
            <Text style={[styles.errorText, { color: colors.tabIconDefault }]}>
              {error}
            </Text>
          </View>
        )}

        {/* Estimated time */}
        <View style={[styles.timeContainer, { backgroundColor: colors.card }]}>
          <Ionicons name="time-outline" size={20} color={colors.primary} />
          <Text style={[styles.timeText, { color: colors.text }]}>
            Temps estimé : 5-10 minutes
          </Text>
        </View>

        {/* Retry button */}
        {onRetry && (
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={onRetry}
          >
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        )}

        {/* Contact info */}
        <View style={styles.contactContainer}>
          <Text style={[styles.contactText, { color: colors.tabIconDefault }]}>
            Besoin d'aide ? Contactez-nous :
          </Text>
          <Text style={[styles.contactEmail, { color: colors.primary }]}>
            support@souqly.com
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  errorContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    width: '100%',
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  timeText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  contactContainer: {
    alignItems: 'center',
  },
  contactText: {
    fontSize: 14,
    marginBottom: 4,
  },
  contactEmail: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 