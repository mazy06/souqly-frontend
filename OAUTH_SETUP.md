# Configuration OAuth2 pour Souqly

Ce guide explique comment configurer l'authentification OAuth2 avec Google, Facebook et Apple pour l'application Souqly.

## Prérequis

- Un compte développeur Google
- Un compte développeur Facebook
- Un compte développeur Apple (pour iOS)

## 1. Configuration Google OAuth2

### Étape 1 : Créer un projet Google Cloud
1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'API Google+ API

### Étape 2 : Créer des identifiants OAuth2
1. Dans le menu, allez à "APIs & Services" > "Credentials"
2. Cliquez sur "Create Credentials" > "OAuth 2.0 Client IDs"
3. Sélectionnez "Web application"
4. Ajoutez les URIs de redirection autorisés :
   - `https://auth.expo.io/@your-expo-username/souqly-frontend`
   - `souqly://auth/google`
5. Notez votre Client ID et Client Secret

### Étape 3 : Mettre à jour la configuration
Dans `services/AuthService.ts`, remplacez :
```typescript
clientId: 'YOUR_GOOGLE_CLIENT_ID',
clientSecret: 'YOUR_GOOGLE_CLIENT_SECRET',
```

## 2. Configuration Facebook OAuth2

### Étape 1 : Créer une application Facebook
1. Allez sur [Facebook Developers](https://developers.facebook.com/)
2. Créez une nouvelle application
3. Ajoutez le produit "Facebook Login"

### Étape 2 : Configurer Facebook Login
1. Dans les paramètres de l'app, allez à "Facebook Login" > "Settings"
2. Ajoutez les URIs de redirection OAuth valides :
   - `https://auth.expo.io/@your-expo-username/souqly-frontend`
   - `souqly://auth/facebook`
3. Notez votre App ID

### Étape 3 : Mettre à jour la configuration
Dans `services/AuthService.ts`, remplacez :
```typescript
clientId: 'YOUR_FACEBOOK_APP_ID',
```

## 3. Configuration Apple Sign In

### Étape 1 : Configurer dans Apple Developer
1. Allez sur [Apple Developer](https://developer.apple.com/)
2. Dans "Certificates, Identifiers & Profiles"
3. Créez un nouvel App ID ou modifiez l'existant
4. Activez "Sign In with Apple"
5. Configurez les domaines et redirections

### Étape 2 : Mettre à jour la configuration
Dans `services/AuthService.ts`, remplacez :
```typescript
clientId: 'com.souqly.app', // Votre Bundle ID
```

## 4. Configuration Expo

### Étape 1 : Configurer le schéma d'URL
Dans `app.json`, assurez-vous que le schéma est configuré :
```json
{
  "expo": {
    "scheme": "souqly",
    "web": {
      "bundler": "metro"
    }
  }
}
```

### Étape 2 : Configurer les deep links
Les deep links sont déjà configurés dans `navigation/AppNavigator.tsx`.

## 5. Variables d'environnement (Recommandé)

Pour la sécurité, créez un fichier `.env` à la racine du projet :

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
APPLE_CLIENT_ID=com.souqly.app
```

Puis installez `react-native-dotenv` et mettez à jour `AuthService.ts` pour utiliser ces variables.

## 6. Test de l'authentification

1. Lancez l'application : `npx expo start`
2. Testez chaque provider d'authentification
3. Vérifiez que les redirections fonctionnent correctement

## Notes importantes

- **Sécurité** : Ne committez jamais vos secrets dans le code source
- **Production** : Utilisez des variables d'environnement pour les secrets
- **Validation** : Validez toujours les tokens côté serveur en production
- **Apple** : Apple Sign In nécessite une validation côté serveur pour la production

## Dépannage

### Erreur "Invalid redirect URI"
- Vérifiez que les URIs de redirection correspondent exactement
- Assurez-vous que le schéma `souqly://` est configuré

### Erreur "Client ID not found"
- Vérifiez que le Client ID est correct
- Assurez-vous que l'application est publiée (pour Google)

### Erreur "App not configured"
- Vérifiez que l'application Facebook est en mode développement
- Ajoutez votre compte comme testeur 