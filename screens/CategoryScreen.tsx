import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import SearchBar from '../components/SearchBar';
import { SearchStackParamList } from './SearchScreen';
import CategoryService, { Category } from '../services/CategoryService';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

// Types pour les catégories
interface CategoryItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string;
  children?: CategoryItem[];
}

interface CategoryTree {
  [key: string]: CategoryItem[];
}

// Structure centralisée récursive
export const CATEGORY_TREE: CategoryTree = {
  femmes: [
    {
      key: 'vetements',
      label: 'Vêtements',
      icon: <MaterialCommunityIcons name="human-female" size={24} color="#008080" />,
      children: [
        { key: 'manteaux', label: 'Manteaux et vestes' },
        { key: 'sweats', label: 'Sweats et sweats à capuche' },
        { key: 'blazers', label: 'Blazers et tailleurs' },
        { key: 'robes', label: 'Robes' },
        { key: 'jupes', label: 'Jupes' },
        { key: 'hauts', label: 'Hauts et t-shirts' },
        { key: 'jeans', label: 'Jeans' },
        { key: 'pantalons', label: 'Pantalons et leggings' },
        { key: 'shorts', label: 'Shorts' },
        { key: 'combinaisons', label: 'Combinaisons et combishorts' },
        { key: 'maillots', label: 'Maillots de bain' },
      ],
    },
    {
      key: 'chaussures',
      label: 'Chaussures',
      icon: <MaterialCommunityIcons name="shoe-heel" size={24} color="#008080" />,
      children: [
        { key: 'ballerines', label: 'Ballerines' },
        { key: 'mocassins', label: 'Mocassins et chaussures bateau' },
        { key: 'bottes', label: 'Bottes', children: [
          { key: 'bottes_cuir', label: 'Bottes en cuir' },
          { key: 'bottes_pluie', label: 'Bottes de pluie' },
        ] },
        { key: 'mules', label: 'Mules et sabots' },
        { key: 'espadrilles', label: 'Espadrilles' },
        { key: 'claquettes', label: 'Claquettes et tongs' },
        { key: 'talons', label: 'Chaussures à talons' },
        { key: 'lacets', label: 'Chaussures à lacets' },
        { key: 'babies', label: 'Babies et Mary-Jane' },
        { key: 'sandales', label: 'Sandales' },
        { key: 'chaussons', label: 'Chaussons et pantoufles' },
      ],
    },
    {
      key: 'sacs',
      label: 'Sacs',
      icon: <MaterialCommunityIcons name="bag-personal-outline" size={24} color="#008080" />,
      children: [
        { key: 'sacados', label: 'Sacs à dos' },
        { key: 'sacplage', label: 'Sacs de plage' },
        { key: 'mallettes', label: 'Mallettes' },
        { key: 'seau', label: 'Sacs seau' },
        { key: 'banane', label: 'Sacs banane' },
        { key: 'pochettes', label: 'Pochettes' },
        { key: 'housses', label: 'Housses pour vêtements' },
        { key: 'sport', label: 'Sacs de sport' },
        { key: 'main', label: 'Sacs à main' },
        { key: 'besaces', label: 'Besaces' },
        { key: 'fourretout', label: 'Fourre-tout et sacs marins' },
      ],
    },
    {
      key: 'accessoires',
      label: 'Accessoires',
      icon: <MaterialCommunityIcons name="necklace" size={24} color="#008080" />,
      children: [
        { key: 'bandanas', label: 'Bandanas et foulards pour cheveux' },
        { key: 'ceintures', label: 'Ceintures' },
        { key: 'gants', label: 'Gants' },
        { key: 'accesscheveux', label: 'Accessoires pour cheveux' },
        { key: 'mouchoirs', label: 'Mouchoirs de poche' },
        { key: 'chapeaux', label: 'Chapeaux & casquettes', children: [
          { key: 'chapeaux', label: 'Chapeaux' },
          { key: 'casquettes', label: 'Casquettes' },
        ] },
        { key: 'bijoux', label: 'Bijoux' },
        { key: 'portecles', label: 'Porte-clés' },
        { key: 'echarpes', label: 'Écharpes et châles' },
        { key: 'lunettes', label: 'Lunettes de soleil' },
        { key: 'parapluies', label: 'Parapluies' },
      ],
    },
    {
      key: 'beaute',
      label: 'Beauté',
      icon: <MaterialCommunityIcons name="bottle-tonic-outline" size={24} color="#008080" />,
      children: [
        { key: 'maquillage', label: 'Maquillage' },
        { key: 'parfums', label: 'Parfums' },
        { key: 'soinsvisage', label: 'Soins du visage' },
        { key: 'accessbeaute', label: 'Accessoires de beauté' },
        { key: 'soinmains', label: 'Soin mains' },
        { key: 'manucure', label: 'Manucure' },
        { key: 'soinscorps', label: 'Soins du corps' },
        { key: 'soinscheveux', label: 'Soins cheveux' },
        { key: 'autres', label: 'Autres cosmétiques et accessoires' },
      ],
    },
  ],
  hommes: [
    { key: 'vetements', label: 'Vêtements', icon: <MaterialCommunityIcons name="tshirt-crew-outline" size={24} color="#008080" /> },
    { key: 'chaussures', label: 'Chaussures', icon: <MaterialCommunityIcons name="shoe-formal" size={24} color="#008080" /> },
    { key: 'accessoires', label: 'Accessoires', icon: <MaterialCommunityIcons name="watch-variant" size={24} color="#008080" /> },
    { key: 'soins', label: 'Soins', icon: <MaterialCommunityIcons name="bottle-tonic-outline" size={24} color="#008080" /> },
  ],
  createurs: [
    { key: 'femmes', label: 'Articles de créateurs pour femmes', icon: <MaterialCommunityIcons name="human-female" size={24} color="#008080" /> },
    { key: 'hommes', label: 'Articles de créateurs pour hommes', icon: <MaterialCommunityIcons name="watch-variant" size={24} color="#008080" /> },
  ],
  enfants: [
    { key: 'filles', label: 'Vêtements pour filles', icon: <MaterialCommunityIcons name="tshirt-crew-outline" size={24} color="#008080" /> },
    { key: 'garcons', label: 'Vêtements pour garçons', icon: <MaterialCommunityIcons name="tshirt-crew-outline" size={24} color="#008080" /> },
    { key: 'jouets', label: 'Jeux et jouets', icon: <MaterialCommunityIcons name="puzzle-outline" size={24} color="#008080" /> },
    { key: 'poussettes', label: 'Poussettes, porte-bébé et sièges auto', icon: <MaterialCommunityIcons name="baby-carriage" size={24} color="#008080" /> },
    { key: 'meubles', label: 'Meubles et décoration', icon: <MaterialCommunityIcons name="bed" size={24} color="#008080" /> },
    { key: 'bain', label: 'Bain et change', icon: <MaterialCommunityIcons name="bathtub-outline" size={24} color="#008080" /> },
    { key: 'securite', label: 'Sécurité bébé et enfant', icon: <MaterialCommunityIcons name="baby-face-outline" size={24} color="#008080" /> },
    { key: 'sante', label: 'Santé et grossesse', icon: <MaterialCommunityIcons name="needle" size={24} color="#008080" /> },
    { key: 'alimentation', label: 'Allaitement et alimentation', icon: <MaterialCommunityIcons name="baby-bottle-outline" size={24} color="#008080" /> },
    { key: 'sommeil', label: 'Sommeil et literie', icon: <MaterialCommunityIcons name="bed-outline" size={24} color="#008080" /> },
    { key: 'fournitures', label: 'Fournitures scolaires', icon: <MaterialCommunityIcons name="bag-personal-outline" size={24} color="#008080" /> },
  ],
  maison: [
    { key: 'cuisine', label: 'Petits appareils de cuisine', icon: <MaterialCommunityIcons name="blender-outline" size={24} color="#008080" /> },
    { key: 'cuisson', label: 'Cuisson et pâtisserie', icon: <MaterialCommunityIcons name="pot-mix" size={24} color="#008080" /> },
    { key: 'outils', label: 'Outils de cuisine', icon: <MaterialCommunityIcons name="silverware-fork-knife" size={24} color="#008080" /> },
    { key: 'arts', label: 'Arts de la table', icon: <MaterialCommunityIcons name="silverware-variant" size={24} color="#008080" /> },
    { key: 'entretien', label: 'Entretien de la maison', icon: <MaterialCommunityIcons name="iron-outline" size={24} color="#008080" /> },
    { key: 'textiles', label: 'Textiles', icon: <MaterialCommunityIcons name="tshirt-crew-outline" size={24} color="#008080" /> },
    { key: 'decoration', label: 'Décoration', icon: <MaterialCommunityIcons name="flower" size={24} color="#008080" /> },
    { key: 'fetes', label: 'Célébrations et fêtes', icon: <MaterialCommunityIcons name="party-popper" size={24} color="#008080" /> },
    { key: 'bricolage', label: 'Outils et bricolage', icon: <MaterialCommunityIcons name="tools" size={24} color="#008080" /> },
    { key: 'jardin', label: 'Extérieur et jardin', icon: <MaterialCommunityIcons name="watering-can" size={24} color="#008080" /> },
    { key: 'animaux', label: 'Animaux', icon: <MaterialCommunityIcons name="paw" size={24} color="#008080" /> },
  ],
  electronique: [
    { key: 'jeux', label: 'Jeux vidéo et consoles', icon: <MaterialCommunityIcons name="gamepad-variant-outline" size={24} color="#008080" /> },
    { key: 'ordinateurs', label: 'Ordinateurs et accessoires', icon: <MaterialCommunityIcons name="laptop" size={24} color="#008080" /> },
    { key: 'telephones', label: 'Téléphones portables et équipements', icon: <MaterialCommunityIcons name="cellphone" size={24} color="#008080" /> },
    { key: 'audio', label: 'Audio, casques et hi-fi', icon: <MaterialCommunityIcons name="headphones" size={24} color="#008080" /> },
    { key: 'photo', label: 'Appareils photo et accessoires', icon: <MaterialCommunityIcons name="camera-outline" size={24} color="#008080" /> },
    { key: 'tablettes', label: 'Tablettes, liseuses et accessoires', icon: <MaterialCommunityIcons name="tablet" size={24} color="#008080" /> },
    { key: 'tv', label: 'TV et home cinema', icon: <MaterialCommunityIcons name="television-classic" size={24} color="#008080" /> },
    { key: 'beaute', label: 'Produits de beauté et de soins perso...', icon: <MaterialCommunityIcons name="lipstick" size={24} color="#008080" /> },
    { key: 'objets', label: 'Objets connectés', icon: <MaterialCommunityIcons name="watch-variant" size={24} color="#008080" /> },
    { key: 'autres', label: 'Autres appareils et accessoires', icon: <MaterialCommunityIcons name="devices" size={24} color="#008080" /> },
  ],
  divertissement: [
    { key: 'livres', label: 'Livres', icon: <MaterialCommunityIcons name="book-open-page-variant" size={24} color="#008080" /> },
    { key: 'musique', label: 'Musique', icon: <MaterialCommunityIcons name="music" size={24} color="#008080" /> },
    { key: 'video', label: 'Vidéo', icon: <MaterialCommunityIcons name="video-outline" size={24} color="#008080" /> },
  ],
  loisirs: [
    { key: 'cartes', label: 'Cartes à collectionner', icon: <MaterialCommunityIcons name="cards-outline" size={24} color="#008080" /> },
    { key: 'societe', label: 'Jeux de société', icon: <MaterialCommunityIcons name="chess-queen" size={24} color="#008080" /> },
    { key: 'puzzles', label: 'Puzzles', icon: <MaterialCommunityIcons name="puzzle-outline" size={24} color="#008080" /> },
    { key: 'plateau', label: 'Jeux de plateau et jeux miniatures', icon: <MaterialCommunityIcons name="dice-multiple-outline" size={24} color="#008080" /> },
    { key: 'souvenirs', label: 'Souvenirs', icon: <MaterialCommunityIcons name="map-marker-outline" size={24} color="#008080" /> },
    { key: 'monnaie', label: 'Pièces de monnaie et billets', icon: <MaterialCommunityIcons name="cash-multiple" size={24} color="#008080" /> },
    { key: 'timbres', label: 'Timbres', icon: <MaterialCommunityIcons name="postage-stamp" size={24} color="#008080" /> },
    { key: 'cartespostales', label: 'Cartes postales', icon: <MaterialCommunityIcons name="post-outline" size={24} color="#008080" /> },
    { key: 'instruments', label: 'Instruments de musique et...', icon: <MaterialCommunityIcons name="microphone-variant" size={24} color="#008080" />, badge: 'Nouveau' },
    { key: 'rangements', label: 'Rangements pour objets de collection', icon: <MaterialCommunityIcons name="archive-outline" size={24} color="#008080" /> },
    { key: 'accessoires', label: 'Accessoires de jeux', icon: <MaterialCommunityIcons name="dice-5-outline" size={24} color="#008080" /> },
  ],
  sport: [
    { key: 'tous', label: 'Tous', icon: <MaterialCommunityIcons name="apps" size={24} color="#008080" /> },
    { key: 'cyclisme', label: 'Cyclisme', icon: <MaterialCommunityIcons name="bike" size={24} color="#008080" /> },
    { key: 'fitness', label: 'Fitness, course à pied et yoga', icon: <MaterialCommunityIcons name="dumbbell" size={24} color="#008080" /> },
    { key: 'pleinair', label: 'Sports de plein air', icon: <MaterialCommunityIcons name="tent" size={24} color="#008080" /> },
    { key: 'nautiques', label: 'Sports nautiques', icon: <MaterialCommunityIcons name="swim" size={24} color="#008080" /> },
    { key: 'equipe', label: 'Sports d\'équipe', icon: <MaterialCommunityIcons name="soccer" size={24} color="#008080" /> },
    { key: 'raquette', label: 'Sports de raquette', icon: <MaterialCommunityIcons name="tennis" size={24} color="#008080" /> },
    { key: 'golf', label: 'Golf', icon: <MaterialCommunityIcons name="golf" size={24} color="#008080" /> },
    { key: 'equitation', label: 'Équitation', icon: <MaterialCommunityIcons name="horse-variant" size={24} color="#008080" /> },
    { key: 'skate', label: 'Skateboards et trottinettes', icon: <MaterialCommunityIcons name="skateboard" size={24} color="#008080" /> },
    { key: 'boxe', label: 'Boxe et arts martiaux', icon: <MaterialCommunityIcons name="boxing-glove" size={24} color="#008080" /> },
    { key: 'loisir', label: 'Sports et jeux de loisir', icon: <MaterialCommunityIcons name="dots-grid" size={24} color="#008080" /> },
  ],
};

interface CategoryListItemProps {
  item: CategoryItem;
  onPress: () => void;
}

function CategoryListItem({ item, onPress }: CategoryListItemProps) {
  const { colors } = useTheme();
  let iconNode = null;
  if (item.icon) {
    // Si c'est un MaterialCommunityIcons, on le recrée avec la bonne couleur
    if (React.isValidElement(item.icon) && item.icon.type && (item.icon.type as any).displayName === 'MaterialCommunityIcons') {
      iconNode = React.createElement(item.icon.type, { ...(item.icon.props as any), color: colors.primary });
    } else {
      iconNode = item.icon;
    }
  }
  const hasChildren = (item as any).children && Array.isArray((item as any).children) && (item as any).children.length > 0;
  return (
    <TouchableOpacity style={[styles.item, { borderBottomColor: colors.border }]} onPress={onPress} activeOpacity={0.7}>
      {iconNode && <View style={styles.icon}>{iconNode}</View>}
      <Text style={[styles.label, { color: colors.text }]} numberOfLines={1}>{item.label}</Text>
      {item.badge && (
        <View style={[styles.badge, { backgroundColor: colors.primary }]}> 
          <Text style={[styles.badgeText, { color: colors.text }]}>{item.badge}</Text>
        </View>
      )}
      {hasChildren && (
        <Ionicons name="chevron-forward" size={22} color={colors.text + '99'} style={styles.chevron} />
      )}
    </TouchableOpacity>
  );
}

export default function CategoryScreen() {
  const { colors } = useTheme();
  const [search, setSearch] = React.useState('');
  const [category, setCategory] = React.useState<Category | null>(null);
  const [loading, setLoading] = React.useState(true);
  const navigation = useNavigation<StackNavigationProp<SearchStackParamList>>();
  const route = useRoute<RouteProp<SearchStackParamList, 'Category'>>();
  const { categoryKey, categoryLabel } = route.params;

  const loadCategory = async () => {
    setLoading(true);
    try {
      if (categoryKey === 'all') {
        // Cas spécial pour "Tous les biens" - on crée une catégorie virtuelle
        setCategory({
          id: 0,
          key: 'all',
          label: 'Tous les biens',
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          children: [
            { key: 'femmes', label: 'Femmes' },
            { key: 'hommes', label: 'Hommes' },
            { key: 'createurs', label: 'Créateurs' },
            { key: 'enfants', label: 'Enfants' },
            { key: 'maison', label: 'Maison' },
            { key: 'electronique', label: 'Électronique' },
            { key: 'divertissement', label: 'Divertissement' },
            { key: 'loisirs', label: 'Loisirs' },
            { key: 'sport', label: 'Sport' },
          ]
        } as Category);
      } else {
        // On récupère la catégorie par sa clé (avec ses enfants)
        const cat = await CategoryService.getCategoryByKey(categoryKey);
        setCategory(cat);
      }
    } catch (error) {
      setCategory(null);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadCategory();
  }, [categoryKey]);

  useFocusEffect(
    useCallback(() => {
      loadCategory();
    }, [categoryKey])
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top','left','right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>{categoryLabel}</Text>
        <TouchableOpacity style={styles.searchBtn}>
          <Ionicons name="search" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Chargement...</Text>
        </View>
      ) : (
        <FlatList
          data={category ? (() => {
            const children = category.children || [];
            // Si la catégorie a des sous-catégories, ajouter l'option "Tous"
            if (children.length > 0) {
              return [{ key: 'tous', label: 'Tous' }, ...children];
            }
            return children;
          })() : []}
          keyExtractor={item => item.key}
          renderItem={({ item }) => (
            <CategoryListItem
              item={item}
              onPress={() => {
                if (item.key === 'tous') {
                  // Navigation vers ArticlesList pour agréger tous les articles des sous-catégories
                  navigation.navigate('ArticlesList');
                } else if ((item as any).children && Array.isArray((item as any).children) && (item as any).children.length > 0) {
                  navigation.push('Category', {
                    categoryKey: item.key,
                    categoryLabel: item.label,
                  });
                } else {
                  // Navigation vers ArticlesList avec le nom de la catégorie parent
                  navigation.navigate('ArticlesList');
                }
              }}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  backBtn: {
    padding: 4,
    marginRight: 8,
  },
  searchBtn: {
    marginLeft: 'auto',
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
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
    fontSize: 17,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 