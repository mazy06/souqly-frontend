# Utiliser l'image Node.js officielle
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration
COPY package*.json ./
COPY app.json ./
COPY babel.config.js ./
COPY tsconfig.json ./

# Installer les dépendances
RUN npm install

# Copier le code source
COPY . .

# Exposer le port pour Expo
EXPOSE 19006

# Commande pour démarrer l'application en mode développement
# L'utilisateur pourra choisir la plateforme via l'interface Expo
CMD ["npm", "start"] 