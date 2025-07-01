import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  ScrollView,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import Colors from '../constants/Colors';

interface SimplePickerProps {
  value: string;
  onValueChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  title?: string;
}

const SimplePicker: React.FC<SimplePickerProps> = ({
  value,
  onValueChange,
  options,
  placeholder = 'Sélectionner une option',
  label,
  disabled = false,
  required = false,
  title
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelectOption = (option: string) => {
    onValueChange(option);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>
          {label}
          {required && <Text style={{ color: '#ff4444' }}> *</Text>}
        </Text>
      )}
      
      <TouchableOpacity 
        style={[
          styles.pickerButton, 
          { 
            backgroundColor: colors.card,
            borderColor: colors.border,
            opacity: disabled ? 0.6 : 1
          }
        ]} 
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
      >
        <Text style={[
          styles.pickerButtonText, 
          { color: value ? colors.text : colors.tabIconDefault }
        ]}>
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color={colors.tabIconDefault} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {title || label || 'Sélectionner une option'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalOptions}>
              {options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.modalOption,
                    { 
                      backgroundColor: value === option ? colors.card : 'transparent'
                    }
                  ]}
                  onPress={() => handleSelectOption(option)}
                >
                  <Text style={[
                    styles.modalOptionText, 
                    { 
                      color: value === option ? '#008080' : colors.text,
                      fontWeight: value === option ? '600' : 'normal'
                    }
                  ]}>
                    {option}
                  </Text>
                  {value === option && (
                    <Ionicons name="checkmark" size={20} color="#008080" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  pickerButton: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerButtonText: {
    fontSize: 16,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalOptions: {
    maxHeight: 400,
  },
  modalOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalOptionText: {
    fontSize: 16,
    flex: 1,
  },
});

export default SimplePicker; 