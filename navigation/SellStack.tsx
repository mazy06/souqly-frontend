import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import SellScreen from '../screens/SellScreen';
import PaymentScreen from '../screens/PaymentScreen';
import PaymentSuccessScreen from '../screens/PaymentSuccessScreen';
import DynamicFormTestScreen from '../screens/DynamicFormTestScreen';

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
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
      <Stack.Screen name="DynamicFormTest" component={DynamicFormTestScreen} />
    </Stack.Navigator>
  );
} 