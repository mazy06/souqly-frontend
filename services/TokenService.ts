import AsyncStorage from '@react-native-async-storage/async-storage';

export interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Timestamp en millisecondes
  userId: string;
  userRole: string;
}

class TokenService {
  private static readonly ACCESS_TOKEN_KEY = '@souqly_access_token';
  private static readonly REFRESH_TOKEN_KEY = '@souqly_refresh_token';
  private static readonly TOKEN_EXPIRY_KEY = '@souqly_token_expiry';
  private static readonly USER_ID_KEY = '@souqly_user_id';
  private static readonly USER_ROLE_KEY = '@souqly_user_role';

  /**
   * Sauvegarde les tokens et informations utilisateur
   */
  async saveTokens(tokenData: TokenData): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem(TokenService.ACCESS_TOKEN_KEY, tokenData.accessToken),
        AsyncStorage.setItem(TokenService.REFRESH_TOKEN_KEY, tokenData.refreshToken),
        AsyncStorage.setItem(TokenService.TOKEN_EXPIRY_KEY, tokenData.expiresAt.toString()),
        AsyncStorage.setItem(TokenService.USER_ID_KEY, tokenData.userId),
        AsyncStorage.setItem(TokenService.USER_ROLE_KEY, tokenData.userRole),
      ]);
    } catch (error) {
      throw new Error('Impossible de sauvegarder les tokens');
    }
  }

  /**
   * Récupère le token d'accès
   */
  async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TokenService.ACCESS_TOKEN_KEY);
    } catch (error) {
      return null;
    }
  }

  /**
   * Récupère le refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TokenService.REFRESH_TOKEN_KEY);
    } catch (error) {
      return null;
    }
  }

  /**
   * Récupère toutes les données de token
   */
  async getTokenData(): Promise<TokenData | null> {
    try {
      const [accessToken, refreshToken, expiresAt, userId, userRole] = await Promise.all([
        AsyncStorage.getItem(TokenService.ACCESS_TOKEN_KEY),
        AsyncStorage.getItem(TokenService.REFRESH_TOKEN_KEY),
        AsyncStorage.getItem(TokenService.TOKEN_EXPIRY_KEY),
        AsyncStorage.getItem(TokenService.USER_ID_KEY),
        AsyncStorage.getItem(TokenService.USER_ROLE_KEY),
      ]);

      if (!accessToken || !refreshToken || !expiresAt || !userId || !userRole) {
        return null;
      }

      return {
        accessToken,
        refreshToken,
        expiresAt: parseInt(expiresAt, 10),
        userId,
        userRole,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Vérifie si le token d'accès est expiré
   */
  async isTokenExpired(): Promise<boolean> {
    try {
      const expiresAt = await AsyncStorage.getItem(TokenService.TOKEN_EXPIRY_KEY);
      if (!expiresAt) return true;

      const expiryTime = parseInt(expiresAt, 10);
      const currentTime = Date.now();
      
      // Considère le token comme expiré 5 minutes avant sa vraie expiration
      return currentTime >= (expiryTime - 5 * 60 * 1000);
    } catch (error) {
      return true;
    }
  }

  /**
   * Vérifie si l'utilisateur est connecté (a des tokens valides)
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const tokenData = await this.getTokenData();
      
      if (!tokenData) {
        return false;
      }

      const isExpired = await this.isTokenExpired();
      
      return !isExpired;
    } catch (error) {
      return false;
    }
  }

  /**
   * Supprime tous les tokens et données utilisateur
   */
  async clearTokens(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(TokenService.ACCESS_TOKEN_KEY),
        AsyncStorage.removeItem(TokenService.REFRESH_TOKEN_KEY),
        AsyncStorage.removeItem(TokenService.TOKEN_EXPIRY_KEY),
        AsyncStorage.removeItem(TokenService.USER_ID_KEY),
        AsyncStorage.removeItem(TokenService.USER_ROLE_KEY),
      ]);
    } catch (error) {
      throw new Error('Impossible de supprimer les tokens');
    }
  }

  /**
   * Met à jour le token d'accès (pour le refresh)
   */
  async updateAccessToken(newAccessToken: string, newExpiresAt: number): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem(TokenService.ACCESS_TOKEN_KEY, newAccessToken),
        AsyncStorage.setItem(TokenService.TOKEN_EXPIRY_KEY, newExpiresAt.toString()),
      ]);
    } catch (error) {
      throw new Error('Impossible de mettre à jour le token d\'accès');
    }
  }

  /**
   * Récupère l'ID de l'utilisateur
   */
  async getUserId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TokenService.USER_ID_KEY);
    } catch (error) {
      return null;
    }
  }

  /**
   * Récupère le rôle de l'utilisateur
   */
  async getUserRole(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TokenService.USER_ROLE_KEY);
    } catch (error) {
      return null;
    }
  }
}

export default new TokenService(); 