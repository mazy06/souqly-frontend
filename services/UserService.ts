import ApiService from './ApiService';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'MODERATOR';
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
  createdAt: string;
  lastLoginAt?: string;
  productsCount: number;
  rating: number;
}

export interface UserFilters {
  search?: string;
  status?: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
  role?: 'USER' | 'ADMIN' | 'MODERATOR';
  page?: number;
  size?: number;
}

export interface UserActionRequest {
  action: 'suspend' | 'ban' | 'activate' | 'promote' | 'demote';
  reason?: string;
}

export interface CreateModeratorRequest {
  email: string;
  reason?: string;
}

class UserService {
  private static instance: UserService;

  private constructor() {}

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  /**
   * Récupérer tous les utilisateurs avec filtres optionnels
   */
  async getUsers(filters: UserFilters = {}): Promise<{
    content: User[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    size: number;
  }> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.role) queryParams.append('role', filters.role);
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.size) queryParams.append('size', filters.size.toString());

      const url = `/users?${queryParams.toString()}`;
      const response = await ApiService.get<any>(url, true);
      
      // Gérer les deux formats de réponse possibles
      if (Array.isArray(response)) {
        // Format direct : [users]
        return {
          content: response,
          totalElements: response.length,
          totalPages: 1,
          currentPage: 0,
          size: response.length
        };
      } else if (response.content) {
        // Format paginé : {content: [users], ...}
        return response;
      } else {
        // Fallback
        return {
          content: [],
          totalElements: 0,
          totalPages: 0,
          currentPage: 0,
          size: 0
        };
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      throw error;
    }
  }

  /**
   * Récupérer un utilisateur par ID
   */
  async getUser(id: number): Promise<User> {
    try {
      const response = await ApiService.get<User>(`/admin/users/${id}`, true);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      throw error;
    }
  }

  /**
   * Effectuer une action sur un utilisateur
   */
  async performUserAction(userId: number, action: UserActionRequest): Promise<User> {
    try {
      const response = await ApiService.post<User>(`/admin/users/${userId}/action`, action, true);
      return response;
    } catch (error) {
      console.error('Erreur lors de l\'action sur l\'utilisateur:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour le statut d'un utilisateur
   */
  async updateUserStatus(userId: number, status: 'ACTIVE' | 'SUSPENDED' | 'BANNED'): Promise<User> {
    try {
      const response = await ApiService.put<User>(`/admin/users/${userId}/status`, { status }, true);
      return response;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour le rôle d'un utilisateur
   */
  async updateUserRole(userId: number, role: 'USER' | 'ADMIN' | 'MODERATOR'): Promise<User> {
    try {
      const response = await ApiService.put<User>(`/admin/users/${userId}/role`, { role }, true);
      return response;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rôle:', error);
      throw error;
    }
  }

  /**
   * Récupérer les statistiques des utilisateurs
   */
  async getUserStats(): Promise<{
    total: number;
    active: number;
    suspended: number;
    banned: number;
    byRole: Record<string, number>;
  }> {
    try {
      const response = await ApiService.get<{
        total: number;
        active: number;
        suspended: number;
        banned: number;
        byRole: Record<string, number>;
      }>('/admin/users/stats', true);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }

  /**
   * Supprimer un utilisateur
   */
  async deleteUser(userId: number): Promise<void> {
    try {
      await ApiService.delete(`/admin/users/${userId}`, true);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      throw error;
    }
  }

  /**
   * Créer un modérateur (admin seulement)
   */
  async createModerator(request: CreateModeratorRequest): Promise<User> {
    try {
      const response = await ApiService.post<User>('/admin/users/moderators', request, true);
      return response;
    } catch (error) {
      console.error('Erreur lors de la création du modérateur:', error);
      throw error;
    }
  }
}

export default UserService.getInstance(); 