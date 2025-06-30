import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import SellScreen from '../screens/SellScreen';

const Stack = createStackNavigator();

export default function SellStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="SellMain" component={SellScreen} />
    </Stack.Navigator>
  );
} 