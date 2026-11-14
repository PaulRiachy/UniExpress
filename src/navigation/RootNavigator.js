import { ActivityIndicator } from 'react-native';
import useAuth from '../hooks/useAuth';
import AuthNavigator from './AuthNavigator';
import MainStackNavigator from './MainStackNavigator';
export default function RootNavigator() {
  const { user, ready } = useAuth();
  if (!ready) return <ActivityIndicator accessibilityLabel="Restoring authentication" />;
  return user ? <MainStackNavigator /> : <AuthNavigator />;
}
