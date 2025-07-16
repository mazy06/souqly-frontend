# Guide de démarrage iOS pour Souqly Frontend

## 🚨 Problème avec Docker et iOS

**L'émulateur iOS ne peut pas être lancé depuis Docker** car :
- Docker utilise Linux, pas macOS
- L'émulateur iOS nécessite Xcode et les outils natifs d'Apple
- Les simulateurs iOS ne sont disponibles que sur macOS

## ✅ Solutions recommandées

### Option 1 : Développement local (Recommandé)

```bash
# 1. Installer les dépendances
npm install

# 2. Créer le fichier .env si nécessaire
cp env.example .env

# 3. Lancer Expo en mode développement
npm start
# ou
./start-local.sh
```

Puis :
- Appuyer sur `i` pour iOS Simulator
- Appuyer sur `a` pour Android Emulator
- Appuyer sur `w` pour Web

### Option 2 : Docker + Expo Go

```bash
# Lancer avec Docker
./start-docker.sh
```

Puis :
- Scanner le QR code avec Expo Go sur votre iPhone
- Ou utiliser l'URL dans le navigateur

### Option 3 : Simulateur iOS natif

1. **Installer Xcode** depuis l'App Store
2. **Ouvrir Xcode** → Preferences → Components
3. **Télécharger un simulateur iOS** (ex: iPhone 15)
4. **Lancer le simulateur** : `open -a Simulator`
5. **Démarrer l'app** : `npm start` puis appuyer sur `i`

## 🔧 Prérequis pour iOS

### Sur macOS :
- Xcode (dernière version)
- iOS Simulator
- CocoaPods (installé avec Xcode)

### Sur Windows/Linux :
- Utiliser Expo Go sur un appareil iOS physique
- Ou utiliser le mode Web

## 🐛 Dépannage

### Erreur "No iOS Simulator found"
```bash
# Ouvrir le simulateur manuellement
open -a Simulator

# Puis relancer
npm start
```

### Erreur "Xcode not found"
```bash
# Installer Xcode depuis l'App Store
# Ou installer les command line tools
xcode-select --install
```

### Erreur "Metro bundler not starting"
```bash
# Nettoyer le cache
npx expo start --clear

# Ou supprimer node_modules et réinstaller
rm -rf node_modules package-lock.json
npm install
```

## 📱 Test sur appareil physique

1. **Installer Expo Go** sur votre iPhone
2. **Lancer l'app** : `npm start`
3. **Scanner le QR code** avec l'appareil photo
4. **Ouvrir dans Expo Go**

## 🌐 Test sur Web

```bash
npm start
# Puis appuyer sur 'w'
```

L'app sera accessible sur `http://localhost:19006` 