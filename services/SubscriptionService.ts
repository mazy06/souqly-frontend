import ApiService from './ApiService';

export interface SubscriptionRequest {
  followingId: number;
}

export interface UserProfileDetail {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  profilePictureUrl: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: string;
  followersCount: number;
  followingCount: number;
  productsCount: number;
  isFollowing: boolean;
  isOwnProfile: boolean;
}

const SubscriptionService = {
  async followUser(followingId: number): Promise<string> {
    try {
      const response = await ApiService.post<string>('/subscriptions/follow', {
        followingId
      });
      return response;
    } catch (error) {
      console.error('Erreur lors de l\'abonnement:', error);
      throw error;
    }
  },

  async unfollowUser(followingId: number): Promise<string> {
    try {
      const response = await ApiService.delete<string>(`/subscriptions/unfollow/${followingId}`);
      return response;
    } catch (error) {
      console.error('Erreur lors du désabonnement:', error);
      throw error;
    }
  },

  async getFollowers(userId: number): Promise<any[]> {
    try {
      const response = await ApiService.get<any[]>(`/subscriptions/followers/${userId}`);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des abonnés:', error);
      throw error;
    }
  },

  async getFollowing(userId: number): Promise<any[]> {
    try {
      const response = await ApiService.get<any[]>(`/subscriptions/following/${userId}`);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des abonnements:', error);
      throw error;
    }
  },

  async isFollowing(userId: number): Promise<boolean> {
    try {
      const response = await ApiService.get<boolean>(`/subscriptions/is-following/${userId}`);
      return response;
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'abonnement:', error);
      return false;
    }
  },

  async getUserProfileDetail(userId: number): Promise<UserProfileDetail> {
    try {
      const response = await ApiService.get<UserProfileDetail>(`/users/${userId}/profile-detail`);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération du profil détaillé:', error);
      throw error;
    }
  }
};

export default SubscriptionService; 