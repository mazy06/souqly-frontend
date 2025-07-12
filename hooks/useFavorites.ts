import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProductService from '../services/ProductService';

export function useFavorites() {
  const { isAuthenticated, isGuest } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);

  const loadFavorites = async () => {
    if (!isAuthenticated || isGuest) {
      setFavoriteIds(new Set());
      return;
    }

    try {
      setLoading(true);
      const favorites = await ProductService.getFavorites();
      const ids = new Set(favorites.map(product => product.id));
      setFavoriteIds(ids);
    } catch (error) {
      console.error('[useFavorites] Erreur lors du chargement des favoris:', error);
      setFavoriteIds(new Set());
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
      
      // Mettre à jour la liste locale
      if (result.isFavorite) {
        setFavoriteIds(prev => new Set([...prev, productId]));
      } else {
        setFavoriteIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
      }
      
      return result;
    } catch (error) {
      console.error('[useFavorites] Erreur lors du toggle des favoris:', error);
      throw error;
    }
  };

  useEffect(() => {
    loadFavorites();
  }, [isAuthenticated, isGuest]);

  return {
    favoriteIds,
    isFavorite,
    toggleFavorite,
    loading,
    refreshFavorites: loadFavorites
  };
} 