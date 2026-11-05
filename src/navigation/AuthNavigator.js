import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';

const Stack = createNativeStackNavigator();

export default function AuthNavigator({ onEnterPreview }) {
  return (
    <Stack.Navigator screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ title: 'UniExpress' }} />
      <Stack.Screen name="Login" options={{ title: 'Login' }}>
        {(props) => <LoginScreen {...props} onEnterPreview={onEnterPreview} />}
      </Stack.Screen>
      <Stack.Screen name="SignUp" component={SignUpScreen} options={{ title: 'Sign Up' }} />
    </Stack.Navigator>
  );
}
