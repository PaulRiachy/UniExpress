// Real SDK services + disposable PocketBase. Never reads or mutates the developer's accounts.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const net = require('node:net');
const crypto = require('node:crypto');
const { spawn, spawnSync } = require('node:child_process');
const { once } = require('node:events');
const backend = path.resolve(__dirname, '..');
const binary = path.join(backend, process.platform === 'win32' ? 'pocketbase.exe' : 'pocketbase');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'uniexpress-phase8-'));
const flags = ['--dir=' + temp, '--migrationsDir=' + path.join(backend, 'pb_migrations'), '--automigrate=false'];
let server, base;
let apiChecks = 0;

function command(args) {
  const result = spawnSync(binary, [...args, ...flags], { cwd: backend, encoding: 'utf8', windowsHide: true });
  assert.equal(result.status, 0, 'Disposable PocketBase setup failed.');
}
async function api(collection, method, suffix, body, token = '', status = 200) {
  const response = await fetch(`${base}/api/collections/${collection}/${suffix}`, {
    method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: token } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  apiChecks++;
  assert.equal(response.status, status, `${method} ${collection} failed`);
  return response.status === 204 ? null : response.json();
}

async function main() {
  const { getCampusTime, getStoreStatus, getNextCandidateSlot } = await import('../../src/utils/campusTime.js');
  const { filterStores, groupProducts, clampQuantity, hasUnconfiguredOptions } = await import('../../src/utils/catalog.js');
  const { formatCurrency } = await import('../../src/utils/formatters.js');
  const seed = JSON.parse(fs.readFileSync(path.join(backend, 'seed/catalog.json'), 'utf8'));
  const campus = JSON.parse(fs.readFileSync(path.join(backend, 'seed/campus.json'), 'utf8'));
  const store = { ...seed.stores[0], hours: seed.store_hours.filter(row => row.store === seed.stores[0].id) };
  const open = instant => getStoreStatus(store, new Date(instant)).isOpen;
  assert.equal(open('2026-11-16T05:59:59Z'), false);
  assert.equal(open('2026-11-16T06:00:00Z'), true); // 08:00 Beirut, winter
  assert.equal(open('2026-11-16T14:59:59Z'), true);
  assert.equal(open('2026-11-16T15:00:00Z'), false); // exclusive closing time
  assert.equal(open('2026-11-15T10:00:00Z'), false); // Sunday
  assert.equal(open('2026-07-06T05:00:00Z'), true); // 08:00 Beirut, summer
  assert.equal(open('2026-07-06T14:00:00Z'), false);
  assert.equal(getStoreStatus({ ...store, is_active: false }, new Date('2026-11-16T10:00:00Z')).isOpen, false);
  assert.equal(getStoreStatus({ ...store, hours: [] }).isOpen, false);
  assert.equal(getStoreStatus({ ...store, hours: [{weekday: 1, opens_at: 'bad', closes_at: '17:00'}] }, new Date('2026-11-16T10:00:00Z')).isOpen, false);
  assert.equal(getCampusTime(new Date('2026-11-15T22:30:00Z')).weekday, 1);
  assert.equal(getCampusTime(new Date('2026-11-15T22:30:00Z')).date, '2026-11-16');
  const next = instant => getNextCandidateSlot(campus.delivery_slots, new Date(instant));
  assert.equal(next('2026-11-16T07:44:59Z').start_time, '09:45');
  assert.equal(next('2026-11-16T07:45:00Z').start_time, '11:15');
  assert.equal(next('2026-11-16T14:15:00Z'), null);
  assert.equal(getNextCandidateSlot([]), null);
  assert.equal(getNextCandidateSlot(campus.delivery_slots.map(row => ({ ...row, is_active: false }))), null);
  for (const tz of ['UTC', 'America/Los_Angeles', 'Asia/Tokyo']) {
    const result = spawnSync(process.execPath, ['--input-type=module', '-e',
      "import {getCampusTime} from './src/utils/campusTime.js'; const t=getCampusTime(new Date('2026-11-15T22:30:00Z')); if(t.date!=='2026-11-16'||t.weekday!==1||t.minutes!==30)process.exit(1);"],
    { cwd: path.resolve(backend, '..'), encoding: 'utf8', env: { ...process.env, TZ: tz }, windowsHide: true });
    assert.equal(result.status, 0, `Timezone independence: ${tz}`);
  }
  assert.equal(filterStores(seed.stores, '  cOFfee  ', '').length, 1);
  assert.equal(filterStores(seed.stores, 'coffee', 'Food').length, 0);
  assert.equal(filterStores(seed.stores, '', 'Food').length, 1);
  assert.equal(filterStores(seed.stores, 'missing', '').length, 0);
  assert.equal(filterStores(seed.stores, '   ', '').length, 4);
  const rows = groupProducts(seed.products, seed.product_categories);
  assert.equal(rows.filter(row => row.type === 'product').length, 25);
  assert.equal(new Set(rows.map(row => row.key)).size, rows.length);
  assert.equal(rows.filter(row => row.type === 'category').length, 3);
  assert.equal(rows.filter(row => row.type === 'product' && !row.product.in_stock).length, 1);
  assert.deepEqual(groupProducts([], seed.product_categories), []);
  for (const [input, expected] of [[0,1],[-1,1],[1,1],[2.9,2],[999,99],[NaN,1]]) assert.equal(clampQuantity(input), expected);
  assert.equal(formatCurrency(0), '$0.00'); assert.equal(formatCurrency(75), '$0.75');
  assert.equal(formatCurrency(250 * 3), '$7.50'); assert.equal(formatCurrency(1.5), 'Price unavailable');
  assert.equal(hasUnconfiguredOptions([]), false); assert.equal(hasUnconfiguredOptions(null), false);
  assert.equal(hasUnconfiguredOptions([{ unknown: 'Do not invent a price' }]), true);
  console.log('PASS: Beirut winter/summer/boundaries/weekend/day rollover; device-zone independence; slots, combined filters, grouping, cents and quantity limits.');

  command(['migrate', 'up']);
  const password = crypto.randomBytes(24).toString('base64url');
  const adminEmail = `phase8-${crypto.randomUUID()}@example.invalid`;
  command(['superuser', 'create', adminEmail, password]);
  const socket = net.createServer();
  await new Promise(resolve => socket.listen(0, '127.0.0.1', resolve));
  const port = socket.address().port;
  await new Promise(resolve => socket.close(resolve));
  base = `http://127.0.0.1:${port}`;
  server = spawn(binary, ['serve', '--http=127.0.0.1:' + port, ...flags], { cwd: backend, stdio: 'ignore', windowsHide: true });
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try { ready = (await fetch(base + '/api/health')).ok; } catch {}
    if (ready) break;
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  assert.ok(ready, 'Isolated server did not start');
  const admin = (await api('_superusers', 'POST', 'auth-with-password', {identity: adminEmail, password})).token;
  process.env.EXPO_PUBLIC_POCKETBASE_URL = base;
  const auth = await import('../../src/services/authService.js');
  const catalog = await import('../../src/services/catalogService.js');
  const wallet = await import('../../src/services/walletService.js');
  const delivery = await import('../../src/services/deliveryService.js');
  const { checkPocketBaseHealth } = await import('../../src/services/pocketbase.js');
  assert.equal((await checkPocketBaseHealth()).status, 'connected');
  const stores = await catalog.getStores();
  assert.equal(stores.length, 4);
  assert.ok(stores.every(item => item.hours.length === 7));
  const products = [];
  for (const item of stores) {
    assert.equal((await catalog.getStoreById(item.id)).name, item.name);
    assert.equal((await catalog.getStoreHours(item.id)).length, 7);
    const groups = await catalog.getProductCategories(item.id);
    assert.equal(groups.length, 1);
    const items = await catalog.getProductsByStore(item.id);
    assert.ok(items.every(product => product.store === item.id && product.expand.category.store === item.id));
    products.push(...items);
  }
  assert.equal(products.length, 25);
  assert.ok(products.some(product => !product.in_stock));
  for (const product of products) {
    const detail = await catalog.getProductById(product.id);
    assert.equal(detail.name, product.name);
    assert.equal(detail.expand.store.id, product.store);
    assert.equal(detail.expand.store.hours.length, 7);
    assert.deepEqual(detail.options_json, []);
    assert.equal(detail.image, '');
  }
  const sample = products[0];
  await api('products', 'PATCH', 'records/' + sample.id, { is_active: false }, admin);
  assert.ok(!(await catalog.getProductsByStore(sample.store)).some(item => item.id === sample.id));
  await assert.rejects(catalog.getProductById(sample.id), /no longer available/);
  await api('products', 'PATCH', 'records/' + sample.id, { is_active: true, price_cents: 675 }, admin);
  assert.equal((await catalog.getProductById(sample.id)).price_cents, 675);
  await api('stores', 'PATCH', 'records/' + sample.store, { is_active: false }, admin);
  assert.equal((await catalog.getStores()).length, 3);
  assert.deepEqual(await catalog.getProductsByStore(sample.store), []);
  await assert.rejects(catalog.getStoreById(sample.store), /no longer available/);
  await assert.rejects(catalog.getProductById(sample.id), /no longer available/);
  await api('stores', 'PATCH', 'records/' + sample.store, { is_active: true }, admin);
  assert.deepEqual(await catalog.getProductsByStore('xxxxxxxxxxxxxxx'), []);
  await assert.rejects(catalog.getStoreById('xxxxxxxxxxxxxxx'), /no longer available/);
  await assert.rejects(catalog.getProductById('xxxxxxxxxxxxxxx'), /no longer available/);
  console.log('PASS: four live stores, 25 products, reverse/nested expansions, stock visibility, active filters, empty results and refresh after backend changes.');

  const values = { name:'Phase Eight', email:'phase8-a@ua.edu.lb', university_id:'PHASE8-A', account_type:'student', faculty:'Engineering and Technology', phone:'00000000', password, passwordConfirm:password };
  const a = await auth.register(values);
  await auth.login(values.email, password);
  assert.equal(await wallet.getBalance(), null);
  const record = await api('wallets', 'POST', 'records', { user:a.id, balance_cents:0 }, admin);
  assert.equal(await wallet.getBalance(), 0);
  await api('wallets', 'PATCH', 'records/' + record.id, { balance_cents:1234 }, admin);
  assert.equal(await wallet.getBalance(), 1234);
  const slots = await delivery.getDeliverySlots();
  assert.equal(slots.length, 5);
  await api('delivery_slots', 'PATCH', 'records/' + slots[0].id, { is_active:false }, admin);
  assert.equal((await delivery.getDeliverySlots()).length, 4);
  const authA = await api('users', 'POST', 'auth-with-password', {identity: values.email, password});
  await api('wallets', 'PATCH', 'records/' + record.id, {balance_cents: 9999}, authA.token, 403);
  await auth.register({...values, email:'phase8-b@ua.edu.lb', university_id:'PHASE8-B'});
  await auth.login('phase8-b@ua.edu.lb', password);
  assert.equal(await wallet.getBalance(), null); // A's balance is never returned
  const authB = await api('users', 'POST', 'auth-with-password', {identity:'phase8-b@ua.edu.lb', password});
  await api('wallets', 'GET', 'records/' + record.id, null, authB.token, 404);
  auth.logout();
  await assert.rejects(wallet.getBalance(), /sign in/);
  console.log('PASS: missing/zero/funded wallet, account switching, owner isolation, denied writes, active slots and logout.');

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new TypeError('Network request failed'); };
  try {
    await assert.rejects(catalog.getStores(), /Connection failed/);
    assert.equal((await checkPocketBaseHealth()).status, 'error');
  } finally { globalThis.fetch = originalFetch; }
  assert.equal((await catalog.getStores()).length, 4);
  assert.equal((await checkPocketBaseHealth()).status, 'connected');
  await auth.login(values.email, password);
  server.kill(); await once(server, 'exit');
  await assert.rejects(catalog.getStores(), /Connection failed/);
  await assert.rejects(wallet.getBalance(), /Connection failed/);
  await assert.rejects(delivery.getDeliverySlots(), /Connection failed/);
  assert.equal((await checkPocketBaseHealth()).status, 'error');
  server = spawn(binary, ['serve', '--http=127.0.0.1:' + port, ...flags], { cwd: backend, stdio: 'ignore', windowsHide: true });
  ready = false;
  for (let i = 0; i < 100; i++) {
    try { ready = (await fetch(base + '/api/health')).ok; } catch {}
    if (ready) break;
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  assert.ok(ready, 'Server did not restart');
  assert.equal((await catalog.getStores()).length, 4);
  assert.equal(await wallet.getBalance(), 1234);
  assert.equal((await delivery.getDeliverySlots()).length, 4);
  assert.equal((await checkPocketBaseHealth()).status, 'connected');
  auth.logout();
  console.log(`PASS: simulated network loss/recovery and real server shutdown/restart; catalog, wallet, slots and health recover. ${apiChecks} fixture/API assertions passed.`);
}
main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(async () => {
  if (server && server.exitCode === null) { server.kill(); await once(server, 'exit'); }
  const resolved = path.resolve(temp);
  assert.ok(resolved.startsWith(path.resolve(os.tmpdir()) + path.sep) && path.basename(resolved).startsWith('uniexpress-phase8-'));
  fs.rmSync(resolved, { recursive:true, force:true, maxRetries:5, retryDelay:200 });
});
