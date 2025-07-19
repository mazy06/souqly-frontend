import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  SafeAreaView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

// Type pour la navigation
type ProfileStackParamList = {
  ProfileMain: undefined;
  AdminAnalytics: undefined;
};

const AdminAnalyticsScreen = () => {
  const navigation = useNavigation<StackNavigationProp<ProfileStackParamList>>();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Simulation de données d'analytics
      const mockData = {
        users: {
          total: 1250,
          newThisMonth: 89,
          activeToday: 342,
          growth: 12.5
        },
        products: {
          total: 5670,
          newThisWeek: 234,
          activeListings: 3456,
          growth: 8.3
        },
        transactions: {
          total: 890,
          thisMonth: 156,
          averageValue: 45.67,
          growth: 15.2
        },
        revenue: {
          total: 45678.90,
          thisMonth: 12345.67,
          averagePerTransaction: 51.32,
          growth: 18.7
        }
      };
      
      setAnalyticsData(mockData);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les données analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('fr-FR');
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`;
  };

  const chartConfig = {
    backgroundColor: colors.background,
    backgroundGradientFrom: colors.background,
    backgroundGradientTo: colors.background,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 128, 128, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: colors.primary,
    },
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Chargement des analytics...
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
          Dashboard Analytics
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* KPI Cards */}
        <View style={styles.kpiSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Indicateurs Clés
          </Text>
          
          <View style={styles.kpiGrid}>
            <View style={[styles.kpiCard, { backgroundColor: colors.card }]}>
              <View style={styles.kpiHeader}>
                <Ionicons name="people-outline" size={24} color={colors.primary} />
                <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>
                  Utilisateurs
                </Text>
              </View>
              <Text style={[styles.kpiValue, { color: colors.text }]}>
                {formatNumber(analyticsData?.users?.total || 0)}
              </Text>
              <Text style={[styles.kpiGrowth, { color: '#4CAF50' }]}>
                +{analyticsData?.users?.growth || 0}%
              </Text>
            </View>

            <View style={[styles.kpiCard, { backgroundColor: colors.card }]}>
              <View style={styles.kpiHeader}>
                <Ionicons name="cube-outline" size={24} color={colors.primary} />
                <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>
                  Produits
                </Text>
              </View>
              <Text style={[styles.kpiValue, { color: colors.text }]}>
                {formatNumber(analyticsData?.products?.total || 0)}
              </Text>
              <Text style={[styles.kpiGrowth, { color: '#4CAF50' }]}>
                +{analyticsData?.products?.growth || 0}%
              </Text>
            </View>

            <View style={[styles.kpiCard, { backgroundColor: colors.card }]}>
              <View style={styles.kpiHeader}>
                <Ionicons name="swap-horizontal-outline" size={24} color={colors.primary} />
                <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>
                  Transactions
                </Text>
              </View>
              <Text style={[styles.kpiValue, { color: colors.text }]}>
                {formatNumber(analyticsData?.transactions?.total || 0)}
              </Text>
              <Text style={[styles.kpiGrowth, { color: '#4CAF50' }]}>
                +{analyticsData?.transactions?.growth || 0}%
              </Text>
            </View>

            <View style={[styles.kpiCard, { backgroundColor: colors.card }]}>
              <View style={styles.kpiHeader}>
                <Ionicons name="cash-outline" size={24} color={colors.primary} />
                <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>
                  Revenus
                </Text>
              </View>
              <Text style={[styles.kpiValue, { color: colors.text }]}>
                {formatCurrency(analyticsData?.revenue?.total || 0)}
              </Text>
              <Text style={[styles.kpiGrowth, { color: '#4CAF50' }]}>
                +{analyticsData?.revenue?.growth || 0}%
              </Text>
            </View>
          </View>
        </View>

        {/* Charts Section */}
        <View style={styles.chartsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Graphiques
          </Text>
          
          <View style={[styles.chartCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.chartTitle, { color: colors.text }]}>
              Évolution des utilisateurs
            </Text>
            <LineChart
              data={{
                labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
                datasets: [
                  {
                    data: [850, 920, 1050, 1120, 1180, 1250],
                    color: (opacity = 1) => `rgba(0, 128, 128, ${opacity})`,
                    strokeWidth: 2,
                  },
                ],
              }}
              width={Dimensions.get('window').width - 40}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </View>

          <View style={[styles.chartCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.chartTitle, { color: colors.text }]}>
              Répartition des catégories
            </Text>
            <BarChart
              data={{
                labels: ['Électronique', 'Vêtements', 'Maison', 'Sport', 'Loisirs'],
                datasets: [
                  {
                    data: [35, 25, 20, 15, 5],
                  },
                ],
              }}
              width={Dimensions.get('window').width - 40}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
            />
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Activité Récente
          </Text>
          
          <View style={[styles.activityCard, { backgroundColor: colors.card }]}>
            <View style={styles.activityItem}>
              <Ionicons name="person-add-outline" size={20} color="#4CAF50" />
              <Text style={[styles.activityText, { color: colors.text }]}>
                12 nouveaux utilisateurs aujourd'hui
              </Text>
            </View>
            
            <View style={styles.activityItem}>
              <Ionicons name="cube-outline" size={20} color="#FF9800" />
              <Text style={[styles.activityText, { color: colors.text }]}>
                45 nouveaux produits ajoutés
              </Text>
            </View>
            
            <View style={styles.activityItem}>
              <Ionicons name="swap-horizontal-outline" size={20} color="#2196F3" />
              <Text style={[styles.activityText, { color: colors.text }]}>
                23 transactions effectuées
              </Text>
            </View>
            
            <View style={styles.activityItem}>
              <Ionicons name="trending-up-outline" size={20} color="#4CAF50" />
              <Text style={[styles.activityText, { color: colors.text }]}>
                Revenus en hausse de 15%
              </Text>
            </View>
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
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 10,
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    marginTop: 10,
  },
  kpiSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  kpiCard: {
    width: (Dimensions.get('window').width - 40 - 10) / 2, // Adjust for margin
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  kpiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  kpiLabel: {
    fontSize: 14,
    marginLeft: 8,
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  kpiGrowth: {
    fontSize: 14,
    fontWeight: '600',
  },
  chartsSection: {
    marginBottom: 20,
  },
  chartCard: {
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  chart: {
    marginVertical: 5,
  },
  activitySection: {
    marginTop: 20,
  },
  activityCard: {
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  activityText: {
    fontSize: 14,
    marginLeft: 10,
  },
});

export default AdminAnalyticsScreen; 