import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import ApiService from '../services/ApiService';

export default function BulkDiscountScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  const [isBulkDiscountEnabled, setIsBulkDiscountEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBulkDiscountSettings();
  }, []);

  const loadBulkDiscountSettings = async () => {
    try {
      setIsLoading(true);
      const response = await ApiService.get(`/users/${user?.id}/bulk-discount-settings`) as any;
      setIsBulkDiscountEnabled(response.bulkDiscountEnabled || false);
    } catch (error) {
      console.log('⚠️ Utilisation des paramètres par défaut');
      // Par défaut, les réductions sur lots sont désactivées
      setIsBulkDiscountEnabled(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleBulkDiscount = async (value: boolean) => {
    try {
      setIsLoading(true);
      await ApiService.put(`/users/${user?.id}/bulk-discount-settings`, {
        bulkDiscountEnabled: value
      });
      
      setIsBulkDiscountEnabled(value);
      
      Alert.alert(
        'Paramètres mis à jour',
        value 
          ? 'Les réductions sur les lots sont maintenant activées. Vos acheteurs pourront bénéficier de prix réduits lors d\'achats groupés.'
          : 'Les réductions sur les lots sont maintenant désactivées.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Erreur lors de la mise à jour des paramètres:', error);
      Alert.alert(
        'Erreur',
        'Impossible de mettre à jour les paramètres. Veuillez réessayer.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Réductions sur les lots
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Section principale */}
        <View style={[styles.mainSection, { backgroundColor: colors.card }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="pricetag-outline" size={24} color={colors.primary} style={styles.settingIcon} />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>
                  Activer les réductions sur les lots
                </Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Permettre aux acheteurs de bénéficier de réductions lors d'achats groupés
                </Text>
              </View>
            </View>
            <Switch
              value={isBulkDiscountEnabled}
              onValueChange={handleToggleBulkDiscount}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={isBulkDiscountEnabled ? '#fff' : '#f4f3f4'}
              disabled={isLoading}
            />
          </View>
        </View>

        {/* Section Avantages */}
        <View style={[styles.advantagesSection, { backgroundColor: '#E8F5E8' }]}>
          <View style={styles.advantagesHeader}>
            <Ionicons name="trending-up" size={24} color="#2E7D32" />
            <Text style={styles.advantagesTitle}>
              Avantages pour augmenter vos ventes
            </Text>
          </View>
          
          <Text style={styles.advantagesDescription}>
            En activant les réductions sur les lots, vous augmentez significativement vos chances de vendre plus rapidement et plus efficacement :
          </Text>
          
          <View style={styles.advantagesList}>
            <View style={styles.advantageItem}>
              <Ionicons name="rocket-outline" size={20} color="#2E7D32" />
              <View style={styles.advantageContent}>
                <Text style={styles.advantageTitle}>
                  Ventes plus rapides
                </Text>
                <Text style={styles.advantageText}>
                  Les prix réduits sur les lots attirent plus d'acheteurs et accélèrent vos ventes
                </Text>
              </View>
            </View>
            
            <View style={styles.advantageItem}>
              <Ionicons name="cube-outline" size={20} color="#2E7D32" />
              <View style={styles.advantageContent}>
                <Text style={styles.advantageTitle}>
                  Un seul colis à préparer
                </Text>
                <Text style={styles.advantageText}>
                  Réduisez le temps de préparation et les frais d'expédition en vendant plusieurs articles ensemble
                </Text>
              </View>
            </View>
            
            <View style={styles.advantageItem}>
              <Ionicons name="pricetag" size={20} color="#2E7D32" />
              <View style={styles.advantageContent}>
                <Text style={styles.advantageTitle}>
                  Prix plus attractifs
                </Text>
                <Text style={styles.advantageText}>
                  Les réductions sur lots rendent vos articles plus compétitifs et augmentent l'intérêt des acheteurs
                </Text>
              </View>
            </View>
            
            <View style={styles.advantageItem}>
              <Ionicons name="people-outline" size={20} color="#2E7D32" />
              <View style={styles.advantageContent}>
                <Text style={styles.advantageTitle}>
                  Plus d'acheteurs potentiels
                </Text>
                <Text style={styles.advantageText}>
                  Attirez des acheteurs qui recherchent des bonnes affaires et des économies d'échelle
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Section Comment ça marche */}
        <View style={[styles.howItWorksSection, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Comment ça marche ?
            </Text>
          </View>
          
          <View style={styles.stepsList}>
            <View style={styles.stepItem}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, { color: colors.text }]}>
                  Activez la fonctionnalité
                </Text>
                <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
                  Activez les réductions sur les lots dans vos paramètres
                </Text>
              </View>
            </View>
            
            <View style={styles.stepItem}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, { color: colors.text }]}>
                  Configurez vos réductions
                </Text>
                <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
                  Définissez les pourcentages de réduction selon la quantité d'articles achetés
                </Text>
              </View>
            </View>
            
            <View style={styles.stepItem}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, { color: colors.text }]}>
                  Vendez plus efficacement
                </Text>
                <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
                  Les acheteurs voient automatiquement les réductions et sont incités à acheter plus
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Section Info */}
        <View style={styles.infoSection}>
          <Ionicons name="bulb-outline" size={20} color={colors.textSecondary} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Vous pouvez modifier ces paramètres à tout moment. Les réductions s'appliquent automatiquement aux acheteurs qui sélectionnent plusieurs articles de vos annonces.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  mainSection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  advantagesSection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  advantagesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  advantagesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E7D32',
    marginLeft: 8,
  },
  advantagesDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#2E7D32',
    marginBottom: 16,
  },
  advantagesList: {
    gap: 16,
  },
  advantageItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  advantageContent: {
    flex: 1,
    marginLeft: 12,
  },
  advantageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 4,
  },
  advantageText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#2E7D32',
  },
  howItWorksSection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  stepsList: {
    gap: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 8,
    flex: 1,
  },
}); 