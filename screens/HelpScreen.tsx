import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';

export default function HelpScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();

  const faqItems = [
    {
      question: "Comment acheter un produit ?",
      answer: "Pour acheter un produit, cliquez sur le bouton 'Acheter' sur la page du produit. Vous serez redirigé vers l'écran de paiement."
    },
    {
      question: "Comment contacter un vendeur ?",
      answer: "Vous pouvez contacter un vendeur en cliquant sur 'Faire une offre' ou en utilisant le bouton de message sur la page du produit."
    },
    {
      question: "Comment signaler un produit ?",
      answer: "Utilisez le lien 'Signaler ce produit' en bas de la page du produit pour signaler un contenu inapproprié."
    },
    {
      question: "Comment ajouter aux favoris ?",
      answer: "Cliquez sur l'icône cœur sur la page du produit ou dans les listes de produits pour ajouter/retirer des favoris."
    },
    {
      question: "Comment vendre un produit ?",
      answer: "Utilisez l'onglet 'Vendre' dans la navigation pour créer une nouvelle annonce."
    }
  ];

  const supportOptions = [
    {
      title: "Centre d'aide",
      icon: "help-circle-outline",
      onPress: () => Alert.alert("Centre d'aide", "Redirection vers le centre d'aide en ligne")
    },
    {
      title: "Nous contacter",
      icon: "mail-outline",
      onPress: () => Alert.alert("Contact", "Email: support@souqly.com")
    },
    {
      title: "Chat en ligne",
      icon: "chatbubble-outline",
      onPress: () => Alert.alert("Chat", "Chat en ligne temporairement indisponible")
    },
    {
      title: "Conditions d'utilisation",
      icon: "document-text-outline",
      onPress: () => Alert.alert("Conditions", "Conditions d'utilisation à implémenter")
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
          Centre d'aide
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Section Support */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Support
          </Text>
          <View style={styles.supportGrid}>
            {supportOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.supportCard, { backgroundColor: colors.card }]}
                onPress={option.onPress}
              >
                <Ionicons name={option.icon as any} size={24} color={colors.primary} />
                <Text style={[styles.supportCardText, { color: colors.text }]}>
                  {option.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Section FAQ */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Questions fréquentes
          </Text>
          {faqItems.map((item, index) => (
            <View key={index} style={[styles.faqItem, { backgroundColor: colors.card }]}>
              <Text style={[styles.faqQuestion, { color: colors.text }]}>
                {item.question}
              </Text>
              <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>
                {item.answer}
              </Text>
            </View>
          ))}
        </View>

        {/* Section Contact */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Nous contacter
          </Text>
          <View style={[styles.contactCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.contactText, { color: colors.textSecondary }]}>
              Email: support@souqly.com{'\n'}
              Téléphone: +33 1 23 45 67 89{'\n'}
              Horaires: Lun-Ven 9h-18h
            </Text>
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
    marginBottom: 16,
  },
  supportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  supportCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  supportCardText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  faqItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 20,
  },
  contactCard: {
    padding: 16,
    borderRadius: 12,
  },
  contactText: {
    fontSize: 14,
    lineHeight: 20,
  },
}); 