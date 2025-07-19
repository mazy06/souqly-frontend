import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import ReportService from '../services/ReportService';

type ReportProductRouteProp = RouteProp<{ ReportProduct: { productId: string; productTitle: string } }, 'ReportProduct'>;

const REPORT_REASONS = [
  'Prix suspect ou trompeur',
  'Description trompeuse',
  'Produit contrefait',
  'Contenu inapproprié',
  'Spam ou publicité',
  'Produit interdit',
  'Informations de contact dans l\'annonce',
  'Mauvaise catégorisation',
  'Photos de mauvaise qualité',
  'Autre raison'
];

export default function ReportProductScreen() {
  const navigation = useNavigation();
  const route = useRoute<ReportProductRouteProp>();
  const { colors } = useTheme();
  const { user } = useAuth();
  
  const { productId, productTitle } = route.params;
  
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [customReason, setCustomReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleReason = (reason: string) => {
    if (selectedReasons.includes(reason)) {
      setSelectedReasons(selectedReasons.filter(r => r !== reason));
    } else {
      setSelectedReasons([...selectedReasons, reason]);
    }
  };

  const handleSubmitReport = async () => {
    if (selectedReasons.length === 0) {
      Alert.alert('Erreur', 'Veuillez sélectionner au moins une raison de signalement');
      return;
    }

    if (!user?.id) {
      Alert.alert('Erreur', 'Vous devez être connecté pour signaler un produit');
      return;
    }

    setLoading(true);
    try {
      const reportData = {
        productId: parseInt(productId),
        userId: user.id,
        reasons: selectedReasons,
        customReason: customReason.trim() || null,
        description: description.trim() || null
      };

      await ReportService.createReport(reportData);
      
      Alert.alert(
        'Signalement envoyé',
        'Votre signalement a été enregistré et sera examiné par notre équipe. Merci de nous aider à maintenir la qualité de notre plateforme.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Erreur lors du signalement:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer le signalement pour le moment. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const renderReasonItem = (reason: string) => (
    <TouchableOpacity
      key={reason}
              style={[
          styles.reasonItem,
          {
            backgroundColor: selectedReasons.includes(reason) ? colors.primary : colors.card,
            borderColor: selectedReasons.includes(reason) ? colors.primary : colors.border
          }
        ]}
      onPress={() => toggleReason(reason)}
    >
      <View style={styles.reasonContent}>
        <Text style={[
          styles.reasonText,
          { color: selectedReasons.includes(reason) ? '#fff' : colors.text }
        ]}>
          {reason}
        </Text>
        <Ionicons
          name={selectedReasons.includes(reason) ? 'checkmark-circle' : 'ellipse-outline'}
          size={20}
          color={selectedReasons.includes(reason) ? '#fff' : colors.text}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Signaler ce produit
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Informations produit */}
        <View style={[styles.productInfo, { backgroundColor: colors.card }]}>
          <Text style={[styles.productTitle, { color: colors.text }]}>
            {productTitle}
          </Text>
          <Text style={[styles.productId, { color: colors.textSecondary }]}>
            ID: {productId}
          </Text>
        </View>

        {/* Raisons de signalement */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Raisons du signalement *
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Sélectionnez toutes les raisons qui s'appliquent
          </Text>
          
          <View style={styles.reasonsContainer}>
            {REPORT_REASONS.map(renderReasonItem)}
          </View>
        </View>

        {/* Raison personnalisée */}
        {selectedReasons.includes('Autre raison') && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Précisez votre raison
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  color: colors.text
                }
              ]}
              placeholder="Décrivez votre raison de signalement..."
              placeholderTextColor={colors.textSecondary}
              value={customReason}
              onChangeText={setCustomReason}
              multiline
              numberOfLines={3}
            />
          </View>
        )}

        {/* Description supplémentaire */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Description supplémentaire (optionnel)
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Ajoutez des détails pour nous aider à mieux comprendre le problème
          </Text>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.text
              }
            ]}
            placeholder="Décrivez le problème en détail..."
            placeholderTextColor={colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Bouton de soumission */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            {
              backgroundColor: selectedReasons.length > 0 ? colors.primary : colors.secondary,
              opacity: loading ? 0.7 : 1
            }
          ]}
          onPress={handleSubmitReport}
          disabled={selectedReasons.length === 0 || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>
              Envoyer le signalement
            </Text>
          )}
        </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  productInfo: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  productId: {
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  reasonsContainer: {
    gap: 12,
  },
  reasonItem: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  reasonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reasonText: {
    fontSize: 16,
    flex: 1,
    marginRight: 12,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  submitButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 