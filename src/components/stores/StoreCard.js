import { Pressable, Text, View, StyleSheet } from 'react-native';
import { colors } from '../../constants/theme';
import CatalogImage from '../common/CatalogImage';
import OpenClosedBadge from './OpenClosedBadge';

export default function StoreCard({ store, status, onPress }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`${store.name}, ${status.label}. Browse store.`}
    onPress={onPress} style={({ pressed }) => [styles.card, !status.isOpen && styles.closed, pressed && { backgroundColor: colors.pale }]}>
    <View style={styles.row}>
      <CatalogImage uri={store.logo} name={store.name} />
      <View style={styles.info}>
        <Text style={styles.category}>{store.category}</Text>
        <Text style={styles.title}>{store.name}</Text>
      </View>
      <OpenClosedBadge status={status} />
    </View>
    {!!store.description && <Text style={styles.description} numberOfLines={2}>{store.description}</Text>}
    <Text style={styles.prep}>Average prep · {store.preparation_minutes} min</Text>
    <Text style={styles.hours}>{status.message}</Text>
  </Pressable>;
}
const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 16, marginBottom: 14, backgroundColor: colors.white },
  closed: { borderColor: colors.muted },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' },
  info: { flex: 1, minWidth: 120, gap: 4 },
  category: { color: colors.primaryDark, fontSize: 13, fontWeight: '600' },
  title: { color: colors.text, fontSize: 19, lineHeight: 25, fontWeight: '700' },
  description: { color: colors.muted, lineHeight: 21, fontSize: 14, marginTop: 12 },
  prep: { color: colors.text, fontSize: 14, marginTop: 12 },
  hours: { color: colors.muted, lineHeight: 20, fontSize: 13, marginTop: 6 },
});
