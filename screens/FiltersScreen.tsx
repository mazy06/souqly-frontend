import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface FilterOption {
  id: string;
  label: string;
  type: 'toggle' | 'range' | 'select';
  value?: any;
  options?: string[];
}

interface FilterSection {
  title: string;
  filters: FilterOption[];
}

export default function FiltersScreen() {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation();
  const [filters, setFilters] = useState<FilterSection[]>([
    {
      title: 'Prix',
      filters: [
        { id: 'price_min', label: 'Prix minimum', type: 'range', value: 0 },
        { id: 'price_max', label: 'Prix maximum', type: 'range', value: 1000 },
      ]
    },
    {
      title: 'Localisation',
      filters: [
        { id: 'nearby', label: 'À proximité', type: 'toggle', value: false },
        { id: 'same_city', label: 'Même ville', type: 'toggle', value: false },
        { id: 'same_region', label: 'Même région', type: 'toggle', value: false },
      ]
    },
    {
      title: 'État',
      filters: [
        { id: 'new', label: 'Neuf', type: 'toggle', value: false },
        { id: 'like_new', label: 'Comme neuf', type: 'toggle', value: false },
        { id: 'good', label: 'Bon état', type: 'toggle', value: false },
        { id: 'acceptable', label: 'État acceptable', type: 'toggle', value: false },
      ]
    },
    {
      title: 'Vendeur',
      filters: [
        { id: 'verified_seller', label: 'Vendeur vérifié', type: 'toggle', value: false },
        { id: 'professional', label: 'Professionnel', type: 'toggle', value: false },
        { id: 'private', label: 'Particulier', type: 'toggle', value: false },
      ]
    },
    {
      title: 'Livraison',
      filters: [
        { id: 'free_shipping', label: 'Livraison gratuite', type: 'toggle', value: false },
        { id: 'pickup', label: 'Retrait sur place', type: 'toggle', value: false },
        { id: 'shipping_available', label: 'Livraison disponible', type: 'toggle', value: false },
      ]
    },
    {
      title: 'Promotions',
      filters: [
        { id: 'on_sale', label: 'En promotion', type: 'toggle', value: false },
        { id: 'urgent', label: 'Vente urgente', type: 'toggle', value: false },
        { id: 'negotiable', label: 'Prix négociable', type: 'toggle', value: false },
      ]
    },
    {
      title: 'Date',
      filters: [
        { id: 'today', label: 'Aujourd\'hui', type: 'toggle', value: false },
        { id: 'this_week', label: 'Cette semaine', type: 'toggle', value: false },
        { id: 'this_month', label: 'Ce mois', type: 'toggle', value: false },
        { id: 'last_week', label: 'La semaine dernière', type: 'toggle', value: false },
      ]
    },
    {
      title: 'Photos',
      filters: [
        { id: 'with_photos', label: 'Avec photos', type: 'toggle', value: false },
        { id: 'multiple_photos', label: 'Plusieurs photos', type: 'toggle', value: false },
      ]
    },
    {
      title: 'Certification',
      filters: [
        { id: 'authentic', label: 'Authentique', type: 'toggle', value: false },
        { id: 'warranty', label: 'Avec garantie', type: 'toggle', value: false },
        { id: 'receipt', label: 'Avec facture', type: 'toggle', value: false },
      ]
    }
  ]);

  const toggleFilter = (sectionIndex: number, filterId: string) => {
    setFilters(prev => 
      prev.map((section, sIndex) => 
        sIndex === sectionIndex 
          ? {
              ...section,
              filters: section.filters.map(filter => 
                filter.id === filterId 
                  ? { ...filter, value: !filter.value }
                  : filter
              )
            }
          : section
      )
    );
  };

  const getActiveFiltersCount = () => {
    return filters.reduce((total, section) => 
      total + section.filters.filter(filter => filter.value).length, 0
    );
  };

  const clearAllFilters = () => {
    setFilters(prev => 
      prev.map(section => ({
        ...section,
        filters: section.filters.map(filter => ({ ...filter, value: false }))
      }))
    );
  };

  const applyFilters = () => {
    // TODO: Appliquer les filtres et naviguer vers les résultats
    console.log('Filtres appliqués:', filters);
    navigation.goBack();
  };

  const activeCount = getActiveFiltersCount();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top','left','right']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Filtres</Text>
        <TouchableOpacity 
          style={styles.clearButton}
          onPress={clearAllFilters}
        >
          <Text style={[styles.clearButtonText, { color: colors.primary }]}>
            Effacer
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contenu */}
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {filters.map((section, sectionIndex) => (
          <View key={section.title} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {section.title}
            </Text>
            {section.filters.map((filter) => (
              <View key={filter.id} style={styles.filterRow}>
                <Text style={[styles.filterLabel, { color: colors.text }]}>
                  {filter.label}
                </Text>
                {filter.type === 'toggle' && (
                  <Switch
                    value={filter.value}
                    onValueChange={() => toggleFilter(sectionIndex, filter.id)}
                    trackColor={{ false: colors.border, true: colors.primary + '40' }}
                    thumbColor={filter.value ? colors.primary : colors.tabIconDefault}
                  />
                )}
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* Bouton d'application */}
      <View style={[styles.footer, { backgroundColor: colors.background }]}>
        <TouchableOpacity 
          style={[
            styles.applyButton, 
            { backgroundColor: colors.primary },
            activeCount === 0 && { opacity: 0.5 }
          ]}
          onPress={applyFilters}
          disabled={activeCount === 0}
        >
          <Text style={styles.applyButtonText}>
            Appliquer {activeCount > 0 ? `(${activeCount})` : ''}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterLabel: {
    fontSize: 16,
    flex: 1,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  applyButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 