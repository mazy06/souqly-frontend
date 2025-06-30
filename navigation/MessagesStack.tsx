import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import MessagesScreen from '../screens/MessagesScreen';

const Stack = createStackNavigator();

export default function MessagesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="MessagesMain" component={MessagesScreen} />
    </Stack.Navigator>
  );
} 