import { createClient } from '@supabase/supabase-js';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// "Keep me signed in" is on unless someone turns it off at sign-in.
const STAY_KEY = 'm60:stay-signed-in';
export function staySignedIn() {
  try { return localStorage.getItem(STAY_KEY) !== 'no'; } catch { return true; }
}
export function setStaySignedIn(keep) {
  try { localStorage.setItem(STAY_KEY, keep ? 'yes' : 'no'); } catch { /* The default (stay signed in) applies. */ }
}

// In the native apps the session lives in the device's own app storage, which
// the system does not clear the way it can clear a web view's storage.
const native = Capacitor.isNativePlatform();
const web = {
  get: key => { try { return localStorage.getItem(key); } catch { return null; } },
  set: (key, value) => { try { localStorage.setItem(key, value); } catch { /* Kept in memory for this visit. */ } },
  remove: key => { try { localStorage.removeItem(key); } catch { /* Nothing stored. */ } },
};
const durable = native ? {
  get: async key => (await Preferences.get({ key })).value ?? web.get(key),
  set: (key, value) => Preferences.set({ key, value }),
  remove: async key => { await Preferences.remove({ key }); web.remove(key); },
} : web;
const memory = new Map();
export const sessionStorageAdapter = {
  getItem: async key => memory.has(key) ? memory.get(key) : (staySignedIn() ? await durable.get(key) : null),
  setItem: async (key, value) => { memory.set(key, value); if (staySignedIn()) await durable.set(key, value); else await durable.remove(key); },
  removeItem: async key => { memory.delete(key); await durable.remove(key); },
};

export const hasServiceConfiguration = Boolean(supabaseUrl && supabaseAnonKey);
export const supabase = createClient(supabaseUrl || 'https://unconfigured.invalid', supabaseAnonKey || 'configuration-required', {
  auth: { storage: sessionStorageAdapter, persistSession: true, autoRefreshToken: true },
});
