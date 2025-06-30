import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';

const filters = ['Voir tout', 'Femmes', 'Hommes', 'Articles de créateurs', 'Enfants', 'Maison', 'Électronique'];

export default function FilterChips({ selected, onSelect }: { selected: string; onSelect: (f: string) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
      <View style={styles.row}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.chip, selected === filter && styles.chipSelected]}
            onPress={() => onSelect(filter)}
          >
            <Text style={[styles.chipText, selected === filter && styles.chipTextSelected]}>{filter}</Text>
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
    backgroundColor: '#23242a',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: '#00BFA6',
  },
  chipText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 15,
  },
  chipTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
}); 