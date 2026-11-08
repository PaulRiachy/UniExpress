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
      description="Development-only preview. No account is signed in."
      headerContent={
        <Text accessibilityLiveRegion="polite" style={{ marginTop: 16, fontSize: 16, lineHeight: 24 }}>
          API connectivity: {connection.message}
        </Text>
      }
      actions={[
        {
          label: connection.status === 'checking' ? 'Checking API...' : 'Check API Connection Again',
          disabled: connection.status === 'checking',
          onPress: () => setAttempt((value) => value + 1),
        },
        { label: "Open Store Preview", onPress: () => navigation.navigate("Store") },
        { label: "Open Printing Preview", onPress: () => navigation.navigate("Printing") },
      ]}
    />
  );
}
