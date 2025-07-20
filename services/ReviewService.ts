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

interface SellerRating {
  averageRating: number;
  totalReviews: number;
  recentReviews: Array<{
    id: number;
    rating: number;
    comment: string;
    buyerName: string;
    createdAt: string;
  }>;
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
      // Vérification de sécurité : s'assurer que response.data existe et est un tableau
      if (response && response.data && Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Erreur récupération avis vendeur:', error);
      return [];
    }
  }

  /**
   * Obtient la note moyenne et les avis d'un vendeur
   */
  static async getSellerRating(sellerId: number): Promise<SellerRating> {
    try {
      const reviews = await this.getSellerReviews(sellerId);
      
      // Vérification de sécurité : s'assurer que reviews existe et est un tableau
      if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
        return {
          averageRating: 5.0,
          totalReviews: 0,
          recentReviews: []
        };
      }

      const averageRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length;
      
      const recentReviews = reviews
        .slice(0, 10) // Limiter à 10 avis récents
        .map(review => ({
          id: review.id || 0,
          rating: review.rating || 0,
          comment: review.comment || '',
          buyerName: review.buyerName || 'Anonyme',
          createdAt: review.createdAt || new Date().toISOString()
        }));

      return {
        averageRating,
        totalReviews: reviews.length,
        recentReviews
      };
    } catch (error) {
      console.error('Erreur récupération note vendeur:', error);
      return {
        averageRating: 5.0,
        totalReviews: 0,
        recentReviews: []
      };
    }
  }
}

export default ReviewService; 