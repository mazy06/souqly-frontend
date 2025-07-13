# Fonctionnalité de Conversation avec Proposition d'Achat - Souqly

## Vue d'ensemble

Cette fonctionnalité permet aux utilisateurs de créer une conversation avec un vendeur en faisant une proposition d'achat directement depuis la page de détail d'un article. La conversation commence par un rappel de l'article en question avec une carte de l'article dans la discussion.

## Flux utilisateur

### 1. Page de détail d'un article
- L'utilisateur consulte un article
- Il clique sur "Faire une offre"
- Un formulaire s'ouvre avec :
  - Prix proposé (pré-rempli avec le prix de l'article)
  - Message personnalisé au vendeur
  - Boutons "Annuler" et "Envoyer l'offre"

### 2. Création de la conversation
- L'utilisateur remplit le formulaire et clique sur "Envoyer l'offre"
- Une nouvelle conversation est créée avec le vendeur
- L'utilisateur est redirigé vers la conversation

### 3. Conversation avec carte d'article
- La conversation affiche une carte de l'article en haut
- Le premier message contient l'offre avec le prix proposé
- Les messages suivants sont normaux
- Le vendeur peut accepter ou refuser l'offre

## Composants implémentés

### ConversationService
- **Localisation** : `services/ConversationService.ts`
- **Responsabilités** :
  - Créer une nouvelle conversation
  - Envoyer des messages
  - Récupérer les messages d'une conversation
  - Gérer les offres avec prix

### ConversationProductCard
- **Localisation** : `components/ConversationProductCard.tsx`
- **Responsabilités** :
  - Afficher une carte compacte de l'article
  - Afficher l'image, titre, prix, etc.
  - Style adapté aux conversations

### OfferMessage
- **Localisation** : `components/OfferMessage.tsx`
- **Responsabilités** :
  - Afficher un message contenant une offre
  - Afficher le prix proposé
  - Boutons d'acceptation/refus pour le destinataire

## Modifications apportées

### ProductDetailScreen
- Intégration du `ConversationService`
- Modification de `handleSendOffer` pour créer une conversation
- Navigation vers la conversation avec l'ID du produit

### ConversationScreen
- Utilisation du `ConversationService` pour charger les messages
- Affichage de la carte de l'article en haut
- Support des messages avec offre
- Chargement des informations du produit

### MessagesScreen
- Utilisation du `ConversationService` pour charger les conversations
- Navigation vers la conversation avec l'ID du produit

## Structure des données

### Message avec offre
```typescript
interface Message {
  id: string;
  text: string;
  timestamp: string;
  isFromMe: boolean;
  productId?: number;
  offerPrice?: number; // Prix de l'offre si applicable
}
```

### Conversation
```typescript
interface Conversation {
  id: string;
  name: string;
  avatarUrl?: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  productId?: number;
  sellerId: number;
}
```

## API Endpoints (à implémenter côté backend)

### POST `/api/conversations`
```json
{
  "sellerId": 123,
  "productId": 456,
  "initialMessage": "Bonjour, je vous propose 50€ pour votre article",
  "offerPrice": 50.00
}
```

### GET `/api/conversations`
Retourne la liste des conversations de l'utilisateur connecté.

### GET `/api/conversations/{id}/messages`
Retourne les messages d'une conversation.

### POST `/api/conversations/{id}/messages`
```json
{
  "text": "Votre message",
  "productId": 456,
  "offerPrice": 50.00
}
```

## Fonctionnalités futures

1. **Acceptation/Refus d'offre** : Implémenter les actions d'acceptation et de refus
2. **Notifications** : Notifications push pour les nouvelles offres
3. **Historique des offres** : Garder un historique des offres faites
4. **Contre-offres** : Permettre au vendeur de faire une contre-offre
5. **Statut des offres** : Suivre le statut des offres (en attente, acceptée, refusée)

## Tests

### Scénarios de test
1. Créer une conversation depuis la page de détail d'un article
2. Envoyer un message avec une offre
3. Afficher la carte de l'article dans la conversation
4. Accepter/refuser une offre
5. Navigation entre les écrans de messages

### Données de test
- Utiliser les données mockées dans `MOCK_CONVERSATIONS`
- Tester avec différents types de produits
- Tester les cas d'erreur (réseau, authentification)

## Dépendances

- `@react-navigation/native` : Navigation entre écrans
- `react-native-safe-area-context` : Gestion des safe areas
- `@expo/vector-icons` : Icônes
- `expo-location` : Géolocalisation (pour la distance)

## Configuration

Aucune configuration supplémentaire requise. La fonctionnalité utilise les services existants :
- `ApiService` : Requêtes HTTP
- `AuthService` : Authentification
- `ProductService` : Données des produits 