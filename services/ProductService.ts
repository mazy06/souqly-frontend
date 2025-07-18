import ApiService from './ApiService';
import { getImageUrl, API_CONFIG } from '../constants/Config';

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  priceWithFees?: number;
  brand?: string;
  size?: string;
  condition: string;
  shippingInfo?: string;
  status: string;
  favoriteCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  sellerId: number;
  categoryId: number;
  latitude?: number;
  longitude?: number;
  locationName?: string;
  city?: string;
  country?: string;
  category?: {
    id: number;
    label: string;
    categoryKey: string;
  };
  seller?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  images?: ProductImage[];
}

export interface ProductImage {
  id: number;
  fileName: string;
  contentType: string;
}

export interface CreateProductRequest {
  title: string;
  description: string;
  price: number;
  brand?: string;
  size?: string;
  condition: string;
  shippingInfo?: string;
  categoryId: number;
  imageIds: number[];
  city?: string;
  country?: string;
  boost?: boolean;
}

export interface ProductFilters {
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  brand?: string;
  size?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'price' | 'createdAt' | 'favoriteCount';
  sortOrder?: 'asc' | 'desc';
  status?: string;
}

class ProductService {
  private baseUrl = '/products';

  // Récupérer tous les produits avec filtres optionnels
  async getProducts(filters: ProductFilters = {}): Promise<{
    content: Product[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    size: number;
  }> {
    console.log('[DEBUG] getProducts appelée avec:', filters);
    const queryParams = new URLSearchParams();
    
    if (filters.categoryId) queryParams.append('categoryId', filters.categoryId.toString());
    if (filters.minPrice) queryParams.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice.toString());
    if (filters.condition) queryParams.append('condition', filters.condition);
    if (filters.brand) queryParams.append('brand', filters.brand);
    if (filters.size) queryParams.append('size', filters.size);
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.pageSize) queryParams.append('size', filters.pageSize.toString());
    if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
    if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);
    if (filters.status) queryParams.append('status', filters.status);

    const url = `${this.baseUrl}?${queryParams.toString()}`;
    // Affiche l'URL complète appelée (pour debug)
    console.log('[DEBUG] URL getProducts:', `${API_CONFIG.baseURL}${API_CONFIG.apiPath}${url}`);
    
    try {
      const result = await ApiService.get<{
        content: Product[];
        totalElements: number;
        totalPages: number;
        currentPage: number;
        size: number;
      }>(url, false);
      // Affiche le résultat de l'API (pour debug)
      console.log('[DEBUG] Résultat getProducts:', result);
      if (result && Array.isArray(result.content)) {
        console.log('[DEBUG] Nombre de produits retournés:', result.content.length);
        // Suppression du log du premier produit pour éviter d'afficher les images base64
        // if (result.content.length > 0) {
        //   console.log('[DEBUG] Premier produit:', result.content[0]);
        // }
      } else {
        console.log('[DEBUG] Format inattendu pour result:', result);
      }
      return result;
    } catch (error) {
      console.error('[ProductService] Erreur lors de la récupération des produits:', error);
      
      // Retourner une réponse vide en cas d'erreur pour éviter le crash de l'app
      return {
        content: [],
        totalElements: 0,
        totalPages: 0,
        currentPage: 0,
        size: filters.pageSize || 20
      };
    }
  }

  // Récupérer un produit par ID
  async getProduct(id: number): Promise<Product> {
    return ApiService.get(`${this.baseUrl}/${id}`, false);
  }

  // Créer un nouveau produit
  async createProduct(productData: CreateProductRequest): Promise<Product> {
    return ApiService.post(this.baseUrl, productData, true);
  }

  // Mettre à jour un produit
  async updateProduct(id: number, productData: Partial<CreateProductRequest>): Promise<Product> {
    return ApiService.put(`${this.baseUrl}/${id}`, productData, true);
  }

  // Supprimer un produit
  async deleteProduct(id: number): Promise<void> {
    return ApiService.delete(`${this.baseUrl}/${id}`, true);
  }

  // Ajouter/retirer des favoris
  async toggleFavorite(productId: number): Promise<{ isFavorite: boolean; favoriteCount: number }> {
    return ApiService.post(`${this.baseUrl}/${productId}/favorite`, {}, true);
  }

  // Récupérer les produits favoris de l'utilisateur
  async getFavorites(): Promise<Product[]> {
    try {
      const result = await ApiService.get<Product[]>(`${this.baseUrl}/favorites`, true);
      return result;
    } catch (error) {
      console.error('[ProductService] Erreur lors de la récupération des favoris:', error);
      throw error;
    }
  }

  // Récupérer les produits de l'utilisateur connecté
  async getMyProducts(): Promise<Product[]> {
    return ApiService.get(`${this.baseUrl}/my-products`, true);
  }

  // Activer/désactiver un produit
  async toggleProductStatus(productId: number): Promise<Product> {
    return ApiService.post(`${this.baseUrl}/${productId}/toggle-status`, {}, true);
  }

  // Marquer un produit comme vendu
  async markAsSold(productId: number): Promise<Product> {
    try {
      return await ApiService.post(`${this.baseUrl}/${productId}/mark-as-sold`, {}, true);
    } catch (error) {
      console.log('⚠️ Endpoint mark-as-sold non disponible, simulation du changement de statut');
      // Simulation du changement de statut pour la démo
      return {
        id: productId,
        title: 'Produit vendu',
        description: 'Ce produit a été vendu',
        price: 0,
        condition: 'vendu',
        status: 'sold',
        favoriteCount: 0,
        viewCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sellerId: 1,
        categoryId: 1
      } as Product;
    }
  }

  // Récupérer l'URL d'une image de produit
  getImageUrl(imageId: number): string {
    return getImageUrl(imageId);
  }

  // Récupérer les images d'un produit
  async getProductImages(productId: number): Promise<ProductImage[]> {
    try {
      return await ApiService.get(`${this.baseUrl}/${productId}/images`, false);
    } catch (error) {
      return [];
    }
  }

  // Récupérer l'URL de la première image d'un produit
  
  // Récupérer les produits d'un vendeur spécifique
  async getProductsBySeller(sellerId: number): Promise<Product[]> {
    try {
      return await ApiService.get(`${this.baseUrl}/seller/${sellerId}`, false);
    } catch (error) {
      console.error('[ProductService] Erreur lors de la récupération des produits du vendeur:', error);
      return [];
    }
  }
  getProductImageUrl(product: Product): string | null {
    
    // Si les images sont déjà dans l'objet produit
    if (product.images && product.images.length > 0) {
      const imageUrl = this.getImageUrl(product.images[0].id);
      return imageUrl;
    }
    
    return null;
  }

  // Récupérer l'état favori et le compteur pour un produit
  async getFavoriteStatus(productId: number): Promise<{ isFavorite: boolean; favoriteCount: number }> {
    return ApiService.get(`${this.baseUrl}/${productId}/favorite`, true);
  }

  // Récupérer le nombre de favoris pour une liste d'IDs de produits
  async getFavoriteCounts(productIds: number[]): Promise<{ [productId: number]: number }> {
    try {
      return await ApiService.post(`${this.baseUrl}/favorite-counts`, productIds, false);
    } catch (error) {
      console.log('⚠️ Endpoint favorite-counts non disponible, utilisation des données par défaut');
      // Retourner des compteurs par défaut basés sur les IDs
      const defaultCounts: { [productId: number]: number } = {};
      productIds.forEach(id => {
        // Générer un nombre aléatoire entre 0 et 50 pour simuler des compteurs
        defaultCounts[id] = Math.floor(Math.random() * 51);
      });
      return defaultCounts;
    }
  }

  // Récupérer tous les produits via le endpoint cacheable
  async getProductsCacheable(filters: ProductFilters = {}): Promise<{
    content: Product[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    size: number;
  }> {
    const queryParams = new URLSearchParams();
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.pageSize) queryParams.append('pageSize', filters.pageSize.toString());
    const url = `${this.baseUrl}/cacheable?${queryParams.toString()}`;
    
    return ApiService.get(url, false);
  }

  // Incrémenter le compteur de vues d'un produit
  async incrementViewCount(productId: number): Promise<void> {
    try {
      await ApiService.post(`${this.baseUrl}/${productId}/increment-view`, {}, true);
    } catch (error) {
      console.error('[ProductService] Erreur lors de l\'incrémentation des vues:', error);
    }
  }
}

export default new ProductService(); 