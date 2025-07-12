import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome, AntDesign, Ionicons } from '@expo/vector-icons';

const LOGO = require('../assets/images/logo-souqly.png');

export default function AuthLandingScreen({ navigation }: { navigation: any }) {
  const { colors, isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const { guest, signInWithApple, signInWithGoogle, signInWithFacebook } = useAuth();

  const handleGuestMode = () => {
    guest();
    // Navigation will be handled automatically by AppNavigator based on auth state
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
        // Navigation will be handled automatically by AppNavigator based on auth state
      } else {
        Alert.alert('Erreur', result.error || "Échec de l'authentification");
      }
    } catch (error) {
      Alert.alert('Erreur', "Une erreur est survenue lors de l'authentification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'left', 'right']}>
      <View style={{ flex: 1, justifyContent: 'space-between' }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity>
              <Text style={[styles.lang, styles.langLeft, { color: colors.text }]}>🌐 Français</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleGuestMode}>
              <Text style={[styles.skip, styles.skipRight, { color: '#888' }]}>Ignorer</Text>
            </TouchableOpacity>
          </View>

          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image source={LOGO} style={styles.logo} resizeMode="contain" />
          </View>

          {/* Slogan */}
          <Text style={[styles.slogan, { color: colors.text }]}>Découvrez, échangez et trouvez votre prochaine bonne affaire sur Souqly !</Text>

          {/* Boutons principaux */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#3ba6a6' }]}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>Se connecter</Text>
          </TouchableOpacity>

          {/* Social login */}
          <View style={styles.socialRow}>
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: isDark ? '#222' : '#f0f0f0' }]}
              onPress={() => handleSocialAuth('apple')}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Ionicons name="logo-apple" size={28} color={isDark ? '#fff' : '#222'} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: isDark ? '#222' : '#f0f0f0' }]}
              onPress={() => handleSocialAuth('google')}
              disabled={loading}
              activeOpacity={0.85}
            >
              <AntDesign name="google" size={28} color="#EA4335" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: isDark ? '#222' : '#f0f0f0' }]}
              onPress={() => handleSocialAuth('facebook')}
              disabled={loading}
              activeOpacity={0.85}
            >
              <FontAwesome name="facebook" size={28} color="#1877F3" />
            </TouchableOpacity>
          </View>
          {loading && <ActivityIndicator size="small" color="#3ba6a6" style={{ marginTop: 12 }} />}
        </ScrollView>
        {/* Footer toujours en bas */}
        <View style={{ paddingBottom: 16, paddingHorizontal: 24 }}>
          <Text style={[styles.footer, { color: colors.text, opacity: 0.6 }]}>© {new Date().getFullYear()} Souqly. Plateforme de découvertes et de bonnes affaires.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingTop: 12,
    zIndex: 10,
  },
  lang: {
    fontSize: 16,
    fontWeight: '500',
  },
  langLeft: {
    marginLeft: 24,
  },
  skip: {
    fontSize: 16,
    fontWeight: '400',
  },
  skipRight: {
    marginRight: 0,
    textAlign: 'right'
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e6f2f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  logo: {
    width: 80,
    height: 80,
  },
  slogan: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    width: '100%',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#3ba6a6',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 18,
    gap: 16,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  socialButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 32,
    fontSize: 13,
    textAlign: 'center',
  },
}); 