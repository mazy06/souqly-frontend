import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  color?: string;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  color = '#222',
  style,
  titleStyle,
  subtitleStyle,
}) => (
  <View style={[styles.header, style]}>
    <Text style={[styles.title, { color }, titleStyle]}>{title}</Text>
    {subtitle ? (
      <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'left',
  },
});

export default SectionHeader; 