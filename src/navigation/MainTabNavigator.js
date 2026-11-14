import { colors, navigationOptions } from '../constants/theme';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/home/HomeScreen';
import CartScreen from '../screens/checkout/CartScreen';
import OrderHistoryScreen from '../screens/orders/OrderHistoryScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();
const tabSymbols = { Home: 'H', Cart: 'C', Orders: 'O', Profile: 'P' };

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      backBehavior="history"
      screenOptions={({ route }) => ({
        ...navigationOptions,
        tabBarActiveTintColor: colors.primaryDark,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor:colors.white, borderTopColor:colors.gray },
        sceneStyle: { backgroundColor:colors.white },
        tabBarIcon: ({ color, focused }) => (
          <Text accessible={false} style={{ color: focused ? colors.primary : color, fontSize: 20, fontWeight: '700' }}>
            {tabSymbols[route.name]}
          </Text>
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Orders" component={OrderHistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
