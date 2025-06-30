import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import SearchScreen from '../screens/SearchScreen';
import CategoryScreen from '../screens/CategoryScreen';

const Stack = createStackNavigator();

export default function SearchStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="SearchMain" component={SearchScreen} />
      <Stack.Screen name="Category" component={CategoryScreen} />
    </Stack.Navigator>
  );
} 