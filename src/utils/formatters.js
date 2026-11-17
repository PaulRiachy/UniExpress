export function formatCurrency(cents) {
  if (!Number.isSafeInteger(cents) || cents < 0) return 'Price unavailable';
  return `$${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, '0')}`;
}
