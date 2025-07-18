import { Platform } from 'react-native';

// Configuration des environnements
export type Environment = 'development' | 'staging' | 'production';

// Configuration par environnement
const ENV_CONFIG = {
  development: {
    // Utiliser localhost pour tous les environnements de développement
    apiBaseUrl: 'http://localhost:8080',
    apiPath: '/api',
  },
  staging: {
    apiBaseUrl: 'https://staging-api.souqly.com', // À remplacer par votre URL de staging
    apiPath: '/api',
  },
  production: {
    apiBaseUrl: 'https://api.souqly.com', // À remplacer par votre URL de production
    apiPath: '/api',
  },
};

// Déterminer l'environnement actuel
// En développement, on peut forcer l'environnement avec une variable d'environnement
const getCurrentEnvironment = (): Environment => {
  // Si on est en développement et qu'on veut tester avec un serveur distant
  if (__DEV__ && process.env.EXPO_PUBLIC_API_ENV) {
    return process.env.EXPO_PUBLIC_API_ENV as Environment;
  }
  
  // En développement par défaut
  if (__DEV__) {
    return 'development';
  }
  
  // En production par défaut
  return 'production';
};

const currentEnv = getCurrentEnvironment();
let config = ENV_CONFIG[currentEnv];

// Permettre de surcharger la configuration avec des variables d'environnement
if (process.env.EXPO_PUBLIC_API_BASE_URL) {
  config = {
    ...config,
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
  };
}

if (process.env.EXPO_PUBLIC_API_PATH) {
  config = {
    ...config,
    apiPath: process.env.EXPO_PUBLIC_API_PATH,
  };
}

// Export de la configuration complète
export const CONFIG = {
  environment: currentEnv,
  apiBaseUrl: config.apiBaseUrl,
  apiPath: config.apiPath,
  platform: Platform.OS,
  customConfig: {
    hasCustomBaseUrl: !!process.env.EXPO_PUBLIC_API_BASE_URL,
    hasCustomPath: !!process.env.EXPO_PUBLIC_API_PATH,
  },
};

// Fonctions utilitaires pour construire les URLs
export const getBaseUrl = (): string => {
  return config.apiBaseUrl;
};

export const getApiUrl = (endpoint: string): string => {
  return `${config.apiBaseUrl}${config.apiPath}${endpoint}`;
};

// URLs spécifiques
export const getImageUrl = (imageId: number): string => {
  return getApiUrl(`/products/image/${imageId}`);
};

export const getUploadUrl = (): string => {
  return getApiUrl('/products/upload-image');
};

// Configuration pour les services
export const API_CONFIG = {
  baseURL: config.apiBaseUrl,
  apiPath: config.apiPath,
  timeout: 30000, // 30 secondes
  retryAttempts: 3,
};

// Configuration pour les images
export const IMAGE_CONFIG = {
  maxFileSize: process.env.EXPO_PUBLIC_MAX_FILE_SIZE 
    ? parseInt(process.env.EXPO_PUBLIC_MAX_FILE_SIZE) 
    : 10 * 1024 * 1024, // 10MB par défaut
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxImagesPerProduct: process.env.EXPO_PUBLIC_MAX_IMAGES_PER_PRODUCT 
    ? parseInt(process.env.EXPO_PUBLIC_MAX_IMAGES_PER_PRODUCT) 
    : 10,
  thumbnailSize: 300,
  fullSize: 1200,
};

// Configuration pour l'application
export const APP_CONFIG = {
  name: process.env.EXPO_PUBLIC_APP_NAME || 'Souqly',
  version: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
  environment: currentEnv,
  isDevelopment: __DEV__,
  isProduction: !__DEV__,
};

// Export de la configuration complète
export default {
  api: API_CONFIG,
  image: IMAGE_CONFIG,
  app: APP_CONFIG,
  getBaseUrl,
  getApiUrl,
  getImageUrl,
  getUploadUrl,
}; 