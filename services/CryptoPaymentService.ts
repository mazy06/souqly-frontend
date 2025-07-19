import AsyncStorage from '@react-native-async-storage/async-storage';

interface CryptoWallet {
  id: string;
  address: string;
  balance: {
    [currency: string]: number;
  };
  currency: 'BTC' | 'ETH' | 'USDT' | 'USDC' | 'SOL';
  isConnected: boolean;
  lastSync: number;
}

interface CryptoTransaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'failed' | 'cancelled';
  timestamp: number;
  gasFee?: number;
  blockNumber?: number;
  txHash?: string;
}

interface CryptoPayment {
  id: string;
  productId: string;
  amount: number;
  currency: string;
  walletAddress: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  timestamp: number;
  transactionId?: string;
  gasEstimate?: number;
}

interface CryptoRate {
  currency: string;
  rate: number;
  lastUpdated: number;
}

interface DeFiPool {
  id: string;
  name: string;
  tokens: string[];
  liquidity: number;
  apy: number;
  risk: 'low' | 'medium' | 'high';
}

class CryptoPaymentService {
  private static instance: CryptoPaymentService;
  private wallets: Map<string, CryptoWallet> = new Map();
  private transactions: CryptoTransaction[] = [];
  private payments: CryptoPayment[] = [];
  private rates: Map<string, CryptoRate> = new Map();
  private defiPools: DeFiPool[] = [];
  private isInitialized = false;

  private constructor() {}

  static getInstance(): CryptoPaymentService {
    if (!CryptoPaymentService.instance) {
      CryptoPaymentService.instance = new CryptoPaymentService();
    }
    return CryptoPaymentService.instance;
  }

  /**
   * Initialise le service de paiements crypto
   */
  async initialize(): Promise<void> {
    try {
      console.log('₿ [CryptoPaymentService] Initialisation...');
      
      // Charger les données existantes
      await this.loadStoredData();
      
      // Initialiser les taux de change
      await this.initializeExchangeRates();
      
      // Charger les pools DeFi
      await this.loadDeFiPools();
      
      this.isInitialized = true;
      console.log('✅ [CryptoPaymentService] Initialisation terminée');
    } catch (error) {
      console.error('❌ [CryptoPaymentService] Erreur d\'initialisation:', error);
      throw error;
    }
  }

  /**
   * Charge les données stockées
   */
  private async loadStoredData(): Promise<void> {
    try {
      const [walletsData, transactionsData, paymentsData] = await Promise.all([
        AsyncStorage.getItem('crypto_wallets'),
        AsyncStorage.getItem('crypto_transactions'),
        AsyncStorage.getItem('crypto_payments')
      ]);

      if (walletsData) {
        const wallets = JSON.parse(walletsData);
        wallets.forEach((wallet: CryptoWallet) => {
          this.wallets.set(wallet.id, wallet);
        });
      }

      if (transactionsData) {
        this.transactions = JSON.parse(transactionsData);
      }

      if (paymentsData) {
        this.payments = JSON.parse(paymentsData);
      }

      console.log(`📊 [CryptoPaymentService] Données chargées: ${this.wallets.size} wallets, ${this.transactions.length} transactions, ${this.payments.length} payments`);
    } catch (error) {
      console.error('❌ [CryptoPaymentService] Erreur chargement données:', error);
    }
  }

  /**
   * Sauvegarde les données
   */
  private async saveData(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem('crypto_wallets', JSON.stringify(Array.from(this.wallets.values()))),
        AsyncStorage.setItem('crypto_transactions', JSON.stringify(this.transactions)),
        AsyncStorage.setItem('crypto_payments', JSON.stringify(this.payments))
      ]);
    } catch (error) {
      console.error('❌ [CryptoPaymentService] Erreur sauvegarde données:', error);
    }
  }

  /**
   * Initialise les taux de change
   */
  private async initializeExchangeRates(): Promise<void> {
    try {
      // Simuler les taux de change actuels
      const rates = [
        { currency: 'BTC', rate: 45000 },
        { currency: 'ETH', rate: 3200 },
        { currency: 'USDT', rate: 1.0 },
        { currency: 'USDC', rate: 1.0 },
        { currency: 'SOL', rate: 95 }
      ];

      rates.forEach(rate => {
        this.rates.set(rate.currency, {
          ...rate,
          lastUpdated: Date.now()
        });
      });

      console.log('💱 [CryptoPaymentService] Taux de change initialisés');
    } catch (error) {
      console.error('❌ [CryptoPaymentService] Erreur initialisation taux:', error);
    }
  }

  /**
   * Charge les pools DeFi
   */
  private async loadDeFiPools(): Promise<void> {
    try {
      this.defiPools = [
        {
          id: 'pool_1',
          name: 'Souqly Liquidity Pool',
          tokens: ['USDT', 'USDC'],
          liquidity: 2500000,
          apy: 8.5,
          risk: 'low'
        },
        {
          id: 'pool_2',
          name: 'BTC-ETH Pool',
          tokens: ['BTC', 'ETH'],
          liquidity: 15000000,
          apy: 12.3,
          risk: 'medium'
        },
        {
          id: 'pool_3',
          name: 'High Yield Pool',
          tokens: ['SOL', 'USDT'],
          liquidity: 500000,
          apy: 18.7,
          risk: 'high'
        }
      ];

      console.log(`🏊 [CryptoPaymentService] ${this.defiPools.length} pools DeFi chargés`);
    } catch (error) {
      console.error('❌ [CryptoPaymentService] Erreur chargement pools DeFi:', error);
    }
  }

  /**
   * Crée un nouveau wallet crypto
   */
  async createWallet(currency: CryptoWallet['currency']): Promise<CryptoWallet> {
    try {
      console.log(`💰 [CryptoPaymentService] Création wallet ${currency}...`);
      
      const wallet: CryptoWallet = {
        id: `wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        address: this.generateWalletAddress(currency),
        balance: { [currency]: 0 },
        currency,
        isConnected: false,
        lastSync: Date.now()
      };

      this.wallets.set(wallet.id, wallet);
      await this.saveData();
      
      console.log(`✅ [CryptoPaymentService] Wallet créé: ${wallet.address}`);
      return wallet;
    } catch (error) {
      console.error('❌ [CryptoPaymentService] Erreur création wallet:', error);
      throw error;
    }
  }

  /**
   * Génère une adresse de wallet
   */
  private generateWalletAddress(currency: string): string {
    const prefix = {
      'BTC': 'bc1',
      'ETH': '0x',
      'USDT': '0x',
      'USDC': '0x',
      'SOL': ''
    }[currency] || '0x';

    const randomHex = Math.random().toString(16).substr(2, 40);
    return `${prefix}${randomHex}`;
  }

  /**
   * Connecte un wallet
   */
  async connectWallet(walletId: string): Promise<boolean> {
    try {
      const wallet = this.wallets.get(walletId);
      if (!wallet) {
        throw new Error('Wallet non trouvé');
      }

      console.log(`🔗 [CryptoPaymentService] Connexion wallet: ${wallet.address}`);
      
      // Simuler la connexion au wallet
      wallet.isConnected = true;
      wallet.lastSync = Date.now();
      
      // Mettre à jour le solde
      await this.updateWalletBalance(walletId);
      
      await this.saveData();
      console.log(`✅ [CryptoPaymentService] Wallet connecté: ${wallet.address}`);
      return true;
    } catch (error) {
      console.error('❌ [CryptoPaymentService] Erreur connexion wallet:', error);
      return false;
    }
  }

  /**
   * Met à jour le solde d'un wallet
   */
  private async updateWalletBalance(walletId: string): Promise<void> {
    try {
      const wallet = this.wallets.get(walletId);
      if (!wallet) return;

      // Simuler la récupération du solde
      const balance = Math.random() * 10;
      wallet.balance[wallet.currency] = balance;
      wallet.lastSync = Date.now();

      console.log(`💰 [CryptoPaymentService] Solde mis à jour: ${balance} ${wallet.currency}`);
    } catch (error) {
      console.error('❌ [CryptoPaymentService] Erreur mise à jour solde:', error);
    }
  }

  /**
   * Effectue un paiement crypto
   */
  async processCryptoPayment(
    productId: string,
    amount: number,
    currency: string,
    walletId: string
  ): Promise<CryptoPayment> {
    try {
      console.log(`💳 [CryptoPaymentService] Paiement crypto: ${amount} ${currency}`);
      
      const wallet = this.wallets.get(walletId);
      if (!wallet || !wallet.isConnected) {
        throw new Error('Wallet non connecté');
      }

      if (wallet.balance[currency] < amount) {
        throw new Error('Solde insuffisant');
      }

      // Créer le paiement
      const payment: CryptoPayment = {
        id: `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        productId,
        amount,
        currency,
        walletAddress: wallet.address,
        status: 'pending',
        timestamp: Date.now(),
        gasEstimate: this.estimateGasFee(currency)
      };

      this.payments.push(payment);

      // Traiter le paiement
      await this.executePayment(payment);

      await this.saveData();
      console.log(`✅ [CryptoPaymentService] Paiement traité: ${payment.id}`);
      return payment;
    } catch (error) {
      console.error('❌ [CryptoPaymentService] Erreur paiement crypto:', error);
      throw error;
    }
  }

  /**
   * Exécute le paiement
   */
  private async executePayment(payment: CryptoPayment): Promise<void> {
    try {
      // Simuler le traitement du paiement
      payment.status = 'processing';
      
      // Simuler le temps de traitement
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Créer la transaction
      const transaction: CryptoTransaction = {
        id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        from: payment.walletAddress,
        to: 'souqly_platform_wallet',
        amount: payment.amount,
        currency: payment.currency,
        status: 'confirmed',
        timestamp: Date.now(),
        gasFee: payment.gasEstimate,
        blockNumber: Math.floor(Math.random() * 1000000),
        txHash: `0x${Math.random().toString(16).substr(2, 64)}`
      };

      this.transactions.push(transaction);
      
      // Mettre à jour le statut du paiement
      payment.status = 'completed';
      payment.transactionId = transaction.id;
      
      console.log(`✅ [CryptoPaymentService] Transaction confirmée: ${transaction.txHash}`);
    } catch (error) {
      console.error('❌ [CryptoPaymentService] Erreur exécution paiement:', error);
      payment.status = 'failed';
      throw error;
    }
  }

  /**
   * Estime les frais de gas
   */
  private estimateGasFee(currency: string): number {
    const gasRates = {
      'BTC': 0.0001,
      'ETH': 0.005,
      'USDT': 0.005,
      'USDC': 0.005,
      'SOL': 0.00025
    };

    return gasRates[currency as keyof typeof gasRates] || 0.001;
  }

  /**
   * Convertit une devise en EUR
   */
  convertToEUR(amount: number, currency: string): number {
    const rate = this.rates.get(currency);
    if (!rate) {
      throw new Error(`Taux non disponible pour ${currency}`);
    }
    return amount * rate.rate;
  }

  /**
   * Convertit EUR en devise crypto
   */
  convertFromEUR(eurAmount: number, currency: string): number {
    const rate = this.rates.get(currency);
    if (!rate) {
      throw new Error(`Taux non disponible pour ${currency}`);
    }
    return eurAmount / rate.rate;
  }

  /**
   * Obtient les statistiques des wallets
   */
  getWalletStats(): {
    totalWallets: number;
    connectedWallets: number;
    totalBalance: { [currency: string]: number };
    totalTransactions: number;
  } {
    const totalWallets = this.wallets.size;
    const connectedWallets = Array.from(this.wallets.values()).filter(w => w.isConnected).length;
    
    const totalBalance: { [currency: string]: number } = {};
    this.wallets.forEach(wallet => {
      Object.entries(wallet.balance).forEach(([currency, balance]) => {
        totalBalance[currency] = (totalBalance[currency] || 0) + balance;
      });
    });

    return {
      totalWallets,
      connectedWallets,
      totalBalance,
      totalTransactions: this.transactions.length
    };
  }

  /**
   * Obtient les wallets connectés
   */
  getConnectedWallets(): CryptoWallet[] {
    return Array.from(this.wallets.values()).filter(w => w.isConnected);
  }

  /**
   * Obtient les transactions récentes
   */
  getRecentTransactions(limit: number = 10): CryptoTransaction[] {
    return this.transactions
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Obtient les paiements récents
   */
  getRecentPayments(limit: number = 10): CryptoPayment[] {
    return this.payments
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Obtient les pools DeFi
   */
  getDeFiPools(): DeFiPool[] {
    return [...this.defiPools];
  }

  /**
   * Obtient les taux de change
   */
  getExchangeRates(): CryptoRate[] {
    return Array.from(this.rates.values());
  }

  /**
   * Vérifie si le service est initialisé
   */
  isServiceInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Nettoie les données
   */
  async cleanup(): Promise<void> {
    try {
      console.log('🧹 [CryptoPaymentService] Nettoyage des données...');
      
      this.wallets.clear();
      this.transactions = [];
      this.payments = [];
      this.rates.clear();
      this.defiPools = [];
      this.isInitialized = false;
      
      console.log('✅ [CryptoPaymentService] Nettoyage terminé');
    } catch (error) {
      console.error('❌ [CryptoPaymentService] Erreur nettoyage:', error);
      throw error;
    }
  }
}

export default CryptoPaymentService; 