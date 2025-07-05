import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import CustomHeader from '../components/CustomHeader';

export default function LoginScreen({ navigation }: { navigation: any }) {
  const { signInWithEmail, signUpWithEmail } = useAuth();
  const { colors } = useTheme();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password || (!isLogin && !name)) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      let result;
      if (isLogin) {
        result = await signInWithEmail(email, password);
      } else {
        result = await signUpWithEmail(email, password, name);
      }
      
      if (result.success) {
        navigation.navigate('Main');
      } else {
        Alert.alert('Erreur', result.error || 'Échec de l\'authentification');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <CustomHeader onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          {isLogin ? 'Connexion' : 'Inscription'}
        </Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>
          {isLogin ? 'Bienvenue sur Souqly' : 'Créez votre compte Souqly'}
        </Text>

        {!isLogin && (
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.card, 
              color: colors.text, 
              borderColor: colors.border 
            }]}
            placeholder="Nom complet"
            placeholderTextColor={colors.text + '80'}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        )}

        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.card, 
            color: colors.text, 
            borderColor: colors.border 
          }]}
          placeholder="Adresse e-mail"
          placeholderTextColor={colors.text + '80'}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.card, 
            color: colors.text, 
            borderColor: colors.border 
          }]}
          placeholder="Mot de passe"
          placeholderTextColor={colors.text + '80'}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <PrimaryButton 
          title={isLogin ? 'Se connecter' : 'S\'inscrire'} 
          onPress={handleSubmit}
        />

        <TouchableOpacity 
          style={styles.switchButton}
          onPress={() => setIsLogin(!isLogin)}
        >
          <Text style={[styles.switchText, { color: '#3ba6a6' }]}>
            {isLogin ? 'Pas encore de compte ? S\'inscrire' : 'Déjà un compte ? Se connecter'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    opacity: 0.8,
  },
  input: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    fontSize: 16,
  },
  switchButton: {
    marginTop: 20,
    padding: 10,
  },
  switchText: {
    fontSize: 16,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
}); 