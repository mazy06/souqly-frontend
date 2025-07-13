# Configuration de l'Environnement Souqly

## 🚨 Problème Résolu

Vous aviez une URL IP locale codée en dur (`http://192.168.1.153:8080`) qui ne fonctionnait plus quand vous changez de réseau WiFi. Cette configuration a été remplacée par un système flexible utilisant des variables d'environnement.

## 🔧 Configuration Rapide

### 1. Exécuter le script de configuration
```bash
./setup-env.sh
```

### 2. Modifier le fichier .env selon votre environnement

#### Pour un émulateur :
```env
EXPO_PUBLIC_DEV_API_URL=http://localhost:8080
```

#### Pour un appareil physique :
```env
EXPO_PUBLIC_DEV_API_URL=http://VOTRE_IP_LOCALE:8080
```

## 📋 Variables d'Environnement Disponibles

| Variable | Description | Défaut |
|----------|-------------|---------|
| `EXPO_PUBLIC_API_ENV` | Environnement (development/staging/production) | development |
| `EXPO_PUBLIC_API_BASE_URL` | URL de base complète (surcharge tout) | - |
| `EXPO_PUBLIC_DEV_API_URL` | URL spécifique pour développement mobile | localhost:8080 |
| `EXPO_PUBLIC_API_PATH` | Chemin API | /api |
| `EXPO_PUBLIC_MAX_FILE_SIZE` | Taille max des fichiers (bytes) | 10485760 |
| `EXPO_PUBLIC_MAX_IMAGES_PER_PRODUCT` | Nombre max d'images par produit | 10 |
| `EXPO_PUBLIC_APP_NAME` | Nom de l'application | Souqly |
| `EXPO_PUBLIC_APP_VERSION` | Version de l'application | 1.0.0 |

## 🌐 Comment Trouver Votre IP Locale

### macOS/Linux :
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### Windows :
```bash
ipconfig | findstr "IPv4"
```

### Ou utilisez le script :
```bash
./setup-env.sh
```

## 🔄 Redémarrage Nécessaire

Après modification du fichier `.env`, redémarrez votre application :

```bash
# Arrêter l'application (Ctrl+C)
# Puis redémarrer
npm start
# ou
expo start
```

## 🏗️ Architecture de Configuration

### Fichiers Modifiés :

1. **`constants/Config.ts`** : Configuration principale
   - Suppression de l'IP codée en dur
   - Utilisation de variables d'environnement
   - Fallback vers localhost

2. **`env.example`** : Template de configuration
   - Ajout de `EXPO_PUBLIC_DEV_API_URL`

3. **`setup-env.sh`** : Script d'installation
   - Création automatique du fichier `.env`
   - Détection de l'IP locale
   - Instructions de configuration

## 🛡️ Avantages de Cette Solution

✅ **Flexibilité** : Changez d'URL sans modifier le code  
✅ **Portabilité** : Fonctionne sur différents réseaux  
✅ **Sécurité** : Pas d'IPs codées en dur dans le code  
✅ **Facilité** : Configuration via variables d'environnement  
✅ **Maintenance** : Un seul endroit pour changer l'URL  

## 🚀 Utilisation Avancée

### Pour différents environnements :

```env
# Développement local
EXPO_PUBLIC_API_ENV=development
EXPO_PUBLIC_DEV_API_URL=http://localhost:8080

# Staging
EXPO_PUBLIC_API_ENV=staging

# Production
EXPO_PUBLIC_API_ENV=production
```

### Pour surcharger complètement l'URL :

```env
EXPO_PUBLIC_API_BASE_URL=https://mon-api-custom.com
```

## 🔍 Dépannage

### L'application ne se connecte pas à l'API ?

1. Vérifiez que votre serveur backend fonctionne
2. Vérifiez l'URL dans le fichier `.env`
3. Redémarrez l'application après modification
4. Vérifiez les logs de l'application

### Comment vérifier la configuration actuelle ?

Ajoutez temporairement ce code dans votre app pour afficher la configuration :

```javascript
import { CONFIG } from './constants/Config';
console.log('Configuration actuelle:', CONFIG);
```

## 📝 Notes Importantes

- Le fichier `.env` est dans `.gitignore` (normal)
- Les variables commencent par `EXPO_PUBLIC_` pour être accessibles côté client
- Redémarrez toujours l'application après modification du `.env`
- Utilisez `localhost` pour les émulateurs, l'IP locale pour les appareils physiques 