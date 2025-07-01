import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import { useColorScheme } from 'react-native';
import Colors from '../constants/Colors';

// Définition du type du stack profil
export type ProfileStackParamList = {
  ProfileMain: undefined;
  AdminCategories: undefined;
  MyProducts: undefined;
};

export default function ProfileScreen() {
  const navigation = useNavigation<StackNavigationProp<ProfileStackParamList>>();
  const { user, logout } = useAuth(); // user: AuthUser | null
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: () => {
            logout();
            // Navigation vers l'écran de login ou landing
            navigation.reset({
              index: 0,
              routes: [{ name: 'AuthLanding' as any }],
            });
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>Profil non disponible</Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#3ba6a6' }]}
          onPress={() => navigation.navigate('AuthLanding' as any)}
        >
          <Text style={styles.buttonText}>Se connecter</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: '#3ba6a6' }]}>
          <Text style={styles.avatarText}>
            {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.name, { color: colors.text }]}>{user.name || 'Utilisateur'}</Text>
        <Text style={[styles.email, { color: colors.text + '80' }]}>{user.email}</Text>
        <View style={[styles.roleBadge, { backgroundColor: user.role === 'admin' ? '#ff6b6b' : '#3ba6a6' }]}>
          <Text style={styles.roleText}>
            {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Actions</Text>
        
        {user.role === 'admin' && (
          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => navigation.navigate('AdminCategories')}
          >
            <Text style={[styles.menuItemText, { color: colors.text }]}>Gestion des catégories</Text>
            <Text style={[styles.menuItemSubtext, { color: colors.text + '80' }]}>Administrer les catégories</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => navigation.navigate('MyProducts')}
        >
          <Text style={[styles.menuItemText, { color: colors.text }]}>Mes produits</Text>
          <Text style={[styles.menuItemSubtext, { color: colors.text + '80' }]}>Gérer mes articles publiés</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {/* TODO: Navigation vers les favoris */}}
        >
          <Text style={[styles.menuItemText, { color: colors.text }]}>Mes favoris</Text>
          <Text style={[styles.menuItemSubtext, { color: colors.text + '80' }]}>Voir mes articles favoris</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {/* TODO: Navigation vers les paramètres */}}
        >
          <Text style={[styles.menuItemText, { color: colors.text }]}>Paramètres</Text>
          <Text style={[styles.menuItemSubtext, { color: colors.text + '80' }]}>Gérer mes préférences</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: '#ff6b6b' }]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    marginBottom: 12,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roleText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  menuItem: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  menuItemSubtext: {
    fontSize: 14,
  },
  logoutButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
}); 