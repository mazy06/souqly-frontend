import React from 'react';
import { View, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import ProductCard from '../components/ProductCard';
import PrimaryButton from '../components/PrimaryButton';

// Types pour la navigation
export type HomeStackParamList = {
  HomeMain: undefined;
  ProductDetail: { productId: string };
};

export default function HomeScreen() {
  const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();

  return (
    <ScrollView contentContainerStyle={{ alignItems: 'center', padding: 16 }}>
      <ProductCard
        title="Chemise Sézane verte"
        price="25"
        image="https://via.placeholder.com/120"
        onPress={() => navigation.navigate('ProductDetail', { productId: '1' })}
      />
      <PrimaryButton
        title="Voir le détail"
        onPress={() => navigation.navigate('ProductDetail', { productId: '1' })}
      />
    </ScrollView>
  );
} 