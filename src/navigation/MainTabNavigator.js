import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/home/HomeScreen';
import CartScreen from '../screens/checkout/CartScreen';
import OrderHistoryScreen from '../screens/orders/OrderHistoryScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();
const tabSymbols = { Home: 'H', Cart: 'C', Orders: 'O', Profile: 'P' };

export default function MainTabNavigator({ onExitPreview }) {
  return (
    <Tab.Navigator
      backBehavior="history"
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#145C4A',
        tabBarIcon: ({ color }) => (
          <Text accessible={false} style={{ color, fontSize: 18, fontWeight: '700' }}>
            {tabSymbols[route.name]}
          </Text>
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Orders" component={OrderHistoryScreen} />
      <Tab.Screen name="Profile">
        {(props) => <ProfileScreen {...props} onExitPreview={onExitPreview} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
