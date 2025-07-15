import ApiService from './ApiService';

export interface WalletBalance {
  balance: number;
  upcomingAmount: number;
}

export interface WalletOperation {
  id: string;
  type: 'earning' | 'expense' | 'transfer';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'cancelled';
}

export interface WalletStats {
  totalEarnings: number;
  totalExpenses: number;
  totalTransfers: number;
  monthlyEarnings: number;
  monthlyExpenses: number;
}

class WalletService {
  /**
   * Récupère le solde du portefeuille de l'utilisateur
   */
  static async getBalance(userId: string): Promise<WalletBalance> {
    try {
      const response = await ApiService.get(`/users/${userId}/wallet/balance`) as WalletBalance;
      return response;
    } catch (error) {
      console.log('⚠️ Endpoint wallet/balance non disponible, utilisation des données par défaut');
      // Retourner des valeurs par défaut en cas d'erreur
      return {
        balance: 0,
        upcomingAmount: 0
      };
    }
  }

  /**
   * Récupère les opérations du portefeuille
   */
  static async getOperations(userId: string, filter?: string): Promise<WalletOperation[]> {
    try {
      const params = filter && filter !== 'all' ? `?type=${filter}` : '';
      const response = await ApiService.get(`/users/${userId}/wallet/operations${params}`) as WalletOperation[];
      return response;
    } catch (error) {
      console.log('⚠️ Endpoint wallet/operations non disponible, utilisation des données par défaut');
      // Retourner des données d'exemple pour la démo
      return [
        {
          id: '1',
          type: 'earning',
          amount: 150.00,
          description: 'Vente - iPhone 13 Pro',
          date: new Date().toISOString(),
          status: 'completed'
        },
        {
          id: '2',
          type: 'earning',
          amount: 75.50,
          description: 'Vente - AirPods Pro',
          date: new Date(Date.now() - 86400000).toISOString(), // Hier
          status: 'completed'
        },
        {
          id: '3',
          type: 'expense',
          amount: 25.00,
          description: 'Commission de vente',
          date: new Date(Date.now() - 172800000).toISOString(), // Il y a 2 jours
          status: 'completed'
        }
      ];
    }
  }

  /**
   * Récupère les statistiques du portefeuille
   */
  static async getStats(userId: string): Promise<WalletStats> {
    try {
      const response = await ApiService.get(`/users/${userId}/wallet/stats`) as WalletStats;
      return response;
    } catch (error) {
      console.log('⚠️ Endpoint wallet/stats non disponible, utilisation des données par défaut');
      return {
        totalEarnings: 0,
        totalExpenses: 0,
        totalTransfers: 0,
        monthlyEarnings: 0,
        monthlyExpenses: 0
      };
    }
  }

  /**
   * Effectue un transfert depuis le portefeuille
   */
  static async transfer(userId: string, amount: number, destination: string): Promise<boolean> {
    try {
      await ApiService.post(`/users/${userId}/wallet/transfer`, {
        amount,
        destination
      });
      return true;
    } catch (error) {
      console.error('Erreur lors du transfert:', error);
      return false;
    }
  }

  /**
   * Récupère l'historique des ventes pour calculer les revenus
   */
  static async getSalesHistory(userId: string): Promise<any[]> {
    try {
      const response = await ApiService.get(`/users/${userId}/sales`) as any[];
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique des ventes:', error);
      return [];
    }
  }
}

export default WalletService; 