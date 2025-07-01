# Documentation JWT Authentication - Souqly

## Vue d'ensemble

Cette documentation décrit le système d'authentification JWT (JSON Web Token) implémenté dans l'application Souqly, couvrant à la fois le backend Spring Boot et le frontend React Native.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Native  │    │   TokenService  │    │   AsyncStorage  │
│   (Frontend)    │◄──►│   (Gestion      │◄──►│   (Stockage     │
│                 │    │    des tokens)  │    │    local)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   ApiService    │    │   AuthService   │
│   (Requêtes     │    │   (Logique      │
│    HTTP)        │    │    métier)      │
└─────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐
│   Spring Boot   │
│   (Backend)     │
│   - JWT Service │
│   - Auth Filter │
│   - Controllers │
└─────────────────┘
```

## Backend (Spring Boot)

### 1. Configuration JWT

#### JwtService
- **Localisation** : `src/main/java/io/mazy/souqly_backend/service/JwtService.java`
- **Responsabilités** :
  - Génération des tokens JWT
  - Validation des tokens
  - Extraction des claims (userId, role, etc.)
  - Gestion des refresh tokens

#### Configuration de sécurité
- **Localisation** : `src/main/java/io/mazy/souqly_backend/config/SecurityConfig.java`
- **Fonctionnalités** :
  - Configuration des endpoints publics/privés
  - Intégration du JwtAuthenticationFilter
  - Configuration CORS

### 2. Endpoints d'authentification

#### POST `/api/auth/login`
```json
// Request
{
  "email": "admin@souqly.com",
  "password": "admin123"
}

// Response
{
  "token": "eyJhbGciOiJIUzM4NCJ9...",
  "refreshToken": "eyJhbGciOiJIUzM4NCJ9...",
  "user": {
    "id": 1,
    "email": "admin@souqly.com",
    "firstName": "Admin",
    "lastName": "Souqly",
    "role": "ADMIN"
  },
  "tokenType": "Bearer",
  "expiresIn": 86400000
}
```

#### POST `/api/auth/register`
```json
// Request
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}

// Response (même format que login)
```

#### POST `/api/auth/refresh`
```json
// Request
{
  "refreshToken": "eyJhbGciOiJIUzM4NCJ9..."
}

// Response (nouveau access token + refresh token)
```

#### GET `/api/auth/me`
```json
// Response (nécessite Authorization header)
{
  "id": 1,
  "email": "admin@souqly.com",
  "firstName": "Admin",
  "lastName": "Souqly",
  "role": "ADMIN"
}
```

### 3. Structure du JWT

#### Access Token
```json
{
  "sub": "admin@souqly.com",
  "iat": 1751315969,
  "exp": 1751402369,
  "userId": 1,
  "role": "ADMIN"
}
```

#### Refresh Token
- Durée de vie plus longue (7 jours)
- Utilisé uniquement pour générer de nouveaux access tokens

## Frontend (React Native)

### 1. Services

#### TokenService
- **Localisation** : `services/TokenService.ts`
- **Responsabilités** :
  - Stockage sécurisé des tokens dans AsyncStorage
  - Vérification de l'expiration des tokens
  - Gestion de la persistance de l'authentification

```typescript
// Exemple d'utilisation
const tokenData = await TokenService.getTokenData();
const isExpired = await TokenService.isTokenExpired();
await TokenService.saveTokens(tokenData);
```

#### ApiService
- **Localisation** : `services/ApiService.ts`
- **Responsabilités** :
  - Gestion automatique des headers Authorization
  - Refresh automatique des tokens expirés
  - Méthodes HTTP centralisées

```typescript
// Exemple d'utilisation
const categories = await ApiService.get('/categories');
const user = await ApiService.get('/auth/me');
```

#### AuthService
- **Localisation** : `services/AuthService.ts`
- **Responsabilités** :
  - Logique d'authentification (email, OAuth)
  - Intégration avec ApiService
  - Gestion des erreurs d'authentification

### 2. Contexte d'authentification

#### AuthContext
- **Localisation** : `contexts/AuthContext.tsx`
- **Fonctionnalités** :
  - État global de l'authentification
  - Vérification automatique au démarrage
  - Persistance de la session

```typescript
const { user, isAuthenticated, isLoading, logout } = useAuth();
```

### 3. Flux d'authentification

#### Connexion
1. Utilisateur saisit email/password
2. `AuthService.signInWithEmail()` appelle l'API
3. `ApiService.login()` gère la requête HTTP
4. `TokenService.saveTokens()` stocke les tokens
5. `AuthContext` met à jour l'état global

#### Vérification au démarrage
1. `AuthContext.checkAuthStatus()` s'exécute au montage
2. `TokenService.isAuthenticated()` vérifie les tokens
3. Si valide, l'utilisateur est automatiquement connecté

#### Refresh automatique
1. `ApiService.makeRequest()` détecte une erreur 401
2. `ApiService.refreshToken()` tente de rafraîchir
3. Si succès, la requête originale est réessayée
4. Si échec, l'utilisateur est déconnecté

#### Déconnexion
1. `AuthContext.logout()` est appelé
2. `AuthService.logout()` appelle l'API de logout
3. `TokenService.clearTokens()` supprime les tokens locaux
4. L'état global est réinitialisé

## Gestion des erreurs

### Backend

#### Exceptions personnalisées
```java
public class AuthenticationException extends RuntimeException {
    public AuthenticationException(String message) {
        super(message);
    }
}

public class TokenExpiredException extends RuntimeException {
    public TokenExpiredException(String message) {
        super(message);
    }
}
```

#### Gestion dans les controllers
```java
@ExceptionHandler(AuthenticationException.class)
public ResponseEntity<ErrorResponse> handleAuthenticationException(AuthenticationException e) {
    return ResponseEntity.status(401)
        .body(new ErrorResponse("AUTH_ERROR", e.getMessage()));
}
```

### Frontend

#### Types d'erreurs
```typescript
export enum AuthErrorType {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR'
}

export interface AuthError {
  type: AuthErrorType;
  message: string;
  code?: number;
}
```

#### Gestion dans les services
```typescript
try {
  const result = await ApiService.login(email, password);
  return { success: true, user: result.user };
} catch (error) {
  if (error.message.includes('401')) {
    return { success: false, error: 'Identifiants incorrects' };
  }
  return { success: false, error: 'Erreur de connexion' };
}
```

## Sécurité

### Backend
- **Secret JWT** : Clé secrète de 256 bits minimum
- **Expiration** : Access token (24h), Refresh token (7 jours)
- **HTTPS** : Obligatoire en production
- **CORS** : Configuration stricte des origines

### Frontend
- **AsyncStorage** : Stockage local sécurisé
- **Validation** : Vérification de l'expiration des tokens
- **Nettoyage** : Suppression automatique des tokens expirés
- **Refresh** : Renouvellement automatique des tokens

## Tests

### Backend
```bash
# Test de connexion
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@souqly.com","password":"admin123"}'

# Test avec token
curl -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Frontend
```typescript
// Test de persistance
await TokenService.saveTokens(tokenData);
const isAuth = await TokenService.isAuthenticated(); // true

// Test de refresh
const response = await ApiService.get('/protected-endpoint');
// Si token expiré, refresh automatique
```

## Bonnes pratiques

### Backend
1. **Validation** : Valider tous les inputs
2. **Logging** : Logger les tentatives d'authentification
3. **Rate limiting** : Limiter les tentatives de connexion
4. **Monitoring** : Surveiller les échecs d'authentification

### Frontend
1. **UX** : Afficher des messages d'erreur clairs
2. **Performance** : Éviter les appels API inutiles
3. **Sécurité** : Ne jamais stocker de données sensibles en clair
4. **Accessibilité** : Gérer les cas d'erreur réseau

## Déploiement

### Variables d'environnement
```bash
# Backend
JWT_SECRET=your-super-secret-key-256-bits
JWT_EXPIRATION=86400000
JWT_REFRESH_EXPIRATION=604800000

# Frontend
API_BASE_URL=https://api.souqly.com
```

### Production
1. **HTTPS** : Obligatoire pour tous les endpoints
2. **CORS** : Configuration stricte
3. **Monitoring** : Surveillance des tokens expirés
4. **Backup** : Sauvegarde des clés JWT

## Dépannage

### Problèmes courants

#### Token expiré
- **Symptôme** : Erreur 401 sur toutes les requêtes
- **Solution** : Vérifier la synchronisation horaire, ajuster l'expiration

#### Refresh token invalide
- **Symptôme** : Déconnexion automatique
- **Solution** : Vérifier la durée de vie du refresh token

#### Erreurs réseau
- **Symptôme** : Impossible de se connecter
- **Solution** : Vérifier la connectivité, les URLs d'API

#### Persistance perdue
- **Symptôme** : Déconnexion au redémarrage
- **Solution** : Vérifier AsyncStorage, les permissions

## Évolutions futures

1. **OAuth 2.0** : Intégration Google, Facebook, Apple
2. **2FA** : Authentification à deux facteurs
3. **Sessions multiples** : Gestion de plusieurs appareils
4. **Audit trail** : Traçabilité des connexions
5. **Biométrie** : Authentification par empreinte/visage 