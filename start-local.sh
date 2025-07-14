#!/bin/bash

echo "🚀 Démarrage du frontend localement..."
echo "📱 Le backend doit être en cours d'exécution dans Docker"
echo "🔗 Le frontend se connectera au backend sur http://192.168.1.153:8080"
echo ""

# Vérifier que le fichier .env existe
if [ ! -f .env ]; then
    echo "📝 Création du fichier .env..."
    cat > .env << EOF
# Configuration de l'environnement API
EXPO_PUBLIC_API_ENV=development
EXPO_PUBLIC_DEV_API_URL=http://192.168.1.153:8080
EXPO_PUBLIC_MAX_FILE_SIZE=10485760
EXPO_PUBLIC_MAX_IMAGES_PER_PRODUCT=10
EXPO_PUBLIC_APP_NAME=Souqly
EXPO_PUBLIC_APP_VERSION=1.0.0
EOF
    echo "✅ Fichier .env créé"
fi

echo "🎯 Lancement d'Expo en mode interactif..."
echo "📱 Tu peux maintenant :"
echo "   - Appuyer sur 'i' pour iOS"
echo "   - Appuyer sur 'a' pour Android"
echo "   - Appuyer sur 'w' pour Web"
echo ""

# Lancer Expo
npm start 