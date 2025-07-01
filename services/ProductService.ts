import ApiService from './ApiService';
import { getImageUrl } from '../constants/Config';

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

    const url = `${this.baseUrl}?${queryParams.toString()}`;
    const result = await ApiService.get<{
      content: Product[];
      totalElements: number;
      totalPages: number;
      currentPage: number;
      size: number;
    }>(url, false);
    return result;
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
    return ApiService.get(`${this.baseUrl}/favorites`, true);
  }

  // Récupérer les produits de l'utilisateur connecté
  async getMyProducts(): Promise<Product[]> {
    return ApiService.get(`${this.baseUrl}/my-products`, true);
  }

  // Activer/désactiver un produit
  async toggleProductStatus(productId: number): Promise<Product> {
    return ApiService.post(`${this.baseUrl}/${productId}/toggle-status`, {}, true);
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
  getProductImageUrl(product: Product): string | null {
    
    // Si les images sont déjà dans l'objet produit
    if (product.images && product.images.length > 0) {
      const imageUrl = this.getImageUrl(product.images[0].id);
      return imageUrl;
    }
    
    return null;
  }
}

export default new ProductService(); 