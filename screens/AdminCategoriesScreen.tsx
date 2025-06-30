import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useColorScheme } from 'react-native';
import Colors from '../constants/Colors';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// Type de catégorie
interface Category {
  id: string;
  label: string;
  icon?: string;
  badge?: string;
  parentId?: string | null;
  children?: Category[];
}

// Mock API (à remplacer par des appels réels à Spring Boot)
const fetchCategories = async (): Promise<Category[]> => {
  // Simule un appel API
  return [
    {
      id: '1',
      label: 'Femme',
      icon: 'human-female',
      children: [
        {
          id: '1-1',
          label: 'Vêtements',
          icon: 'tshirt-crew-outline',
          children: [
            { id: '1-1-1', label: 'Robes' },
            { id: '1-1-2', label: 'Jupes' },
          ],
        },
        {
          id: '1-2',
          label: 'Chaussures',
          icon: 'shoe-heel',
        },
      ],
    },
    {
      id: '2',
      label: 'Hommes',
      icon: 'human-male',
    },
  ];
};

const AdminCategoriesScreen = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de charger les catégories');
    } finally {
      setLoading(false);
    }
  };

  // Affichage récursif
  const renderCategory = (cat: Category, level = 0) => (
    <View key={cat.id} style={[styles.categoryRow, { paddingLeft: 16 * (level + 1) }]}> 
      {cat.icon && (
        <MaterialCommunityIcons name={cat.icon as any} size={22} color="#008080" style={{ marginRight: 8 }} />
      )}
      <Text style={[styles.label, { color: colors.text }]}>{cat.label}</Text>
      <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert('Éditer', cat.label)}>
        <Ionicons name="create-outline" size={20} color="#888" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert('Supprimer', cat.label)}>
        <Ionicons name="trash-outline" size={20} color="#e74c3c" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert('Ajouter sous-catégorie', cat.label)}>
        <Ionicons name="add-circle-outline" size={20} color="#008080" />
      </TouchableOpacity>
    </View>
  );

  const renderTree = (cats: Category[], level = 0) =>
    cats.map(cat => [
      renderCategory(cat, level),
      cat.children ? renderTree(cat.children, level + 1) : null,
    ]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Gestion des catégories</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => Alert.alert('Ajouter catégorie racine')}>
          <Ionicons name="add-circle" size={28} color="#008080" />
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#008080" style={{ marginTop: 40 }} />
      ) : (
        <View style={styles.treeContainer}>{renderTree(categories)}</View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
  },
  addBtn: {
    marginLeft: 8,
  },
  treeContainer: {
    paddingHorizontal: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  label: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  actionBtn: {
    marginLeft: 8,
    padding: 4,
  },
});

export default AdminCategoriesScreen; 