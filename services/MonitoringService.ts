import AsyncStorage from '@react-native-async-storage/async-storage';

interface PerformanceMetric {
  timestamp: number;
  type: 'screen_load' | 'api_call' | 'user_action' | 'error' | 'memory' | 'cpu';
  name: string;
  duration?: number;
  value?: number;
  metadata?: Record<string, any>;
}

interface ErrorReport {
  timestamp: number;
  error: string;
  stack?: string;
  context?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface UserAction {
  timestamp: number;
  action: string;
  screen: string;
  userId?: string;
  metadata?: Record<string, any>;
}

interface SystemMetrics {
  memoryUsage: number;
  cpuUsage: number;
  batteryLevel: number;
  networkType: string;
  appVersion: string;
}

class MonitoringService {
  private static instance: MonitoringService;
  private metrics: PerformanceMetric[] = [];
  private errors: ErrorReport[] = [];
  private userActions: UserAction[] = [];
  private isMonitoring = false;
  private flushInterval: NodeJS.Timeout | null = null;
  private maxMetrics = 1000;
  private maxErrors = 100;
  private maxUserActions = 500;

  private constructor() {}

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  /**
   * Initialise le service de monitoring
   */
  async initialize(): Promise<void> {
    try {
      console.log('📊 [MonitoringService] Initialisation...');
      
      // Charger les données existantes
      await this.loadStoredData();
      
      // Démarrer le monitoring
      this.startMonitoring();
      
      // Configurer l'envoi périodique
      this.setupPeriodicFlush();
      
      console.log('✅ [MonitoringService] Initialisation terminée');
    } catch (error) {
      console.error('❌ [MonitoringService] Erreur d\'initialisation:', error);
      throw error;
    }
  }

  /**
   * Charge les données stockées
   */
  private async loadStoredData(): Promise<void> {
    try {
      const [metricsData, errorsData, actionsData] = await Promise.all([
        AsyncStorage.getItem('monitoring_metrics'),
        AsyncStorage.getItem('monitoring_errors'),
        AsyncStorage.getItem('monitoring_actions')
      ]);

      if (metricsData) {
        this.metrics = JSON.parse(metricsData);
      }
      if (errorsData) {
        this.errors = JSON.parse(errorsData);
      }
      if (actionsData) {
        this.userActions = JSON.parse(actionsData);
      }
    } catch (error) {
      console.error('❌ [MonitoringService] Erreur chargement données:', error);
    }
  }

  /**
   * Sauvegarde les données
   */
  private async saveData(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem('monitoring_metrics', JSON.stringify(this.metrics)),
        AsyncStorage.setItem('monitoring_errors', JSON.stringify(this.errors)),
        AsyncStorage.setItem('monitoring_actions', JSON.stringify(this.userActions))
      ]);
    } catch (error) {
      console.error('❌ [MonitoringService] Erreur sauvegarde données:', error);
    }
  }

  /**
   * Démarre le monitoring
   */
  private startMonitoring(): void {
    this.isMonitoring = true;
    console.log('📊 [MonitoringService] Monitoring démarré');
  }

  /**
   * Configure l'envoi périodique des données
   */
  private setupPeriodicFlush(): void {
    // Envoyer les données toutes les 5 minutes
    this.flushInterval = setInterval(() => {
      this.flushData();
    }, 5 * 60 * 1000);
  }

  /**
   * Enregistre une métrique de performance
   */
  recordMetric(type: PerformanceMetric['type'], name: string, duration?: number, metadata?: Record<string, any>): void {
    if (!this.isMonitoring) return;

    const metric: PerformanceMetric = {
      timestamp: Date.now(),
      type,
      name,
      duration,
      metadata
    };

    this.metrics.push(metric);
    
    // Limiter le nombre de métriques
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    console.log(`📊 [MonitoringService] Métrique enregistrée: ${type} - ${name}`);
  }

  /**
   * Enregistre une erreur
   */
  recordError(error: string, stack?: string, context?: Record<string, any>, severity: ErrorReport['severity'] = 'medium'): void {
    if (!this.isMonitoring) return;

    const errorReport: ErrorReport = {
      timestamp: Date.now(),
      error,
      stack,
      context,
      severity
    };

    this.errors.push(errorReport);
    
    // Limiter le nombre d'erreurs
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    console.log(`❌ [MonitoringService] Erreur enregistrée: ${severity} - ${error}`);
  }

  /**
   * Enregistre une action utilisateur
   */
  recordUserAction(action: string, screen: string, userId?: string, metadata?: Record<string, any>): void {
    if (!this.isMonitoring) return;

    const userAction: UserAction = {
      timestamp: Date.now(),
      action,
      screen,
      userId,
      metadata
    };

    this.userActions.push(userAction);
    
    // Limiter le nombre d'actions
    if (this.userActions.length > this.maxUserActions) {
      this.userActions = this.userActions.slice(-this.maxUserActions);
    }

    console.log(`👤 [MonitoringService] Action utilisateur enregistrée: ${action} sur ${screen}`);
  }

  /**
   * Mesure le temps d'exécution d'une fonction
   */
  async measureExecution<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const startTime = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - startTime;
      this.recordMetric('api_call', name, duration);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.recordMetric('api_call', name, duration, { error: error.message });
      throw error;
    }
  }

  /**
   * Mesure le temps de chargement d'un écran
   */
  measureScreenLoad(screenName: string): () => void {
    const startTime = Date.now();
    return () => {
      const duration = Date.now() - startTime;
      this.recordMetric('screen_load', screenName, duration);
    };
  }

  /**
   * Obtient les métriques système
   */
  async getSystemMetrics(): Promise<SystemMetrics> {
    try {
      // Simuler les métriques système
      const metrics: SystemMetrics = {
        memoryUsage: Math.random() * 100,
        cpuUsage: Math.random() * 100,
        batteryLevel: Math.random() * 100,
        networkType: Math.random() > 0.5 ? 'wifi' : 'cellular',
        appVersion: '1.0.0'
      };

      this.recordMetric('memory', 'system_memory', undefined, { value: metrics.memoryUsage });
      this.recordMetric('cpu', 'system_cpu', undefined, { value: metrics.cpuUsage });

      return metrics;
    } catch (error) {
      console.error('❌ [MonitoringService] Erreur métriques système:', error);
      throw error;
    }
  }

  /**
   * Obtient les statistiques de performance
   */
  getPerformanceStats(): Record<string, any> {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    const oneDayAgo = now - (24 * 60 * 60 * 1000);

    const recentMetrics = this.metrics.filter(m => m.timestamp > oneHourAgo);
    const dailyMetrics = this.metrics.filter(m => m.timestamp > oneDayAgo);

    const stats = {
      totalMetrics: this.metrics.length,
      recentMetrics: recentMetrics.length,
      dailyMetrics: dailyMetrics.length,
      errors: this.errors.length,
      userActions: this.userActions.length,
      averageResponseTime: this.calculateAverageResponseTime(recentMetrics),
      errorRate: this.calculateErrorRate(recentMetrics),
      topScreens: this.getTopScreens(dailyMetrics),
      topActions: this.getTopActions(this.userActions.filter(a => a.timestamp > oneDayAgo))
    };

    return stats;
  }

  /**
   * Calcule le temps de réponse moyen
   */
  private calculateAverageResponseTime(metrics: PerformanceMetric[]): number {
    const apiCalls = metrics.filter(m => m.type === 'api_call' && m.duration);
    if (apiCalls.length === 0) return 0;
    
    const totalDuration = apiCalls.reduce((sum, m) => sum + (m.duration || 0), 0);
    return totalDuration / apiCalls.length;
  }

  /**
   * Calcule le taux d'erreur
   */
  private calculateErrorRate(metrics: PerformanceMetric[]): number {
    const totalCalls = metrics.filter(m => m.type === 'api_call').length;
    const errorCalls = metrics.filter(m => m.type === 'api_call' && m.metadata?.error).length;
    
    if (totalCalls === 0) return 0;
    return (errorCalls / totalCalls) * 100;
  }

  /**
   * Obtient les écrans les plus visités
   */
  private getTopScreens(metrics: PerformanceMetric[]): Array<{ screen: string; count: number }> {
    const screenLoads = metrics.filter(m => m.type === 'screen_load');
    const screenCounts: Record<string, number> = {};
    
    screenLoads.forEach(m => {
      screenCounts[m.name] = (screenCounts[m.name] || 0) + 1;
    });
    
    return Object.entries(screenCounts)
      .map(([screen, count]) => ({ screen, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  /**
   * Obtient les actions les plus fréquentes
   */
  private getTopActions(actions: UserAction[]): Array<{ action: string; count: number }> {
    const actionCounts: Record<string, number> = {};
    
    actions.forEach(a => {
      actionCounts[a.action] = (actionCounts[a.action] || 0) + 1;
    });
    
    return Object.entries(actionCounts)
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  /**
   * Envoie les données au serveur
   */
  async flushData(): Promise<void> {
    try {
      if (this.metrics.length === 0 && this.errors.length === 0 && this.userActions.length === 0) {
        console.log('📊 [MonitoringService] Aucune donnée à envoyer');
        return;
      }

      console.log('📤 [MonitoringService] Envoi des données...');
      
      // Simuler l'envoi des données
      const dataToSend = {
        metrics: this.metrics,
        errors: this.errors,
        userActions: this.userActions,
        timestamp: Date.now()
      };

      // Ici on enverrait réellement les données au serveur
      console.log(`📤 [MonitoringService] Données envoyées: ${this.metrics.length} métriques, ${this.errors.length} erreurs, ${this.userActions.length} actions`);

      // Vider les données après envoi
      this.metrics = [];
      this.errors = [];
      this.userActions = [];
      
      // Sauvegarder l'état vide
      await this.saveData();
      
      console.log('✅ [MonitoringService] Données envoyées avec succès');
    } catch (error) {
      console.error('❌ [MonitoringService] Erreur envoi données:', error);
    }
  }

  /**
   * Obtient les métriques enregistrées
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Obtient les erreurs enregistrées
   */
  getErrors(): ErrorReport[] {
    return [...this.errors];
  }

  /**
   * Obtient les actions utilisateur enregistrées
   */
  getUserActions(): UserAction[] {
    return [...this.userActions];
  }

  /**
   * Arrête le monitoring
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    console.log('📊 [MonitoringService] Monitoring arrêté');
  }

  /**
   * Nettoie les données
   */
  async cleanup(): Promise<void> {
    try {
      console.log('🧹 [MonitoringService] Nettoyage des données...');
      
      this.stopMonitoring();
      
      // Vider les données
      this.metrics = [];
      this.errors = [];
      this.userActions = [];
      
      // Supprimer les données stockées
      await Promise.all([
        AsyncStorage.removeItem('monitoring_metrics'),
        AsyncStorage.removeItem('monitoring_errors'),
        AsyncStorage.removeItem('monitoring_actions')
      ]);
      
      console.log('✅ [MonitoringService] Nettoyage terminé');
    } catch (error) {
      console.error('❌ [MonitoringService] Erreur nettoyage:', error);
      throw error;
    }
  }
}

export default MonitoringService; 