import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';

// Configuration des providers OAuth2
const AUTH_CONFIG = {
  // Google OAuth2
  google: {
    clientId: 'YOUR_GOOGLE_CLIENT_ID', // À remplacer par ton Client ID Google
    clientSecret: 'YOUR_GOOGLE_CLIENT_SECRET', // À remplacer par ton Client Secret Google
    redirectUri: AuthSession.makeRedirectUri({
      scheme: 'souqly',
      path: 'auth/google'
    }),
    scopes: ['openid', 'profile', 'email'],
    discovery: {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
      revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
    }
  },
  
  // Facebook OAuth2
  facebook: {
    clientId: 'YOUR_FACEBOOK_APP_ID', // À remplacer par ton App ID Facebook
    redirectUri: AuthSession.makeRedirectUri({
      scheme: 'souqly',
      path: 'auth/facebook'
    }),
    scopes: ['public_profile', 'email'],
    discovery: {
      authorizationEndpoint: 'https://www.facebook.com/v12.0/dialog/oauth',
      tokenEndpoint: 'https://graph.facebook.com/v12.0/oauth/access_token',
    }
  },
  
  // Apple Sign In
  apple: {
    clientId: 'com.souqly.app', // Bundle ID de ton app
    redirectUri: AuthSession.makeRedirectUri({
      scheme: 'souqly',
      path: 'auth/apple'
    }),
    scopes: ['name', 'email'],
    discovery: {
      authorizationEndpoint: 'https://appleid.apple.com/auth/authorize',
      tokenEndpoint: 'https://appleid.apple.com/auth/token',
    }
  }
};

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  provider: 'google' | 'facebook' | 'apple' | 'email';
  role?: 'admin' | 'user';
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

class AuthService {
  // Authentification Google
  async signInWithGoogle(): Promise<AuthResult> {
    try {
      const request = new AuthSession.AuthRequest({
        clientId: AUTH_CONFIG.google.clientId,
        scopes: AUTH_CONFIG.google.scopes,
        redirectUri: AUTH_CONFIG.google.redirectUri,
        responseType: AuthSession.ResponseType.Code,
        extraParams: {
          access_type: 'offline',
        },
      });

      const result = await request.promptAsync(AUTH_CONFIG.google.discovery);
      
      if (result.type === 'success') {
        // Échanger le code contre un token
        const tokenResult = await AuthSession.exchangeCodeAsync(
          {
            clientId: AUTH_CONFIG.google.clientId,
            clientSecret: AUTH_CONFIG.google.clientSecret,
            code: result.params.code,
            redirectUri: AUTH_CONFIG.google.redirectUri,
            extraParams: {
              code_verifier: request.codeVerifier!,
            },
          },
          AUTH_CONFIG.google.discovery
        );

        // Récupérer les informations utilisateur
        const userInfo = await this.getGoogleUserInfo(tokenResult.accessToken);
        
        return {
          success: true,
          user: {
            id: userInfo.id,
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture,
            provider: 'google'
          }
        };
      }
      
      return { success: false, error: 'Authentication cancelled' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Authentification Facebook
  async signInWithFacebook(): Promise<AuthResult> {
    try {
      const request = new AuthSession.AuthRequest({
        clientId: AUTH_CONFIG.facebook.clientId,
        scopes: AUTH_CONFIG.facebook.scopes,
        redirectUri: AUTH_CONFIG.facebook.redirectUri,
        responseType: AuthSession.ResponseType.Code,
      });

      const result = await request.promptAsync(AUTH_CONFIG.facebook.discovery);
      
      if (result.type === 'success') {
        // Échanger le code contre un token
        const tokenResult = await AuthSession.exchangeCodeAsync(
          {
            clientId: AUTH_CONFIG.facebook.clientId,
            code: result.params.code,
            redirectUri: AUTH_CONFIG.facebook.redirectUri,
            extraParams: {
              code_verifier: request.codeVerifier!,
            },
          },
          AUTH_CONFIG.facebook.discovery
        );

        // Récupérer les informations utilisateur
        const userInfo = await this.getFacebookUserInfo(tokenResult.accessToken);
        
        return {
          success: true,
          user: {
            id: userInfo.id,
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture?.data?.url,
            provider: 'facebook'
          }
        };
      }
      
      return { success: false, error: 'Authentication cancelled' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Authentification Apple
  async signInWithApple(): Promise<AuthResult> {
    try {
      const nonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        Math.random().toString(36),
        { encoding: Crypto.CryptoEncoding.HEX }
      );

      const request = new AuthSession.AuthRequest({
        clientId: AUTH_CONFIG.apple.clientId,
        scopes: AUTH_CONFIG.apple.scopes,
        redirectUri: AUTH_CONFIG.apple.redirectUri,
        responseType: AuthSession.ResponseType.Code,
        extraParams: {
          response_mode: 'form_post',
          nonce: nonce,
        },
      });

      const result = await request.promptAsync(AUTH_CONFIG.apple.discovery);
      
      if (result.type === 'success') {
        // Pour Apple, nous devons traiter le token différemment
        // car Apple renvoie un JWT directement
        const userInfo = await this.getAppleUserInfo(result.params);
        
        return {
          success: true,
          user: {
            id: userInfo.sub,
            email: userInfo.email,
            name: userInfo.name,
            provider: 'apple'
          }
        };
      }
      
      return { success: false, error: 'Authentication cancelled' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Récupérer les informations utilisateur Google
  private async getGoogleUserInfo(accessToken: string) {
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`
    );
    return await response.json();
  }

  // Récupérer les informations utilisateur Facebook
  private async getFacebookUserInfo(accessToken: string) {
    const response = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`
    );
    return await response.json();
  }

  // Traiter les informations utilisateur Apple
  private async getAppleUserInfo(params: any) {
    // Apple renvoie un JWT dans id_token
    // Dans une vraie app, tu devrais vérifier ce JWT côté serveur
    // Pour cet exemple, on va simuler
    return {
      sub: params.user || 'apple_user_id',
      email: params.email || 'user@example.com',
      name: params.name || 'Apple User'
    };
  }

  // Authentification par email (simulation)
  async signInWithEmail(email: string, password: string): Promise<AuthResult> {
    try {
      // Simulation d'une authentification par email
      // Dans une vraie app, tu ferais un appel API vers ton backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        user: {
          id: `email_${Date.now()}`,
          email: email,
          name: email.split('@')[0],
          provider: 'email'
        }
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Inscription par email (simulation)
  async signUpWithEmail(email: string, password: string, name: string): Promise<AuthResult> {
    try {
      // Simulation d'une inscription par email
      // Dans une vraie app, tu ferais un appel API vers ton backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        user: {
          id: `email_${Date.now()}`,
          email: email,
          name: name,
          provider: 'email'
        }
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

export default new AuthService(); 