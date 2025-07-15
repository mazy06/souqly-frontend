import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import ApiService from '../services/ApiService';

export default function PaymentMethodsScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  const [iban, setIban] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [savedIban, setSavedIban] = useState('');

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const response = await ApiService.get(`/users/${user?.id}/payment-methods`) as any;
      setSavedIban(response.iban || '');
    } catch (error) {
      console.log('⚠️ Aucun IBAN enregistré');
      setSavedIban('');
    }
  };

  const handleSaveIban = async () => {
    if (!iban.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un IBAN valide');
      return;
    }

    // Validation basique de l'IBAN (format français)
    const ibanRegex = /^FR\d{2}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{2}\s?\d{2}$/;
    if (!ibanRegex.test(iban.replace(/\s/g, ''))) {
      Alert.alert('Erreur', 'Format d\'IBAN invalide. Utilisez un IBAN français.');
      return;
    }

    try {
      setIsLoading(true);
      await ApiService.put(`/users/${user?.id}/payment-methods`, {
        iban: iban.trim()
      });
      
      setSavedIban(iban.trim());
      setIban('');
      
      Alert.alert(
        'Succès',
        'Votre IBAN a été enregistré avec succès. Vous recevrez vos paiements directement sur ce compte.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'IBAN:', error);
      Alert.alert(
        'Erreur',
        'Impossible d\'enregistrer l\'IBAN. Veuillez réessayer.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteIban = async () => {
    Alert.alert(
      'Supprimer l\'IBAN',
      'Êtes-vous sûr de vouloir supprimer votre IBAN enregistré ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await ApiService.delete(`/users/${user?.id}/payment-methods`);
              setSavedIban('');
              Alert.alert('Succès', 'Votre IBAN a été supprimé.');
            } catch (error) {
              console.error('Erreur lors de la suppression:', error);
              Alert.alert('Erreur', 'Impossible de supprimer l\'IBAN.');
            }
          }
        }
      ]
    );
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
          Moyens de paiement
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Section IBAN */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="card-outline" size={24} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Compte bancaire
            </Text>
          </View>
          
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Ajoutez votre IBAN pour recevoir vos paiements directement sur votre compte bancaire.
          </Text>

          {savedIban ? (
            <View style={styles.savedIbanContainer}>
              <View style={styles.ibanInfo}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={[styles.savedIbanText, { color: colors.text }]}>
                  IBAN enregistré : {savedIban}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.deleteButton, { backgroundColor: '#FF6B6B' }]}
                onPress={handleDeleteIban}
              >
                <Ionicons name="trash-outline" size={16} color="white" />
                <Text style={styles.deleteButtonText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.addIbanContainer}>
              <TextInput
                style={[styles.ibanInput, { 
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.text 
                }]}
                placeholder="FR76 1234 5678 9012 3456 7890 123"
                placeholderTextColor={colors.textSecondary}
                value={iban}
                onChangeText={setIban}
                autoCapitalize="characters"
                maxLength={34}
              />
              <TouchableOpacity
                style={[styles.saveButton, { 
                  backgroundColor: colors.primary,
                  opacity: isLoading ? 0.6 : 1 
                }]}
                onPress={handleSaveIban}
                disabled={isLoading}
              >
                <Ionicons name="save-outline" size={16} color="white" />
                <Text style={styles.saveButtonText}>
                  {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Section Carte bancaire - Promotion */}
        <View style={[styles.promotionSection, { backgroundColor: '#E3F2FD' }]}>
          <View style={styles.promotionHeader}>
            <Ionicons name="star" size={24} color="#1976D2" />
            <Text style={styles.promotionTitle}>
              Avantages de la carte bancaire
            </Text>
          </View>
          
          <Text style={styles.promotionDescription}>
            Utilisez votre carte bancaire pour bénéficier des avantages exclusifs du porte-monnaie Souqly :
          </Text>
          
          <View style={styles.advantagesList}>
            <View style={styles.advantageItem}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.advantageText}>
                Paiements instantanés et sécurisés
              </Text>
            </View>
            
            <View style={styles.advantageItem}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.advantageText}>
                Frais réduits sur les transactions
              </Text>
            </View>
            
            <View style={styles.advantageItem}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.advantageText}>
                Protection acheteur incluse
              </Text>
            </View>
            
            <View style={styles.advantageItem}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.advantageText}>
                Support prioritaire client
              </Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={[styles.promotionButton, { backgroundColor: '#1976D2' }]}
            onPress={() => (navigation as any).navigate('Wallet')}
          >
            <Ionicons name="wallet-outline" size={16} color="white" />
            <Text style={styles.promotionButtonText}>
              Accéder au porte-monnaie
            </Text>
          </TouchableOpacity>
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
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  addIbanContainer: {
    gap: 12,
  },
  ibanInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'monospace',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  savedIbanContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#F0F8F0',
    borderRadius: 8,
  },
  ibanInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  savedIbanText: {
    fontSize: 14,
    marginLeft: 8,
    fontFamily: 'monospace',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 6,
    gap: 4,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  promotionSection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  promotionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  promotionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1976D2',
    marginLeft: 8,
  },
  promotionDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#1976D2',
    marginBottom: 16,
  },
  advantagesList: {
    gap: 8,
    marginBottom: 16,
  },
  advantageItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  advantageText: {
    fontSize: 14,
    color: '#1976D2',
    marginLeft: 8,
  },
  promotionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  promotionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 