import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ModalSelectorProps {
  label: string;
  data: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const ModalSelector: React.FC<ModalSelectorProps> = ({ label, data, selectedValue, onSelect, placeholder, disabled }) => {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');

  const filteredData = data.filter(item => item.toLowerCase().includes(search.toLowerCase()));

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TouchableOpacity
        style={[styles.textInput, { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderColor: '#ccc', borderWidth: 1, opacity: disabled ? 0.5 : 1 }]}
        onPress={() => !disabled && setShowModal(true)}
        activeOpacity={disabled ? 1 : 0.8}
        disabled={disabled}
      >
        <Text style={{ color: selectedValue ? '#222' : '#aaa', fontSize: 16 }}>
          {selectedValue || placeholder || 'Sélectionner'}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#888" style={{ marginLeft: 'auto' }} />
      </TouchableOpacity>
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 12, width: '90%', maxHeight: '70%' }}>
            <TextInput
              style={{ borderWidth: 1, borderColor: '#eee', borderRadius: 8, margin: 12, paddingHorizontal: 12, height: 40, backgroundColor: '#fff' }}
              placeholder={`Rechercher ${label.toLowerCase()}`}
              value={search}
              onChangeText={setSearch}
            />
            <FlatList
              data={filteredData}
              keyExtractor={(item, index) => item + '-' + index}
              style={{ height: 350, backgroundColor: '#fff' }}
              ListHeaderComponent={
                <TouchableOpacity
                  style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: '#f8f8f8' }}
                  onPress={() => {
                    setShowModal(false);
                    setSearch('');
                    onSelect('');
                  }}
                >
                  <Text style={{ fontSize: 16, color: '#666', fontStyle: 'italic' }}>Aucun</Text>
                </TouchableOpacity>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' }}
                  onPress={() => {
                    setShowModal(false);
                    setSearch('');
                    onSelect(item);
                  }}
                >
                  <Text style={{ fontSize: 16 }}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity onPress={() => { setShowModal(false); setSearch(''); }} style={{ padding: 16, alignItems: 'center' }}>
              <Text style={{ color: '#008080', fontWeight: 'bold' }}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
});

export default ModalSelector; 