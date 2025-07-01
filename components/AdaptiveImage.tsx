import React from 'react';
import { Image, Platform, ImageProps } from 'react-native';

interface AdaptiveImageProps extends Omit<ImageProps, 'source'> {
  source: { uri: string };
  alt?: string;
}

const AdaptiveImage: React.FC<AdaptiveImageProps> = ({ source, style, alt = "Image", ...props }) => {
  if (Platform.OS === 'web') {
    return (
      <img 
        src={source.uri} 
        alt={alt}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          ...(style as any)
        }}
      />
    );
  }
  
  return (
    <Image 
      source={source} 
      style={style} 
      resizeMode="cover"
      {...props}
    />
  );
};

export default AdaptiveImage; 