import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface GuestMessageProps {
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  title: string;
  subtitle?: string;
  buttonLabel?: string;
  onPress: () => void;
  color?: string; // couleur principale (ex: colors.primary)
  textColor?: string; // couleur du texte principal
  backgroundColor?: string;
}

const GuestMessage: React.FC<GuestMessageProps> = ({
  iconName,
  iconColor = '#008080',
  title,
  subtitle,
  buttonLabel = 'Se connecter',
  onPress,
  color = '#008080',
  textColor = '#222',
  backgroundColor = '#fff',
}) => {
  return (
    <View style={{ flex: 1, flexDirection: 'column', backgroundColor }}>
      <View style={{ height: 80, justifyContent: 'center', alignItems: 'center' }}>
        <Ionicons name={iconName} size={80} color={iconColor || color} />
      </View>
      <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', paddingTop: 6 }}>
        <Text style={[styles.title, { color: textColor }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: textColor }]}>{subtitle}</Text>
        ) : null}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: color }]}
          onPress={onPress}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>{buttonLabel}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default GuestMessage; 