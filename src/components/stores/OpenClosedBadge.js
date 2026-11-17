import { Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/theme';

export default function OpenClosedBadge({ status }) {
  return <Text style={[styles.badge, !status.isOpen && styles.closed]}>{status.label}</Text>;
}
const styles = StyleSheet.create({
  badge: { color: colors.primaryDark, backgroundColor: colors.pale, fontWeight: '700', fontSize: 13, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start', overflow: 'hidden' },
  closed: { color: colors.error, backgroundColor: '#FFF0ED' },
});
