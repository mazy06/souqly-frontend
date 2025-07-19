import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

// Type pour la navigation
type ProfileStackParamList = {
  ProfileMain: undefined;
  RealTimeMonitoring: undefined;
};

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

interface AlertItem {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
}

const RealTimeMonitoringScreen = () => {
  const navigation = useNavigation<StackNavigationProp<ProfileStackParamList>>();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);

  useEffect(() => {
    loadMonitoringData();
    const interval = setInterval(() => {
      if (isMonitoring) {
        updateMetrics();
      }
    }, 5000); // Mise à jour toutes les 5 secondes

    return () => clearInterval(interval);
  }, [isMonitoring]);

  const loadMonitoringData = async () => {
    setLoading(true);
    try {
      // Simulation de données de monitoring
      const mockMetrics: SystemMetric[] = [
        {
          name: 'CPU Usage',
          value: 45.2,
          unit: '%',
          status: 'normal',
          trend: 'up'
        },
        {
          name: 'Memory Usage',
          value: 78.5,
          unit: '%',
          status: 'warning',
          trend: 'up'
        },
        {
          name: 'Disk Space',
          value: 92.1,
          unit: '%',
          status: 'critical',
          trend: 'up'
        },
        {
          name: 'Network Load',
          value: 34.7,
          unit: '%',
          status: 'normal',
          trend: 'stable'
        },
        {
          name: 'Active Users',
          value: 1250,
          unit: '',
          status: 'normal',
          trend: 'up'
        },
        {
          name: 'Response Time',
          value: 245,
          unit: 'ms',
          status: 'normal',
          trend: 'down'
        }
      ];

      const mockAlerts: AlertItem[] = [
        {
          id: '1',
          type: 'warning',
          message: 'Disk space usage is high (92.1%)',
          timestamp: '2024-01-25 14:32:15',
          severity: 'high'
        },
        {
          id: '2',
          type: 'info',
          message: 'New user registration spike detected',
          timestamp: '2024-01-25 14:30:42',
          severity: 'medium'
        },
        {
          id: '3',
          type: 'error',
          message: 'Database connection timeout',
          timestamp: '2024-01-25 14:28:33',
          severity: 'high'
        }
      ];

      setSystemMetrics(mockMetrics);
      setAlerts(mockAlerts);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les données de monitoring');
    } finally {
      setLoading(false);
    }
  };

  const updateMetrics = () => {
    setSystemMetrics(prev => 
      prev.map(metric => ({
        ...metric,
        value: metric.value + (Math.random() - 0.5) * 5, // Variation aléatoire
        status: Math.random() > 0.8 ? 'warning' : metric.status
      }))
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return '#4CAF50';
      case 'warning': return '#FF9800';
      case 'critical': return '#F44336';
      default: return colors.textSecondary;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return 'trending-up';
      case 'down': return 'trending-down';
      case 'stable': return 'remove';
      default: return 'remove';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return '#4CAF50';
      case 'down': return '#F44336';
      case 'stable': return colors.textSecondary;
      default: return colors.textSecondary;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error': return '#F44336';
      case 'warning': return '#FF9800';
      case 'info': return '#2196F3';
      default: return colors.textSecondary;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return colors.textSecondary;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR');
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Chargement du monitoring...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Monitoring Temps Réel
        </Text>
        <TouchableOpacity
          onPress={() => setIsMonitoring(!isMonitoring)}
          style={styles.monitoringToggle}
        >
          <Ionicons 
            name={isMonitoring ? "pause-circle" : "play-circle"} 
            size={24} 
            color={isMonitoring ? '#4CAF50' : '#FF9800'} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* System Status */}
        <View style={styles.statusSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Statut du Système
          </Text>
          
          <View style={[styles.statusCard, { backgroundColor: colors.card }]}>
            <View style={styles.statusHeader}>
              <Ionicons 
                name={isMonitoring ? "pulse" : "pause"} 
                size={24} 
                color={isMonitoring ? '#4CAF50' : '#FF9800'} 
              />
              <Text style={[styles.statusText, { color: colors.text }]}>
                {isMonitoring ? 'Monitoring actif' : 'Monitoring en pause'}
              </Text>
            </View>
            
            <View style={styles.statusMetrics}>
              <View style={styles.statusMetric}>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                  Alertes actives
                </Text>
                <Text style={[styles.metricValue, { color: '#FF9800' }]}>
                  {alerts.filter(a => a.severity === 'high').length}
                </Text>
              </View>
              
              <View style={styles.statusMetric}>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                  Métriques critiques
                </Text>
                <Text style={[styles.metricValue, { color: '#F44336' }]}>
                  {systemMetrics.filter(m => m.status === 'critical').length}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* System Metrics */}
        <View style={styles.metricsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Métriques Système
          </Text>
          
          <View style={styles.metricsGrid}>
            {systemMetrics.map((metric, index) => (
              <View key={index} style={[styles.metricCard, { backgroundColor: colors.card }]}>
                <View style={styles.metricHeader}>
                  <Text style={[styles.metricName, { color: colors.text }]}>
                    {metric.name}
                  </Text>
                  <View style={[
                    styles.statusIndicator,
                    { backgroundColor: getStatusColor(metric.status) }
                  ]} />
                </View>
                
                <View style={styles.metricValue}>
                  <Text style={[styles.valueText, { color: colors.text }]}>
                    {metric.value.toFixed(1)}
                  </Text>
                  <Text style={[styles.unitText, { color: colors.textSecondary }]}>
                    {metric.unit}
                  </Text>
                </View>
                
                <View style={styles.metricTrend}>
                  <Ionicons 
                    name={getTrendIcon(metric.trend) as any} 
                    size={16} 
                    color={getTrendColor(metric.trend)} 
                  />
                  <Text style={[
                    styles.trendText,
                    { color: getTrendColor(metric.trend) }
                  ]}>
                    {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Alerts */}
        <View style={styles.alertsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Alertes Récentes
          </Text>
          
          {alerts.map((alert) => (
            <View key={alert.id} style={[styles.alertCard, { backgroundColor: colors.card }]}>
              <View style={styles.alertHeader}>
                <View style={styles.alertType}>
                  <Ionicons 
                    name={alert.type === 'error' ? 'close-circle' : alert.type === 'warning' ? 'warning' : 'information-circle'} 
                    size={20} 
                    color={getAlertColor(alert.type)} 
                  />
                  <View style={[
                    styles.severityBadge,
                    { backgroundColor: getSeverityColor(alert.severity) }
                  ]}>
                    <Text style={styles.severityText}>
                      {alert.severity.toUpperCase()}
                    </Text>
                  </View>
                </View>
                
                <Text style={[styles.alertTime, { color: colors.textSecondary }]}>
                  {formatTimestamp(alert.timestamp)}
                </Text>
              </View>
              
              <Text style={[styles.alertMessage, { color: colors.text }]}>
                {alert.message}
              </Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Actions Rapides
          </Text>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary }]}>
              <Ionicons name="refresh" size={20} color="white" />
              <Text style={styles.actionButtonText}>Actualiser</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#FF9800' }]}>
              <Ionicons name="download" size={20} color="white" />
              <Text style={styles.actionButtonText}>Exporter</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#F44336' }]}>
              <Ionicons name="warning" size={20} color="white" />
              <Text style={styles.actionButtonText}>Alertes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 16,
    backgroundColor: 'transparent', // Ensure it's transparent to allow SafeAreaView to handle background
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  monitoringToggle: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000', // Dark background for loading
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  statusSection: {
    padding: 16,
    marginBottom: 16,
  },
  statusCard: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statusMetric: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  metricsSection: {
    padding: 16,
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48%', // Two columns
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricName: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  metricValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  valueText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  unitText: {
    fontSize: 14,
    marginLeft: 4,
  },
  metricTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  trendText: {
    fontSize: 14,
    marginLeft: 4,
  },
  alertsSection: {
    padding: 16,
    marginBottom: 16,
  },
  alertCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    marginLeft: 8,
  },
  severityText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  alertTime: {
    fontSize: 12,
  },
  alertMessage: {
    fontSize: 14,
  },
  actionsSection: {
    padding: 16,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%', // Two columns
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});

export default RealTimeMonitoringScreen; 