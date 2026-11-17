import pocketbase from './pocketbase.js';
import { serviceRequest } from './serviceRequest.js';

function client() {
  if (!pocketbase) throw new Error('Campus services are not configured. Check the PocketBase connection.');
  return pocketbase;
}

function withHours(store) {
  return { ...store, hours: store.expand?.store_hours_via_store || [] };
}

async function getRecord(collection, id, expand, unavailableMessage) {
  const pb = client();
  try {
    return await serviceRequest(options => pb.collection(collection).getOne(id, { ...options, expand }));
  } catch (error) {
    if (error.status === 404) throw new Error(unavailableMessage);
    throw error;
  }
}

// Reverse expansion fetches all daily hours with the stores, avoiding one request per card.
export async function getStores() {
  const pb = client();
  const records = await serviceRequest(options => pb.collection('stores').getFullList({
    ...options, filter: 'is_active = true', sort: 'name,id', expand: 'store_hours_via_store',
  }));
  return records.map(withHours);
}

export async function getStoreById(storeId) {
  if (!storeId) throw new Error('Choose a campus store from Home.');
  const store = await getRecord('stores', storeId, 'store_hours_via_store', 'This store is no longer available.');
  if (!store.is_active) throw new Error('This store is no longer available.');
  return withHours(store);
}

export function getStoreHours(storeId) {
  const pb = client();
  if (!storeId) throw new Error('Choose a campus store from Home.');
  return serviceRequest(options => pb.collection('store_hours').getFullList({
    ...options, filter: pb.filter('store = {:storeId} && store.is_active = true', { storeId }), sort: 'weekday,id',
  }));
}

export function getProductCategories(storeId) {
  const pb = client();
  if (!storeId) throw new Error('Choose a campus store from Home.');
  // Categories have no is_active field; their parent store does.
  return serviceRequest(options => pb.collection('product_categories').getFullList({
    ...options, filter: pb.filter('store = {:storeId} && store.is_active = true', { storeId }), sort: 'sort_order,name,id',
  }));
}

export function getProductsByStore(storeId) {
  const pb = client();
  if (!storeId) throw new Error('Choose a campus store from Home.');
  return serviceRequest(options => pb.collection('products').getFullList({
    ...options,
    filter: pb.filter('store = {:storeId} && is_active = true && store.is_active = true', { storeId }),
    sort: 'category.sort_order,name,id', expand: 'category',
  }));
}

export async function getProductById(productId) {
  if (!productId) throw new Error('Choose a product from a store.');
  const product = await getRecord('products', productId, 'category,store,store.store_hours_via_store', 'This product is no longer available.');
  if (!product.is_active || !product.expand?.store?.is_active) {
    throw new Error('This product is no longer available.');
  }
  return { ...product, expand: { ...product.expand, store: withHours(product.expand.store) } };
}
