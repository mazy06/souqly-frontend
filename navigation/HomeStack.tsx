import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import ArticlesListScreen from '../screens/ArticlesListScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ProductImagesScreen from '../screens/ProductImagesScreen';

const Stack = createStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="ArticlesList" component={ArticlesListScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'Favoris' }} />
      <Stack.Screen name="ProductImages" component={ProductImagesScreen} />
    </Stack.Navigator>
  );
} 