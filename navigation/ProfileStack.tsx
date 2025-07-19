import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import ProfileScreen from '../screens/ProfileScreen';
import AdminCategoriesScreen from '../screens/AdminCategoriesScreen';
import AdminAnalyticsScreen from '../screens/AdminAnalyticsScreen';
import BoostManagementScreen from '../screens/BoostManagementScreen';
import RealTimeMonitoringScreen from '../screens/RealTimeMonitoringScreen';
import UserManagementScreen from '../screens/UserManagementScreen';
import ProductModerationScreen from '../screens/ProductModerationScreen';
import AdvancedAnalyticsScreen from '../screens/AdvancedAnalyticsScreen';
import FinancialReportsScreen from '../screens/FinancialReportsScreen';
import PlatformSettingsScreen from '../screens/PlatformSettingsScreen';
import RoleManagementScreen from '../screens/RoleManagementScreen';
import SecurityAuditScreen from '../screens/SecurityAuditScreen';
import GDPRComplianceScreen from '../screens/GDPRComplianceScreen';
import NotificationsManagementScreen from '../screens/NotificationsManagementScreen';
import SupportTicketsScreen from '../screens/SupportTicketsScreen';
import SystemMaintenanceScreen from '../screens/SystemMaintenanceScreen';
import APIManagementScreen from '../screens/APIManagementScreen';
import PaymentManagementScreen from '../screens/PaymentManagementScreen';
import SubscriptionManagementScreen from '../screens/SubscriptionManagementScreen';
import MarketingPromotionsScreen from '../screens/MarketingPromotionsScreen';
import SEOOptimizationScreen from '../screens/SEOOptimizationScreen';
import MyProductsScreen from '../screens/MyProductsScreen';
import MyProductDetailScreen from '../screens/MyProductDetailScreen';
import EditProductScreen from '../screens/EditProductScreen';
import WalletScreen from '../screens/WalletScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import MyAnnouncementsScreen from '../screens/MyAnnouncementsScreen';
import EmailSettingsScreen from '../screens/EmailSettingsScreen';
import PaymentMethodsScreen from '../screens/PaymentMethodsScreen';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';
import BulkDiscountScreen from '../screens/BulkDiscountScreen';
import Colors from '../constants/Colors';
import { useColorScheme } from 'react-native';
import TransactionsScreen from '../screens/TransactionsScreen';
import OrdersScreen from '../screens/OrdersScreen';
import TransferSelectionScreen from '../screens/TransferSelectionScreen';
import TransferAmountScreen from '../screens/TransferAmountScreen';
import TransferConfirmationScreen from '../screens/TransferConfirmationScreen';
import TransferSuccessScreen from '../screens/TransferSuccessScreen';
import { ProfileStackParamList } from '../types/navigation';

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
      <Stack.Screen name="AdminAnalytics" component={AdminAnalyticsScreen} />
      <Stack.Screen name="BoostManagement" component={BoostManagementScreen} />
      <Stack.Screen name="RealTimeMonitoring" component={RealTimeMonitoringScreen} />
      <Stack.Screen name="UserManagement" component={UserManagementScreen} />
      <Stack.Screen name="ProductModeration" component={ProductModerationScreen} />
      <Stack.Screen name="AdvancedAnalytics" component={AdvancedAnalyticsScreen} />
      <Stack.Screen name="FinancialReports" component={FinancialReportsScreen} />
      <Stack.Screen name="PlatformSettings" component={PlatformSettingsScreen} />
      <Stack.Screen name="RoleManagement" component={RoleManagementScreen} />
      <Stack.Screen name="SecurityAudit" component={SecurityAuditScreen} />
      <Stack.Screen name="GDPRCompliance" component={GDPRComplianceScreen} />
      <Stack.Screen name="NotificationsManagement" component={NotificationsManagementScreen} />
      <Stack.Screen name="SupportTickets" component={SupportTicketsScreen} />
      <Stack.Screen name="SystemMaintenance" component={SystemMaintenanceScreen} />
      <Stack.Screen name="APIManagement" component={APIManagementScreen} />
      <Stack.Screen name="PaymentManagement" component={PaymentManagementScreen} />
      <Stack.Screen name="SubscriptionManagement" component={SubscriptionManagementScreen} />
      <Stack.Screen name="MarketingPromotions" component={MarketingPromotionsScreen} />
      <Stack.Screen name="SEOOptimization" component={SEOOptimizationScreen} />
      <Stack.Screen name="MyProducts" component={MyProductsScreen} />
      <Stack.Screen name="MyProductDetail" component={MyProductDetailScreen} />
      <Stack.Screen name="EditProduct" component={EditProductScreen} />
      <Stack.Screen name="Wallet" component={WalletScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="MyAnnouncements" component={MyAnnouncementsScreen} />
      <Stack.Screen name="Transactions" component={TransactionsScreen} />
      <Stack.Screen name="Orders" component={OrdersScreen} />
      <Stack.Screen name="EmailSettings" component={EmailSettingsScreen} />
      <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen name="BulkDiscount" component={BulkDiscountScreen} />
      <Stack.Screen name="TransferSelection" component={TransferSelectionScreen} />
      <Stack.Screen name="TransferAmount" component={TransferAmountScreen} />
      <Stack.Screen name="TransferConfirmation" component={TransferConfirmationScreen} />
      <Stack.Screen name="TransferSuccess" component={TransferSuccessScreen} />
    </Stack.Navigator>
  );
} 