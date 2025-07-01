import React, { useState, useMemo } from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, TextInput, StyleSheet, Dimensions, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const NUM_COLUMNS = 6;
const ICON_SIZE = 32;
const SCREEN_WIDTH = Dimensions.get('window').width;
const ITEM_SIZE = Math.floor((SCREEN_WIDTH - 48) / NUM_COLUMNS);

// Liste dynamique de tous les noms d'icônes disponibles
const ALL_ICONS = Object.keys(MaterialCommunityIcons.glyphMap);

interface IconPickerModalProps {
  visible: boolean;
  onSelect: (iconName: string) => void;
  onClose: () => void;
}

const IconPickerModal: React.FC<IconPickerModalProps> = ({ visible, onSelect, onClose }) => {
  const [search, setSearch] = useState('');

  const filteredIcons = useMemo(() => {
    if (!search.trim()) return ALL_ICONS;
    return ALL_ICONS.filter(icon => icon.toLowerCase().includes(search.trim().toLowerCase()));
  }, [search]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Choisir une icône</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une icône..."
            value={search}
            onChangeText={setSearch}
            autoFocus
          />
          <FlatList
            data={filteredIcons}
            keyExtractor={item => item}
            numColumns={NUM_COLUMNS}
            contentContainerStyle={styles.iconGrid}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.iconItem} onPress={() => onSelect(item)}>
                <MaterialCommunityIcons name={item as any} size={ICON_SIZE} color="#008080" />
                <Text style={styles.iconLabel} numberOfLines={1}>{item}</Text>
              </TouchableOpacity>
            )}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: SCREEN_WIDTH - 24,
    maxHeight: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    } : {
      shadowColor: '#000',
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#008080',
    textAlign: 'center',
  },
  closeBtn: {
    padding: 4,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  iconGrid: {
    paddingBottom: 12,
  },
  iconItem: {
    width: ITEM_SIZE,
    alignItems: 'center',
    marginBottom: 12,
  },
  iconLabel: {
    fontSize: 10,
    color: '#333',
    marginTop: 2,
    textAlign: 'center',
    width: ITEM_SIZE - 4,
  },
});

export default IconPickerModal; 