// Serialize writes per journal entry so a slow older save cannot win.
export function createJournalQueue({ write, status, delay = 500 }) {
  const entries = new Map();
  let closed = false;
  async function flush(key) {
    const entry = entries.get(key);
    if (closed || !entry || entry.running) return;
    clearTimeout(entry.timer);
    entry.running = true;
    const version = entry.version;
    const value = entry.value;
    status(key, 'saving');
    try {
      await write(key, value);
      if (!closed && entry.version === version) status(key, 'saved');
    } catch {
      if (!closed && entry.version === version) status(key, 'failed');
    } finally {
      entry.running = false;
      if (!closed && entry.version !== version) void flush(key);
    }
  }
  return {
    enqueue(key, value) {
      if (closed) return;
      const entry = entries.get(key) || { version: 0, running: false };
      clearTimeout(entry.timer);
      entry.value = value;
      entry.version += 1;
      entries.set(key, entry);
      status(key, 'pending');
      entry.timer = setTimeout(() => void flush(key), delay);
    },
    flush,
    close() {
      closed = true;
      for (const entry of entries.values()) clearTimeout(entry.timer);
    }
  };
}
