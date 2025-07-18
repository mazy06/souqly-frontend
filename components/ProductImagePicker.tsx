import React, { useState, useRef, useMemo, useEffect } from 'react';
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
  onExtraPhotosPurchase?: (quantity: number, price: number) => void;
  extraPhotosPurchased?: number;
  maxFreePhotos?: number;
}

const ProductImagePicker: React.FC<ProductImagePickerProps> = ({ 
  imageIds, 
  onChange, 
  uploadUrl, 
  getImageUrl,
  onExtraPhotosPurchase,
  extraPhotosPurchased = 0,
  maxFreePhotos = 5
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showExtraPhotosModal, setShowExtraPhotosModal] = useState(false);
  const fileInputRef = useRef<any>(null);

  // Options d'achat de photos supplémentaires
  const extraPhotosOptions = [
    { quantity: 5, price: 2.99, popular: false },
    { quantity: 10, price: 4.99, popular: true },
    { quantity: 20, price: 8.99, popular: false },
  ];

  // Calculer le nombre total de photos autorisées
  const totalAllowedPhotos = maxFreePhotos + extraPhotosPurchased;
  const canAddMorePhotos = imageIds.length < totalAllowedPhotos;
  const remainingFreePhotos = Math.max(0, maxFreePhotos - imageIds.length);
  const remainingExtraPhotos = Math.max(0, extraPhotosPurchased - Math.max(0, imageIds.length - maxFreePhotos));

  // Mémoriser les URLs d'images pour éviter les re-renders
  const imageUrls = useMemo(() => {
    return imageIds.reduce((acc, id) => {
      acc[id] = getImageUrl(id);
      return acc;
    }, {} as Record<number, string>);
  }, [imageIds]); // Supprimé getImageUrl des dépendances

  // Marquer automatiquement les nouvelles images comme chargées après un délai
  useEffect(() => {
    const newImageIds = imageIds.filter(id => !loadedImages.has(id));
    
    if (newImageIds.length > 0) {
      // Marquer les nouvelles images comme chargées après 500ms
      const timer = setTimeout(() => {
        setLoadedImages(prev => {
          const newSet = new Set(prev);
          newImageIds.forEach(id => newSet.add(id));
          return newSet;
        });
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [imageIds, loadedImages]);

  // Réinitialiser les états de chargement quand les imageIds changent
  useEffect(() => {
    // Nettoyer les états pour les images qui ne sont plus présentes
    setLoadedImages(prev => {
      const newSet = new Set(prev);
      for (const id of newSet) {
        if (!imageIds.includes(id)) {
          newSet.delete(id);
        }
      }
      return newSet;
    });
    
    setImageErrors(prev => {
      const newSet = new Set(prev);
      for (const id of newSet) {
        if (!imageIds.includes(id)) {
          newSet.delete(id);
        }
      }
      return newSet;
    });
  }, [imageIds]);

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
    if (!canAddMorePhotos) {
      setShowExtraPhotosModal(true);
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: any) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    // Vérifier si on peut ajouter toutes les images
    const totalNewImages = files.length;
    const availableSlots = totalAllowedPhotos - imageIds.length;
    
    if (totalNewImages > availableSlots) {
      // Ouvrir automatiquement le modal d'achat de photos supplémentaires
      setShowExtraPhotosModal(true);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    
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
      
      // Afficher un message d'erreur pour les uploads partiels
      if (failedFiles.length > 0) {
        const successCount = newIds.length;
        const failCount = failedFiles.length;
        
        if (successCount > 0) {
          setErrorMessage(`${successCount} image(s) uploadée(s) avec succès.\n${failCount} image(s) n'ont pas pu être uploadée(s).\n\nFichiers échoués:\n${failedFiles.join('\n')}`);
        } else {
          setErrorMessage("Aucune image n'a pu être uploadée");
        }
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

    if (!canAddMorePhotos) {
      setShowExtraPhotosModal(true);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      // Vérifier si on peut ajouter toutes les images
      const totalNewImages = result.assets.length;
      const availableSlots = totalAllowedPhotos - imageIds.length;
      
      if (totalNewImages > availableSlots) {
        // Ouvrir automatiquement le modal d'achat de photos supplémentaires
        setShowExtraPhotosModal(true);
        return;
      }
      
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
        
        // Afficher un message d'erreur pour les uploads partiels
        if (failedAssets.length > 0) {
          const successCount = newIds.length;
          const failCount = failedAssets.length;
          
          if (successCount > 0) {
            setErrorMessage(`${successCount} image(s) uploadée(s) avec succès.\n${failCount} image(s) n'ont pas pu être uploadée(s).\n\nImages échouées:\n${failedAssets.join('\n')}`);
          } else {
            setErrorMessage("Aucune image n'a pu être uploadée");
          }
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
      
      // Mettre à jour immédiatement l'interface
      const updatedIds = imageIds.filter(imgId => imgId !== id);
      onChange(updatedIds);
      
      // Nettoyer les états d'erreur et de chargement pour cette image
      setImageErrors(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      
      setLoadedImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      
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

  const handleExtraPhotosPurchase = (quantity: number, price: number) => {
    if (onExtraPhotosPurchase) {
      onExtraPhotosPurchase(quantity, price);
    }
    setShowExtraPhotosModal(false);
  };

  const renderExtraPhotosModal = () => {
    if (!showExtraPhotosModal) return null;

    const remainingSlots = totalAllowedPhotos - imageIds.length;
    const message = remainingSlots > 0 
      ? `Vous pouvez encore ajouter ${remainingSlots} photo(s) avec votre quota actuel. Achetez des photos supplémentaires pour enrichir votre annonce.`
      : `Vous avez atteint la limite de ${maxFreePhotos} photos gratuites. Achetez des photos supplémentaires pour enrichir votre annonce.`;

    return (
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Photos supplémentaires</Text>
            <TouchableOpacity onPress={() => setShowExtraPhotosModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.modalDescription}>
            {message}
          </Text>
          
          <View style={styles.optionsContainer}>
            {extraPhotosOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionCard,
                  option.popular && styles.popularOption
                ]}
                onPress={() => handleExtraPhotosPurchase(option.quantity, option.price)}
              >
                {option.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>Populaire</Text>
                  </View>
                )}
                <Text style={styles.optionQuantity}>+{option.quantity} photos</Text>
                <Text style={styles.optionPrice}>{option.price.toFixed(2)} €</Text>
                <Text style={styles.optionPricePerPhoto}>
                  {(option.price / option.quantity).toFixed(2)} €/photo
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowExtraPhotosModal(false)}
          >
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

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
      <Text style={{ fontWeight: 'bold', marginBottom: 12 }}>Photos</Text>
      
      {/* Grille d'images */}
      <View style={styles.imageGrid} key={`grid-${imageIds.length}`}>
        {imageIds.map((id, index) => {
          const imageUrl = imageUrls[id];
          const hasError = imageErrors.has(id);
          const isLoaded = loadedImages.has(id);
          
          return (
            <View key={`${id}-${index}`} style={styles.imageContainer}>
              {hasError ? (
                <View style={[styles.image, styles.errorImage]}>
                  <Ionicons name="image-outline" size={32} color="#999" />
                  <Text style={styles.errorText}>Erreur</Text>
                </View>
              ) : !isLoaded ? (
                <View style={[styles.image, styles.loadingImage]}>
                  <ActivityIndicator color="#008080" size="small" />
                </View>
              ) : (
                <Image 
                  source={{ uri: imageUrl }} 
                  style={styles.image}
                  onError={createImageHandlers(id).onError}
                  onLoad={createImageHandlers(id).onLoad}
                  resizeMode="cover"
                  fadeDuration={200}
                />
              )}
              <TouchableOpacity style={styles.removeBtn} onPress={() => removeImage(id)} disabled={uploading}>
                <Ionicons name="close" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          );
        })}
        
        {/* Bouton d'ajout */}
        <TouchableOpacity
          style={styles.addBtn}
          onPress={Platform.OS === 'web' ? pickImageWeb : pickImageMobile}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#008080" size="large" />
          ) : (
            <View style={{ alignItems: 'center' }}>
              <Ionicons name="camera-outline" size={32} color="#008080" />
              <Text style={{ color: '#008080', fontSize: 11, marginTop: 4, fontWeight: '500' }}>
                Ajouter
              </Text>
            </View>
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
      </View>
      {uploading && uploadingCount > 1 && (
        <Text style={{ color: '#008080', marginTop: 4 }}>Upload en cours ({uploadingCount} image(s))...</Text>
      )}
      {imageIds.length > 0 && (
        <Text style={{ color: '#666', fontSize: 12, marginTop: 4 }}>
          {imageIds.length} image(s) sélectionnée(s)
          {remainingFreePhotos > 0 && ` • ${remainingFreePhotos} photo(s) gratuite(s) restante(s)`}
          {remainingExtraPhotos > 0 && ` • ${remainingExtraPhotos} photo(s) supplémentaire(s) restante(s)`}
        </Text>
      )}
      {!canAddMorePhotos && (
        <Text style={{ color: '#f44336', fontSize: 12, marginTop: 4, fontWeight: '500' }}>
          Limite atteinte • Achetez plus de photos pour continuer
        </Text>
      )}
      {errorMessage && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorMessage}>{errorMessage}</Text>
          <TouchableOpacity onPress={() => setErrorMessage('')} style={styles.closeErrorBtn}>
            <Ionicons name="close" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
      {renderExtraPhotosModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    alignItems: 'flex-start',
  },
  imageContainer: {
    position: 'relative',
    width: '30%',
    aspectRatio: 1,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  errorImage: {
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  loadingImage: {
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  errorText: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#008080',
    borderRadius: 16,
    padding: 6,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  addBtn: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#008080',
    borderStyle: 'dashed',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
    padding: 12,
    marginTop: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorMessage: {
    color: '#d32f2f',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  closeErrorBtn: {
    backgroundColor: '#f44336',
    borderRadius: 12,
    padding: 4,
    marginLeft: 8,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  optionsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  optionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  popularOption: {
    borderColor: '#008080',
    borderWidth: 2,
  },
  popularBadge: {
    position: 'absolute',
    top: -5,
    left: -5,
    backgroundColor: '#008080',
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
    zIndex: 1,
  },
  popularText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  optionQuantity: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  optionPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#008080',
  },
  optionPricePerPhoto: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  cancelButton: {
    backgroundColor: '#f44336',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    width: '100%',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ProductImagePicker; 