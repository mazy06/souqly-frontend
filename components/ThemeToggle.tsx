import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
  visible: boolean;
  onClose: () => void;
}

export default function ThemeToggle({ visible, onClose }: ThemeToggleProps) {
  const { themeMode, setThemeMode, colors, isDark } = useTheme();

  const themeOptions = [
    { mode: 'light' as const, label: 'Clair', icon: 'sunny' },
    { mode: 'dark' as const, label: 'Sombre', icon: 'moon' },
    { mode: 'system' as const, label: 'Système', icon: 'settings' },
  ];

  const handleThemeChange = (mode: 'light' | 'dark' | 'system') => {
    setThemeMode(mode);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={[styles.modal, { backgroundColor: colors.card }]}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text }]}>
              Choisir le thème
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          {themeOptions.map((option) => (
            <TouchableOpacity
              key={option.mode}
              style={[
                styles.option,
                { 
                  backgroundColor: themeMode === option.mode ? colors.primary + '20' : 'transparent',
                  borderBottomColor: colors.border 
                }
              ]}
              onPress={() => handleThemeChange(option.mode)}
            >
              <View style={styles.optionContent}>
                <Ionicons 
                  name={option.icon as any} 
                  size={24} 
                  color={themeMode === option.mode ? colors.primary : colors.text} 
                />
                <Text style={[
                  styles.optionText, 
                  { 
                    color: themeMode === option.mode ? colors.primary : colors.text,
                    fontWeight: themeMode === option.mode ? '600' : '400'
                  }
                ]}>
                  {option.label}
                </Text>
              </View>
              {themeMode === option.mode && (
                <Ionicons name="checkmark" size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '80%',
    maxWidth: 300,
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    marginLeft: 12,
  },
}); 