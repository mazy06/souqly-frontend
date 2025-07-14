import TokenService from './TokenService';
import { API_CONFIG } from '../constants/Config';

class ApiService {
  /**
   * Effectue une requête HTTP avec gestion automatique des tokens
   */
  private async makeRequest(
    endpoint: string,
    options: RequestInit = {},
    requireAuth: boolean = true
  ): Promise<Response> {
    const url = `${API_CONFIG.baseURL}${API_CONFIG.apiPath}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    // Ajouter le token d'authentification si requis
    if (requireAuth) {
      const token = await TokenService.getAccessToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      // Si le token est expiré et qu'on a un refresh token, essayer de le renouveler
      if (response.status === 401 && requireAuth) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Réessayer la requête avec le nouveau token
          const newToken = await TokenService.getAccessToken();
          if (newToken) {
            headers.Authorization = `Bearer ${newToken}`;
            return fetch(url, { ...config, headers });
          }
        }
      }

      return response;
    } catch (error) {
      // Debug: afficher l'erreur capturée
      if (__DEV__) {
        console.log('🔍 ApiService - Erreur capturée:', error);
        console.log('🔍 ApiService - Type d\'erreur:', typeof error);
        console.log('🔍 ApiService - Message:', error instanceof Error ? error.message : String(error));
      }
      throw error;
    }
  }

  /**
   * Rafraîchit le token d'accès
   */
  private async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = await TokenService.getRefreshToken();
      if (!refreshToken) return false;

      const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.apiPath}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        const expiresAt = Date.now() + (data.expiresIn || 86400000);
        
        await TokenService.updateAccessToken(data.token, expiresAt);
        return true;
      }
    } catch (error) {
    }

    // Si le refresh échoue, supprimer les tokens
    await TokenService.clearTokens();
    return false;
  }

  /**
   * Requête GET
   */
  async get<T>(endpoint: string, requireAuth: boolean = true): Promise<T> {
    const response = await this.makeRequest(endpoint, { method: 'GET' }, requireAuth);
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Requête POST
   */
  async post<T>(endpoint: string, data: any, requireAuth: boolean = true): Promise<T> {
    const response = await this.makeRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }, requireAuth);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
    }

    // Correction : gérer les réponses vides ou non JSON
    const text = await response.text();
    if (!text) {
      return null as T;
    }
    try {
      return JSON.parse(text);
    } catch {
      return null as T;
    }
  }

  /**
   * Requête PUT
   */
  async put<T>(endpoint: string, data: any, requireAuth: boolean = true): Promise<T> {
    const response = await this.makeRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, requireAuth);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Requête DELETE
   */
  async delete<T>(endpoint: string, requireAuth: boolean = true): Promise<T> {
    const response = await this.makeRequest(endpoint, { method: 'DELETE' }, requireAuth);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
    }

    // Pour les réponses 204 (No Content), ne pas essayer de parser le JSON
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  /**
   * Méthodes spécifiques pour l'authentification
   */
  async login(email: string, password: string) {
    const data = await this.post<any>('/auth/login', { email, password }, false);
    
    // Sauvegarder les tokens
    if (data.token && data.refreshToken) {
      const expiresAt = Date.now() + (data.expiresIn || 86400000);
      await TokenService.saveTokens({
        accessToken: data.token,
        refreshToken: data.refreshToken,
        expiresAt,
        userId: data.user.id.toString(),
        userRole: data.user.role.toLowerCase(),
      });
    }

    return data;
  }

  async register(email: string, password: string, firstName: string, lastName: string) {
    const data = await this.post<any>('/auth/register', { 
      email, 
      password, 
      firstName, 
      lastName 
    }, false);
    
    // Sauvegarder les tokens
    if (data.token && data.refreshToken) {
      const expiresAt = Date.now() + (data.expiresIn || 86400000);
      await TokenService.saveTokens({
        accessToken: data.token,
        refreshToken: data.refreshToken,
        expiresAt,
        userId: data.user.id.toString(),
        userRole: data.user.role.toLowerCase(),
      });
    }

    return data;
  }

  async logout() {
    try {
      // Appeler l'endpoint de logout du backend si nécessaire
      await this.post('/auth/logout', {}, true);
    } catch (error) {
    } finally {
      // Toujours supprimer les tokens locaux
      await TokenService.clearTokens();
    }
  }

  /**
   * Méthodes pour les catégories
   */
  async getCategories() {
    return this.get('/categories');
  }

  async createCategory(categoryData: any) {
    return this.post('/categories', categoryData);
  }

  async updateCategory(id: number, categoryData: any) {
    return this.put(`/categories/${id}`, categoryData);
  }

  async deleteCategory(id: number) {
    return this.delete(`/categories/${id}`);
  }

  /**
   * Méthodes pour les utilisateurs
   */
  async getCurrentUser() {
    return this.get('/auth/me');
  }

  async updateProfile(userData: any) {
    return this.put('/users/profile', userData);
  }
}

export default new ApiService(); 