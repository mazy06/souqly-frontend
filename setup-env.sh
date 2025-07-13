#!/bin/bash

# Script de configuration de l'environnement Souqly
echo "🔧 Configuration de l'environnement Souqly"

# Vérifier si le fichier .env existe
if [ ! -f .env ]; then
    echo "📝 Création du fichier .env..."
    cat > .env << EOF
# Configuration de l'environnement API
# Environnement API (development, staging, production)
EXPO_PUBLIC_API_ENV=development

# URL spécifique pour le développement mobile
# Remplacez cette URL par l'IP de votre serveur local
# Vous pouvez utiliser localhost si vous utilisez un émulateur
# ou l'IP de votre machine si vous testez sur un appareil physique
EXPO_PUBLIC_DEV_API_URL=http://localhost:8080

# Configuration des images
EXPO_PUBLIC_MAX_FILE_SIZE=10485760
EXPO_PUBLIC_MAX_IMAGES_PER_PRODUCT=10

# Configuration de l'application
EXPO_PUBLIC_APP_NAME=Souqly
EXPO_PUBLIC_APP_VERSION=1.0.0
EOF
    echo "✅ Fichier .env créé avec succès"
else
    echo "ℹ️  Le fichier .env existe déjà"
fi

# Afficher l'IP locale pour faciliter la configuration
echo ""
echo "🌐 Votre IP locale:"
if command -v ifconfig &> /dev/null; then
    # macOS/Linux
    LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1)
elif command -v ipconfig &> /dev/null; then
    # Windows
    LOCAL_IP=$(ipconfig | grep "IPv4" | awk '{print $NF}' | head -n 1)
else
    LOCAL_IP="Non détectée"
fi

echo "   IP locale détectée: $LOCAL_IP"
echo ""
echo "📋 Instructions:"
echo "1. Si vous utilisez un émulateur, gardez: EXPO_PUBLIC_DEV_API_URL=http://localhost:8080"
echo "2. Si vous testez sur un appareil physique, remplacez par: EXPO_PUBLIC_DEV_API_URL=http://$LOCAL_IP:8080"
echo "3. Modifiez le fichier .env selon vos besoins"
echo ""
echo "🚀 Redémarrez votre application après modification du fichier .env" 