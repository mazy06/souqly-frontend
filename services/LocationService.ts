import * as Location from 'expo-location';

export interface LocationData {
  latitude: number;
  longitude: number;
  locationName?: string;
}

export interface DistanceData {
  distance: number; // en kilomètres
  formattedDistance: string;
}

class LocationService {
  private userLocation: LocationData | null = null;

  // Demander les permissions de localisation
  async requestLocationPermission(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('[LocationService] Erreur lors de la demande de permission:', error);
      return false;
    }
  }

  // Récupérer la position actuelle de l'utilisateur
  async getCurrentLocation(): Promise<LocationData | null> {
    try {
      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) {
        console.log('[LocationService] Permission de localisation refusée');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000,
        distanceInterval: 10,
      });

      this.userLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      // Optionnel : récupérer le nom de la localisation
      try {
        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        if (reverseGeocode.length > 0) {
          const address = reverseGeocode[0];
          this.userLocation.locationName = [
            address.city,
            address.region,
            address.country
          ].filter(Boolean).join(', ');
        }
      } catch (error) {
        console.log('[LocationService] Erreur lors de la géocodification inverse:', error);
      }

      return this.userLocation;
    } catch (error) {
      console.error('[LocationService] Erreur lors de la récupération de la position:', error);
      return null;
    }
  }

  // Calculer la distance entre deux points (formule de Haversine)
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): DistanceData {
    const R = 6371; // Rayon de la Terre en kilomètres
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return {
      distance,
      formattedDistance: this.formatDistance(distance)
    };
  }

  // Convertir les degrés en radians
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Formater la distance pour l'affichage
  private formatDistance(distance: number): string {
    if (distance < 1) {
      return `${Math.round(distance * 1000)} m`;
    } else if (distance < 10) {
      return `${distance.toFixed(1)} km`;
    } else {
      return `${Math.round(distance)} km`;
    }
  }

  // Récupérer la position de l'utilisateur (mise en cache)
  async getUserLocation(): Promise<LocationData | null> {
    if (this.userLocation) {
      return this.userLocation;
    }
    return this.getCurrentLocation();
  }

  // Calculer la distance entre la position de l'utilisateur et un produit
  async calculateDistanceToProduct(
    productLat: number,
    productLon: number
  ): Promise<DistanceData | null> {
    const userLocation = await this.getUserLocation();
    if (!userLocation) {
      return null;
    }

    return this.calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      productLat,
      productLon
    );
  }

  // Vérifier si la géolocalisation est disponible
  async isLocationAvailable(): Promise<boolean> {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      return false;
    }
  }
}

export default new LocationService(); 