import ApiService from './ApiService';
import { Product } from './ProductService';

export interface BoostInfo {
  id: number;
  productId: number;
  boostType: 'premium' | 'standard' | 'urgent';
  boostLevel: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  price: number;
}

export interface CreateBoostRequest {
  productId: number;
  boostType: 'premium' | 'standard' | 'urgent';
  boostLevel: number;
  duration: number; // en jours
}

class BoostService {
  private static instance: BoostService;

  private constructor() {}

  public static getInstance(): BoostService {
    if (!BoostService.instance) {
      BoostService.instance = new BoostService();
    }
    return BoostService.instance;
  }

  /**
   * Récupère les informations de boost pour un produit
   */
  async getProductBoost(productId: number): Promise<BoostInfo | null> {
    try {
      const response = await ApiService.get<BoostInfo>(`/boosts/product/${productId}`);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération du boost:', error);
      return null;
    }
  }

  /**
   * Récupère tous les boosts actifs
   */
  async getActiveBoosts(): Promise<BoostInfo[]> {
    try {
      const response = await ApiService.get<BoostInfo[]>('/boosts/active');
      return response || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des boosts actifs:', error);
      return [];
    }
  }

  /**
   * Récupère les boosts de l'utilisateur connecté
   */
  async getMyBoosts(): Promise<BoostInfo[]> {
    try {
      const response = await ApiService.get<BoostInfo[]>('/boosts/my-boosts');
      return response || [];
    } catch (error) {
      console.error('Erreur lors de la récupération de mes boosts:', error);
      return [];
    }
  }

  /**
   * Crée un nouveau boost
   */
  async createBoost(boostData: CreateBoostRequest): Promise<BoostInfo> {
    try {
      const response = await ApiService.post<BoostInfo>('/boosts/create', boostData);
      return response;
    } catch (error) {
      console.error('Erreur lors de la création du boost:', error);
      throw error;
    }
  }

  /**
   * Annule un boost
   */
  async cancelBoost(boostId: number): Promise<boolean> {
    try {
      await ApiService.post(`/boosts/${boostId}/cancel`, {});
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'annulation du boost:', error);
      return false;
    }
  }

  /**
   * Récupère les prix des boosts
   */
  async getBoostPrices(): Promise<{
    premium: number;
    standard: number;
    urgent: number;
  }> {
    try {
      const response = await ApiService.get<{
        premium: number;
        standard: number;
        urgent: number;
      }>('/boosts/prices');
      return response || { premium: 10, standard: 5, urgent: 15 };
    } catch (error) {
      console.error('Erreur lors de la récupération des prix:', error);
      return { premium: 10, standard: 5, urgent: 15 };
    }
  }

  /**
   * Vérifie si un produit est boosté
   */
  async isProductBoosted(productId: number): Promise<boolean> {
    try {
      const boost = await this.getProductBoost(productId);
      return boost !== null && boost.isActive;
    } catch (error) {
      console.error('Erreur lors de la vérification du boost:', error);
      return false;
    }
  }

  /**
   * Récupère les produits boostés
   */
  async getBoostedProducts(): Promise<Product[]> {
    try {
      const response = await ApiService.get<Product[]>('/boosts/boosted-products');
      return response || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des produits boostés:', error);
      return [];
    }
  }

  /**
   * Calcule le prix d'un boost
   */
  calculateBoostPrice(boostType: 'premium' | 'standard' | 'urgent', duration: number): number {
    const basePrices = {
      premium: 10,
      standard: 5,
      urgent: 15
    };
    
    return basePrices[boostType] * duration;
  }

  /**
   * Formate la durée restante d'un boost
   */
  formatRemainingTime(endDate: string): string {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) {
      return 'Expiré';
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days}j ${hours}h`;
    } else {
      return `${hours}h`;
    }
  }

  /**
   * Vérifie si un boost est expiré
   */
  isBoostExpired(endDate: string): boolean {
    const end = new Date(endDate);
    const now = new Date();
    return end.getTime() <= now.getTime();
  }
}

export default BoostService; 