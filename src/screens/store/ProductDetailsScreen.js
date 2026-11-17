import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CatalogFeedback from '../../components/common/CatalogFeedback';
import CatalogImage from '../../components/common/CatalogImage';
import { Action } from '../../components/common/FormScreen';
import OpenClosedBadge from '../../components/stores/OpenClosedBadge';
import QuantitySelector from '../../components/products/QuantitySelector';
import { colors } from '../../constants/theme';
import useStoreStatus from '../../hooks/useStoreStatus';
import { getProductById } from '../../services/catalogService.js';
import { hasUnconfiguredOptions } from '../../utils/catalog.js';
import { formatCurrency } from '../../utils/formatters.js';

export default function ProductDetailsScreen({ route }) {
  const productId = route.params?.productId;
  const insets = useSafeAreaInsets();
  const { statusFor } = useStoreStatus();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true); setError(''); setProduct(null); setQuantity(1);
    getProductById(productId).then(record => { if (active) setProduct(record); })
      .catch(e => { if (active) setError(e.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [productId, attempt]));
  const store = product?.expand?.store;
  const status = statusFor(store);
  const unconfiguredOptions = product && hasUnconfiguredOptions(product.options_json);
  const priceAvailable = Number.isSafeInteger(product?.price_cents) && product.price_cents >= 0;
  const unavailable = !product?.in_stock || !status.isOpen || unconfiguredOptions || !priceAvailable;
  const refresh = () => setAttempt(value => value + 1);
  const details = product ? <View style={styles.details}>
    <CatalogImage uri={product.image} name={product.name} large />
    <Text style={styles.store}>{store.name}</Text>
    <Text accessibilityRole="header" style={styles.title}>{product.name}</Text>
    <Text style={styles.price}>{formatCurrency(product.price_cents)}</Text>
    <Text style={styles.description}>{product.description || 'No description is available for this product.'}</Text>
    <Text style={[styles.availability, !product.in_stock && { color: colors.error }]}>{product.in_stock ? 'In stock' : 'Out of stock · Unavailable'}</Text>
    <OpenClosedBadge status={status} />
    <Text style={styles.description}>{status.message}</Text>
    <View style={styles.options}>
      <Text accessibilityRole="header" style={styles.label}>Product options</Text>
      <Text style={styles.description}>{unconfiguredOptions ? 'Options for this product are not available yet. Please check back later.' : 'No sizes or extras are configured for this product.'}</Text>
    </View>
    <QuantitySelector value={quantity} onChange={setQuantity} disabled={!product.in_stock || unconfiguredOptions || !priceAvailable} />
    <View style={styles.estimate}>
      <Text style={styles.label}>Estimated item total</Text>
      <Text style={styles.price}>{unconfiguredOptions || !priceAvailable ? 'Unavailable' : formatCurrency(product.price_cents * quantity)}</Text>
      <Text style={styles.description}>Final prices and availability are confirmed at checkout.</Text>
    </View>
    <Action title={unavailable ? 'Unavailable for ordering' : 'Add to Cart · Coming next phase'} disabled />
    <Text style={styles.note}>Cart functionality will be available in Phase 9.</Text>
    <Action title="Refresh product" variant="text" onPress={refresh} disabled={loading} />
  </View> : <CatalogFeedback loading={loading} error={error} empty="This product is unavailable." onRetry={refresh} />;
  return <FlatList style={styles.screen} data={[]} renderItem={() => null}
    contentContainerStyle={[styles.content, { paddingLeft: 20 + insets.left, paddingRight: 20 + insets.right, paddingBottom: 24 + insets.bottom }]}
    onRefresh={refresh} refreshing={loading && !!product} ListHeaderComponent={details} />;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  content: { paddingTop: 24, width: '100%', maxWidth: 640, alignSelf: 'center' }, details: { gap: 12 },
  store: { color: colors.primaryDark, fontSize: 15, fontWeight: '600', marginTop: 8 },
  title: { fontSize: 28, lineHeight: 35, color: colors.text, fontWeight: '700' },
  price: { color: colors.primaryDark, fontSize: 23, fontWeight: '700' },
  description: { color: colors.muted, fontSize: 15, lineHeight: 23 },
  availability: { color: colors.text, fontSize: 15, fontWeight: '600' },
  options: { gap: 8, marginTop: 16 }, label: { color: colors.text, fontSize: 17, fontWeight: '600' },
  estimate: { backgroundColor: colors.pale, padding: 16, borderRadius: 12, gap: 10, marginBottom: 12 },
  note: { color: colors.muted, fontSize: 13, lineHeight: 20, textAlign: 'center' },
});
