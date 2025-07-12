import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';

interface ProductLocationProps {
  location?: string;
  distance?: string;
  shippingOptions?: string[];
  onLocationPress?: () => void;
  latitude?: number;
  longitude?: number;
}

// Composant carte avec liens vers les apps natives
const MapComponent = ({ latitude, longitude, location, screenWidth, mapHeight }: any) => {
  const openInMaps = async () => {
    if (!latitude || !longitude) return;

    const url = `maps://?q=${latitude},${longitude}`;
    const googleUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

    try {
      // Essayer d'ouvrir dans l'app Plans native
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        // Fallback vers Google Maps
        await Linking.openURL(googleUrl);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ouverture de la carte:', error);
      // Fallback vers Google Maps
      await Linking.openURL(googleUrl);
    }
  };

  const openInGoogleMaps = () => {
    if (!latitude || !longitude) return;
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url);
    }
  };

  return (
    <View style={styles.mapContainer}>
      <View style={[styles.map, { width: screenWidth - 32, height: mapHeight, backgroundColor: '#f8f9fa' }]}>
        <View style={styles.webMapPlaceholder}>
          <Ionicons name="map-outline" size={40} color="#008080" />
          <Text style={styles.webMapText}>
            {Platform.OS === 'web' ? 'Carte non disponible sur web' : 'Ouvrir dans l\'app Plans'}
          </Text>
          {latitude && longitude && (
            <View style={styles.mapButtons}>
              {Platform.OS !== 'web' && (
                <TouchableOpacity
                  style={styles.webMapButton}
                  onPress={openInMaps}
                >
                  <Text style={styles.webMapButtonText}>Ouvrir dans Plans</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.webMapButton, Platform.OS === 'web' && styles.webMapButtonPrimary]}
                onPress={openInGoogleMaps}
              >
                <Text style={styles.webMapButtonText}>Ouvrir dans Google Maps</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default function ProductLocation({
  location,
  distance,
  shippingOptions = [],
  onLocationPress,
  latitude,
  longitude,
}: ProductLocationProps) {
  const screenWidth = Dimensions.get('window').width;
  const mapHeight = 200;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Localisation</Text>
      </View>

      <View style={styles.locationCard}>
        <View style={styles.locationHeader}>
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
        </View>
        {/* Carte centrée sur la ville du produit */}
        {latitude && longitude && (
          <View style={{ height: 180, borderRadius: 12, overflow: 'hidden', marginTop: 12 }}>
            <MapView
              style={{ flex: 1 }}
              initialRegion={{
                latitude,
                longitude,
                latitudeDelta: 0.08,
                longitudeDelta: 0.08,
              }}
              pointerEvents="none"
            >
              <Marker coordinate={{ latitude, longitude }} title={location} />
            </MapView>
          </View>
        )}
      </View>

      {/*
        TODO: Adapter cette section avec les vraies offres de livraison pour le marché d'Arabie Saoudite
        (voir avec l'équipe produit/logistique les options disponibles et les intégrer dynamiquement)
      */}
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
          Remise en main propre avec paiement sécurisé
        </Text>
        <View style={styles.meetupBenefits}>
          <View style={styles.meetupBenefitRow}>
            <Ionicons name="shield-checkmark" size={16} color="#008080" style={styles.meetupIcon} />
            <Text style={styles.meetupBenefit}>Réservez ce bien jusqu'au rendez-vous avec le vendeur</Text>
          </View>
          <View style={styles.meetupBenefitRow}>
            <Ionicons name="happy-outline" size={16} color="#008080" style={styles.meetupIcon} />
            <Text style={styles.meetupBenefit}>Restez libre de refuser ce bien s'il ne correspond pas à vos attentes</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.howItWorksButton}>
          <Text style={styles.howItWorksText}>Comment ça marche ?</Text>
        </TouchableOpacity>
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
    backgroundColor: '#f8f9fa',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
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
  mapContainer: {
    marginBottom: 0,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
  },
  map: {
    borderRadius: 12,
  },
  webMapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  webMapText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    marginBottom: 16,
    textAlign: 'center',
  },
  mapButtons: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  webMapButton: {
    backgroundColor: '#008080',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  webMapButtonPrimary: {
    backgroundColor: '#0066cc',
  },
  webMapButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  shippingSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  shippingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
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
    marginBottom: 8,
  },
  meetupBenefits: {
    marginBottom: 12,
  },
  meetupBenefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  meetupIcon: {
    marginRight: 8,
    marginTop: 1,
  },
  meetupBenefit: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    flex: 1,
  },
  howItWorksButton: {
    alignSelf: 'flex-start',
  },
  howItWorksText: {
    color: '#008080',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
}); 