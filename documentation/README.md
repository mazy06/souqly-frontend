# 📚 Documentation Souqly Frontend

Ce dossier contient toute la documentation technique du projet Souqly Frontend, organisée par thèmes et fonctionnalités.

## 📋 Table des matières

### 🎨 Thème et Interface Utilisateur
- **[Migration du Thème](./THEME_MIGRATION_SUMMARY.md)** - Résumé complet de la migration vers le thème unifié
- **[Migration des Composants](./COMPONENTS_THEME_MIGRATION.md)** - Détails de la migration des composants vers le thème
- **[Guide CustomHeader](./CUSTOM_HEADER_GUIDE.md)** - Guide d'utilisation du header unifié

### 🔧 Architecture et Configuration
- **[Configuration](./CONFIGURATION.md)** - Configuration générale du projet
- **[Authentification JWT](./JWT_AUTHENTICATION.md)** - Système d'authentification
- **[Configuration OAuth](./OAUTH_SETUP.md)** - Configuration OAuth

## 🚀 Vue d'ensemble du projet

### Objectif
Souqly est une application mobile de marketplace développée en React Native avec Expo, permettant aux utilisateurs de vendre et acheter des articles d'occasion.

### Technologies utilisées
- **React Native** - Framework mobile
- **Expo** - Plateforme de développement
- **TypeScript** - Langage de programmation
- **React Navigation** - Navigation entre écrans
- **AsyncStorage** - Stockage local
- **Context API** - Gestion d'état globale

### Architecture
```
souqly-frontend/
├── app/                    # Configuration Expo
├── components/             # Composants réutilisables
├── contexts/              # Contextes React (thème, auth)
├── navigation/            # Configuration de navigation
├── screens/               # Écrans de l'application
├── services/              # Services API et utilitaires
├── constants/             # Constantes et configurations
└── documentation/         # Documentation technique
```

## 🎯 Fonctionnalités principales

### ✅ Implémentées
- [x] **Système de thème** - Support clair/sombre/système
- [x] **Authentification** - JWT avec persistance
- [x] **Navigation** - Navigation par onglets et stack
- [x] **Gestion des produits** - CRUD complet
- [x] **Gestion des catégories** - Interface d'administration
- [x] **Interface adaptative** - Composants unifiés
- [x] **Header personnalisé** - CustomHeader flexible

### 🚧 En cours de développement
- [ ] **Système de favoris** - Gestion des articles favoris
- [ ] **Recherche avancée** - Filtres et recherche
- [ ] **Messagerie** - Communication entre utilisateurs
- [ ] **Notifications** - Système de notifications push

## 📱 Écrans principaux

### Navigation par onglets
1. **Accueil** - Liste des produits récents
2. **Rechercher** - Recherche et catégories
3. **Vendre** - Publication d'articles
4. **Messages** - Messagerie (à venir)
5. **Profil** - Gestion du compte

### Écrans de navigation
- **Détail produit** - Informations complètes d'un article
- **Gestion des catégories** - Interface d'administration
- **Mes produits** - Gestion des articles publiés
- **Connexion/Inscription** - Authentification

## 🎨 Système de thème

### Modes disponibles
- **Mode clair** : Interface claire avec fond blanc
- **Mode sombre** : Interface sombre avec fond noir
- **Mode système** : Suit les préférences du système

### Couleurs principales
```typescript
interface ThemeColors {
  primary: string;           // #008080 (vert principal)
  background: string;        // Fond de l'écran
  card: string;             // Fond des cartes/composants
  text: string;             // Texte principal
  border: string;           // Bordures
  tabIconDefault: string;   // Icônes par défaut
  tabIconSelected: string;  // Icônes sélectionnées
  danger: string;           // #e74c3c (rouge)
  warning: string;          // #f39c12 (orange)
}
```

## 🔧 Configuration

### Prérequis
- Node.js (version 18+)
- npm ou yarn
- Expo CLI
- Expo Go (pour tester sur mobile)

### Installation
```bash
# Cloner le projet
git clone [repository-url]
cd souqly-frontend

# Installer les dépendances
npm install

# Démarrer le projet
npm start
```

### Variables d'environnement
Créer un fichier `.env` basé sur `.env.example` :
```env
API_BASE_URL=http://localhost:8080/api
JWT_SECRET=your-jwt-secret
```

## 📊 État du projet

### Pages migrées vers le thème unifié
- ✅ **ProfileScreen** - Profil utilisateur
- ✅ **ProductDetailScreen** - Détail produit
- ✅ **MyProductsScreen** - Mes produits
- ✅ **ProductImagesScreen** - Galerie d'images
- ✅ **AdminCategoriesScreen** - Gestion des catégories
- ✅ **HomeScreen** - Page d'accueil
- ✅ **ArticlesListScreen** - Liste des articles

### Composants migrés vers le thème unifié
- ✅ **SearchBar** - Barre de recherche
- ✅ **FilterChips** - Filtres horizontaux
- ✅ **ProductCard** - Carte produit
- ✅ **CustomHeader** - Header unifié
- ✅ **PrimaryButton** - Bouton principal
- ✅ **VisitorBadge** - Badge visiteur
- ✅ **SimplePicker** - Sélecteur simple
- ✅ **ThemeToggle** - Sélecteur de thème

## 🚀 Déploiement

### Développement
```bash
npm start
```

### Production
```bash
# Build pour production
expo build:android
expo build:ios

# Ou build EAS
eas build --platform all
```

## 🤝 Contribution

### Guidelines
1. Suivre les conventions de nommage
2. Utiliser TypeScript pour tous les nouveaux fichiers
3. Tester les modifications sur les deux thèmes
4. Documenter les nouvelles fonctionnalités
5. Respecter l'architecture existante

### Structure des commits
```
feat: nouvelle fonctionnalité
fix: correction de bug
docs: documentation
style: formatage
refactor: refactorisation
test: tests
chore: tâches de maintenance
```

## 📞 Support

Pour toute question ou problème :
1. Consulter la documentation appropriée
2. Vérifier les issues existantes
3. Créer une nouvelle issue avec les détails

---

**Dernière mise à jour :** Décembre 2024  
**Version :** 1.0.0  
**Mainteneur :** Équipe Souqly 