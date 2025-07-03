import React from 'react';
import { View, ScrollView, Image, TouchableOpacity, StyleSheet, Dimensions, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import CustomHeader from '../components/CustomHeader';
import { useTheme } from '../contexts/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

type ProductImagesScreenRouteProp = RouteProp<{ params: { images: string[] } }, 'params'>;

export default function ProductImagesScreen() {
  const navigation = useNavigation();
  const route = useRoute<ProductImagesScreenRouteProp>();
  const { colors, isDark } = useTheme();
  const images = route.params?.images || [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <CustomHeader onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {images.map((uri, idx) => (
          <Image
            key={idx}
            source={{ uri }}
            style={[styles.image, { backgroundColor: isDark ? '#222' : '#f5f5f5' }]}
            resizeMode="contain"
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    position: 'absolute',
    top: 40,
    left: 10,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 24,
  },
  backText: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 8,
  },
  scrollContent: {
    paddingTop: 80,
    paddingBottom: 40,
    alignItems: 'center',
  },
  image: {
    width: screenWidth,
    height: screenWidth * 1.2,
    marginBottom: 24,
  },
}); 