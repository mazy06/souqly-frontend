import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Colors from '../constants/Colors';
import { useColorScheme } from 'react-native';

type Props = {
  title: string;
  onPress: () => void;
};

export default function PrimaryButton({ title, onPress }: Props) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  return (
    <TouchableOpacity style={[styles.button, { backgroundColor: colors.button }]} onPress={onPress}>
      <Text style={[styles.text, { color: colors.text }]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginVertical: 8,
  },
  text: {
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 