import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import ApiService from '../services/ApiService';
import { AuthUser } from '../services/AuthService';

interface ProfileData {
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  avatar?: string;
}

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { user, updateUser } = useAuth();
  
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    email: '',
    phone: '',
    bio: ''
  });
  const [avatar, setAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: '', // Propriété optionnelle
        bio: '' // Propriété optionnelle
      });
      setAvatar(user.picture || null);
    }
  }, [user]);

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setAvatar(result.assets[0].uri);
        setHasChanges(true);
      }
    } catch (error) {
      console.error('Erreur lors de la sélection d\'image:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner l\'image');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'Nous avons besoin de votre permission pour accéder à la caméra');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setAvatar(result.assets[0].uri);
        setHasChanges(true);
      }
    } catch (error) {
      console.error('Erreur lors de la prise de photo:', error);
      Alert.alert('Erreur', 'Impossible de prendre une photo');
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      'Changer la photo',
      'Choisissez une option',
      [
        {
          text: 'Prendre une photo',
          onPress: takePhoto,
        },
        {
          text: 'Choisir depuis la galerie',
          onPress: pickImage,
        },
        {
          text: 'Annuler',
          style: 'cancel',
        },
      ]
    );
  };

  const handleSave = async () => {
    if (!profileData.name.trim()) {
      Alert.alert('Erreur', 'Le nom est obligatoire');
      return;
    }

    if (!profileData.email.trim()) {
      Alert.alert('Erreur', 'L\'email est obligatoire');
      return;
    }

    try {
      setLoading(true);
      
      // TODO: Implémenter l'upload de l'avatar si nécessaire
      const updatedData = {
        ...profileData,
        avatar: avatar
      };

      // Appel API pour mettre à jour le profil
      const response = await ApiService.put(`/users/${user?.id}/profile`, updatedData);
      
      // Mettre à jour le contexte utilisateur
      if (updateUser && response) {
        updateUser(response as AuthUser);
      }

      Alert.alert('Succès', 'Profil mis à jour avec succès', [
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour le profil');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        'Annuler les modifications',
        'Êtes-vous sûr de vouloir annuler les modifications ?',
        [
          {
            text: 'Continuer l\'édition',
            style: 'cancel',
          },
          {
            text: 'Annuler',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleCancel}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Modifier le profil
        </Text>
        <TouchableOpacity
          style={[styles.saveButton, { opacity: hasChanges ? 1 : 0.5 }]}
          onPress={handleSave}
          disabled={!hasChanges || loading}
        >
          <Text style={[styles.saveButtonText, { color: colors.primary }]}>
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={showImagePickerOptions}
          >
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatarImage} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                <Text style={styles.avatarPlaceholderText}>
                  {profileData.name ? profileData.name.charAt(0).toUpperCase() : 'U'}
                </Text>
              </View>
            )}
            <View style={[styles.avatarEditButton, { backgroundColor: colors.primary }]}>
              <Ionicons name="camera" size={16} color="white" />
            </View>
          </TouchableOpacity>
          <Text style={[styles.avatarHint, { color: colors.textSecondary }]}>
            Appuyez pour changer la photo
          </Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          {/* Name */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Nom complet *</Text>
            <TextInput
              style={[styles.textInput, { 
                backgroundColor: colors.card, 
                borderColor: colors.border,
                color: colors.text 
              }]}
              value={profileData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="Votre nom complet"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Email *</Text>
            <TextInput
              style={[styles.textInput, { 
                backgroundColor: colors.card, 
                borderColor: colors.border,
                color: colors.text 
              }]}
              value={profileData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="votre@email.com"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Phone */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Téléphone</Text>
            <TextInput
              style={[styles.textInput, { 
                backgroundColor: colors.card, 
                borderColor: colors.border,
                color: colors.text 
              }]}
              value={profileData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              placeholder="+33 6 12 34 56 78"
              placeholderTextColor={colors.textSecondary}
              keyboardType="phone-pad"
            />
          </View>

          {/* Bio */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Bio</Text>
            <TextInput
              style={[styles.textArea, { 
                backgroundColor: colors.card, 
                borderColor: colors.border,
                color: colors.text 
              }]}
              value={profileData.bio}
              onChangeText={(value) => handleInputChange('bio', value)}
              placeholder="Parlez-nous un peu de vous..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
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
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  avatarHint: {
    fontSize: 14,
    textAlign: 'center',
  },
  formSection: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
}); 