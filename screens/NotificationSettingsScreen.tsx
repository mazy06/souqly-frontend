import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import ApiService from '../services/ApiService';

interface NotificationSettings {
  messaging: {
    newMessages: {
      mobile: boolean;
      email: boolean;
    };
  };
  adLife: {
    favorites: {
      mobile: boolean;
      email: boolean;
    };
    online: {
      mobile: boolean;
    };
    expiration: {
      mobile: boolean;
    };
  };
  news: {
    mobile: boolean;
    email: boolean;
  };
  personalized: {
    mobile: boolean;
    email: boolean;
  };
  partners: {
    email: boolean;
  };
}

export default function NotificationSettingsScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  
  // États pour les sections déroulables
  const [messagingExpanded, setMessagingExpanded] = useState(true);
  const [adLifeExpanded, setAdLifeExpanded] = useState(true);
  
  // État pour les paramètres de notifications
  const [settings, setSettings] = useState<NotificationSettings>({
    messaging: {
      newMessages: {
        mobile: true,
        email: true,
      },
    },
    adLife: {
      favorites: {
        mobile: true,
        email: true,
      },
      online: {
        mobile: true,
      },
      expiration: {
        mobile: true,
      },
    },
    news: {
      mobile: true,
      email: false,
    },
    personalized: {
      mobile: true,
      email: true,
    },
    partners: {
      email: false,
    },
  });

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      const response = await ApiService.get(`/users/${user?.id}/notification-settings`) as any;
      if (response) {
        setSettings(response);
      }
    } catch (error) {
      console.log('⚠️ Utilisation des paramètres par défaut');
      // Les paramètres par défaut sont déjà définis dans l'état initial
    }
  };

  const handleToggleSetting = async (path: string, value: boolean) => {
    try {
      // Mise à jour locale immédiate
      const newSettings = { ...settings };
      const pathArray = path.split('.');
      let current: any = newSettings;
      
      for (let i = 0; i < pathArray.length - 1; i++) {
        current = current[pathArray[i]];
      }
      current[pathArray[pathArray.length - 1]] = value;
      
      setSettings(newSettings);

      // Appel API pour sauvegarder
      await ApiService.put(`/users/${user?.id}/notification-settings`, {
        [path]: value
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour des paramètres:', error);
      // Revenir à l'état précédent en cas d'erreur
      loadNotificationSettings();
    }
  };

  const renderToggle = (path: string, value: boolean, icon: string, label: string) => (
    <View style={styles.toggleRow}>
      <View style={styles.toggleInfo}>
        <Ionicons name={icon as any} size={20} color={colors.textSecondary} style={styles.toggleIcon} />
        <Text style={[styles.toggleLabel, { color: colors.text }]}>
          {label}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={(newValue) => handleToggleSetting(path, newValue)}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={value ? '#fff' : '#f4f3f4'}
      />
    </View>
  );

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
          Notifications
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Section Messagerie */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setMessagingExpanded(!messagingExpanded)}
            activeOpacity={0.7}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Messagerie
            </Text>
            <Ionicons 
              name={messagingExpanded ? "chevron-up" : "chevron-down"} 
              size={20} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>
          
          {messagingExpanded && (
            <View style={styles.sectionContent}>
              <Text style={[styles.subsectionTitle, { color: colors.text }]}>
                Nouveaux messages
              </Text>
              {renderToggle(
                'messaging.newMessages.mobile',
                settings.messaging.newMessages.mobile,
                'phone-portrait-outline',
                'Notifications mobile'
              )}
              {renderToggle(
                'messaging.newMessages.email',
                settings.messaging.newMessages.email,
                'mail-outline',
                'E-mails'
              )}
            </View>
          )}
        </View>

        {/* Section Vie de l'annonce */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setAdLifeExpanded(!adLifeExpanded)}
            activeOpacity={0.7}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Vie de l'annonce
            </Text>
            <Ionicons 
              name={adLifeExpanded ? "chevron-up" : "chevron-down"} 
              size={20} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>
          
          {adLifeExpanded && (
            <View style={styles.sectionContent}>
              <Text style={[styles.subsectionTitle, { color: colors.text }]}>
                Mise en favoris de mes annonces
              </Text>
              {renderToggle(
                'adLife.favorites.mobile',
                settings.adLife.favorites.mobile,
                'phone-portrait-outline',
                'Notifications mobile'
              )}
              {renderToggle(
                'adLife.favorites.email',
                settings.adLife.favorites.email,
                'mail-outline',
                'E-mails'
              )}
              
              <Text style={[styles.subsectionTitle, { color: colors.text }]}>
                Mise en ligne de mes annonces
              </Text>
              {renderToggle(
                'adLife.online.mobile',
                settings.adLife.online.mobile,
                'phone-portrait-outline',
                'Notifications mobile'
              )}
              
              <Text style={[styles.subsectionTitle, { color: colors.text }]}>
                Expiration de mes annonces
              </Text>
              {renderToggle(
                'adLife.expiration.mobile',
                settings.adLife.expiration.mobile,
                'phone-portrait-outline',
                'Notifications mobile'
              )}
            </View>
          )}
        </View>

        {/* Section Actus, offres et conseils */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Actus, offres et conseils
            </Text>
          </View>
          
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Newsletters à propos des nouvelles fonctionnalités, des offres promo du moment et des tendances de recherche
          </Text>
          
          <View style={styles.sectionContent}>
            {renderToggle(
              'news.mobile',
              settings.news.mobile,
              'phone-portrait-outline',
              'Notifications mobile'
            )}
            {renderToggle(
              'news.email',
              settings.news.email,
              'mail-outline',
              'E-mails'
            )}
          </View>
        </View>

        {/* Section Communications personnalisées */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Communications personnalisées
            </Text>
          </View>
          
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Communications personnalisées par rapport à votre utilisation et des conseils rien que pour vous
          </Text>
          
          <View style={styles.sectionContent}>
            {renderToggle(
              'personalized.mobile',
              settings.personalized.mobile,
              'phone-portrait-outline',
              'Notifications mobile'
            )}
            {renderToggle(
              'personalized.email',
              settings.personalized.email,
              'mail-outline',
              'E-mails'
            )}
          </View>
        </View>

        {/* Section Communications partenaires */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Communications partenaires
            </Text>
          </View>
          
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Communications en collaboration avec nos partenaires
          </Text>
          
          <View style={styles.sectionContent}>
            {renderToggle(
              'partners.email',
              settings.partners.email,
              'mail-outline',
              'E-mails'
            )}
          </View>
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
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  sectionContent: {
    gap: 12,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 8,
    marginBottom: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  toggleIcon: {
    marginRight: 12,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '400',
  },
}); 