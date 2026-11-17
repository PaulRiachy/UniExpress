import { Pressable, Text, View, StyleSheet } from 'react-native';
import { colors } from '../../constants/theme';
import { formatCurrency } from '../../utils/formatters.js';
import CatalogImage from '../common/CatalogImage';

export default function ProductCard({ product, onPress }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`${product.name}, ${formatCurrency(product.price_cents)}, ${product.in_stock ? 'in stock' : 'out of stock'}. View details.`}
    onPress={onPress} style={({ pressed }) => [styles.card, pressed && { backgroundColor: colors.pale }]}>
    <CatalogImage uri={product.image} name={product.name} />
    <View style={styles.info}>
      <Text style={styles.name}>{product.name}</Text>
      {!!product.description && <Text style={styles.description} numberOfLines={2}>{product.description}</Text>}
      <Text style={styles.price}>{formatCurrency(product.price_cents)}</Text>
      <Text style={[styles.stock, !product.in_stock && { color: colors.error }]}>{product.in_stock ? 'In stock' : 'Out of stock · Unavailable'}</Text>
    </View>
  </Pressable>;
}
const styles = StyleSheet.create({
  card: { flexDirection: 'row', gap: 14, padding: 16, marginBottom: 12, borderRadius: 14, borderWidth: 1, borderColor: colors.border },
  info: { flex: 1, gap: 6 },
  name: { fontSize: 17, lineHeight: 23, color: colors.text, fontWeight: '700' },
  description: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  price: { color: colors.primaryDark, fontWeight: '700', fontSize: 17 },
  stock: { color: colors.muted, fontSize: 13, lineHeight: 19 },
});
