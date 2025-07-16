# Guide de Formatage des Montants

## Vue d'ensemble

Le formatage des montants a été standardisé dans toute l'application pour afficher les montants avec des espaces aux milliers, suivant le format français.

## Format Utilisé

### Format Standard
- **Format** : `1 234,56 €`
- **Séparateur de milliers** : Espace
- **Séparateur décimal** : Virgule
- **Devise** : Euro (€)

### Exemples
- `1 234,56 €` (au lieu de `1234.56€`)
- `50,00 €` (au lieu de `50.00€`)
- `1 000,00 €` (au lieu de `1000.00€`)
- `12 345,67 €` (au lieu de `12345.67€`)

## Fonctions Utilitaires

### `formatAmount(amount, currency)`
Formate un montant avec la devise.

```typescript
import { formatAmount } from '../utils/formatters';

// Exemples d'utilisation
formatAmount(1234.56)        // "1 234,56 €"
formatAmount(50)              // "50,00 €"
formatAmount(12345.67, '$')  // "12 345,67 $"
```

### `formatAmountWithoutCurrency(amount)`
Formate un montant sans devise.

```typescript
import { formatAmountWithoutCurrency } from '../utils/formatters';

// Exemples d'utilisation
formatAmountWithoutCurrency(1234.56)  // "1 234,56"
formatAmountWithoutCurrency(50)        // "50,00"
```

## Composants Mis à Jour

### ✅ Pages de Paiement
- **PaymentScreen** : Montants dans le résumé et bouton de paiement
- **PaymentSuccessScreen** : Montant de la transaction

### ✅ Affichage des Produits
- **ProductCard** : Prix des produits dans les listes
- **ProductInfoSection** : Prix détaillé du produit
- **HorizontalProductList** : Prix dans les listes horizontales

### ✅ Gestion des Commandes
- **OrdersScreen** : Prix des commandes

### ✅ Portefeuille
- **WalletScreen** : Solde et montants des opérations

## Implémentation Technique

### Fichier Utilitaires
```typescript
// utils/formatters.ts
export const formatAmount = (amount: number, currency: string = '€'): string => {
  const formatted = amount.toFixed(2);
  const [integerPart, decimalPart] = formatted.split('.');
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${formattedInteger},${decimalPart} ${currency}`;
};
```

### Utilisation dans les Composants
```typescript
import { formatAmount } from '../utils/formatters';

// Avant
<Text>{price.toFixed(2)} €</Text>

// Après
<Text>{formatAmount(price)}</Text>
```

## Avantages

### 1. **Lisibilité Améliorée**
- Les grands montants sont plus faciles à lire
- Format cohérent avec les standards français

### 2. **Cohérence Globale**
- Même formatage dans toute l'application
- Expérience utilisateur uniforme

### 3. **Maintenance Simplifiée**
- Une seule fonction pour tout le formatage
- Facile à modifier si besoin

### 4. **Standards Internationaux**
- Respect des conventions françaises
- Compatible avec les standards européens

## Migration

### Remplacement des Anciens Formats
```typescript
// ❌ Ancien format
price.toFixed(2) + ' €'
`${price.toFixed(2)} €`

// ✅ Nouveau format
formatAmount(price)
```

### Exemples de Migration
```typescript
// Dans ProductCard
price={formatAmount(item.price)}

// Dans PaymentScreen
{formatAmount(productPrice)}

// Dans WalletScreen
{formatAmount(balance)}
```

## Tests

### Vérification du Formatage
```typescript
// Tests unitaires
formatAmount(1234.56) === "1 234,56 €"
formatAmount(50) === "50,00 €"
formatAmount(12345.67) === "12 345,67 €"
```

## Maintenance

### Ajout de Nouveaux Composants
Pour tout nouveau composant affichant des montants :

1. **Importer la fonction**
```typescript
import { formatAmount } from '../utils/formatters';
```

2. **Utiliser le formatage**
```typescript
<Text>{formatAmount(price)}</Text>
```

### Modification du Format
Pour modifier le formatage (ex: changer la devise par défaut) :

1. **Modifier utils/formatters.ts**
2. **Tous les composants seront automatiquement mis à jour**

## Notes Importantes

- ✅ **Format français** : Espace pour les milliers, virgule pour les décimales
- ✅ **Devise par défaut** : Euro (€)
- ✅ **Décimales** : Toujours 2 décimales affichées
- ✅ **Cohérence** : Même formatage partout dans l'app 