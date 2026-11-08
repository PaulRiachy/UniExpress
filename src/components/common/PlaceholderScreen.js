import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PlaceholderScreen({ title, description, actions = [], headerContent }) {
  const insets = useSafeAreaInsets();

  // Navigator headers protect the top; inset the content at the sides and bottom.
  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        {
          paddingLeft: 24 + insets.left,
          paddingRight: 24 + insets.right,
          paddingBottom: 24 + insets.bottom,
        },
      ]}
      data={actions}
      keyExtractor={(item) => item.label}
      ListHeaderComponent={
        <View style={styles.introduction}>
          <Text style={styles.caption}>UNIEXPRESS / NAVIGATION PREVIEW</Text>
          <Text accessibilityRole="header" style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
          <Text style={styles.note}>Application features are still placeholders.</Text>
          {headerContent}
        </View>
      }
      renderItem={({ item }) => (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: Boolean(item.disabled) }}
          disabled={item.disabled}
          onPress={item.onPress}
          style={({ pressed }) => [styles.button, (pressed || item.disabled) && styles.pressed]}
        >
          <Text style={styles.buttonText}>{item.label}</Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F8F7' },
  content: { paddingTop: 28, flexGrow: 1 },
  introduction: { marginBottom: 20 },
  caption: { color: '#145C4A', fontSize: 12, fontWeight: '700', marginBottom: 16 },
  title: { color: '#17352C', fontSize: 28, fontWeight: '700', marginBottom: 12 },
  description: { color: '#364A43', fontSize: 17, lineHeight: 26 },
  note: { color: '#53665E', fontSize: 14, lineHeight: 22, marginTop: 16 },
  button: { backgroundColor: '#145C4A', borderRadius: 10, padding: 16, minHeight: 48, marginBottom: 12 },
  pressed: { opacity: 0.75 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
