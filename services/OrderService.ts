import ApiService from './ApiService';

export interface Order {
  id: string;
  orderNumber: string;
  productTitle: string;
  productPrice: number;
  productImage?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  sellerName: string;
  transactionId?: string;
  shippingAddress?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

export interface OrderDetail extends Order {
  productId: number;
  paymentMethod: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  notes?: string;
}

class OrderService {
  /**
   * Récupère les commandes de l'utilisateur
   */
  static async getOrders(): Promise<Order[]> {
    try {
      const response = await ApiService.get('/users/orders') as Order[];
      return response;
    } catch (error) {
      console.log('⚠️ Endpoint orders non disponible, utilisation des données par défaut');
      // Retourner des données d'exemple pour la démo
      return [
        {
          id: '1',
          orderNumber: 'ORD-20250715-1001',
          productTitle: 'iPhone 13 Pro - 128GB',
          productPrice: 150.00,
          productImage: undefined, // Pas d'image pour tester le fallback
          status: 'delivered',
          orderDate: new Date(Date.now() - 86400000 * 5).toISOString(), // Il y a 5 jours
          sellerName: 'Jean Dupont',
          transactionId: 'txn_123456'
        },
        {
          id: '2',
          orderNumber: 'ORD-20250715-1002',
          productTitle: 'AirPods Pro - 2ème génération',
          productPrice: 75.50,
          productImage: undefined, // Pas d'image pour tester le fallback
          status: 'shipped',
          orderDate: new Date(Date.now() - 86400000 * 10).toISOString(), // Il y a 10 jours
          sellerName: 'Marie Martin',
          transactionId: 'txn_123457'
        },
        {
          id: '3',
          orderNumber: 'ORD-20250715-1003',
          productTitle: 'MacBook Air M2 - 256GB',
          productPrice: 1200.00,
          productImage: undefined, // Pas d'image pour tester le fallback
          status: 'processing',
          orderDate: new Date(Date.now() - 86400000 * 2).toISOString(), // Il y a 2 jours
          sellerName: 'Pierre Durand',
          transactionId: 'txn_123458'
        }
      ];
    }
  }

  /**
   * Récupère les détails d'une commande
   */
  static async getOrderDetails(orderId: string): Promise<OrderDetail> {
    try {
      const response = await ApiService.get(`/users/orders/${orderId}`) as OrderDetail;
      return response;
    } catch (error) {
      console.log('⚠️ Endpoint order details non disponible, utilisation des données par défaut');
      // Retourner des données d'exemple pour la démo
      return {
        id: orderId,
        orderNumber: 'ORD-20250715-1001',
        productTitle: 'iPhone 13 Pro - 128GB',
        productPrice: 150.00,
        productImage: 'https://via.placeholder.com/80',
        status: 'delivered',
        orderDate: new Date(Date.now() - 86400000 * 5).toISOString(),
        sellerName: 'Jean Dupont',
        transactionId: 'txn_123456',
        productId: 1,
        paymentMethod: 'Portefeuille Souqly',
        trackingNumber: 'TRK123456789',
        estimatedDelivery: new Date(Date.now() + 86400000 * 3).toISOString(), // Dans 3 jours
        notes: 'Livraison à domicile - Présence requise'
      };
    }
  }

  /**
   * Annule une commande
   */
  static async cancelOrder(orderId: string): Promise<boolean> {
    try {
      await ApiService.post(`/users/orders/${orderId}/cancel`, {});
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'annulation de la commande:', error);
      return false;
    }
  }

  /**
   * Marque une commande comme reçue
   */
  static async markAsReceived(orderId: string): Promise<boolean> {
    try {
      await ApiService.post(`/users/orders/${orderId}/received`, {});
      return true;
    } catch (error) {
      console.error('Erreur lors de la confirmation de réception:', error);
      return false;
    }
  }

  /**
   * Récupère le statut de livraison
   */
  static async getShippingStatus(orderId: string): Promise<any> {
    try {
      const response = await ApiService.get(`/users/orders/${orderId}/shipping`);
      return response;
    } catch (error) {
      console.log('⚠️ Endpoint shipping status non disponible');
      return {
        status: 'shipped',
        trackingNumber: 'TRK123456789',
        estimatedDelivery: new Date(Date.now() + 86400000 * 2).toISOString(),
        currentLocation: 'Centre de tri - Paris',
        lastUpdate: new Date().toISOString()
      };
    }
  }
}

export default OrderService; 