// Utilitaires pour la gestion des images
export const getFallbackImage = () => {
  // Utiliser une image locale comme fallback
  return require('../assets/images/icon.png');
};

export const getPlaceholderImage = () => {
  // Alternative: utiliser un service de placeholder plus fiable
  return 'https://picsum.photos/120/120?random=' + Math.random();
};

export const getProductPlaceholder = () => {
  // Image spécifique pour les produits
  return require('../assets/images/icon.png');
};

export const getAvatarPlaceholder = () => {
  // Image spécifique pour les avatars
  return require('../assets/images/icon.png');
}; 