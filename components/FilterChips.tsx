import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const filters = ['Voir tout', 'Femmes', 'Hommes', 'Articles de créateurs', 'Enfants', 'Maison', 'Électronique'];

export default function FilterChips({ selected, onSelect }: { selected: string; onSelect: (f: string) => void }) {
  const { colors } = useTheme();
  
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
      <View style={styles.row}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.chip, 
              { backgroundColor: colors.card },
              selected === filter && { backgroundColor: colors.primary }
            ]}
            onPress={() => onSelect(filter)}
          >
            <Text style={[
              styles.chipText, 
              { color: colors.text },
              selected === filter && { color: 'white' }
            ]}>
              {filter}
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
  chip: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  chipText: {
    fontWeight: '500',
    fontSize: 15,
  },
}); 