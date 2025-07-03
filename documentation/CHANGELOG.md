# 📝 Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [1.0.0] - 2024-12-XX

### 🎨 Ajouté
- **Système de thème unifié** - Support complet des modes clair/sombre/système
- **ThemeContext** - Contexte React pour la gestion globale du thème
- **ThemeToggle** - Composant pour changer de thème
- **CustomHeader unifié** - Header flexible et adaptatif
- **Migration complète des composants** - Tous les composants s'adaptent au thème

### 🔧 Modifié
- **SearchBar** - Migration vers le système de thème unifié
- **FilterChips** - Adaptation aux couleurs du thème
- **ProductCard** - Support des thèmes clair/sombre
- **PrimaryButton** - Utilisation du contexte de thème
- **VisitorBadge** - Adaptation au thème
- **SimplePicker** - Migration vers le thème unifié

### 📱 Pages migrées
- **ProfileScreen** - Profil utilisateur avec thème adaptatif
- **ProductDetailScreen** - Détail produit avec header unifié
- **MyProductsScreen** - Mes produits avec thème
- **ProductImagesScreen** - Galerie d'images adaptative
- **AdminCategoriesScreen** - Gestion des catégories avec CustomHeader
- **HomeScreen** - Page d'accueil avec thème
- **ArticlesListScreen** - Liste des articles avec composants adaptatifs

### 🏗️ Architecture
- **Organisation de la documentation** - Dossier `documentation/` avec README principal
- **Structure des composants** - Composants unifiés et réutilisables
- **Gestion d'état** - Contextes React pour thème et authentification

### 📚 Documentation
- **README principal** - Vue d'ensemble complète du projet
- **Guide CustomHeader** - Documentation d'utilisation du header unifié
- **Migration du thème** - Résumé complet des modifications
- **Migration des composants** - Détails techniques des changements

## [0.9.0] - 2024-12-XX

### 🎨 Ajouté
- **Système d'authentification JWT** - Connexion et inscription
- **Navigation par onglets** - Interface principale de l'application
- **Gestion des produits** - CRUD complet pour les articles
- **Gestion des catégories** - Interface d'administration
- **Services API** - Communication avec le backend

### 🔧 Modifié
- **Structure du projet** - Organisation des dossiers
- **Configuration Expo** - Setup initial du projet
- **Navigation** - Configuration des routes

### 📱 Écrans de base
- **Accueil** - Liste des produits
- **Recherche** - Recherche et catégories
- **Vendre** - Publication d'articles
- **Messages** - Placeholder pour la messagerie
- **Profil** - Gestion du compte

### 🏗️ Architecture
- **Services** - ApiService, AuthService, ProductService, etc.
- **Contextes** - AuthContext pour l'authentification
- **Navigation** - Stack et Tab navigators
- **Composants** - Composants de base réutilisables

## [0.8.0] - 2024-12-XX

### 🎨 Ajouté
- **Configuration initiale** - Setup du projet React Native avec Expo
- **Structure de base** - Organisation des dossiers et fichiers
- **Configuration TypeScript** - Setup TypeScript
- **Dépendances de base** - React Navigation, AsyncStorage, etc.

### 🔧 Modifié
- **package.json** - Dépendances initiales
- **tsconfig.json** - Configuration TypeScript
- **app.json** - Configuration Expo

### 📱 Écrans
- **Écrans de base** - Structure initiale des écrans

---

## Types de modifications

- **🎨 Ajouté** - Nouvelles fonctionnalités
- **🔧 Modifié** - Modifications de fonctionnalités existantes
- **🐛 Corrigé** - Corrections de bugs
- **📱 Écrans** - Modifications des écrans
- **🏗️ Architecture** - Changements d'architecture
- **📚 Documentation** - Ajouts ou modifications de documentation
- **⚡ Performance** - Améliorations de performance
- **🔒 Sécurité** - Améliorations de sécurité
- **🧪 Tests** - Ajouts ou modifications de tests

## Versioning

Ce projet utilise le [Semantic Versioning](https://semver.org/lang/fr/) :

- **MAJOR** - Changements incompatibles avec les versions précédentes
- **MINOR** - Nouvelles fonctionnalités compatibles
- **PATCH** - Corrections de bugs compatibles

---

**Dernière mise à jour :** Décembre 2024  
**Mainteneur :** Équipe Souqly 