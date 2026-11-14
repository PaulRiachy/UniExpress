import { useState } from 'react';
import { FlatList, Keyboard, Modal, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../constants/theme';

export default function DropdownSelect({ label, options, value, onChange, disabled, error }) {
  const [open, setOpen] = useState(false);
  const { height } = useWindowDimensions();
  function close() { setOpen(false); }
  return <View>
    <Text style={styles.label}>{label}</Text>
    <Pressable accessibilityRole="button" accessibilityLabel={label}
      accessibilityHint="Opens department choices" accessibilityValue={{ text: value || 'Select your department' }}
      accessibilityState={{ expanded: open, disabled: !!disabled }}
      disabled={disabled} onPress={() => { Keyboard.dismiss(); setOpen(true); }}
      style={[styles.field, open && { borderColor: colors.primary }, error && { borderColor: colors.error }, disabled && { opacity: 0.6 }]}>
      <Text style={[styles.value, !value && { color: colors.muted }]}>{value || 'Select your department'}</Text>
      <View accessible={false} pointerEvents="none" style={styles.iconSlot}>
        <View style={[styles.chevron, { borderColor: open ? colors.primary : colors.muted, transform: [{ rotate: open ? '225deg' : '45deg' }] }]} />
      </View>
    </Pressable>
    {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
    <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
      <SafeAreaView style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} accessibilityRole="button" accessibilityLabel="Close department choices" onPress={close} />
        <View accessibilityViewIsModal onAccessibilityEscape={close} style={[styles.dialog, { maxHeight: height * 0.75 }]}>
          <Text accessibilityRole="header" style={styles.heading}>Select Department</Text>
          <FlatList data={options} keyExtractor={item => item} keyboardShouldPersistTaps="handled"
            ItemSeparatorComponent={() => <View style={styles.divider} />}
            renderItem={({ item }) => <Pressable accessibilityRole="radio" accessibilityState={{ checked: item === value }}
              onPress={() => { onChange(item); close(); }} style={[styles.option, item === value && styles.selected]}>
              <Text style={styles.optionText}>{item}</Text>
              <View accessible={false} style={[styles.radio, item === value && { borderColor: colors.primary }]}>
                {item === value && <View style={styles.radioDot} />}
              </View>
            </Pressable>} />
          <Pressable accessibilityRole="button" onPress={close} style={styles.cancel}><Text style={styles.link}>Cancel</Text></Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  </View>;
}
const styles = StyleSheet.create({
  label: { color: colors.text, fontSize: 15, fontWeight: '600', marginBottom: 8 },
  field: { minHeight: 48, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white },
  value: { color: colors.text, fontSize: 16, flex: 1 },
  iconSlot: { width: 20, height: 20, flexShrink: 0, alignItems: 'center', justifyContent: 'center' },
  chevron: { width: 10, height: 10, borderRightWidth: 2, borderBottomWidth: 2 },
  error: { color: colors.error, fontSize: 14, lineHeight: 20, marginTop: 8 },
  overlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.35)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  dialog: { width: '100%', maxWidth: 520, backgroundColor: colors.white, borderRadius: 12, padding: 16 },
  heading: { color: colors.primaryDark, fontSize: 20, fontWeight: '700', marginBottom: 16 },
  option: { minHeight: 56, width: '100%', paddingHorizontal: 16, paddingVertical: 16, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 16 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 4 },
  selected: { backgroundColor: colors.pale }, optionText: { color: colors.text, fontSize: 16, flex: 1 },
  radio: { width: 20, height: 20, borderWidth: 2, borderColor: colors.muted, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  cancel: { minHeight: 48, justifyContent: 'center', alignItems: 'center', marginTop: 8 }, link: { color: colors.secondary, fontWeight: '600', fontSize: 16 },
});
