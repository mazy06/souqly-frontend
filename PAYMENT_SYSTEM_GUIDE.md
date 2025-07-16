# Guide du Système de Paiement Souqly

Ce guide explique comment utiliser le système de paiement intégré dans l'application Souqly.

## 🎯 Fonctionnalités Disponibles

### ✅ Système Complet Implémenté

1. **Service de Paiement Frontend** (`PaymentService.ts`)
   - Gestion des méthodes de paiement
   - Validation des cartes de crédit
   - Vérification du solde du portefeuille
   - Traitement des achats
   - Historique des transactions

2. **Écran de Paiement** (`PaymentScreen.tsx`)
   - Interface utilisateur complète
   - Sélection de méthode de paiement
   - Ajout de nouvelles cartes
   - Validation des données
   - Confirmation d'achat

3. **Écran de Succès** (`PaymentSuccessScreen.tsx`)
   - Confirmation visuelle de l'achat
   - Détails de la transaction
   - Prochaines étapes
   - Navigation post-achat

4. **Backend API** (`PaymentController.java`)
   - Endpoints REST complets
   - Gestion des méthodes de paiement
   - Traitement des achats
   - Historique des transactions

## 🚀 Comment Utiliser

### Pour l'Utilisateur

1. **Accéder à un produit**
   - Naviguez vers un détail de produit
   - Cliquez sur le bouton "Acheter"

2. **Sélectionner le paiement**
   - Choisissez une méthode de paiement existante
   - Ou ajoutez une nouvelle carte
   - Vérifiez le résumé de l'achat

3. **Confirmer l'achat**
   - Cliquez sur "Payer"
   - Confirmez la transaction
   - Recevez la confirmation

### Pour le Développeur

#### Frontend

```typescript
// Utiliser le service de paiement
import PaymentService from '../services/PaymentService';

// Récupérer les méthodes de paiement
const methods = await PaymentService.getPaymentMethods();

// Effectuer un achat
const result = await PaymentService.purchase({
  productId: 1,
  paymentMethodId: 'wallet-1',
  amount: 150.00
});
```

#### Backend

```java
// Utiliser le contrôleur de paiement
@Autowired
private PaymentService paymentService;

// Traiter un achat
PurchaseResponseDto response = paymentService.processPurchase(userId, request);
```

## 📱 Interface Utilisateur

### Écran de Paiement
- **Résumé de l'achat** : Produit, prix, image
- **Méthodes de paiement** : Portefeuille, cartes existantes
- **Ajout de carte** : Formulaire complet avec validation
- **Bouton de paiement** : Confirmation et traitement

### Écran de Succès
- **Confirmation visuelle** : Icône de succès
- **Détails de transaction** : ID, montant, date
- **Prochaines étapes** : Email, notification vendeur, livraison
- **Actions post-achat** : Continuer les achats, voir commandes

## 🔧 Configuration

### Variables d'Environnement

```bash
# Frontend
EXPO_PUBLIC_API_ENV=development
EXPO_PUBLIC_DEV_API_URL=http://localhost:8080

# Backend
SPRING_PROFILES_ACTIVE=default
```

### Endpoints API

```bash
# Méthodes de paiement
GET /api/payments/methods
POST /api/payments/methods
DELETE /api/payments/methods/{id}

# Achats
POST /api/payments/purchase
GET /api/payments/transactions

# Portefeuille
GET /api/payments/wallet/balance
```

## 🧪 Tests

### Test Manuel
1. Lancez l'application
2. Connectez-vous
3. Allez sur un produit
4. Cliquez sur "Acheter"
5. Testez le processus de paiement

### Test Automatisé
```bash
# Exécuter le script de test
node test-payment.js
```

## 🔒 Sécurité

### Validation Frontend
- Validation des cartes de crédit
- Vérification des champs obligatoires
- Protection contre les montants négatifs

### Sécurité Backend
- Authentification requise
- Validation des données
- Simulation sécurisée des paiements

## 🚨 Gestion d'Erreurs

### Erreurs Communes
- **Connexion requise** : Redirection vers l'authentification
- **Fonds insuffisants** : Affichage du solde disponible
- **Carte invalide** : Validation et message d'erreur
- **Erreur réseau** : Retry automatique

### Messages d'Erreur
```typescript
// Exemples de gestion d'erreur
try {
  const result = await PaymentService.purchase(request);
} catch (error) {
  Alert.alert('Erreur', 'Impossible de traiter l\'achat');
}
```

## 📈 Améliorations Futures

### Fonctionnalités à Ajouter
- [ ] Intégration Stripe/PayPal
- [ ] Paiement en plusieurs fois
- [ ] Remboursements
- [ ] Factures PDF
- [ ] Notifications push
- [ ] Historique détaillé

### Optimisations
- [ ] Cache des méthodes de paiement
- [ ] Validation côté serveur renforcée
- [ ] Logs de transaction
- [ ] Monitoring des performances

## 🎨 Personnalisation

### Thème
Le système s'adapte automatiquement au thème de l'application :
- Couleurs primaires
- Mode sombre/clair
- Typographie cohérente

### Localisation
Prêt pour l'internationalisation :
- Messages en français
- Devises configurables
- Formats de date locaux

## 📞 Support

### Débogage
```typescript
// Activer les logs de debug
console.log('[PAYMENT]', 'Début du processus de paiement');
```

### Logs Backend
```java
// Logs de transaction
log.info("Transaction {} traitée pour l'utilisateur {}", transactionId, userId);
```

---

**🎉 Le système de paiement est maintenant opérationnel !**

Vous pouvez tester l'achat complet en naviguant vers un produit et en cliquant sur "Acheter". 