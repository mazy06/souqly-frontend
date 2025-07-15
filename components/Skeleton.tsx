import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
  containerStyle?: any;
  heightRatio?: number; // Ratio de la hauteur de l'écran (0.3 = 30% de l'écran)
  adaptive?: boolean; // Si true, ajuste automatiquement selon le type d'appareil
}

/**
 * Composant LoadingSpinner adaptatif
 * 
 * Ce composant s'adapte automatiquement à la taille de l'écran et au type d'appareil :
 * - Téléphones petits (< 700px) : ratio augmenté de 20%
 * - Tablettes (≥ 768px) : ratio réduit de 40%
 * 
 * L'application est forcée en mode portrait, donc pas de gestion de l'orientation.
 * 
 * Exemples d'utilisation :
 * 
 * // Chargement simple (adaptatif par défaut)
 * <LoadingSpinner message="Chargement..." />
 * 
 * // Chargement avec ratio personnalisé
 * <LoadingSpinner message="Chargement..." heightRatio={0.5} />
 * 
 * // Chargement non-adaptatif (taille fixe)
 * <LoadingSpinner message="Chargement..." adaptive={false} />
 * 
 * // Chargement dans une liste
 * <LoadingSpinner 
 *   message="Recherche en cours..." 
 *   heightRatio={0.25}
 *   containerStyle={styles.listContainer}
 * />
 */
const getAdaptiveHeightRatio = (baseRatio: number = 0.3): number => {
  const { width, height } = Dimensions.get('window');
  const isTablet = width >= 768 || height >= 1024;
  const isSmallPhone = height < 700;
  
  let adjustedRatio = baseRatio;
  
  if (isTablet) {
    adjustedRatio *= 0.6; // Plus petit sur tablette
  } else if (isSmallPhone) {
    adjustedRatio *= 1.2; // Plus grand sur petit téléphone
  }
  
  return adjustedRatio;
};

export default function LoadingSpinner({ 
  message = "Chargement...", 
  size = 'large',
  containerStyle,
  heightRatio = 0.3,
  adaptive = true
}: LoadingSpinnerProps) {
  const { colors } = useTheme();
  const screenHeight = Dimensions.get('window').height;
  const finalRatio = adaptive ? getAdaptiveHeightRatio(heightRatio) : heightRatio;
  const minHeight = Math.max(200, screenHeight * finalRatio);
  
  return (
    <View style={[styles.container, { minHeight }, containerStyle]}>
      <ActivityIndicator size={size} color={colors.primary} />
      <Text style={[styles.text, { color: colors.text }]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
}); 