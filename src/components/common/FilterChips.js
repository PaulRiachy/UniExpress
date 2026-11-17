import { FlatList, Pressable, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/theme';

export default function FilterChips({ options, value, onChange }) {
  return <FlatList horizontal showsHorizontalScrollIndicator={false} data={options} extraData={value}
    keyExtractor={item => item.value} contentContainerStyle={styles.list}
    renderItem={({ item }) => <Pressable accessibilityRole="button" accessibilityState={{ selected: value === item.value }}
      onPress={() => onChange(item.value)} style={({ pressed }) => [styles.chip, value === item.value && styles.active, pressed && value !== item.value && { backgroundColor: colors.pale }]}>
      <Text style={[styles.text, value === item.value && styles.activeText]}>{item.label}</Text>
    </Pressable>} />;
}
const styles = StyleSheet.create({
  list: { gap: 8, paddingVertical: 14 },
  chip: { minHeight: 44, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 24, borderWidth: 1, borderColor: colors.border, justifyContent: 'center' },
  active: { backgroundColor: colors.primaryDark, borderColor: colors.primaryDark },
  text: { color: colors.text, fontWeight: '600', fontSize: 14 },
  activeText: { color: colors.white },
});
