// PocketBase 0.41.1. Forward-only: never drop local records on rollback.
migrate((app) => {
  const existing = app.findAllCollections();
  const names = ['stores', 'store_hours', 'product_categories', 'products', 'buildings',
    'delivery_slots', 'saved_locations', 'pricing_rules', 'orders', 'order_items',
    'wallets', 'wallet_transactions', 'ratings'];
  for (const name of names) {
    if (existing.some((c) => c.name === name)) {
      throw new Error('Phase 6 conflict: ' + name + ' already exists. Review a backup; no collection is overwritten.');
    }
  }
  let users = existing.find((c) => c.name === 'users');
  if (users && (users.type !== 'auth' || app.countRecords(users.id) !== 0)) {
    throw new Error('Phase 6 requires an empty auth users collection; existing users need a reviewed migration.');
  }
  if (!users) users = new Collection({ name: 'users', type: 'auth' });
  const owner = '@request.auth.id != "" && user = @request.auth.id';
  const self = '@request.auth.id != "" && id = @request.auth.id';
  const text = (name, max = 120, required = true, pattern = '') =>
    ({ name, type: 'text', required, max, pattern });
  const number = (name, min = 0, max = 100000000, required = false) =>
    ({ name, type: 'number', onlyInt: true, min, max, required });
  const bool = (name) => ({ name, type: 'bool' });
  const select = (name, values) => ({ name, type: 'select', required: true, maxSelect: 1, values });
  const relation = (name, target, required = true) => ({ name, type: 'relation',
    collectionId: app.findCollectionByNameOrId(target).id, required,
    maxSelect: 1, cascadeDelete: false });
  const json = (name) => ({ name, type: 'json', maxSize: 20000 });
  const date = (name, required = false) => ({ name, type: 'date', required });
  const timestamps = () => [
    { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
    { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
  ];
  const addIndex = (c, suffix, cols, unique = false, where = '') =>
    c.addIndex('idx_ue_' + c.name + '_' + suffix, unique, cols, where);
  const create = (name, fields, readRule = '', indexes = []) => {
    const c = new Collection({ name, type: 'base', fields: [...fields, ...timestamps()],
      listRule: readRule, viewRule: readRule, createRule: null, updateRule: null, deleteRule: null });
    for (const [suffix, cols, unique, where] of indexes) addIndex(c, suffix, cols, unique, where);
    app.save(c);
    return c;
  };

  // Preserve default fields (including avatar), but constrain editable identity fields.
  users.fields.getByName('email').onlyDomains = ['ua.edu.lb'];
  users.fields.getByName('password').min = 8;
  const nameField = users.fields.getByName('name');
  if (nameField) { nameField.required = true; nameField.max = 120; }
  else users.fields.add(new TextField(text('name')));
  const profile = [text('university_id', 32, true, '^[A-Za-z0-9][A-Za-z0-9-]{2,31}$'),
    select('account_type', ['student', 'staff']), text('faculty'), text('phone', 32)];
  for (const field of profile) {
    if (users.fields.getByName(field.name)) throw new Error('Existing users field conflict: ' + field.name);
    users.fields.add(field.type === 'select' ? new SelectField(field) : new TextField(field));
  }
  users.listRule = self;
  users.viewRule = self;
  users.createRule = null; // Controlled registration is Phase 7.
  users.deleteRule = null;
  users.manageRule = null;
  users.updateRule = self + ' && ' + ['email', 'verified', 'university_id', 'account_type',
    'password', 'tokenKey', 'emailVisibility'].map((f) => '@request.body.' + f + ':changed = false').join(' && ');
  addIndex(users, 'university_id', 'university_id', true);
  app.save(users);

  create('stores', [text('name'), text('category', 60), text('description', 1000, false),
    { name: 'logo', type: 'url' }, number('preparation_minutes', 1, 180, true), bool('is_active')], '',
    [['name', 'name', true]]);
  create('store_hours', [relation('store', 'stores'), number('weekday', 0, 6),
    text('opens_at', 5, true, '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
    text('closes_at', 5, true, '^([01][0-9]|2[0-3]):[0-5][0-9]$'), bool('is_closed')], '',
    [['store_day', 'store, weekday', true]]);
  create('product_categories', [relation('store', 'stores'), text('name'), number('sort_order')], '',
    [['store_name', 'store, name', true]]);
  create('products', [relation('store', 'stores'), relation('category', 'product_categories'),
    text('name'), text('description', 1000, false), { name: 'image', type: 'url' },
    number('price_cents'), bool('in_stock'), bool('is_active'), json('options_json')], '',
    [['store_name', 'store, name', true], ['category', 'category']]);
  create('buildings', [text('code', 16, true, '^[A-Z0-9-]+$'), text('name'), bool('is_active')], '',
    [['code', 'code', true]]);
  create('delivery_slots', [text('label', 60),
    text('start_time', 5, true, '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
    text('end_time', 5, true, '^([01][0-9]|2[0-3]):[0-5][0-9]$'), bool('is_active'), number('sort_order')], '',
    [['window', 'start_time, end_time', true]]);
  const locations = create('saved_locations', [relation('user', 'users'), text('label', 80),
    relation('building', 'buildings'), text('room', 32)], owner, [['user_label', 'user, label', true]]);
  locations.createRule = '@request.auth.id != "" && @request.body.user = @request.auth.id';
  locations.updateRule = owner + ' && @request.body.user:changed = false';
  locations.deleteRule = owner;
  app.save(locations);
  create('pricing_rules', [number('minimum_order_cents'), number('free_delivery_threshold_cents'),
    number('delivery_fee_cents'), number('bw_page_cents'), number('color_page_cents'),
    number('spiral_binding_cents'), number('staple_fee_cents'),
    select('duplex_policy', ['per_page_no_surcharge']), bool('is_active')], 'is_active = true',
    [['one_active', 'is_active', true, 'is_active = TRUE']]);
  create('orders', [relation('user', 'users'), relation('store', 'stores'),
    relation('building', 'buildings'), text('room', 32), relation('slot', 'delivery_slots'),
    text('delivery_date', 10, true, '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'),
    select('payment_method', ['wallet', 'cash']),
    select('status', ['received', 'preparing', 'on_the_way', 'delivered', 'cancelled']),
    number('subtotal_cents'), number('delivery_fee_cents'), number('total_cents'),
    text('courier_name', 120, false), date('estimated_delivery_at'), date('delivered_at'), date('cancelled_at')], owner,
    [['user_created', 'user, created'], ['user_status', 'user, status'], ['store', 'store'], ['slot', 'slot']]);
  create('order_items', [relation('order', 'orders'), select('item_type', ['product', 'printing']),
    relation('product', 'products', false), text('name_snapshot'), number('quantity', 1, 10000, true),
    json('selected_options_json'), json('printing_spec_json'), number('unit_price_cents'), number('line_total_cents')],
    '@request.auth.id != "" && order.user = @request.auth.id', [['order', '"order"']]);
  create('wallets', [relation('user', 'users'), number('balance_cents')], owner, [['user', 'user', true]]);
  create('wallet_transactions', [relation('user', 'users'), relation('wallet', 'wallets'),
    relation('order', 'orders', false), select('kind', ['demo_topup', 'payment', 'refund']),
    number('amount_cents', 1, 100000000, true), number('balance_after_cents'), text('description', 500)], owner,
    [['user_created', 'user, created'], ['wallet', 'wallet'], ['order', '"order"']]);
  create('ratings', [relation('order', 'orders'), relation('user', 'users'), number('stars', 1, 5, true),
    text('comment', 1000, false)], owner, [['order', '"order"', true], ['user', 'user']]);
}, () => {
  throw new Error('Phase 6 is forward-only to preserve local data. Restore a reviewed backup instead of dropping collections.');
});
