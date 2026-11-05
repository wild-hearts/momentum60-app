// Only remove this account's data; another account may have recoverable drafts.
export function clearAccountStorage(storage, userId) {
  if (!userId) return;
  const prefix = `momentum60:draft:${userId}:`;
  for (let i = storage.length - 1; i >= 0; i--) {
    const key = storage.key(i);
    if (key === `m60:snapshot:${userId}` || key?.startsWith(prefix)) storage.removeItem(key);
  }
}
