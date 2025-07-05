import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProductLocationProps {
  location?: string;
  distance?: string;
  shippingOptions?: string[];
  onLocationPress?: () => void;
}

export default function ProductLocation({
  location,
  distance,
  shippingOptions = [],
  onLocationPress,
}: ProductLocationProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Localisation</Text>
      </View>

      <TouchableOpacity
        style={styles.locationCard}
        onPress={onLocationPress}
        activeOpacity={0.8}
      >
        <View style={styles.locationInfo}>
          <View style={styles.locationIconContainer}>
            <Ionicons name="location-outline" size={20} color="#008080" />
          </View>
          <View style={styles.locationDetails}>
            <Text style={styles.locationText}>
              {location || 'Localisation non spécifiée'}
            </Text>
            {distance && (
              <Text style={styles.distanceText}>
                À {distance} de votre position
              </Text>
            )}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </TouchableOpacity>

      {shippingOptions.length > 0 && (
        <View style={styles.shippingSection}>
          <Text style={styles.shippingTitle}>Options de livraison</Text>
          {shippingOptions.map((option, index) => (
            <View key={index} style={styles.shippingOption}>
              <Ionicons name="car-outline" size={16} color="#008080" />
              <Text style={styles.shippingOptionText}>{option}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.meetupSection}>
        <View style={styles.meetupHeader}>
          <Ionicons name="people-outline" size={20} color="#008080" />
          <Text style={styles.meetupTitle}>Rencontre possible</Text>
        </View>
        <Text style={styles.meetupText}>
          Vous pouvez organiser une rencontre avec le vendeur pour récupérer l'article en personne.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingVertical: 20,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e8f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  locationDetails: {
    flex: 1,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 2,
  },
  distanceText: {
    fontSize: 14,
    color: '#666',
  },
  shippingSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  shippingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  shippingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  shippingOptionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  meetupSection: {
    backgroundColor: '#f8f9fa',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
  },
  meetupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  meetupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginLeft: 8,
  },
  meetupText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
}); 