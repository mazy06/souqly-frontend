import ApiService from './ApiService';

export interface ReportData {
  productId: number;
  userId: number;
  reasons: string[];
  customReason?: string | null;
  description?: string | null;
}

export interface Report {
  id: number;
  productId: number;
  userId: number;
  reasons: string[];
  customReason?: string | null;
  description?: string | null;
  createdAt: string;
  status: 'pending' | 'reviewed' | 'resolved';
  product?: {
    id: number;
    title: string;
    description: string;
    price: number;
    seller: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  reporter?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

class ReportService {
  private static instance: ReportService;

  private constructor() {}

  public static getInstance(): ReportService {
    if (!ReportService.instance) {
      ReportService.instance = new ReportService();
    }
    return ReportService.instance;
  }

  /**
   * Créer un nouveau signalement
   */
  async createReport(reportData: ReportData): Promise<Report> {
    try {
      const response = await ApiService.post<Report>('/reports', reportData);
      return response;
    } catch (error) {
      console.error('Erreur lors de la création du signalement:', error);
      throw error;
    }
  }

  /**
   * Récupérer tous les signalements (pour admin)
   */
  async getAllReports(): Promise<Report[]> {
    try {
      const response = await ApiService.get<Report[]>('/reports');
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des signalements:', error);
      throw error;
    }
  }

  /**
   * Récupérer les signalements d'un produit spécifique
   */
  async getProductReports(productId: number): Promise<Report[]> {
    try {
      const response = await ApiService.get<Report[]>(`/reports/product/${productId}`);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des signalements du produit:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour le statut d'un signalement (pour admin)
   */
  async updateReportStatus(reportId: number, status: 'pending' | 'reviewed' | 'resolved'): Promise<Report> {
    try {
      const response = await ApiService.put<Report>(`/reports/${reportId}/status`, { status });
      return response;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut du signalement:', error);
      throw error;
    }
  }

  /**
   * Supprimer un signalement (pour admin)
   */
  async deleteReport(reportId: number): Promise<void> {
    try {
      await ApiService.delete(`/reports/${reportId}`);
    } catch (error) {
      console.error('Erreur lors de la suppression du signalement:', error);
      throw error;
    }
  }

  /**
   * Récupérer les statistiques des signalements (pour admin)
   */
  async getReportStats(): Promise<{
    total: number;
    pending: number;
    reviewed: number;
    resolved: number;
    byReason: Record<string, number>;
  }> {
    try {
      const response = await ApiService.get<{
        total: number;
        pending: number;
        reviewed: number;
        resolved: number;
        byReason: Record<string, number>;
      }>('/reports/stats');
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques des signalements:', error);
      throw error;
    }
  }
}

export default ReportService.getInstance(); 