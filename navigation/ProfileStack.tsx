import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import ProfileScreen from '../screens/ProfileScreen';
import AdminCategoriesScreen from '../screens/AdminCategoriesScreen';
import Colors from '../constants/Colors';
import { useColorScheme } from 'react-native';

const Stack = createStackNavigator();

export default function ProfileStack() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="AdminCategories" component={AdminCategoriesScreen} />
    </Stack.Navigator>
  );
} 