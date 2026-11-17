export const MAX_PRODUCT_QUANTITY = 99;

export function clampQuantity(value) {
  return Math.max(1, Math.min(MAX_PRODUCT_QUANTITY, Number.isFinite(value) ? Math.trunc(value) : 1));
}

export function filterStores(stores, search, category) {
  const query = search.trim().toLowerCase();
  return stores.filter(store => store.name.toLowerCase().includes(query) && (!category || store.category === category));
}

export function groupProducts(products, categories) {
  const groups = categories.map(category => ({ ...category, products: [] }));
  for (const product of products) {
    let group = groups.find(item => item.id === product.category);
    if (!group) {
      group = { id: product.category || 'other', name: product.expand?.category?.name || 'Other products', products: [] };
      groups.push(group);
    }
    group.products.push(product);
  }
  return groups.flatMap(group => group.products.length ? [
    { key: `category-${group.id}`, type: 'category', name: group.name },
    ...group.products.map(product => ({ key: product.id, type: 'product', product })),
  ] : []);
}

export function hasUnconfiguredOptions(options) {
  // Phase 6 defines only [] (no sizes/extras). Never guess prices or JSON contracts.
  return options != null && !(Array.isArray(options) && options.length === 0);
}
