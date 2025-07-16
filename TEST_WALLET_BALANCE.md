# Test du Message d'Erreur de Solde Insuffisant

## Objectif
Vérifier que le message d'erreur rouge s'affiche correctement quand on essaie de payer avec le portefeuille Souqly avec un solde insuffisant.

## Configuration Actuelle
- **Solde simulé du portefeuille** : 25€
- **Prix des produits** : Variable (généralement entre 50€ et 200€)
- **Méthode de paiement par défaut** : Portefeuille Souqly

## Étapes de Test

### 1. Accéder à la Page de Paiement
1. Ouvrir l'application
2. Aller sur un produit avec un prix > 25€
3. Cliquer sur "Acheter"
4. Vérifier que vous êtes sur la page de paiement

### 2. Vérifier la Sélection du Portefeuille
1. S'assurer que "Portefeuille Souqly" est sélectionné (bordure colorée)
2. Vérifier que le bouton "Payer" est actif

### 3. Tester le Paiement
1. Cliquer sur le bouton "Payer"
2. **Résultat attendu** : Un message rouge doit apparaître en haut de l'écran avec le texte :
   ```
   Fonds insuffisants: 25 € disponible pour [PRIX] €
   ```

### 4. Vérifier les Logs
Dans la console de développement, vous devriez voir :
```
[DEBUG] Méthode de paiement sélectionnée: {id: 'wallet-1', type: 'wallet', name: 'Portefeuille Souqly'}
[DEBUG] Prix du produit: [PRIX]
[DEBUG] Vérification du solde pour paiement par portefeuille
[DEBUG] Simulation solde: 25€ pour [PRIX]€ - Suffisant: false
[DEBUG] Résultat vérification solde: {hasEnoughFunds: false, balance: 25}
[DEBUG] Affichage erreur fonds insuffisants: Fonds insuffisants: 25 € disponible pour [PRIX] €
```

## Dépannage

### Si le message ne s'affiche pas :

1. **Vérifier le prix du produit** :
   - Le prix doit être supérieur à 25€ pour déclencher l'erreur
   - Si le prix est ≤ 25€, le paiement sera autorisé

2. **Vérifier la sélection du portefeuille** :
   - S'assurer que "Portefeuille Souqly" est bien sélectionné
   - Le type doit être 'wallet'

3. **Vérifier les logs** :
   - Regarder la console pour voir si la vérification se fait
   - Vérifier que `selectedMethod?.type === 'wallet'` est true

### Si le message s'affiche mais disparaît trop vite :
- La durée d'affichage a été augmentée à 5 secondes
- Le message devrait rester visible suffisamment longtemps

## Test avec un Produit Bon Marché
Pour tester le cas où le paiement est autorisé :
1. Trouver un produit à 20€ ou moins
2. Sélectionner le portefeuille Souqly
3. Cliquer sur "Payer"
4. **Résultat attendu** : Le paiement doit se poursuivre normalement

## Modification du Solde de Test
Pour changer le solde simulé, modifier dans `PaymentService.ts` :
```typescript
const simulatedBalance = 25; // Changer cette valeur
```

- **Solde faible** (ex: 10€) : Plus d'erreurs de fonds insuffisants
- **Solde élevé** (ex: 1000€) : Moins d'erreurs de fonds insuffisants 