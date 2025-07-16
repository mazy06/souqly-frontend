#!/bin/bash

echo "🚀 Démarrage de Souqly Frontend dans Docker..."
echo "📱 Note: L'émulateur iOS ne peut pas être lancé depuis Docker"
echo "💡 Pour tester sur iOS, utilisez:"
echo "   - Expo Go sur votre iPhone"
echo "   - Simulateur iOS sur votre Mac"
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

echo "🐳 Construction de l'image Docker..."
docker build -t souqly-frontend .

echo "🚀 Lancement du conteneur..."
echo "📱 Expo sera accessible sur http://localhost:19006"
echo "📱 QR Code disponible pour Expo Go"
echo ""

# Lancer le conteneur avec port forwarding
docker run -it --rm \
  -p 19006:19006 \
  -p 19000:19000 \
  -p 19001:19001 \
  -p 19002:19002 \
  --env-file .env \
  souqly-frontend 