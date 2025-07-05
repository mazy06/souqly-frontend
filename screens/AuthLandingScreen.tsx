import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Modal, Pressable, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const images = [
  'https://images.unsplash.com/photo-1512436991641-6745cdb1723f',
  'https://images.unsplash.com/photo-1519125323398-675f0ddb6308',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
  'https://images.unsplash.com/photo-1465101046530-73398c7f28ca',
  'https://images.unsplash.com/photo-1519125323398-675f0ddb6308',
  'https://images.unsplash.com/photo-1512436991641-6745cdb1723f',
];

export default function AuthLandingScreen({ navigation }: { navigation: any }) {
  const { colors, isDark } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const { guest, signInWithApple, signInWithGoogle, signInWithFacebook } = useAuth();

  const handleGuestMode = () => {
    guest();
    navigation.navigate('Main');
  };

  const handleSocialAuth = async (provider: 'apple' | 'google' | 'facebook') => {
    setLoading(true);
    try {
      let result;
      switch (provider) {
        case 'apple':
          result = await signInWithApple();
          break;
        case 'google':
          result = await signInWithGoogle();
          break;
        case 'facebook':
          result = await signInWithFacebook();
          break;
      }
      
      if (result.success) {
        navigation.navigate('Main');
      } else {
        Alert.alert('Erreur', result.error || 'Échec de l\'authentification');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'authentification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Text style={[styles.lang, { color: colors.text }]}>🌐 Français</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleGuestMode}>
          <Text style={[styles.skip, { color: '#888' }]}>Ignorer</Text>
        </TouchableOpacity>
      </View>

      {/* Mosaïque d'images */}
      <View style={styles.imagesGrid}>
        {images.map((img, idx) => (
          <Image key={idx} source={{ uri: img }} style={styles.image} />
        ))}
      </View>

      {/* Slogan */}
      <Text style={[styles.slogan, { color: colors.text }]}>La magie de la nouveauté ne s'arrête jamais.</Text>

      {/* Boutons */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#3ba6a6' }]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.buttonText}>S'inscrire sur Souqly</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.buttonOutline]}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={[styles.buttonText, { color: '#3ba6a6' }]}>Accéder à mon compte</Text>
      </TouchableOpacity>

      {/* Footer */}
      <Text style={[styles.footer, { color: colors.text, opacity: 0.7 }]}>À propos de Souqly : <Text style={styles.link}>Notre plateforme</Text></Text>

      {/* Modal d'inscription */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}> 
            <Text style={[styles.modalTitle, { color: colors.text }]}>S'inscrire sur Souqly</Text>
            <Text style={[styles.modalSubtitle, { color: colors.text }]}>Utilise ton identifiant Apple, c'est plus rapide.</Text>
            
            <TouchableOpacity 
              style={[styles.socialButton, { backgroundColor: isDark ? '#222' : '#f0f0f0' }, loading && styles.socialButtonDisabled]}
              onPress={() => handleSocialAuth('apple')}
              disabled={loading}
            >
              <Text style={[styles.socialButtonText, { color: isDark ? '#fff' : '#222' }]}>🍎 Continuer avec Apple</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.socialButton, { backgroundColor: isDark ? '#222' : '#f0f0f0' }, loading && styles.socialButtonDisabled]}
              onPress={() => handleSocialAuth('google')}
              disabled={loading}
            >
              <Text style={[styles.socialButtonText, { color: isDark ? '#fff' : '#222' }]}>🔍 Continuer avec Google</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.socialButton, { backgroundColor: isDark ? '#222' : '#f0f0f0' }, loading && styles.socialButtonDisabled]}
              onPress={() => handleSocialAuth('facebook')}
              disabled={loading}
            >
              <Text style={[styles.socialButtonText, { color: isDark ? '#fff' : '#222' }]}>📘 Continuer avec Facebook</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.emailLink, { color: '#3ba6a6' }]}>Continuer avec une adresse e-mail</Text>
            </TouchableOpacity>
            
            <Pressable onPress={() => setModalVisible(false)} style={styles.closeModal}>
              <Text style={{ color: '#3ba6a6', fontWeight: 'bold' }}>Fermer</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingTop: 40 },
  header: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 10 },
  lang: { fontSize: 16, fontWeight: '500' },
  skip: { fontSize: 16, fontWeight: '400' },
  imagesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginVertical: 20 },
  image: { width: 100, height: 100, borderRadius: 16, margin: 4 },
  slogan: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginVertical: 24 },
  button: { width: '90%', padding: 16, borderRadius: 8, alignItems: 'center', marginVertical: 8 },
  buttonOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#3ba6a6' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  footer: { marginTop: 24, fontSize: 14, textAlign: 'center' },
  link: { textDecorationLine: 'underline', color: '#3ba6a6' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  modalSubtitle: { fontSize: 16, marginBottom: 20, textAlign: 'center' },
  socialButton: { width: '100%', padding: 14, borderRadius: 8, alignItems: 'center', marginVertical: 6 },
  socialButtonDisabled: { backgroundColor: '#555' },
  socialButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  emailLink: { marginTop: 18, fontSize: 16, textAlign: 'center', textDecorationLine: 'underline' },
  closeModal: { marginTop: 18 },
}); 