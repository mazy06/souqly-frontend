import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import FavoritesScreen from '../screens/FavoritesScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';

const Stack = createStackNavigator();

export default function FavoritesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="FavoritesMain" component={FavoritesScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    </Stack.Navigator>
  );
} 