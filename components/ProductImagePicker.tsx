import React, { useState, useRef, useMemo } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator, ScrollView, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TokenService from '../services/TokenService';

// Import conditionnel pour expo-image-picker (mobile seulement)
let ImagePicker: any = null;
if (Platform.OS !== 'web') {
  // @ts-ignore
  ImagePicker = require('expo-image-picker');
}

interface ProductImagePickerProps {
  imageIds: number[];
  onChange: (ids: number[]) => void;
  uploadUrl: string;
  getImageUrl: (id: number) => string;
}

const ProductImagePicker: React.FC<ProductImagePickerProps> = ({ imageIds, onChange, uploadUrl, getImageUrl }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<any>(null);

  // Mémoriser les URLs d'images pour éviter les re-renders
  const imageUrls = useMemo(() => {
    return imageIds.reduce((acc, id) => {
      acc[id] = getImageUrl(id);
      return acc;
    }, {} as Record<number, string>);
  }, [imageIds]); // Supprimé getImageUrl des dépendances

  // Fonction pour obtenir les headers d'authentification
  const getAuthHeaders = async (): Promise<Record<string, string>> => {
    try {
      const token = await TokenService.getAccessToken();
      if (token) {
        return {
          'Authorization': `Bearer ${token}`,
        };
      }
      return {};
    } catch (error) {
      return {};
    }
  };

  // Fonction pour compresser une image (web seulement)
  const compressImage = (file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<File> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new (window as any).Image();
      
      img.onload = () => {
        // Calculer les nouvelles dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Dessiner l'image redimensionnée
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convertir en blob avec compression
        canvas.toBlob(
          (blob: Blob | null) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Erreur lors de la compression'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = () => reject(new Error('Erreur lors du chargement de l\'image'));
      img.src = URL.createObjectURL(file);
    });
  };

  // Web: input file
  const pickImageWeb = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: any) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    setUploading(true);
    setUploadingCount(files.length);
    let newIds: number[] = [];
    let failedFiles: string[] = [];
    
    try {
      const authHeaders = await getAuthHeaders();
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        try {
          let fileToUpload = file;
          
          // Compresser les images de plus de 1MB
          if (file.size > 1024 * 1024) {
            try {
              fileToUpload = await compressImage(file);
            } catch (compressError) {
              // Utiliser le fichier original si la compression échoue
            }
          }
          
          const formData = new FormData();
          formData.append('file', fileToUpload);
          
          const requestInit: RequestInit = {
            method: 'POST',
            body: formData,
          };

          // Ajouter les headers seulement s'ils existent
          if (Object.keys(authHeaders).length > 0) {
            requestInit.headers = authHeaders;
          }
          
          const response = await fetch(uploadUrl, requestInit);
          
          if (!response.ok) {
            if (response.status === 403) {
              Alert.alert('Erreur', 'Vous devez être connecté pour uploader des images');
              return;
            }
            
            // Ajouter le fichier à la liste des échecs
            failedFiles.push(file.name);
            continue; // Continuer avec le fichier suivant
          }
          
          const id = await response.json();
          newIds.push(id);
        } catch (fileError) {
          failedFiles.push(file.name);
        }
      }
      
      if (newIds.length > 0) {
        const updatedIds = [...imageIds, ...newIds];
        onChange(updatedIds);
      }
      
      // Afficher un message pour les uploads partiels
      if (failedFiles.length > 0) {
        const successCount = newIds.length;
        const failCount = failedFiles.length;
        
        if (successCount > 0) {
          Alert.alert(
            'Upload partiel', 
            `${successCount} image(s) uploadée(s) avec succès.\n${failCount} image(s) n'ont pas pu être uploadée(s).\n\nFichiers échoués:\n${failedFiles.join('\n')}`
          );
        } else {
          Alert.alert('Erreur', "Aucune image n'a pu être uploadée");
        }
      } else if (newIds.length > 0) {
        Alert.alert('Succès', `${newIds.length} image(s) uploadée(s) avec succès !`);
      }
      
    } catch (error) {
      Alert.alert('Erreur', "Impossible d'uploader les images");
    } finally {
      setUploading(false);
      setUploadingCount(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Mobile: expo-image-picker
  const pickImageMobile = async () => {
    if (!ImagePicker) {
      Alert.alert('Erreur', 'Image picker non disponible sur cette plateforme');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setUploading(true);
      setUploadingCount(result.assets.length);
      let newIds: number[] = [];
      let failedAssets: string[] = [];
      
      try {
        const authHeaders = await getAuthHeaders();
        
        for (const asset of result.assets) {
          const uri = asset.uri;
          const filename = asset.fileName || uri.split('/').pop() || 'photo.jpg';
          
          try {
            const formData = new FormData();
            const match = /\.([a-zA-Z0-9]+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image`;
            
            formData.append('file', {
              uri,
              name: filename,
              type,
            } as any);
            
            const requestInit: RequestInit = {
              method: 'POST',
              headers: {
                'Content-Type': 'multipart/form-data',
                ...authHeaders,
              },
              body: formData,
            };
            
            const response = await fetch(uploadUrl, requestInit);
            
            if (!response.ok) {
              if (response.status === 403) {
                Alert.alert('Erreur', 'Vous devez être connecté pour uploader des images');
                return;
              }
              
              // Ajouter l'asset à la liste des échecs
              failedAssets.push(filename);
              continue; // Continuer avec l'asset suivant
            }
            
            const id = await response.json();
            newIds.push(id);
          } catch (assetError) {
            failedAssets.push(filename);
          }
        }
        
        if (newIds.length > 0) {
          onChange([...imageIds, ...newIds]);
        }
        
        // Afficher un message pour les uploads partiels
        if (failedAssets.length > 0) {
          const successCount = newIds.length;
          const failCount = failedAssets.length;
          
          if (successCount > 0) {
            Alert.alert(
              'Upload partiel', 
              `${successCount} image(s) uploadée(s) avec succès.\n${failCount} image(s) n'ont pas pu être uploadée(s).\n\nImages échouées:\n${failedAssets.join('\n')}`
            );
          } else {
            Alert.alert('Erreur', "Aucune image n'a pu être uploadée");
          }
        } else if (newIds.length > 0) {
          Alert.alert('Succès', `${newIds.length} image(s) uploadée(s) avec succès !`);
        }
        
      } catch (error) {
        Alert.alert('Erreur', "Impossible d'uploader les images");
      } finally {
        setUploading(false);
        setUploadingCount(0);
      }
    }
  };

  const removeImage = async (id: number) => {
    try {
      setUploading(true);
      const authHeaders = await getAuthHeaders();
      
      const requestInit: RequestInit = {
        method: 'DELETE',
      };

      if (Object.keys(authHeaders).length > 0) {
        requestInit.headers = authHeaders;
      }
      
      await fetch(`${uploadUrl.replace('/upload-image', '')}/image/${id}`, requestInit);
      onChange(imageIds.filter(imgId => imgId !== id));
    } catch (error) {
      Alert.alert('Erreur', "Impossible de supprimer l'image côté serveur");
    } finally {
      setUploading(false);
    }
  };

  // Mémoriser les handlers pour éviter les re-renders
  const handleImageError = useMemo(() => (id: number) => {
    setImageErrors(prev => new Set(prev).add(id));
  }, []);

  const handleImageLoad = useMemo(() => (id: number) => {
    setLoadedImages(prev => new Set(prev).add(id));
    setImageErrors(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  // Créer des fonctions mémorisées pour chaque image
  const createImageHandlers = useMemo(() => {
    const handlers = new Map<number, {
      onError: () => void;
      onLoad: () => void;
    }>();
    
    return (id: number) => {
      if (!handlers.has(id)) {
        handlers.set(id, {
          onError: () => handleImageError(id),
          onLoad: () => handleImageLoad(id),
        });
      }
      return handlers.get(id)!;
    };
  }, [handleImageError, handleImageLoad]);

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Photos</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
        {imageIds.map(id => {
          const imageUrl = imageUrls[id];
          const hasError = imageErrors.has(id);
          const isLoaded = loadedImages.has(id);
          
          return (
            <View key={id} style={styles.imageContainer}>
              {hasError ? (
                <View style={[styles.image, styles.errorImage]}>
                  <Ionicons name="image-outline" size={32} color="#999" />
                  <Text style={styles.errorText}>ID: {id}</Text>
                </View>
              ) : (
                <Image 
                  source={{ uri: imageUrl }} 
                  style={styles.image}
                  onError={createImageHandlers(id).onError}
                  onLoad={createImageHandlers(id).onLoad}
                  // Éviter les re-tentatives automatiques
                  resizeMode="cover"
                  fadeDuration={0}
                />
              )}
              <TouchableOpacity style={styles.removeBtn} onPress={() => removeImage(id)} disabled={uploading}>
                <Ionicons name="close-circle" size={22} color="#008080" />
              </TouchableOpacity>
            </View>
          );
        })}
        <TouchableOpacity
          style={styles.addBtn}
          onPress={Platform.OS === 'web' ? pickImageWeb : pickImageMobile}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#008080" />
          ) : (
            <Ionicons name="add" size={32} color="#008080" />
          )}
          {Platform.OS === 'web' && (
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          )}
        </TouchableOpacity>
      </ScrollView>
      {uploading && uploadingCount > 1 && (
        <Text style={{ color: '#008080', marginTop: 4 }}>Upload en cours ({uploadingCount} image(s))...</Text>
      )}
      {imageIds.length > 0 && (
        <Text style={{ color: '#666', fontSize: 12, marginTop: 4 }}>
          {imageIds.length} image(s) sélectionnée(s)
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#eee',
  },
  errorImage: {
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  errorText: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  removeBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 2,
    elevation: 2,
  },
  addBtn: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
});

export default ProductImagePicker; 