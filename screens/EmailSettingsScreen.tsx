import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import ApiService from '../services/ApiService';

export default function EmailSettingsScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  const [isCommercialEmailEnabled, setIsCommercialEmailEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEmailSettings();
  }, []);

  const loadEmailSettings = async () => {
    try {
      setIsLoading(true);
      // Appel API pour récupérer les paramètres email
      const response = await ApiService.get(`/users/${user?.id}/email-settings`) as any;
      setIsCommercialEmailEnabled(response.commercialEmailEnabled || false);
    } catch (error) {
      console.log('⚠️ Utilisation des paramètres par défaut');
      // Par défaut, le démarchage commercial est désactivé
      setIsCommercialEmailEnabled(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleCommercialEmail = async (value: boolean) => {
    try {
      // Appel API pour mettre à jour les paramètres
      await ApiService.put(`/users/${user?.id}/email-settings`, {
        commercialEmailEnabled: value
      });
      
      setIsCommercialEmailEnabled(value);
      
      Alert.alert(
        'Paramètres mis à jour',
        value 
          ? 'Vous recevrez maintenant des emails commerciaux de Souqly.'
          : 'Vous ne recevrez plus d\'emails commerciaux de Souqly.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Erreur lors de la mise à jour des paramètres:', error);
      Alert.alert(
        'Erreur',
        'Impossible de mettre à jour les paramètres. Veuillez réessayer.',
        [{ text: 'OK' }]
      );
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
          Paramètres Email
        </Text>
        <View style={styles.headerRight} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="mail-outline" size={24} color={colors.primary} style={styles.settingIcon} />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>
                  Démarchage commercial
                </Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Recevoir des emails promotionnels et offres spéciales
                </Text>
              </View>
            </View>
            <Switch
              value={isCommercialEmailEnabled}
              onValueChange={handleToggleCommercialEmail}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={isCommercialEmailEnabled ? '#fff' : '#f4f3f4'}
              disabled={isLoading}
            />
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Vous pouvez modifier ces paramètres à tout moment. Les emails transactionnels (commandes, sécurité) ne sont pas affectés par ce paramètre.
          </Text>
        </View>
      </View>
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
  section: {
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