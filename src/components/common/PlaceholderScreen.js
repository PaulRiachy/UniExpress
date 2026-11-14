import { colors, universityName } from '../../constants/theme';
import { Action } from './FormScreen';
import { FlatList, StyleSheet, Text, View } from 'react-native';
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
          width: '100%', maxWidth: 560, alignSelf: 'center',
        },
      ]}
      data={actions}
      keyExtractor={(item) => item.label}
      ListHeaderComponent={
        <View style={styles.introduction}>
          <Text style={styles.caption}>{universityName}</Text>
          <Text accessibilityRole="header" style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
          <Text style={styles.note}>Application features are still placeholders.</Text>
          {headerContent}
        </View>
      }
      renderItem={({ item }) => (
        <View style={{marginBottom:12}}><Action title={item.label} onPress={item.onPress} disabled={item.disabled} /></View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  content: { paddingTop: 28, flexGrow: 1 },
  introduction: { marginBottom: 24 },
  caption: { color: colors.muted, fontSize: 14, lineHeight: 22, marginBottom: 16, textAlign: 'center' },
  title: { textAlign: 'center', color: colors.primary, fontSize: 28, fontWeight: '700', marginBottom: 12 },
  description: { textAlign: 'center', color: colors.muted, fontSize: 17, lineHeight: 26 },
  note: { textAlign: 'center', color: colors.muted, fontSize: 14, lineHeight: 22, marginTop: 16 },
  button: { backgroundColor: colors.primary, borderRadius: 10, padding: 16, minHeight: 48, marginBottom: 12 },
  pressed: { opacity: 0.75 },
  buttonText: { color: colors.white, fontSize: 16, fontWeight: '600' },
});
