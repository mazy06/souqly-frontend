export enum AuthErrorType {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  INVALID_INPUT = 'INVALID_INPUT',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}

export interface AuthError {
  type: AuthErrorType;
  message: string;
  code?: number;
  timestamp?: string;
}

export class ErrorService {
  /**
   * Analyse une réponse d'erreur du backend et retourne une erreur typée
   */
  static parseApiError(response: Response, errorData?: any): AuthError {
    const status = response.status;
    
    // Si on a des données d'erreur du backend
    if (errorData && errorData.code) {
      return {
        type: this.mapErrorCodeToType(errorData.code),
        message: errorData.message || 'Erreur inconnue',
        code: status,
        timestamp: errorData.timestamp
      };
    }
    
    // Sinon, on se base sur le code HTTP
    return {
      type: this.mapHttpStatusToType(status),
      message: this.getDefaultMessage(status),
      code: status
    };
  }

  /**
   * Mappe les codes d'erreur du backend vers les types d'erreur frontend
   */
  private static mapErrorCodeToType(code: string): AuthErrorType {
    switch (code) {
      case 'INVALID_CREDENTIALS':
        return AuthErrorType.INVALID_CREDENTIALS;
      case 'TOKEN_EXPIRED':
        return AuthErrorType.TOKEN_EXPIRED;
      case 'USER_NOT_FOUND':
        return AuthErrorType.USER_NOT_FOUND;
      case 'INVALID_INPUT':
        return AuthErrorType.INVALID_INPUT;
      case 'INTERNAL_ERROR':
        return AuthErrorType.SERVER_ERROR;
      default:
        return AuthErrorType.SERVER_ERROR;
    }
  }

  /**
   * Mappe les codes HTTP vers les types d'erreur
   */
  private static mapHttpStatusToType(status: number): AuthErrorType {
    switch (status) {
      case 400:
        return AuthErrorType.INVALID_INPUT;
      case 401:
        return AuthErrorType.INVALID_CREDENTIALS;
      case 404:
        return AuthErrorType.USER_NOT_FOUND;
      case 500:
        return AuthErrorType.SERVER_ERROR;
      default:
        return AuthErrorType.NETWORK_ERROR;
    }
  }

  /**
   * Retourne un message d'erreur par défaut selon le code HTTP
   */
  private static getDefaultMessage(status: number): string {
    switch (status) {
      case 400:
        return 'Données invalides';
      case 401:
        return 'Non autorisé';
      case 403:
        return 'Accès interdit';
      case 404:
        return 'Ressource non trouvée';
      case 500:
        return 'Erreur serveur';
      case 502:
        return 'Erreur de passerelle';
      case 503:
        return 'Service indisponible';
      default:
        return 'Erreur de connexion';
    }
  }

  /**
   * Gère les erreurs de réseau
   */
  static handleNetworkError(error: any): AuthError {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        type: AuthErrorType.NETWORK_ERROR,
        message: 'Erreur de connexion réseau. Vérifiez votre connexion internet.',
        code: 0
      };
    }
    
    return {
      type: AuthErrorType.NETWORK_ERROR,
      message: 'Erreur de connexion',
      code: 0
    };
  }

  /**
   * Retourne un message utilisateur-friendly selon le type d'erreur
   */
  static getUserFriendlyMessage(error: AuthError): string {
    switch (error.type) {
      case AuthErrorType.INVALID_CREDENTIALS:
        return 'Email ou mot de passe incorrect';
      case AuthErrorType.TOKEN_EXPIRED:
        return 'Session expirée. Veuillez vous reconnecter.';
      case AuthErrorType.NETWORK_ERROR:
        return 'Erreur de connexion. Vérifiez votre connexion internet.';
      case AuthErrorType.USER_NOT_FOUND:
        return 'Utilisateur non trouvé';
      case AuthErrorType.INVALID_INPUT:
        return 'Données invalides. Vérifiez vos informations.';
      case AuthErrorType.SERVER_ERROR:
        return 'Erreur serveur. Veuillez réessayer plus tard.';
      default:
        return error.message || 'Une erreur inattendue s\'est produite';
    }
  }

  /**
   * Détermine si une erreur nécessite une déconnexion
   */
  static shouldLogout(error: AuthError): boolean {
    return error.type === AuthErrorType.TOKEN_EXPIRED || 
           error.type === AuthErrorType.INVALID_CREDENTIALS;
  }

  /**
   * Détermine si une erreur nécessite un retry
   */
  static shouldRetry(error: AuthError): boolean {
    return error.type === AuthErrorType.NETWORK_ERROR || 
           error.type === AuthErrorType.SERVER_ERROR;
  }
}

export default ErrorService; 