import ApiService from './ApiService';

export interface SearchFilters {
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  categoryId?: number;
  condition?: string;
  brand?: string;
  size?: string;
  city?: string;
  country?: string;
}

export interface SearchResult {
  content: any[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}

export interface Suggestion {
  id: string;
  title: string;
  brand?: string;
  categoryName?: string;
}

class SearchService {
  /**
   * Recherche simple de produits
   */
  async searchProducts(query?: string, page: number = 0, size: number = 20): Promise<SearchResult> {
    try {
      const params = new URLSearchParams();
      if (query) params.append('query', query);
      params.append('page', page.toString());
      params.append('size', size.toString());

      const response = await ApiService.get(`/search/products?${params.toString()}`);
      return response as SearchResult;
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      throw error;
    }
  }

  /**
   * Recherche avec filtres avancés
   */
  async searchProductsWithFilters(filters: SearchFilters, page: number = 0, size: number = 20): Promise<SearchResult> {
    try {
      const params = new URLSearchParams();
      
      if (filters.query) params.append('query', filters.query);
      if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
      if (filters.categoryId) params.append('categoryId', filters.categoryId.toString());
      if (filters.condition) params.append('condition', filters.condition);
      if (filters.brand) params.append('brand', filters.brand);
      if (filters.size) params.append('size', filters.size);
      if (filters.city) params.append('city', filters.city);
      if (filters.country) params.append('country', filters.country);
      
      params.append('page', page.toString());
      params.append('size', size.toString());

      const response = await ApiService.get(`/search/products/filtered?${params.toString()}`);
      return response as SearchResult;
    } catch (error) {
      console.error('Erreur lors de la recherche avec filtres:', error);
      throw error;
    }
  }

  /**
   * Recherche par catégorie
   */
  async searchByCategory(categoryId: number, page: number = 0, size: number = 20): Promise<SearchResult> {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('size', size.toString());

      const response = await ApiService.get(`/search/products/category/${categoryId}?${params.toString()}`);
      return response as SearchResult;
    } catch (error) {
      console.error('Erreur lors de la recherche par catégorie:', error);
      throw error;
    }
  }

  /**
   * Recherche par vendeur
   */
  async searchBySeller(sellerId: number, page: number = 0, size: number = 20): Promise<SearchResult> {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('size', size.toString());

      const response = await ApiService.get(`/search/products/seller/${sellerId}?${params.toString()}`);
      return response as SearchResult;
    } catch (error) {
      console.error('Erreur lors de la recherche par vendeur:', error);
      throw error;
    }
  }

  /**
   * Recherche par ville
   */
  async searchByCity(city: string, page: number = 0, size: number = 20): Promise<SearchResult> {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('size', size.toString());

      const response = await ApiService.get(`/search/products/city/${encodeURIComponent(city)}?${params.toString()}`);
      return response as SearchResult;
    } catch (error) {
      console.error('Erreur lors de la recherche par ville:', error);
      throw error;
    }
  }

  /**
   * Recherche par marque
   */
  async searchByBrand(brand: string, page: number = 0, size: number = 20): Promise<SearchResult> {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('size', size.toString());

      const response = await ApiService.get(`/search/products/brand/${encodeURIComponent(brand)}?${params.toString()}`);
      return response as SearchResult;
    } catch (error) {
      console.error('Erreur lors de la recherche par marque:', error);
      throw error;
    }
  }

  /**
   * Recherche par condition
   */
  async searchByCondition(condition: string, page: number = 0, size: number = 20): Promise<SearchResult> {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('size', size.toString());

      const response = await ApiService.get(`/search/products/condition/${encodeURIComponent(condition)}?${params.toString()}`);
      return response as SearchResult;
    } catch (error) {
      console.error('Erreur lors de la recherche par condition:', error);
      throw error;
    }
  }

  /**
   * Recherche par gamme de prix
   */
  async searchByPriceRange(minPrice: number, maxPrice: number, page: number = 0, size: number = 20): Promise<SearchResult> {
    try {
      const params = new URLSearchParams();
      params.append('minPrice', minPrice.toString());
      params.append('maxPrice', maxPrice.toString());
      params.append('page', page.toString());
      params.append('size', size.toString());

      const response = await ApiService.get(`/search/products/price-range?${params.toString()}`);
      return response as SearchResult;
    } catch (error) {
      console.error('Erreur lors de la recherche par gamme de prix:', error);
      throw error;
    }
  }

  /**
   * Suggestions (autocomplete)
   */
  async getSuggestions(query: string, size: number = 5): Promise<Suggestion[]> {
    try {
      const params = new URLSearchParams();
      params.append('query', query);
      params.append('size', size.toString());

      const response = await ApiService.get(`/search/suggestions?${params.toString()}`);
      return response as Suggestion[];
    } catch (error) {
      console.error('Erreur lors de la récupération des suggestions:', error);
      throw error;
    }
  }

  /**
   * Produits populaires
   */
  async getPopularProducts(page: number = 0, size: number = 20): Promise<SearchResult> {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('size', size.toString());

      const response = await ApiService.get(`/search/products/popular?${params.toString()}`);
      return response as SearchResult;
    } catch (error) {
      console.error('Erreur lors de la récupération des produits populaires:', error);
      throw error;
    }
  }

  /**
   * Produits récents
   */
  async getRecentProducts(page: number = 0, size: number = 20): Promise<SearchResult> {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('size', size.toString());

      const response = await ApiService.get(`/search/products/recent?${params.toString()}`);
      return response as SearchResult;
    } catch (error) {
      console.error('Erreur lors de la récupération des produits récents:', error);
      throw error;
    }
  }

  /**
   * Recherche par tags
   */
  async searchByTags(tag: string, page: number = 0, size: number = 20): Promise<SearchResult> {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('size', size.toString());

      const response = await ApiService.get(`/search/products/tags/${encodeURIComponent(tag)}?${params.toString()}`);
      return response as SearchResult;
    } catch (error) {
      console.error('Erreur lors de la recherche par tags:', error);
      throw error;
    }
  }
}

export default new SearchService(); 