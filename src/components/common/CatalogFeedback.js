import { ActivityIndicator, Text, View, StyleSheet } from 'react-native';
import { Action } from './FormScreen';
import { colors } from '../../constants/theme';

export default function CatalogFeedback({ loading, error, empty, onRetry }) {
  return <View style={styles.container}>
    {loading && <ActivityIndicator color={colors.primary} size="large" />}
    <Text accessibilityRole={error ? 'alert' : 'text'} style={[styles.text, error && { color: colors.error }]}>
      {loading ? 'Loading campus services…' : error || empty}
    </Text>
    {!!error && <Action title="Try again" variant="secondary" onPress={onRetry} />}
  </View>;
}
const styles = StyleSheet.create({
  container: { paddingVertical: 24, gap: 16 },
  text: { color: colors.muted, fontSize: 15, lineHeight: 22, textAlign: 'center' },
});
