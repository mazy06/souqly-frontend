import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProductService from '../services/ProductService';

export function useFavorites() {
  console.log('[useFavorites] hook called');
  const { isAuthenticated, isGuest, user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [favoriteCounts, setFavoriteCounts] = useState<{ [productId: number]: number }>({});
  const [loading, setLoading] = useState(false);

  const loadFavorites = async () => {
    if (!isAuthenticated || isGuest) {
      setFavoriteIds(new Set());
      setFavoriteCounts({});
      return;
    }

    try {
      setLoading(true);
      const favorites = await ProductService.getFavorites();
      console.log('[useFavorites] getFavorites result:', favorites);
      const ids = new Set(favorites.map(product => product.id));
      setFavoriteIds(ids);

      // Initialise le compteur à 1 pour chaque favori courant (utilisateur courant uniquement)
      const counts: { [productId: number]: number } = {};
      favorites.forEach(product => {
        counts[product.id] = 1;
      });
      setFavoriteCounts(counts);
    } catch (error) {
      console.error('[useFavorites] Erreur lors du chargement des favoris:', error);
      setFavoriteIds(new Set());
      setFavoriteCounts({});
    } finally {
      setLoading(false);
    }
  };

  const isFavorite = (productId: number): boolean => {
    return favoriteIds.has(productId);
  };

  const toggleFavorite = async (productId: number) => {
    try {
      const result = await ProductService.toggleFavorite(productId);

      // Met à jour la liste locale et le compteur
      setFavoriteCounts(prev => {
        const newCounts = { ...prev };
        if (result.isFavorite) {
          setFavoriteIds(prevIds => new Set([...prevIds, productId]));
          newCounts[productId] = 1;
        } else {
          setFavoriteIds(prevIds => {
            const newSet = new Set(prevIds);
            newSet.delete(productId);
            return newSet;
          });
          newCounts[productId] = 0;
        }
        return newCounts;
      });

      return result;
    } catch (error) {
      console.error('[useFavorites] Erreur lors du toggle des favoris:', error);
      throw error;
    }
  };

  useEffect(() => {
    loadFavorites();
  }, [isAuthenticated, isGuest]);

  useEffect(() => {
    if (user) {
      console.log('[useFavorites] user:', user.email || user.id, 'favoriteIds:', Array.from(favoriteIds));
    } else {
      console.log('[useFavorites] user: null', 'favoriteIds:', Array.from(favoriteIds));
    }
  }, [favoriteIds, user]);

  return {
    favoriteIds,
    isFavorite,
    favoriteCounts,
    toggleFavorite,
    loading,
    refreshFavorites: loadFavorites
  };
} 