import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Action } from '../../components/common/FormScreen';
import CatalogFeedback from '../../components/common/CatalogFeedback';
import FilterChips from '../../components/common/FilterChips';
import StoreCard from '../../components/stores/StoreCard';
import { colors, universityName } from '../../constants/theme';
import useAuth from '../../hooks/useAuth';
import useStoreStatus from '../../hooks/useStoreStatus';
import { getStores } from '../../services/catalogService.js';
import { getDeliverySlots } from '../../services/deliveryService.js';
import { getBalance } from '../../services/walletService.js';
import { checkPocketBaseHealth } from '../../services/pocketbase';
import { filterStores } from '../../utils/catalog.js';
import { getNextCandidateSlot } from '../../utils/campusTime.js';
import { formatCurrency } from '../../utils/formatters.js';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { now, statusFor } = useStoreStatus();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [balance, setBalance] = useState({ loading: true, value: null, error: '' });
  const [slots, setSlots] = useState({ loading: true, value: [], error: '' });
  const [connection, setConnection] = useState({ status: 'checking', message: 'Checking PocketBase API…' });
  const [connectionAttempt, setConnectionAttempt] = useState(0);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true); setError(''); setStores([]);
    setBalance({ loading: true, value: null, error: '' });
    setSlots({ loading: true, value: [], error: '' });
    // Banner failures must not block browsing.
    getStores().then(records => { if (active) setStores(records); })
      .catch(e => { if (active) setError(e.message); })
      .finally(() => { if (active) setLoading(false); });
    Promise.resolve().then(getBalance)
      .then(value => { if (active) setBalance({ loading: false, value, error: '' }); })
      .catch(e => { if (active) setBalance({ loading: false, value: null, error: e.message }); });
    Promise.resolve().then(getDeliverySlots)
      .then(value => { if (active) setSlots({ loading: false, value, error: '' }); })
      .catch(e => { if (active) setSlots({ loading: false, value: [], error: e.message }); });
    return () => { active = false; };
  }, [attempt, user?.id]));

  useEffect(() => {
    const controller = new AbortController();
    setConnection({ status: 'checking', message: 'Checking PocketBase API…' });
    checkPocketBaseHealth({ signal: controller.signal }).then(result => {
      if (!controller.signal.aborted) setConnection(result);
    });
    return () => controller.abort();
  }, [connectionAttempt]);

  const categories = useMemo(() => [
    { label: 'All', value: '' },
    ...[...new Set(stores.map(store => store.category))].sort().map(value => ({ label: value, value })),
  ], [stores]);
  const visible = useMemo(() => filterStores(stores, search, category), [stores, search, category]);
  const nextSlot = getNextCandidateSlot(slots.value, now);
  const refresh = () => { setAttempt(value => value + 1); setConnectionAttempt(value => value + 1); };
  const firstName = user?.name?.trim().split(/\s+/)[0];

  const header = <View>
    <Text style={styles.brand}>UniExpress</Text>
    <Text style={styles.university}>{universityName}</Text>
    <Text accessibilityRole="header" style={styles.welcome}>Hello{firstName ? `, ${firstName}` : ''}!</Text>
    <Text style={styles.subtitle}>Your campus essentials, delivered between classes.</Text>
    <View style={styles.banner}>
      <View style={styles.bannerItem}>
        <Text style={styles.bannerLabel}>Campus wallet</Text>
        {balance.loading ? <ActivityIndicator color={colors.primary} accessibilityLabel="Loading wallet" /> :
          <Text style={styles.bannerValue}>{balance.error ? 'Balance unavailable' : balance.value === null ? 'Not initialized' : formatCurrency(balance.value)}</Text>}
        <Text style={styles.hint}>{balance.loading ? 'Reading your balance…' : balance.error || (balance.value === null ? 'Your wallet is not set up yet.' : 'Simulated campus balance')}</Text>
      </View>
      <View style={styles.bannerItem}>
        <Text style={styles.bannerLabel}>Next class break</Text>
        {slots.loading ? <ActivityIndicator color={colors.primary} accessibilityLabel="Loading delivery slots" /> :
          <Text style={styles.bannerValue}>{slots.error ? 'Slots unavailable' : nextSlot ? `${nextSlot.start_time}–${nextSlot.end_time}` : 'No later slot today'}</Text>}
        <Text style={styles.hint}>{slots.error || 'Today · Beirut time. Confirmed at checkout.'}</Text>
      </View>
      {(!!balance.error || !!slots.error) && <Action title="Retry banner" variant="text" onPress={refresh} />}
    </View>
    <View style={styles.search}>
      <TextInput accessibilityLabel="Search stores by name" placeholder="Search campus stores" placeholderTextColor={colors.muted}
        value={search} onChangeText={setSearch} autoCorrect={false} autoCapitalize="none" returnKeyType="search" style={styles.searchInput} />
      {!!search && <Pressable accessibilityRole="button" accessibilityLabel="Clear store search" onPress={() => setSearch('')} style={styles.clear}>
        <Text style={styles.clearText}>Clear</Text>
      </Pressable>}
    </View>
    <FilterChips options={categories} value={category} onChange={setCategory} />
    <View style={styles.section}>
      <Text accessibilityRole="header" style={styles.sectionTitle}>Campus Stores</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Refresh campus stores and banner" disabled={loading} onPress={refresh} style={styles.refresh}>
        <Text style={[styles.clearText, loading && { color: colors.muted }]}>Refresh</Text>
      </Pressable>
    </View>
  </View>;

  const footer = <View style={styles.connection}>
    <Text accessibilityLiveRegion="polite" style={styles.connectionText}>PocketBase: {connection.status === 'connected' ? 'Connected' : connection.status === 'checking' ? 'Checking…' : 'Unreachable / not configured'}</Text>
    {connection.status !== 'connected' && <Text style={styles.hint}>{connection.message}</Text>}
    <Action variant="text" title="Check connection" disabled={connection.status === 'checking'} onPress={() => setConnectionAttempt(value => value + 1)} />
  </View>;

  return <FlatList style={styles.screen} data={visible} extraData={now} keyExtractor={store => store.id}
    contentContainerStyle={[styles.content, { paddingLeft: 20 + insets.left, paddingRight: 20 + insets.right }]}
    keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" onRefresh={refresh} refreshing={loading && stores.length > 0}
    ListHeaderComponent={header} ListFooterComponent={footer}
    ListEmptyComponent={<CatalogFeedback loading={loading} error={error} onRetry={refresh}
      empty={stores.length ? 'No stores match your search and category. Try another name or choose All.' : 'No campus stores are available right now. Pull down to refresh.'} />}
    renderItem={({ item }) => <StoreCard store={item} status={statusFor(item)} onPress={() => navigation.navigate('Store', { storeId: item.id })} />} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  content: { paddingVertical: 24, width: '100%', maxWidth: 640, alignSelf: 'center' },
  brand: { color: colors.primary, fontSize: 27, fontWeight: '800' },
  university: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 4 },
  welcome: { color: colors.text, fontSize: 25, fontWeight: '700', marginTop: 24 },
  subtitle: { color: colors.muted, fontSize: 15, lineHeight: 22, marginTop: 6 },
  banner: { backgroundColor: colors.pale, borderRadius: 16, padding: 16, marginVertical: 22, flexDirection: 'row', flexWrap: 'wrap', gap: 18 },
  bannerItem: { flex: 1, minWidth: 135, gap: 6 }, bannerLabel: { color: colors.primaryDark, fontSize: 13, fontWeight: '600' },
  bannerValue: { color: colors.text, fontSize: 18, lineHeight: 25, fontWeight: '700' },
  hint: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  search: { flexDirection: 'row', borderWidth: 1, borderColor: colors.border, borderRadius: 12, alignItems: 'center' },
  searchInput: { flex: 1, minWidth: 0, padding: 14, minHeight: 50, color: colors.text, fontSize: 16 },
  clear: { minHeight: 48, paddingHorizontal: 12, justifyContent: 'center' }, clearText: { color: colors.primaryDark, fontWeight: '600', fontSize: 14 },
  section: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 12 },
  sectionTitle: { flexShrink: 1, fontSize: 21, fontWeight: '700', color: colors.text },
  refresh: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 8 },
  connection: { padding: 14, borderTopWidth: 1, borderColor: colors.border, marginTop: 12, gap: 6 },
  connectionText: { color: colors.text, fontSize: 13, lineHeight: 20 },
});
