import React, { useState, useEffect } from 'react';
import { Image, Platform, ImageProps, ActivityIndicator, View, Text } from 'react-native';

interface AdaptiveImageProps extends Omit<ImageProps, 'source'> {
  source: { uri: string };
  alt?: string;
  retryCount?: number;
}

const AdaptiveImage: React.FC<AdaptiveImageProps> = ({ 
  source, 
  style, 
  alt = "Image", 
  onError, 
  retryCount = 0,
  ...props 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryAttempts, setRetryAttempts] = useState(0);
  const maxRetries = 2;

  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  const handleError = (error: any) => {
    console.log('[DEBUG] Erreur image:', source.uri, error);
    setIsLoading(false);
    setHasError(true);
    
    // Retry automatique si on n'a pas dépassé le nombre max de tentatives
    if (retryAttempts < maxRetries) {
      setTimeout(() => {
        setRetryAttempts(prev => prev + 1);
        setHasError(false);
        setIsLoading(true);
      }, 1000 * (retryAttempts + 1)); // Délai progressif
    } else if (onError) {
      onError(error);
    }
  };

  // Reset quand l'URL change
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setRetryAttempts(0);
  }, [source.uri]);

  if (Platform.OS === 'web') {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {isLoading && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f0f0f0',
            zIndex: 1
          }}>
            <div style={{ fontSize: '12px', color: '#999' }}>Chargement...</div>
          </div>
        )}
        <img 
          src={source.uri} 
          alt={alt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: isLoading ? 0 : 1,
            transition: 'opacity 0.3s',
            ...(style as any)
          }}
          onLoad={() => setIsLoading(false)}
          onError={(e) => handleError(e)}
        />
      </div>
    );
  }
  
  return (
    <View style={{ position: 'relative', width: '100%', height: '100%' }}>
      {isLoading && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f0f0f0',
          zIndex: 1
        }}>
          <ActivityIndicator size="small" color="#999" />
        </View>
      )}
      <Image 
        source={source} 
        style={[style, { opacity: isLoading ? 0 : 1 }]}
        resizeMode="cover"
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        {...props}
      />
    </View>
  );
};

export default AdaptiveImage; 