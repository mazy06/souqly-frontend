import ApiService from './ApiService';

export interface Review {
  id: number;
  productId: number;
  sellerId: number;
  buyerId: number;
  rating: number;
  comment: string;
  transactionId: string;
  createdAt: string;
  buyerName?: string;
}

export interface SellerRating {
  averageRating: number;
  totalReviews: number;
  recentReviews: Review[];
}

class ReviewService {
  /**
   * Récupère tous les commentaires d'un vendeur
   */
  async getSellerReviews(sellerId: number): Promise<Review[]> {
    try {
      const response = await ApiService.get(`/reviews/seller/${sellerId}`) as { data: Review[] };
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des commentaires du vendeur:', error);
      return [];
    }
  }

  /**
   * Récupère la note moyenne et les commentaires récents d'un vendeur
   */
  async getSellerRating(sellerId: number): Promise<SellerRating> {
    try {
      const response = await ApiService.get(`/reviews/seller/${sellerId}/rating`) as { data: SellerRating };
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de la note du vendeur:', error);
      // Retourner des valeurs par défaut en cas d'erreur
      return {
        averageRating: 0,
        totalReviews: 0,
        recentReviews: []
      };
    }
  }

  /**
   * Crée un nouveau commentaire
   */
  async createReview(reviewData: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
    try {
      const response = await ApiService.post('/reviews', reviewData) as { data: Review };
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du commentaire:', error);
      throw error;
    }
  }
}

export default new ReviewService(); 