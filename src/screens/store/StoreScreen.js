import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CatalogFeedback from '../../components/common/CatalogFeedback';
import CatalogImage from '../../components/common/CatalogImage';
import { Action } from '../../components/common/FormScreen';
import OpenClosedBadge from '../../components/stores/OpenClosedBadge';
import ProductCard from '../../components/products/ProductCard';
import { colors } from '../../constants/theme';
import useStoreStatus from '../../hooks/useStoreStatus';
import { getStoreById, getProductsByStore, getProductCategories } from '../../services/catalogService.js';
import { groupProducts } from '../../utils/catalog.js';

export default function StoreScreen({ navigation, route }) {
  const storeId = route.params?.storeId;
  const insets = useSafeAreaInsets();
  const { statusFor } = useStoreStatus();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true); setError(''); setStore(null); setProducts([]); setCategories([]);
    Promise.resolve().then(() => Promise.all([getStoreById(storeId), getProductsByStore(storeId), getProductCategories(storeId)]))
      .then(([record, items, groups]) => {
        if (active) { setStore(record); setProducts(items); setCategories(groups); }
      }).catch(e => { if (active) setError(e.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [storeId, attempt]));
  const rows = useMemo(() => groupProducts(products, categories), [products, categories]);
  const status = statusFor(store);
  const refresh = () => setAttempt(value => value + 1);
  const header = store ? <View style={styles.header}>
    <CatalogImage uri={store.logo} name={store.name} />
    <Text style={styles.category}>{store.category}</Text>
    <Text accessibilityRole="header" style={styles.title}>{store.name}</Text>
    {!!store.description && <Text style={styles.description}>{store.description}</Text>}
    <OpenClosedBadge status={status} />
    <Text style={styles.description}>{status.message}</Text>
    <Text style={styles.prep}>Average preparation · {store.preparation_minutes} min</Text>
    <Action title="Refresh store" variant="text" onPress={refresh} disabled={loading} />
    <Text accessibilityRole="header" style={styles.section}>Products</Text>
  </View> : null;
  return <FlatList style={styles.screen} data={rows} keyExtractor={item => item.key}
    contentContainerStyle={[styles.content, { paddingLeft: 20 + insets.left, paddingRight: 20 + insets.right, paddingBottom: 24 + insets.bottom }]}
    onRefresh={refresh} refreshing={loading && !!store} ListHeaderComponent={header}
    ListEmptyComponent={<CatalogFeedback loading={loading} error={error} onRetry={refresh}
      empty={store?.category === 'Printing' ? 'Printing jobs will be available in the printing phase.' : 'No products are listed here yet. Pull down to refresh.'} />}
    renderItem={({ item }) => item.type === 'category'
      ? <Text accessibilityRole="header" style={styles.group}>{item.name}</Text>
      : <ProductCard product={item.product} onPress={() => navigation.navigate('ProductDetails', { productId: item.product.id })} />} />;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  content: { paddingTop: 24, width: '100%', maxWidth: 640, alignSelf: 'center' },
  header: { gap: 12, marginBottom: 8 }, category: { color: colors.primaryDark, fontWeight: '600', fontSize: 14 },
  title: { fontSize: 27, lineHeight: 34, color: colors.text, fontWeight: '700' },
  description: { color: colors.muted, fontSize: 15, lineHeight: 22 }, prep: { color: colors.text, fontSize: 15 },
  section: { fontSize: 22, fontWeight: '700', color: colors.text },
  group: { fontSize: 18, fontWeight: '700', color: colors.primaryDark, marginTop: 12, marginBottom: 14 },
});
