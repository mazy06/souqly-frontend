import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useColorScheme } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Colors from '../constants/Colors';
import SearchBar from '../components/SearchBar';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

// Types pour la navigation
export type SearchStackParamList = {
  SearchMain: undefined;
  Category: { categoryKey: string; categoryLabel: string };
};

// Type pour les catégories
interface Category {
  key: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

const CATEGORIES: Category[] = [
  {
    key: 'femmes',
    label: 'Femmes',
    icon: <MaterialCommunityIcons name="human-female" size={26} color="#008080" />,
  },
  {
    key: 'hommes',
    label: 'Hommes',
    icon: <MaterialCommunityIcons name="human-male" size={26} color="#008080" />,
  },
  {
    key: 'createurs',
    label: 'Articles de créateurs',
    icon: <MaterialCommunityIcons name="diamond-stone" size={26} color="#008080" />,
  },
  {
    key: 'enfants',
    label: 'Enfants',
    icon: <MaterialCommunityIcons name="baby-face-outline" size={26} color="#008080" />,
  },
  {
    key: 'maison',
    label: 'Maison',
    icon: <MaterialCommunityIcons name="lamp" size={26} color="#008080" />,
  },
  {
    key: 'electronique',
    label: 'Électronique',
    icon: <MaterialCommunityIcons name="power" size={26} color="#008080" />,
  },
  {
    key: 'divertissement',
    label: 'Divertissement',
    icon: <MaterialCommunityIcons name="book-open-page-variant" size={26} color="#008080" />,
  },
  {
    key: 'loisirs',
    label: 'Loisirs et collections',
    icon: <MaterialCommunityIcons name="star-outline" size={26} color="#008080" />,
    badge: 'Nouveau',
  },
  {
    key: 'sport',
    label: 'Sport',
    icon: <MaterialCommunityIcons name="tennis-ball" size={26} color="#008080" />,
  },
];

interface CategoryListItemProps {
  item: Category;
  onPress: () => void;
}

function CategoryListItem({ item, onPress }: CategoryListItemProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  return (
    <TouchableOpacity style={[styles.item, { borderBottomColor: colors.border }]} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.icon}>{item.icon}</View>
      <Text style={[styles.label, { color: colors.text }]}>{item.label}</Text>
      {item.badge && (
        <View style={styles.badge}><Text style={styles.badgeText}>{item.badge}</Text></View>
      )}
      <Ionicons name="chevron-forward" size={22} color={colors.text + '99'} style={styles.chevron} />
    </TouchableOpacity>
  );
}

export default function SearchScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const [search, setSearch] = React.useState('');
  const navigation = useNavigation<StackNavigationProp<SearchStackParamList>>();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <View style={styles.header}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Rechercher un article ou un membre" />
      </View>
      <FlatList
        data={CATEGORIES}
        keyExtractor={item => item.key}
        renderItem={({ item }) => (
          <CategoryListItem item={item} onPress={() => navigation.navigate('Category', { categoryKey: item.key, categoryLabel: item.label })} />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  list: {
    paddingBottom: 24,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    backgroundColor: 'transparent',
  },
  icon: {
    width: 36,
    alignItems: 'center',
    marginRight: 12,
  },
  label: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
  },
  badge: {
    backgroundColor: '#008080',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginRight: 8,
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  chevron: {
    marginLeft: 4,
  },
}); 