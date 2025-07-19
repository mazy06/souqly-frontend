import ApiService from './ApiService';

interface ReviewData {
  productId: number;
  sellerId: number;
  rating: number;
  comment: string;
  transactionId: string;
}

interface ReviewResponse {
  success: boolean;
  message?: string;
  reviewId?: number;
}

class ReviewService {
  /**
   * Soumet un avis pour un produit
   */
  static async submitReview(reviewData: ReviewData): Promise<ReviewResponse> {
    try {
      const response = await ApiService.post('/reviews', reviewData) as any;
      return {
        success: true,
        reviewId: response.data.id,
        message: 'Avis soumis avec succès'
      };
    } catch (error) {
      console.error('Erreur soumission avis:', error);
      return {
        success: false,
        message: 'Impossible de soumettre l\'avis'
      };
    }
  }

  /**
   * Obtient les avis d'un produit
   */
  static async getProductReviews(productId: number): Promise<any[]> {
    try {
      const response = await ApiService.get(`/reviews/product/${productId}`) as any;
      return response.data;
    } catch (error) {
      console.error('Erreur récupération avis:', error);
      return [];
    }
  }

  /**
   * Obtient les avis d'un vendeur
   */
  static async getSellerReviews(sellerId: number): Promise<any[]> {
    try {
      const response = await ApiService.get(`/reviews/seller/${sellerId}`) as any;
      return response.data;
    } catch (error) {
      console.error('Erreur récupération avis vendeur:', error);
      return [];
    }
  }
}

export default ReviewService; 