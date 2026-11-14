import { navigationOptions } from '../constants/theme';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabNavigator from './MainTabNavigator';
import StoreScreen from '../screens/store/StoreScreen';
import ProductDetailsScreen from '../screens/store/ProductDetailsScreen';
import PrintingScreen from '../screens/printing/PrintingScreen';
import CheckoutScreen from '../screens/checkout/CheckoutScreen';
import OrderTrackingScreen from '../screens/orders/OrderTrackingScreen';
import WalletScreen from '../screens/profile/WalletScreen';
import SavedLocationsScreen from '../screens/profile/SavedLocationsScreen';

const Stack = createNativeStackNavigator();

export default function MainStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ ...navigationOptions, headerBackButtonDisplayMode: 'minimal' }}>
      <Stack.Screen name="MainTabs" options={{ headerShown: false }}>
        {() => <MainTabNavigator  />}
      </Stack.Screen>
      <Stack.Screen name="Store" component={StoreScreen} />
      <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} options={{ title: 'Product Details' }} />
      <Stack.Screen name="Printing" component={PrintingScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} options={{ title: 'Order Tracking' }} />
      <Stack.Screen name="Wallet" component={WalletScreen} />
      <Stack.Screen name="SavedLocations" component={SavedLocationsScreen} options={{ title: 'Saved Locations' }} />
    </Stack.Navigator>
  );
}
