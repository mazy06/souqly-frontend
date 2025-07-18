import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

interface FilterChipsProps {
  selected: string;
  onSelect: (filter: string) => void;
}

export default function FilterChips({ selected, onSelect }: FilterChipsProps) {
  const { colors } = useTheme();
  const navigation = useNavigation();
  
  // Filtres de recherche
  const searchFilters = [
    { key: 'recent', label: 'Récents', icon: 'time-outline' },
    { key: 'popular', label: 'Populaires', icon: 'trending-up-outline' },
    { key: 'nearby', label: 'À proximité', icon: 'location-outline' },
    { key: 'new', label: 'Nouveautés', icon: 'sparkles-outline' },
    { key: 'promo', label: 'Promotions', icon: 'pricetag-outline' },
    { key: 'verified', label: 'Vérifiés', icon: 'checkmark-circle-outline' },
    { key: 'urgent', label: 'Urgents', icon: 'flash-outline' },
  ];
  
  const handleFilterPress = (filterKey: string) => {
    if (filterKey === 'filters') {
      (navigation as any).navigate('Filters');
    } else {
      onSelect(filterKey);
    }
  };
  
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
      <View style={styles.row}>
        {/* Bouton de filtres avancés */}
        <TouchableOpacity
          style={[
            styles.filterButton, 
            { backgroundColor: colors.card },
            selected === 'filters' && { backgroundColor: colors.primary }
          ]}
          onPress={() => handleFilterPress('filters')}
        >
          <Ionicons 
            name="filter-outline" 
            size={18} 
            color={selected === 'filters' ? 'white' : colors.primary} 
          />
        </TouchableOpacity>
        
        {/* Filtres rapides */}
        {searchFilters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.chip, 
              { backgroundColor: colors.card },
              selected === filter.key && { backgroundColor: colors.primary }
            ]}
            onPress={() => handleFilterPress(filter.key)}
          >
            <Text style={[
              styles.chipText, 
              { color: colors.text },
              selected === filter.key && { color: 'white' }
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { marginVertical: 4, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
  filterButton: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  chip: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  chipText: {
    fontWeight: '500',
    fontSize: 14,
  },
}); 