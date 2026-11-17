import { useState } from 'react';
import { Image, Text, View, StyleSheet } from 'react-native';
import { colors } from '../../constants/theme';

export default function CatalogImage({ uri, name, large = false }) {
  const [failedUri, setFailedUri] = useState(null);
  const style = [styles.image, large && styles.large];
  return uri && failedUri !== uri
    ? <Image source={{ uri }} accessibilityLabel={name} style={style} resizeMode="cover" onError={() => setFailedUri(uri)} />
    : <View style={[style, styles.placeholder]} accessibilityLabel={`${name}, no image`}>
      <Text style={[styles.letter, large && { fontSize: 48 }]}>{name?.charAt(0)?.toUpperCase() || 'U'}</Text>
    </View>;
}
const styles = StyleSheet.create({
  image: { width: 64, height: 64, borderRadius: 12, backgroundColor: colors.pale },
  large: { width: '100%', height: 200, borderRadius: 16 },
  placeholder: { justifyContent: 'center', alignItems: 'center' },
  letter: { color: colors.primaryDark, fontWeight: '800', fontSize: 28 },
});
