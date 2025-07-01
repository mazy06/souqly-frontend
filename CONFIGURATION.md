# Configuration de l'Application Souqly

## Vue d'ensemble

L'application utilise un système de configuration centralisé dans `constants/Config.ts` qui permet de gérer facilement les différents environnements (développement, staging, production) et de passer d'un serveur local à un serveur distant.

## Structure de la configuration

### Environnements supportés

- **development** : Environnement de développement local
- **staging** : Environnement de test/staging
- **production** : Environnement de production

### Configuration par défaut

```typescript
const ENV_CONFIG = {
  development: {
    apiBaseUrl: Platform.OS === 'web' ? 'http://192.168.1.71:8080' : 'http://localhost:8080',
    apiPath: '/api',
  },
  staging: {
    apiBaseUrl: 'https://staging-api.souqly.com',
    apiPath: '/api',
  },
  production: {
    apiBaseUrl: 'https://api.souqly.com',
    apiPath: '/api',
  },
};
```

## Utilisation

### 1. Configuration automatique

L'environnement est automatiquement détecté :
- En mode développement (`__DEV__` = true) → `development`
- En mode production (`__DEV__` = false) → `production`

### 2. Configuration manuelle avec variables d'environnement

Créez un fichier `.env` à la racine du projet :

```bash
# Copier le fichier d'exemple
cp env.example .env
```

Puis modifiez le fichier `.env` :

```bash
# Forcer un environnement spécifique
EXPO_PUBLIC_API_ENV=staging

# Ou surcharger les URLs directement
EXPO_PUBLIC_API_BASE_URL=https://mon-api-distant.com
EXPO_PUBLIC_API_PATH=/api/v1

# Configuration des images
EXPO_PUBLIC_MAX_FILE_SIZE=5242880  # 5MB
EXPO_PUBLIC_MAX_IMAGES_PER_PRODUCT=5

# Configuration de l'application
EXPO_PUBLIC_APP_NAME=MonApp
EXPO_PUBLIC_APP_VERSION=2.0.0
```

### 3. Utilisation dans le code

```typescript
import { getApiUrl, getImageUrl, API_CONFIG } from '../constants/Config';

// URLs d'API
const productsUrl = getApiUrl('/products');
const imageUrl = getImageUrl(123);

// Configuration
console.log('Base URL:', API_CONFIG.baseURL);
console.log('Timeout:', API_CONFIG.timeout);
```

## Migration vers un serveur distant

### Étape 1 : Mettre à jour les URLs de production

Modifiez `constants/Config.ts` :

```typescript
production: {
  apiBaseUrl: 'https://votre-api-production.com',
  apiPath: '/api',
},
```

### Étape 2 : Tester avec l'environnement staging

```bash
# Dans .env
EXPO_PUBLIC_API_ENV=staging
```

### Étape 3 : Déployer en production

L'application utilisera automatiquement la configuration de production.

## Variables d'environnement disponibles

| Variable | Description | Défaut |
|----------|-------------|---------|
| `EXPO_PUBLIC_API_ENV` | Environnement forcé | Auto-détecté |
| `EXPO_PUBLIC_API_BASE_URL` | URL de base de l'API | Selon environnement |
| `EXPO_PUBLIC_API_PATH` | Chemin de l'API | `/api` |
| `EXPO_PUBLIC_MAX_FILE_SIZE` | Taille max des fichiers | 10MB |
| `EXPO_PUBLIC_MAX_IMAGES_PER_PRODUCT` | Nombre max d'images | 10 |
| `EXPO_PUBLIC_APP_NAME` | Nom de l'application | Souqly |
| `EXPO_PUBLIC_APP_VERSION` | Version de l'application | 1.0.0 |

## Services utilisant la configuration

- ✅ `ApiService` : URLs d'API centralisées
- ✅ `ProductService` : URLs d'images et upload
- ✅ `SellScreen` : URLs d'upload d'images
- ✅ `AdaptiveImage` : Affichage d'images adaptatif

## Avantages

1. **Centralisation** : Toutes les URLs dans un seul endroit
2. **Flexibilité** : Support des variables d'environnement
3. **Migration facile** : Changement d'environnement en une ligne
4. **Maintenance** : Configuration claire et documentée
5. **Sécurité** : Pas d'URLs en dur dans le code

## Dépannage

### Les images ne s'affichent pas

1. Vérifiez la configuration dans la console :
   ```
   🔧 Configuration chargée: { environment: 'development', apiBaseUrl: '...' }
   ```

2. Testez l'URL directement :
   ```bash
   curl -I http://192.168.1.71:8080/api/products/image/1
   ```

3. Vérifiez les logs d'erreur dans la console du navigateur

### Erreur CORS

Assurez-vous que le backend autorise les requêtes depuis votre domaine frontend.

### Changement d'environnement non pris en compte

1. Redémarrez l'application
2. Vérifiez que le fichier `.env` est bien à la racine
3. Vérifiez que les variables commencent par `EXPO_PUBLIC_` 