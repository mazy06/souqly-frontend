import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, Animated, Easing, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import CustomHeader from '../components/CustomHeader';
import Checkbox from 'expo-checkbox';
import * as ImagePicker from 'expo-image-picker';

export default function LoginScreen({ navigation }: { navigation: any }) {
  const { signInWithEmail, signUpWithEmail } = useAuth();
  const { colors, themeMode } = useTheme();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptCGU, setAcceptCGU] = useState(false);
  const [pseudo, setPseudo] = useState('');
  const [phone, setPhone] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [gender, setGender] = useState('');
  const [city, setCity] = useState('');
  const [newsletter, setNewsletter] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const switchAnim = useState(new Animated.Value(0))[0];

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    if (!isLogin) {
      if (!pseudo || !name || !email || !phone || !birthdate || !city || !password || !confirmPassword) {
        setError('Veuillez remplir tous les champs obligatoires');
        return;
      }
      if (password !== confirmPassword) {
        setError('Les mots de passe ne correspondent pas');
        return;
      }
      if (!acceptCGU) {
        setError("Vous devez accepter les Conditions Générales d'Utilisation");
        return;
      }
    } else {
      if (!email || !password) {
        setError('Veuillez remplir tous les champs');
        return;
      }
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
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      } else {
        setError(result.error || "Échec de l'authentification");
      }
    } catch (error) {
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitch = (toLogin: boolean) => {
    Animated.timing(switchAnim, {
      toValue: toLogin ? 0 : 1,
      duration: 350,
      easing: Easing.out(Easing.exp),
      useNativeDriver: false,
    }).start();
    setIsLogin(toLogin);
    setError(null);
  };

  return (
    <View style={styles.container}>
      <CustomHeader onBack={() => navigation.reset({ index: 0, routes: [{ name: 'Auth' }] })} />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Logo centré */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/logo-souqly.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        {/* Carte d'auth flottante */}
        <View style={styles.card}>
          {/* Tabs login/signup */}
          <View style={styles.tabRow}>
            <TouchableOpacity style={[styles.tab, isLogin && styles.tabActive]} onPress={() => handleSwitch(true)}>
              <Animated.Text style={[styles.tabText, isLogin && styles.tabTextActive]}>Connexion</Animated.Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, !isLogin && styles.tabActive]} onPress={() => handleSwitch(false)}>
              <Animated.Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>Inscription</Animated.Text>
            </TouchableOpacity>
          </View>
          {/* Champs */}
          {!isLogin && (
            <>
              {/* Photo de profil */}
              <TouchableOpacity style={styles.profileImagePicker} onPress={handlePickImage} activeOpacity={0.8}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.profileImage} />
                ) : (
                  <View style={styles.profileImagePlaceholder}>
                    <Ionicons name="camera-outline" size={28} color={'rgb(0, 128, 128)'} />
                    <Text style={styles.profileImageText}>Ajouter une photo</Text>
                  </View>
                )}
              </TouchableOpacity>
              {/* Pseudo */}
              <View style={styles.inputWrapper}>
                <Ionicons name="person-circle-outline" size={20} color={'rgb(0, 128, 128)'} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Pseudo (nom d'utilisateur)"
                  placeholderTextColor="#aaa"
                  value={pseudo}
                  onChangeText={setPseudo}
                  autoCapitalize="none"
                  returnKeyType="next"
                />
              </View>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color={'rgb(0, 128, 128)'} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nom complet"
                  placeholderTextColor="#aaa"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>
              {/* Téléphone */}
              <View style={styles.inputWrapper}>
                <Ionicons name="call-outline" size={20} color={'rgb(0, 128, 128)'} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Numéro de téléphone"
                  placeholderTextColor="#aaa"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  returnKeyType="next"
                />
              </View>
              {/* Date de naissance */}
              <View style={styles.inputWrapper}>
                <Ionicons name="calendar-outline" size={20} color={'rgb(0, 128, 128)'} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Date de naissance (JJ/MM/AAAA)"
                  placeholderTextColor="#aaa"
                  value={birthdate}
                  onChangeText={setBirthdate}
                  keyboardType="numbers-and-punctuation"
                  returnKeyType="next"
                />
              </View>
              {/* Genre */}
              <View style={styles.inputWrapper}>
                <Ionicons name="male-female-outline" size={20} color={'rgb(0, 128, 128)'} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Genre (optionnel)"
                  placeholderTextColor="#aaa"
                  value={gender}
                  onChangeText={setGender}
                  returnKeyType="next"
                />
              </View>
              {/* Ville */}
              <View style={styles.inputWrapper}>
                <Ionicons name="location-outline" size={20} color={'rgb(0, 128, 128)'} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Ville"
                  placeholderTextColor="#aaa"
                  value={city}
                  onChangeText={setCity}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>
            </>
          )}
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color={'rgb(0, 128, 128)'} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Adresse e-mail"
              placeholderTextColor="#aaa"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
            />
          </View>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color={'rgb(0, 128, 128)'} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              placeholderTextColor="#aaa"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              returnKeyType="done"
            />
            <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.eyeIcon}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#aaa" />
            </TouchableOpacity>
          </View>
          {!isLogin && (
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={'rgb(0, 128, 128)'} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirmer le mot de passe"
                placeholderTextColor="#aaa"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                returnKeyType="done"
              />
            </View>
          )}
          {!isLogin && (
            <View style={styles.cguRow}>
              <Checkbox
                value={acceptCGU}
                onValueChange={setAcceptCGU}
                color={acceptCGU ? 'rgb(0, 128, 128)' : '#aaa'}
                style={styles.cguCheckbox}
              />
              <Text style={styles.cguText}>
                J'accepte les <Text style={styles.cguLink}>Conditions Générales d'Utilisation</Text>
              </Text>
            </View>
          )}
          {/* Opt-in newsletter */}
          {!isLogin && (
            <View style={styles.cguRow}>
              <Checkbox
                value={newsletter}
                onValueChange={setNewsletter}
                color={newsletter ? 'rgb(0, 128, 128)' : '#aaa'}
                style={styles.cguCheckbox}
              />
              <Text style={styles.cguText}>
                Je souhaite recevoir les offres et nouveautés Souqly
              </Text>
            </View>
          )}
          {/* Lien mot de passe oublié */}
          {isLogin && (
            <TouchableOpacity style={styles.forgotBtn} onPress={() => {/* TODO: navigation vers reset */}}>
              <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
            </TouchableOpacity>
          )}
          {/* Erreur */}
          {error && <Text style={styles.error}>{error}</Text>}
          {/* Bouton principal */}
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: 'rgb(0, 128, 128)' }]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>{isLogin ? 'Se connecter' : "S'inscrire"}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fa',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    minHeight: 600,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 18,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 2,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'rgb(0, 128, 128)',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRadius: 22,
    padding: 28,
    shadowColor: '#00BFA6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 18,
    elevation: 8,
    alignItems: 'center',
  },
  tabRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 18,
    backgroundColor: '#f2f4f7',
    borderRadius: 12,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: 'rgba(0,128,128,0.08)',
  },
  tabText: {
    fontSize: 16,
    color: '#222',
    fontWeight: '500',
  },
  tabTextActive: {
    color: 'rgb(0, 128, 128)',
    fontWeight: 'bold',
  },
  inputWrapper: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f6fafd',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 14,
    paddingHorizontal: 10,
  },
  inputIcon: {
    marginRight: 6,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#222',
    backgroundColor: 'transparent',
  },
  eyeIcon: {
    marginLeft: 4,
    padding: 4,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  forgotText: {
    color: 'rgb(0, 128, 128)',
    fontSize: 14,
    textDecorationLine: 'underline',
    opacity: 0.85,
  },
  error: {
    color: '#e74c3c',
    fontSize: 15,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: '500',
  },
  submitButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 6,
    shadowColor: '#00BFA6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 0.2,
  },
  cguRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: -4,
    width: '100%',
  },
  cguCheckbox: {
    marginRight: 8,
    width: 20,
    height: 20,
  },
  cguText: {
    color: '#222',
    fontSize: 14,
    flex: 1,
    flexWrap: 'wrap',
  },
  cguLink: {
    color: 'rgb(0, 128, 128)',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
  profileImagePicker: {
    alignItems: 'center',
    marginBottom: 12,
  },
  profileImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 4,
  },
  profileImagePlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(0,128,128,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  profileImageText: {
    color: 'rgb(0, 128, 128)',
    fontSize: 13,
    marginTop: 2,
  },
}); 