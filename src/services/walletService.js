import pocketbase from './pocketbase.js';
import { getCurrentUser } from './authService.js';
import { serviceRequest } from './serviceRequest.js';

// No user ID parameter: only the current user's wallet can be requested.
export async function getBalance() {
  const user = getCurrentUser();
  if (!user || !pocketbase) throw new Error('Please sign in again.');
  const result = await serviceRequest(options => pocketbase.collection('wallets').getList(1, 1, {
    ...options, filter: pocketbase.filter('user = {:userId}', { userId: user.id }),
    fields: 'id,user,balance_cents',
  }));
  if (getCurrentUser()?.id !== user.id) throw new Error('Please sign in again.');
  const wallet = result.items[0];
  if (!wallet) return null;
  if (wallet.user !== user.id || !Number.isSafeInteger(wallet.balance_cents) || wallet.balance_cents < 0) {
    throw new Error('Wallet balance is unavailable. Please try again.');
  }
  return wallet.balance_cents;
}
