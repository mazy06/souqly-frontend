# 🎯 Guide d'utilisation du CustomHeader unifié

## 📋 Vue d'ensemble

Le `CustomHeader` est maintenant un composant unifié qui remplace tous les headers personnalisés de l'application. Il s'adapte automatiquement au thème (clair/sombre) et offre une interface cohérente dans toute l'application.

## 🚀 Utilisation de base

### Header simple avec titre
```typescript
<CustomHeader 
  title="Mon titre" 
  onBack={() => navigation.goBack()} 
/>
```

### Header sans titre
```typescript
<CustomHeader 
  onBack={() => navigation.goBack()} 
/>
```

## ⭐ Fonctionnalités avancées

### Header avec favoris (comme ProductDetailScreen)
```typescript
<CustomHeader
  title={product.title}
  onBack={() => navigation.goBack()}
  showFavorite={true}
  isFavorite={isFavorite}
  onToggleFavorite={toggleFavorite}
  showMenu={true}
  onMenu={() => {}}
/>
```

### Header avec bouton personnalisé
```typescript
<CustomHeader
  title="Mes produits"
  onBack={() => navigation.goBack()}
  showRightButton={true}
  rightButtonIcon="add"
  onRightButtonPress={() => createNewProduct()}
/>
```

### Header avec couleurs personnalisées
```typescript
<CustomHeader
  title="Galerie d'images"
  onBack={() => navigation.goBack()}
  color="#ff0000"
  backgroundColor="rgba(255,0,0,0.8)"
/>
```

## 🎨 Props disponibles

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `title` | `string` | - | Titre du header (optionnel) |
| `onBack` | `() => void` | **requis** | Fonction appelée lors du clic sur retour |
| `color` | `string` | `colors.text` | Couleur du texte et icônes |
| `backgroundColor` | `string` | `thème adaptatif` | Couleur de fond du header |
| `showFavorite` | `boolean` | `false` | Afficher le bouton favoris |
| `isFavorite` | `boolean` | `false` | État du favoris |
| `onToggleFavorite` | `() => void` | - | Fonction pour basculer favoris |
| `showMenu` | `boolean` | `false` | Afficher le bouton menu |
| `onMenu` | `() => void` | - | Fonction du menu |
| `showRightButton` | `boolean` | `false` | Afficher un bouton personnalisé |
| `rightButtonIcon` | `string` | `'ellipsis-vertical'` | Icône du bouton personnalisé |
| `onRightButtonPress` | `() => void` | - | Fonction du bouton personnalisé |

## 🌓 Gestion automatique des thèmes

Le header s'adapte automatiquement au thème :

- **Mode clair** : Fond blanc semi-transparent, texte sombre
- **Mode sombre** : Fond sombre semi-transparent, texte clair
- **Bordure** : S'adapte automatiquement au thème

## 📱 Exemples d'utilisation dans l'app

### ProductImagesScreen
```typescript
<CustomHeader onBack={() => navigation.goBack()} />
```

### MyProductsScreen
```typescript
<CustomHeader 
  title="Mes produits" 
  onBack={() => navigation.goBack()} 
/>
```

### ProductDetailScreen
```typescript
<CustomHeader
  title={product.title}
  onBack={() => navigation.goBack()}
  showFavorite={true}
  isFavorite={isFavorite}
  onToggleFavorite={toggleFavorite}
  showMenu={true}
  onMenu={() => {}}
/>
```

## ✨ Avantages du composant unifié

1. **Cohérence** : Un seul composant pour tous les headers
2. **Maintenance** : Plus facile à maintenir et mettre à jour
3. **Flexibilité** : Props optionnelles pour tous les cas d'usage
4. **Thème** : Gestion automatique des thèmes clair/sombre
5. **Réutilisabilité** : Utilisable dans toute l'application

## 🔧 Migration

Si tu as d'autres écrans qui utilisent des headers personnalisés, tu peux maintenant les remplacer par `CustomHeader` avec les props appropriées ! 

## 🎨 Props disponibles

```typescript
interface CustomHeaderProps {
  title?: string;                    // Titre du header
  onBack: () => void;               // Fonction de retour (obligatoire)
  color?: string;                   // Couleur personnalisée du texte
  backgroundColor?: string;         // Couleur personnalisée du fond
  
  // Bouton favoris
  showFavorite?: boolean;           // Afficher le bouton favoris
  isFavorite?: boolean;             // État favori actuel
  onToggleFavorite?: () => void;    // Fonction de toggle favoris
  
  // Bouton menu
  showMenu?: boolean;               // Afficher le bouton menu
  onMenu?: () => void;              // Fonction du menu
  
  // Bouton personnalisé
  showRightButton?: boolean;        // Afficher un bouton personnalisé
  rightButtonIcon?: string;         // Icône du bouton (nom Ionicons)
  onRightButtonPress?: () => void;  // Fonction du bouton personnalisé
}
```

## Exemples d'utilisation

### 1. Header simple avec titre
```tsx
<CustomHeader
  title="Mon écran"
  onBack={() => navigation.goBack()}
/>
```

### 2. Header avec bouton favoris (ProductDetailScreen)
```tsx
<CustomHeader
  title={product?.title}
  onBack={() => navigation.goBack()}
  showFavorite={true}
  isFavorite={isFavorite}
  onToggleFavorite={handleToggleFavorite}
/>
```

### 3. Header avec bouton personnalisé (AdminCategoriesScreen)
```tsx
<CustomHeader
  title="Gestion des catégories"
  onBack={() => navigation.goBack()}
  showRightButton={true}
  rightButtonIcon="add-circle"
  onRightButtonPress={() => openAddModal()}
/>
```

### 4. Header avec menu
```tsx
<CustomHeader
  title="Mon écran"
  onBack={() => navigation.goBack()}
  showMenu={true}
  onMenu={() => setShowMenu(true)}
/>
```

### 5. Header avec couleurs personnalisées
```tsx
<CustomHeader
  title="Mon écran"
  onBack={() => navigation.goBack()}
  color="#FF0000"
  backgroundColor="rgba(255, 255, 255, 0.9)"
/>
```

## 🏷️ Cas d'usage spécifiques

### Gestion des catégories (AdminCategoriesScreen)
La page de gestion des catégories utilise le CustomHeader avec un bouton "+" pour ajouter de nouvelles catégories :

```tsx
<CustomHeader
  title="Gestion des catégories"
  onBack={() => navigation.goBack()}
  showRightButton={true}
  rightButtonIcon="add-circle"
  onRightButtonPress={() => openAddModal()}
/>
```

**Fonctionnalités :**
- **Bouton "+" dans le header** : Ajoute une nouvelle catégorie racine
- **Boutons "+" dans la liste** : Ajoutent des sous-catégories à la catégorie sélectionnée
- **Header adaptatif** : S'adapte automatiquement au thème clair/sombre
- **Espacement automatique** : Le container a un `paddingTop: 100` pour éviter que le contenu soit caché

### Détail produit (ProductDetailScreen)
La page de détail produit utilise le CustomHeader avec bouton favoris :

```tsx
<CustomHeader
  title={product?.title}
  onBack={() => navigation.goBack()}
  showFavorite={true}
  isFavorite={isFavorite}
  onToggleFavorite={handleToggleFavorite}
/>
```

**Fonctionnalités :**
- **Bouton favoris** : Toggle l'état favori du produit
- **Icône adaptative** : Cœur plein/vide selon l'état
- **Couleur adaptative** : Rouge pour favoris, couleur du thème sinon

## Adaptation automatique au thème

Le header s'adapte automatiquement au thème actuel :
- **Mode sombre** : Fond semi-transparent sombre avec bordures subtiles
- **Mode clair** : Fond semi-transparent clair avec bordures subtiles
- **Couleurs du texte** : Adaptées automatiquement selon le thème

## Positionnement

Le header est positionné de manière absolue en haut de l'écran avec un `zIndex: 20`. Pour les écrans qui l'utilisent, ajoutez un `paddingTop: 100` au container principal pour éviter que le contenu soit caché derrière le header.

## Migration depuis les anciens headers

### Avant (header personnalisé)
```tsx
<View style={styles.header}>
  <TouchableOpacity onPress={() => navigation.goBack()}>
    <Ionicons name="arrow-back" size={24} color={colors.text} />
  </TouchableOpacity>
  <Text style={styles.title}>Mon titre</Text>
  <TouchableOpacity onPress={handleAction}>
    <Ionicons name="add" size={24} color={colors.text} />
  </TouchableOpacity>
</View>
```

### Après (CustomHeader)
```tsx
<CustomHeader
  title="Mon titre"
  onBack={() => navigation.goBack()}
  showRightButton={true}
  rightButtonIcon="add"
  onRightButtonPress={handleAction}
/>
```

## Avantages

1. **Cohérence** : Interface uniforme dans toute l'application
2. **Maintenabilité** : Un seul composant à maintenir
3. **Adaptation automatique** : S'adapte au thème sans configuration
4. **Flexibilité** : Props optionnelles pour différents cas d'usage
5. **Performance** : Optimisé et réutilisable

## Cas d'usage spécifiques

### Gestion des catégories (AdminCategoriesScreen)
La page de gestion des catégories utilise le CustomHeader avec un bouton "+" pour ajouter de nouvelles catégories :

```tsx
<CustomHeader
  title="Gestion des catégories"
  onBack={() => navigation.goBack()}
  showRightButton={true}
  rightButtonIcon="add-circle"
  onRightButtonPress={() => openAddModal()}
/>
```

**Fonctionnalités :**
- **Bouton "+" dans le header** : Ajoute une nouvelle catégorie racine
- **Boutons "+" dans la liste** : Ajoutent des sous-catégories à la catégorie sélectionnée
- **Header adaptatif** : S'adapte automatiquement au thème clair/sombre
- **Espacement automatique** : Le container a un `paddingTop: 100` pour éviter que le contenu soit caché

### Détail produit (ProductDetailScreen)
La page de détail produit utilise le CustomHeader avec bouton favoris :

```tsx
<CustomHeader
  title={product?.title}
  onBack={() => navigation.goBack()}
  showFavorite={true}
  isFavorite={isFavorite}
  onToggleFavorite={handleToggleFavorite}
/>
```

**Fonctionnalités :**
- **Bouton favoris** : Toggle l'état favori du produit
- **Icône adaptative** : Cœur plein/vide selon l'état
- **Couleur adaptative** : Rouge pour favoris, couleur du thème sinon

### Profil utilisateur (ProfileScreen)
- **Header simple** : Titre et bouton retour uniquement
- **Thème adaptatif** : Couleurs automatiques selon le thème 