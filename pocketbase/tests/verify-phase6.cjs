// Integration checks use only Node built-ins and PocketBase 0.41.1.
// All accounts, credentials and private fixtures exist only in a disposable database.
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
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'uniexpress-phase6-'));
const flags = ['--dir=' + temp, '--migrationsDir=' + path.join(backend, 'pb_migrations'), '--automigrate=false'];
let server;
let base;
let checks = 0;
function command(args) {
  const result = spawnSync(binary, [...args, ...flags], { cwd: backend, encoding: 'utf8', windowsHide: true });
  assert.equal(result.status, 0, result.stderr || 'PocketBase command failed');
  return result.stdout;
}
async function api(method, collection, id = '', data, token = '') {
  const response = await fetch(base + '/api/collections' + (collection ? '/' + collection + (id ? '/' + id : '/records') : (id.startsWith('?') ? id : '/' + id)), {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: token } : {}) },
    ...(data !== undefined ? { body: JSON.stringify(data) } : {}),
  });
  let body;
  try { body = await response.json(); } catch { body = {}; }
  return { status: response.status, body };
}
function expect(result, status) {
  checks++;
  assert.equal(result.status, status, 'API assertion '+checks+': '+JSON.stringify(result.body));
  return result.body;
}
async function main() {
  assert.match(spawnSync(binary, ['--version'], {encoding:'utf8'}).stdout, /0\.41\.1/);
  command(['migrate', 'up']);
  assert.match(command(['migrate', 'up']), /No new migrations/);
  const adminEmail = 'phase6-' + crypto.randomUUID() + '@example.invalid';
  const password = crypto.randomBytes(24).toString('base64url');
  // Secrets are generated per run and never logged or committed.
  command(['superuser', 'create', adminEmail, password]);
  const socket = net.createServer();
  await new Promise(resolve => socket.listen(0, '127.0.0.1', resolve));
  const port = socket.address().port;
  await new Promise(resolve => socket.close(resolve));
  base = 'http://127.0.0.1:' + port;
  server = spawn(binary, ['serve', '--http=127.0.0.1:' + port, ...flags], {cwd:backend, stdio:'ignore', windowsHide:true});
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try { ready = (await fetch(base + '/api/health')).ok; } catch {}
    if (ready) break;
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  assert.ok(ready, 'Isolated server failed to start');
  const adminAuth = expect(await api('POST', '_superusers', 'auth-with-password', {identity:adminEmail,password}), 200);
  const admin = adminAuth.token;
  const cols = expect(await api('GET', '', '?perPage=100', undefined, admin), 200);
  const expected = ['users','stores','store_hours','product_categories','products','buildings','delivery_slots',
    'saved_locations','pricing_rules','orders','order_items','wallets','wallet_transactions','ratings'];
  assert.deepEqual(cols.items.filter(c => !c.name.startsWith('_')).map(c => c.name).sort(), expected.sort());
  for (const c of cols.items.filter(c => expected.includes(c.name))) {
    const detail = expect(await api('GET', '', c.id, undefined, admin), 200);
    for (const field of detail.fields.filter(f => f.type === 'relation')) {
      assert.ok(cols.items.some(target => target.id === field.collectionId), 'Missing relation target');
      assert.equal(field.maxSelect, 1);
      assert.equal(field.cascadeDelete, false);
    }
  }
  async function create(collection, data) {
    return expect(await api('POST', collection, '', data, admin), 200);
  }
  const catalog = ['stores','store_hours','product_categories','products','buildings','delivery_slots','pricing_rules'];
  const lists = {};
  for (const name of catalog) {
    const list = expect(await api('GET', name), 200);
    assert.ok(list.items.length);
    lists[name] = list.items;
    expect(await api('GET', name, 'records/' + list.items[0].id), 200);
  }
  assert.equal(lists.stores.length, 4);
  assert.equal(lists.products.length, 25);
  assert.equal(lists.buildings.length, 6);
  assert.equal(lists.delivery_slots.length, 5);
  assert.equal(lists.store_hours.length, 28);
  assert.deepEqual(lists.stores.map(s => s.name).sort(), ['Cafeteria','Coffee Corner','Bookstore & Stationery','Printing Office'].sort());
  for (const p of lists.products) {
    assert.ok(Number.isInteger(p.price_cents));
    assert.equal(lists.product_categories.find(c => c.id === p.category).store, p.store);
  }
  const price = lists.pricing_rules[0];
  for (const [k,v] of Object.entries({minimum_order_cents:200,free_delivery_threshold_cents:1000,delivery_fee_cents:50,
    bw_page_cents:5,color_page_cents:25,spiral_binding_cents:150,staple_fee_cents:0})) assert.equal(price[k], v);
  const profile = {name:'Synthetic Test',account_type:'student',faculty:'Demo Faculty',phone:'00000000',password,passwordConfirm:password};
  const a = await create('users', {...profile,email:'phase6-a@ua.edu.lb',university_id:'TEST-A'});
  const b = await create('users', {...profile,email:'phase6-b@ua.edu.lb',university_id:'TEST-B'});
  const authA = expect(await api('POST','users','auth-with-password',{identity:'phase6-a@ua.edu.lb',password}),200).token;
  const authB = expect(await api('POST','users','auth-with-password',{identity:'phase6-b@ua.edu.lb',password}),200).token;
  expect(await api('POST','users','',{...profile,email:'phase6-bad@example.invalid',university_id:'TEST-C'},admin),400);
  expect(await api('POST','users','',{...profile,email:'phase6-duplicate@ua.edu.lb',university_id:'TEST-A'},admin),400);
  expect(await api('POST','users','',{...profile,email:'phase6-missing@ua.edu.lb'},admin),400);
  expect(await api('POST','users','',{...profile,email:'phase6-short@ua.edu.lb',university_id:'TEST-C',password:'short',passwordConfirm:'short'},admin),400);
  const store = lists.stores[0].id;
  const building = lists.buildings[0].id;
  const slot = lists.delivery_slots[0].id;
  const order = await create('orders',{user:a.id,store,building,room:'DEMO-101',slot,delivery_date:'2026-11-10',
    payment_method:'cash',status:'delivered',subtotal_cents:250,delivery_fee_cents:50,total_cents:300});
  const wallet = await create('wallets',{user:a.id,balance_cents:0});
  const privateRows = {
    orders:order,
    wallets:wallet,
    order_items:await create('order_items',{order:order.id,item_type:'product',product:lists.products[0].id,
      name_snapshot:'Synthetic item',quantity:1,unit_price_cents:250,line_total_cents:250}),
    wallet_transactions:await create('wallet_transactions',{user:a.id,wallet:wallet.id,order:order.id,
      kind:'payment',amount_cents:300,balance_after_cents:0,description:'Synthetic test transaction'}),
    ratings:await create('ratings',{user:a.id,order:order.id,stars:5,comment:'Synthetic test rating'}),
  };
  const location = expect(await api('POST','saved_locations','',{user:a.id,label:'Test location',building,room:'101'},authA),200);
  const privateReads = {...privateRows,users:a,saved_locations:location};
  for (const [name,row] of Object.entries(privateReads)) {
    for (const [token,count] of [['',0],[authA,1],[authB,name === 'users' ? 1 : 0]]) {
      const list = expect(await api('GET',name,'',undefined,token),200);
      assert.equal(list.totalItems,count,name+' visibility');
    }
    expect(await api('GET',name,'records/'+row.id,undefined,authA),200);
    expect(await api('GET',name,'records/'+row.id,undefined,authB),404);
    expect(await api('GET',name,'records/'+row.id),404);
  }
  // Deny all direct authoritative writes, even with a valid owner's token and valid body.
  for (const name of [...catalog,...Object.keys(privateRows)]) {
    const row = privateRows[name] || lists[name][0];
    const payload = {...row}; delete payload.id; delete payload.created; delete payload.updated;
    for (const token of ['',authA,authB]) {
      expect(await api('POST',name,'',payload,token),403);
      expect(await api('PATCH',name,'records/'+row.id,{...payload,total_cents:1,balance_cents:999999,status:'delivered'},token),403);
      expect(await api('DELETE',name,'records/'+row.id,undefined,token),403);
    }
  }
  expect(await api('POST','users','',{...profile,email:'phase6-new@ua.edu.lb',university_id:'TEST-D'}),403);
  expect(await api('DELETE','users','records/'+a.id,undefined,authA),403);
  expect(await api('PATCH','users','records/'+a.id,{phone:'11111111'},authA),200);
  expect(await api('PATCH','users','records/'+a.id,{phone:'22222222'},authB),404);
  for (const payload of [{verified:true},{email:'other@ua.edu.lb'},{university_id:'CHANGED'},
    {account_type:'staff'},{password:password+'x',passwordConfirm:password+'x'}]) {
    expect(await api('PATCH','users','records/'+a.id,payload,authA),404);
  }
  expect(await api('POST','saved_locations','',{user:b.id,label:'Spoof',building,room:'101'},authA),400);
  expect(await api('POST','saved_locations','',{user:a.id,label:'Anonymous',building,room:'101'}),400);
  expect(await api('PATCH','saved_locations','records/'+location.id,{user:b.id},authA),404);
  expect(await api('PATCH','saved_locations','records/'+location.id,{'user+':b.id},authA),404);
  expect(await api('PATCH','saved_locations','records/'+location.id,{room:'202'},authB),404);
  expect(await api('PATCH','saved_locations','records/'+location.id,{room:'202'},authA),200);
  expect(await api('POST','saved_locations','',{user:a.id,label:'Bad relation',building:'xxxxxxxxxxxxxxx',room:'101'},authA),400);
  expect(await api('POST','saved_locations','',{user:a.id,label:'No room',building},authA),400);
  expect(await api('DELETE','saved_locations','records/'+location.id,undefined,authB),404);
  expect(await api('DELETE','saved_locations','records/'+location.id,undefined,authA),204);
  const sample = {...lists.products[0]}; delete sample.id;
  expect(await api('POST','products','',{...sample,name:'Fractional price',price_cents:1.5},admin),400);
  expect(await api('POST','products','',{...sample,name:'Negative price',price_cents:-1},admin),400);
  expect(await api('POST','products','',{...sample,name:'Missing store',store:''},admin),400);
  expect(await api('POST','products','',{...sample,name:'Bad category',category:'xxxxxxxxxxxxxxx'},admin),400);
  expect(await api('POST','products','',sample,admin),400); // store/name uniqueness
  expect(await api('POST','wallets','',{user:a.id,balance_cents:20},admin),400);
  expect(await api('POST','ratings','',{order:order.id,user:a.id,stars:6},admin),400);
  expect(await api('POST','ratings','',{order:order.id,user:a.id,stars:4},admin),400);
  expect(await api('POST','pricing_rules','',{...price,id:undefined},admin),400); // only one active policy
  const inactive = await create('pricing_rules',{...price,id:undefined,is_active:false});
  expect(await api('GET','pricing_rules','records/'+inactive.id),404);
  assert.equal(expect(await api('GET','pricing_rules'),200).totalItems,1);
  // A preexisting catalog must trigger an atomic conflict, preserving its records.
  const conflictMigrations = path.join(temp, 'conflict-migrations');
  const conflictData = path.join(temp, 'conflict-data');
  fs.mkdirSync(conflictMigrations);
  fs.writeFileSync(path.join(conflictMigrations,'1000000000_existing.js'), `migrate(app => {
    const c = new Collection({name:'stores',type:'base',fields:[{name:'name',type:'text'}]});
    app.save(c); const r = new Record(c); r.set('name','Preserve this synthetic record'); app.save(r);
  });`);
  const conflictArgs = ['--dir='+conflictData,'--migrationsDir='+conflictMigrations,'--automigrate=false'];
  const conflictRun = () => spawnSync(binary,['migrate','up',...conflictArgs],{cwd:backend,encoding:'utf8',windowsHide:true});
  assert.equal(conflictRun().status,0);
  for (const name of fs.readdirSync(path.join(backend,'pb_migrations'))) {
    fs.copyFileSync(path.join(backend,'pb_migrations',name),path.join(conflictMigrations,name));
  }
  const blocked = conflictRun();
  assert.notEqual(blocked.status,0);
  assert.match(blocked.stderr,/Phase 6 conflict/);
  for (const name of fs.readdirSync(path.join(backend,'pb_migrations'))) {
    fs.renameSync(path.join(conflictMigrations,name),path.join(conflictMigrations,name+'.disabled'));
  }
  fs.writeFileSync(path.join(conflictMigrations,'1794268802_preserved.js'), `migrate(app => {
    const r = app.findFirstRecordByData('stores','name','Preserve this synthetic record');
    if (!r || app.countRecords('stores') !== 1) throw new Error('Existing record lost');
    if (app.findAllCollections().some(c => c.name === 'products')) throw new Error('Partial migration leaked');
  });`);
  assert.equal(conflictRun().status,0);
  console.log('PASS: existing-collection conflict preserves records with no partial schema changes.');
  console.log('PASS: 14 collections, relation targets, seed counts, integer prices, uniqueness and validation.');
  console.log('PASS: anonymous/owner/unrelated-user reads and all direct authoritative write restrictions.');
  console.log('PASS: profile guards, saved-location ownership/spoofing, active pricing filter.');
  console.log('PASS: migration reapply is a no-op; '+checks+' API assertions passed.');
}
main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(async () => {
  if (server && server.exitCode === null) { server.kill(); await once(server,'exit'); }
  const resolved = path.resolve(temp);
  assert.ok(resolved.startsWith(path.resolve(os.tmpdir()) + path.sep) && path.basename(resolved).startsWith('uniexpress-phase6-'));
  fs.rmSync(resolved,{recursive:true,force:true,maxRetries:5,retryDelay:200});
});
