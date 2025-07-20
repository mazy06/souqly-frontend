import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import SearchBar from './SearchBar';
import SearchFilterChips from './SearchFilterChips';

interface HomeHeaderProps {
  search: string;
  onSearchChange: (text: string) => void;
  onSearchSubmit: () => void;
  onCameraPress: () => void;
  selectedFilter: string;
  onFilterSelect: (filter: string) => void;
}

export default function HomeHeader({
  search,
  onSearchChange,
  onSearchSubmit,
  onCameraPress,
  selectedFilter,
  onFilterSelect,
}: HomeHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SearchBar 
        value={search} 
        onChangeText={onSearchChange}
        onPressCamera={onCameraPress}
        onSubmit={onSearchSubmit}
      />
      <SearchFilterChips selected={selectedFilter} onSelect={onFilterSelect} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
}); 