import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';

export default function TermsScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();

  const termsSections = [
    {
      title: "Conditions générales de vente",
      content: `1. ACCEPTATION DES CONDITIONS\n\nEn utilisant Souqly, vous acceptez d'être lié par ces conditions de vente.\n\n2. DESCRIPTION DU SERVICE\n\nSouqly est une plateforme de marketplace permettant aux utilisateurs d'acheter et vendre des produits.\n\n3. COMPTE UTILISATEUR\n\nVous êtes responsable de maintenir la confidentialité de votre compte et mot de passe.\n\n4. PRODUITS ET SERVICES\n\nLes vendeurs sont responsables de la description précise de leurs produits.\n\n5. PAIEMENTS\n\nLes paiements sont traités de manière sécurisée via nos partenaires de paiement.\n\n6. LIVRAISON\n\nLes frais et délais de livraison sont à la charge de l'acheteur sauf accord contraire.\n\n7. RETOURS ET REMBOURSEMENTS\n\nLes retours sont acceptés selon les conditions spécifiées par chaque vendeur.\n\n8. PROTECTION DES DONNÉES\n\nVos données personnelles sont protégées conformément au RGPD.\n\n9. LIMITATION DE RESPONSABILITÉ\n\nSouqly ne peut être tenu responsable des transactions entre utilisateurs.\n\n10. MODIFICATIONS\n\nCes conditions peuvent être modifiées à tout moment.`
    },
    {
      title: "Politique de confidentialité",
      content: `Nous collectons et utilisons vos données personnelles pour :\n\n• Fournir nos services\n• Améliorer l'expérience utilisateur\n• Communiquer avec vous\n• Assurer la sécurité\n\nVos données ne sont jamais vendues à des tiers.\n\nVous pouvez demander la suppression de vos données à tout moment.`
    },
    {
      title: "Règles de la communauté",
      content: `Interdictions :\n\n• Vente de produits illégaux\n• Contenu inapproprié\n• Harcèlement d'autres utilisateurs\n• Fausses informations\n• Spam ou publicité non autorisée\n\nRespectez les autres utilisateurs et la plateforme.`
    }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top','left','right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Conditions de vente
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {termsSections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {section.title}
            </Text>
            <View style={[styles.sectionContent, { backgroundColor: colors.card }]}>
              <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
                {section.content}
              </Text>
            </View>
          </View>
        ))}

        {/* Contact */}
        <View style={styles.contactSection}>
          <Text style={[styles.contactTitle, { color: colors.text }]}>
            Questions ?
          </Text>
          <Text style={[styles.contactText, { color: colors.textSecondary }]}>
            Contactez-nous à legal@souqly.com
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  sectionContent: {
    padding: 16,
    borderRadius: 12,
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 22,
  },
  contactSection: {
    marginTop: 32,
    alignItems: 'center',
    padding: 16,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    textAlign: 'center',
  },
}); 