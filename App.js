import { colors } from './src/constants/theme';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
      <NavigationContainer theme={{...DefaultTheme,colors:{...DefaultTheme.colors,primary:colors.primary,background:colors.white,card:colors.white,text:colors.text,border:colors.gray}}}>
        <RootNavigator />
        <StatusBar style="dark" />
      </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
