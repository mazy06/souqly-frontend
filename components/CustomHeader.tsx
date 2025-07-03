import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface CustomHeaderProps {
  title?: string;
  onBack: () => void;
  color?: string;
  backgroundColor?: string;
  // Nouvelles props pour les fonctionnalités avancées
  showFavorite?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  showMenu?: boolean;
  onMenu?: () => void;
  showRightButton?: boolean;
  rightButtonIcon?: keyof typeof Ionicons.glyphMap;
  onRightButtonPress?: () => void;
}

export default function CustomHeader({ 
  title, 
  onBack, 
  color, 
  backgroundColor,
  showFavorite = false,
  isFavorite = false,
  onToggleFavorite,
  showMenu = false,
  onMenu,
  showRightButton = false,
  rightButtonIcon = 'ellipsis-vertical',
  onRightButtonPress
}: CustomHeaderProps) {
  const { colors, isDark } = useTheme();
  
  // Utiliser les couleurs du thème par défaut si non spécifiées
  const headerColor = color || colors.text;
  const headerBackground = backgroundColor || (isDark 
    ? 'rgba(24,26,32,0.85)' 
    : 'rgba(255,255,255,0.85)'
  );
  const borderColor = isDark 
    ? 'rgba(255,255,255,0.1)' 
    : 'rgba(0,0,0,0.1)';

  return (
    <View style={[
      styles.header, 
      { 
        backgroundColor: headerBackground,
        borderBottomColor: borderColor
      }
    ]}> 
      <TouchableOpacity onPress={onBack} style={styles.headerBtn}>
        <Ionicons name="arrow-back" size={24} color={headerColor} />
      </TouchableOpacity>
      
      {title && (
        <Text style={[styles.headerTitle, { color: headerColor }]} numberOfLines={1}>
          {title}
        </Text>
      )}
      
      <View style={styles.headerRight}>
        {/* Bouton favoris */}
        {showFavorite && onToggleFavorite && (
          <TouchableOpacity onPress={onToggleFavorite} style={styles.headerBtn}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite ? '#e74c3c' : headerColor}
            />
          </TouchableOpacity>
        )}
        
        {/* Bouton menu */}
        {showMenu && onMenu && (
          <TouchableOpacity onPress={onMenu} style={styles.headerBtn}>
            <MaterialIcons name="more-vert" size={24} color={headerColor} />
          </TouchableOpacity>
        )}
        
        {/* Bouton personnalisé */}
        {showRightButton && onRightButtonPress && (
          <TouchableOpacity onPress={onRightButtonPress} style={styles.headerBtn}>
            <Ionicons name={rightButtonIcon} size={24} color={headerColor} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 48 : 20,
    paddingHorizontal: 8,
    paddingBottom: 8,
    borderBottomWidth: 0.5,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 18,
    marginHorizontal: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
}); 