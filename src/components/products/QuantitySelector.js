import { Pressable, Text, View, StyleSheet } from 'react-native';
import { colors } from '../../constants/theme';
import { clampQuantity, MAX_PRODUCT_QUANTITY } from '../../utils/catalog.js';

export default function QuantitySelector({ value, onChange, disabled }) {
  function button(label, title, next, blocked) {
    return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled: !!blocked }} disabled={blocked}
      onPress={() => onChange(clampQuantity(next))} style={({ pressed }) => [styles.button, blocked && styles.disabled, pressed && { backgroundColor: colors.primaryDark }]}>
      <Text style={[styles.symbol, blocked && { color: colors.muted }]}>{title}</Text>
    </Pressable>;
  }
  return <View style={styles.container}>
    <Text style={styles.label}>Quantity</Text>
    <View style={styles.controls}>
      {button('Decrease quantity', '−', value - 1, disabled || value <= 1)}
      <Text accessibilityLiveRegion="polite" accessibilityLabel={`Quantity ${value}`} style={styles.value}>{value}</Text>
      {button('Increase quantity', '+', value + 1, disabled || value >= MAX_PRODUCT_QUANTITY)}
    </View>
    <Text style={styles.hint}>1–{MAX_PRODUCT_QUANTITY} per item</Text>
  </View>;
}
const styles = StyleSheet.create({
  container: { gap: 10, marginVertical: 20 }, label: { color: colors.text, fontSize: 17, fontWeight: '600' },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  button: { minHeight: 48, minWidth: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: colors.primary },
  disabled: { backgroundColor: colors.gray }, symbol: { fontSize: 24, color: colors.white, fontWeight: '700' },
  value: { color: colors.text, fontSize: 20, fontWeight: '600', minWidth: 28, textAlign: 'center' },
  hint: { color: colors.muted, fontSize: 13 },
});
