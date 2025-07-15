# Politique d'Orientation - Souqly Frontend

## Vue d'ensemble

L'application Souqly est configurée pour fonctionner **uniquement en mode portrait**. Cette décision a été prise pour les raisons suivantes :

## Pourquoi le mode portrait uniquement ?

### 1. **Expérience utilisateur optimisée**
- Interface plus cohérente et prévisible
- Navigation plus intuitive sur mobile
- Meilleure lisibilité du contenu

### 2. **Simplicité de développement**
- Moins de cas d'usage à tester
- Layout plus simple à maintenir
- Évite les problèmes de responsive complexe

### 3. **Performance**
- Pas de recalcul de layout lors de rotation
- Moins de re-renders inutiles
- Chargement plus rapide

### 4. **Commerce mobile**
- La plupart des apps e-commerce utilisent le mode portrait
- Meilleure expérience d'achat
- Interface adaptée aux gestes mobiles

## Configuration

### app.json
```json
{
  "expo": {
    "orientation": "portrait"
  }
}
```

Cette configuration force l'application à rester en mode portrait sur tous les appareils.

## Composants adaptatifs

### LoadingSpinner
Le composant `LoadingSpinner` s'adapte automatiquement aux différents types d'appareils :

- **Téléphones petits** (< 700px) : ratio augmenté de 20%
- **Téléphones standards** (700-1024px) : ratio par défaut
- **Tablettes** (≥ 768px) : ratio réduit de 40%

### Exemple d'utilisation
```tsx
// Chargement adaptatif automatique
<LoadingSpinner message="Chargement..." />

// Ratio personnalisé
<LoadingSpinner message="Chargement..." heightRatio={0.5} />

// Mode non-adaptatif
<LoadingSpinner message="Chargement..." adaptive={false} />
```

## Bonnes pratiques

### 1. **Utiliser Dimensions.get('window')**
```tsx
const { width, height } = Dimensions.get('window');
```

### 2. **Pas d'écoute des changements d'orientation**
```tsx
// ❌ Ne pas faire
const subscription = Dimensions.addEventListener('change', ...);

// ✅ Utiliser directement
const screenHeight = Dimensions.get('window').height;
```

### 3. **Tests sur différents appareils**
- Tester sur téléphones petits (iPhone SE)
- Tester sur téléphones standards (iPhone 14)
- Tester sur tablettes (iPad)

## Avantages de cette approche

✅ **Cohérence** : Même expérience sur tous les appareils
✅ **Simplicité** : Moins de code à maintenir
✅ **Performance** : Pas de recalcul de layout
✅ **UX optimisée** : Interface dédiée au mode portrait
✅ **Développement rapide** : Moins de cas d'usage

## Conclusion

Cette politique d'orientation simplifie grandement le développement tout en offrant une expérience utilisateur optimale. L'application reste responsive et s'adapte aux différentes tailles d'écrans tout en conservant le mode portrait. 