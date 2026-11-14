import { View } from 'react-native';
import { Action } from '../../components/common/FormScreen';
import { colors } from '../../constants/theme';
import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import PlaceholderScreen from '../../components/common/PlaceholderScreen';
import { checkPocketBaseHealth } from '../../services/pocketbase';

export default function HomeScreen({ navigation }) {
  const [connection, setConnection] = useState({ status: 'checking', message: 'Checking PocketBase API...' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setConnection({ status: 'checking', message: 'Checking PocketBase API...' });
    checkPocketBaseHealth({ signal: controller.signal }).then((result) => {
      if (!controller.signal.aborted) setConnection(result);
    });
    return () => controller.abort();
  }, [attempt]);

  return (
    <PlaceholderScreen
      title="Home"
      description="Welcome to UniExpress. Campus services will be available in a later phase."
      headerContent={
        <View style={{marginTop:16,padding:16,borderRadius:8,backgroundColor:colors.pale}}>
          <Text accessibilityLiveRegion="polite" style={{fontSize:14,color:colors.text,lineHeight:20}}>PocketBase: {connection.status === 'connected' ? 'Connected' : connection.status === 'checking' ? 'Checking...' : 'Unreachable / not configured'}</Text>
          {connection.status !== 'connected' && <Text style={{color:colors.muted,fontSize:13,marginTop:8}}>{connection.message}</Text>}
          <Action variant="text" title="Check connection" disabled={connection.status === 'checking'} onPress={() => setAttempt(value => value+1)} />
        </View>
      }
      actions={[
        { label: "Open Store Preview", onPress: () => navigation.navigate("Store") },
        { label: "Open Printing Preview", onPress: () => navigation.navigate("Printing") },
      ]}
    />
  );
}
