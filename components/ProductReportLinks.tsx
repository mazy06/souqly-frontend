import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProductReportLinksProps {
  onReportPress?: () => void;
  onHelpPress?: () => void;
  onTermsPress?: () => void;
}

export default function ProductReportLinks({
  onReportPress,
  onHelpPress,
  onTermsPress,
}: ProductReportLinksProps) {
  return (
    <View style={styles.container}>
      <View style={styles.divider} />
      
      <View style={styles.linksContainer}>
        <TouchableOpacity style={styles.linkItem} onPress={onReportPress}>
          <Ionicons name="flag-outline" size={16} color="#666" />
          <Text style={styles.linkText}>Signaler ce produit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.linkItem} onPress={onHelpPress}>
          <Ionicons name="help-circle-outline" size={16} color="#666" />
          <Text style={styles.linkText}>Aide</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.linkItem} onPress={onTermsPress}>
          <Ionicons name="document-text-outline" size={16} color="#666" />
          <Text style={styles.linkText}>Conditions de vente</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          © 2024 Souqly. Tous droits réservés.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingTop: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginHorizontal: 16,
  },
  linksContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  linkText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
}); 