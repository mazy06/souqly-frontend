import ApiService from './ApiService';

export interface Category {
  id: number;
  label: string;
  key: string;
  iconName?: string;
  badgeText?: string;
  parentId?: number | null;
  children?: Category[];
  active: boolean;
  sortOrder?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  label: string;
  key: string;
  iconName?: string;
  badgeText?: string;
  parentId?: number | null;
  active?: boolean;
  sortOrder?: number;
}

export interface UpdateCategoryRequest {
  label?: string;
  key?: string;
  iconName?: string;
  badgeText?: string;
  parentId?: number | null;
  active?: boolean;
  sortOrder?: number;
}

class CategoryService {
  /**
   * Récupère toutes les catégories
   */
  async getAllCategories(): Promise<Category[]> {
    return ApiService.get<Category[]>('/categories');
  }

  /**
   * Récupère l'arborescence des catégories
   */
  async getCategoryTree(): Promise<Category[]> {
    return ApiService.get<Category[]>('/categories/tree');
  }

  /**
   * Récupère l'arborescence complète des catégories (actives et inactives) - Admin uniquement
   */
  async getAllCategoryTree(): Promise<Category[]> {
    return ApiService.get<Category[]>('/categories/tree/all');
  }

  /**
   * Récupère les catégories racines
   */
  async getRootCategories(): Promise<Category[]> {
    return ApiService.get<Category[]>('/categories/root');
  }

  /**
   * Récupère une catégorie par ID
   */
  async getCategoryById(id: number): Promise<Category | null> {
    try {
      return await ApiService.get<Category>(`/categories/${id}`);
    } catch (error) {
      return null;
    }
  }

  /**
   * Crée une nouvelle catégorie
   */
  async createCategory(categoryData: CreateCategoryRequest): Promise<Category> {
    return ApiService.post<Category>('/categories', categoryData);
  }

  /**
   * Met à jour une catégorie existante
   */
  async updateCategory(id: number, categoryData: UpdateCategoryRequest): Promise<Category> {
    return ApiService.put<Category>(`/categories/${id}`, categoryData);
  }

  /**
   * Supprime une catégorie
   */
  async deleteCategory(id: number): Promise<boolean> {
    try {
      
      // Vérifier le token d'authentification
      const TokenService = (await import('./TokenService')).default;
      const token = await TokenService.getAccessToken();
      const userRole = await TokenService.getUserRole();
      
      await ApiService.delete<void>(`/categories/${id}`, true);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Déplace une catégorie vers un nouveau parent
   */
  async moveCategory(id: number, newParentId?: number): Promise<Category> {
    const params = newParentId ? `?newParentId=${newParentId}` : '';
    return ApiService.put<Category>(`/categories/${id}/move${params}`, {});
  }

  /**
   * Récupère toutes les catégories pour la sélection de parent
   */
  async getAllCategoriesForSelection(): Promise<Category[]> {
    return ApiService.get<Category[]>('/categories');
  }

  /**
   * Réorganise l'ordre des catégories
   */
  async reorderCategories(reorderRequests: Array<{id: number; sortOrder: number; parentId?: number | null}>): Promise<Category[]> {
    return ApiService.put<Category[]>('/categories/reorder', reorderRequests);
  }

  /**
   * Recherche des catégories
   */
  async searchCategories(query: string): Promise<Category[]> {
    return ApiService.get<Category[]>(`/categories/search?q=${encodeURIComponent(query)}`);
  }

  /**
   * Vérifie si une clé de catégorie existe
   */
  async existsByKey(key: string): Promise<boolean> {
    return ApiService.get<boolean>(`/categories/exists/${key}`);
  }

  /**
   * Génère une clé unique pour une catégorie
   */
  generateCategoryKey(label: string): string {
    return label
      .toLowerCase()
      .replace(/[àáâãäå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[ýÿ]/g, 'y')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '') // Garde seulement lettres, chiffres, espaces et tirets
      .replace(/\s+/g, '-') // Remplace les espaces par des tirets
      .replace(/-+/g, '-') // Supprime les tirets multiples
      .trim();
  }

  /**
   * Valide les données d'une catégorie
   */
  validateCategory(categoryData: CreateCategoryRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!categoryData.label || categoryData.label.trim().length === 0) {
      errors.push('Le nom de la catégorie est requis');
    }

    if (!categoryData.key || categoryData.key.trim().length === 0) {
      errors.push('La clé de la catégorie est requise');
    }

    if (categoryData.label && categoryData.label.length > 100) {
      errors.push('Le nom de la catégorie ne peut pas dépasser 100 caractères');
    }

    if (categoryData.key && categoryData.key.length > 50) {
      errors.push('La clé de la catégorie ne peut pas dépasser 50 caractères');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Récupère une catégorie par clé
   */
  async getCategoryByKey(key: string): Promise<Category | null> {
    try {
      return await ApiService.get<Category>(`/categories/key/${key}`);
    } catch (error) {
      return null;
    }
  }
}

export default new CategoryService(); 