import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

export interface FilterOption {
  key: string;
  label: string;
  icon?: string;
}

interface SearchFiltersProps {
  filters: FilterOption[];
  selectedFilter: string;
  onFilterSelect: (filter: string) => void;
  showFilterButton?: boolean;
  onFilterButtonPress?: () => void;
}

const defaultFilters: FilterOption[] = [
  { key: 'all', label: 'Tous', icon: 'grid-outline' },
  { key: 'recent', label: 'Récents', icon: 'time-outline' },
  { key: 'popular', label: 'Populaires', icon: 'trending-up-outline' },
  { key: 'nearby', label: 'À proximité', icon: 'location-outline' },
  { key: 'new', label: 'Nouveaux', icon: 'star-outline' },
  { key: 'promo', label: 'Promotions', icon: 'pricetag-outline' },
  { key: 'verified', label: 'Vérifiés', icon: 'checkmark-circle-outline' },
  { key: 'urgent', label: 'Urgents', icon: 'flash-outline' },
];

export default function SearchFilters({
  filters = defaultFilters,
  selectedFilter,
  onFilterSelect,
  showFilterButton = true,
  onFilterButtonPress
}: SearchFiltersProps) {
  const { colors } = useTheme();

  const renderFilter = (filter: FilterOption) => {
    const isSelected = selectedFilter === filter.key;
    
    return (
      <TouchableOpacity
        key={filter.key}
        style={[
          styles.filterButton,
          {
            backgroundColor: isSelected ? colors.primary : colors.card,
            borderColor: isSelected ? colors.primary : colors.border,
          }
        ]}
        onPress={() => onFilterSelect(filter.key)}
        activeOpacity={0.7}
      >
        {filter.icon && (
          <Ionicons
            name={filter.icon as any}
            size={16}
            color={isSelected ? '#fff' : colors.text}
            style={styles.filterIcon}
          />
        )}
        <Text
          style={[
            styles.filterText,
            {
              color: isSelected ? '#fff' : colors.text,
            }
          ]}
        >
          {filter.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
      >
        {filters.map(renderFilter)}
      </ScrollView>
      
      {showFilterButton && onFilterButtonPress && (
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={onFilterButtonPress}
          activeOpacity={0.7}
        >
          <Ionicons name="options-outline" size={16} color={colors.text} style={styles.filterIcon} />
          <Text style={[styles.filterText, { color: colors.text }]}>Filtres</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingVertical: 8,
    marginTop: 8,
  },
  filtersContainer: {
    flexGrow: 1,
    paddingRight: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    minWidth: 80,
  },
  filterIcon: {
    marginRight: 4,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
}); 