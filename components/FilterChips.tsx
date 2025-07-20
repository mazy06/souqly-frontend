import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export interface FilterOption {
  key: string;
  label: string;
  count?: number;
}

interface FilterChipsProps {
  filters: FilterOption[];
  selectedFilter: string;
  onFilterSelect: (filterKey: string) => void;
  title?: string;
  showTitle?: boolean;
}

export default function FilterChips({ 
  filters = [], 
  selectedFilter, 
  onFilterSelect, 
  title = "Filtrer par statut",
  showTitle = true 
}: FilterChipsProps) {
  const { colors } = useTheme();

  // Vérification de sécurité
  if (!filters || !Array.isArray(filters)) {
    return null;
  }

  return (
    <View style={styles.container}>
      {showTitle && (
        <Text style={[styles.filtersTitle, { color: colors.text }]}>
          {title}
        </Text>
      )}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScrollView}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterChip, 
              { backgroundColor: selectedFilter === filter.key ? colors.primary : colors.card },
              { borderColor: selectedFilter === filter.key ? colors.primary : colors.border }
            ]}
            onPress={() => onFilterSelect(filter.key)}
          >
            <Text style={[
              styles.filterChipText, 
              { color: selectedFilter === filter.key ? 'white' : colors.text }
            ]}>
              {filter.label}{filter.count !== undefined ? ` (${filter.count})` : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
    paddingHorizontal: 0,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  filtersScrollView: {
    flexGrow: 0,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minWidth: 80,
    alignItems: 'center',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 