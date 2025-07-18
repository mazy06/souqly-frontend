import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ProductImagesScreen from '../screens/ProductImagesScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileDetailScreen from '../screens/ProfileDetailScreen';
import SearchResultsScreen from '../screens/SearchResultsScreen';
import PaymentScreen from '../screens/PaymentScreen';
import PaymentSuccessScreen from '../screens/PaymentSuccessScreen';
import OrdersScreen from '../screens/OrdersScreen';
import AuthLandingScreen from '../screens/AuthLandingScreen';
import ReviewScreen from '../screens/ReviewScreen';
import ArticlesListScreen from '../screens/ArticlesListScreen';
import CategoryScreen from '../screens/CategoryScreen';
import CategoriesGridScreen from '../screens/CategoriesGridScreen';
import FiltersScreen from '../screens/FiltersScreen';

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
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'Favoris' }} />
      <Stack.Screen name="ProductImages" component={ProductImagesScreen} />
      <Stack.Screen name="ProfileDetail" component={ProfileDetailScreen} />
      <Stack.Screen name="SearchResults" component={SearchResultsScreen} />
      <Stack.Screen name="Category" component={CategoryScreen} />
      <Stack.Screen name="CategoriesGrid" component={CategoriesGridScreen} />
      <Stack.Screen name="ArticlesList" component={ArticlesListScreen} />
      <Stack.Screen name="Filters" component={FiltersScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
      <Stack.Screen name="Orders" component={OrdersScreen} />
      <Stack.Screen name="Review" component={ReviewScreen} />
      <Stack.Screen name="AuthLanding" component={AuthLandingScreen} />
    </Stack.Navigator>
  );
} 