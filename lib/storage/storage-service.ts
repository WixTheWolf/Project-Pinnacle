/**
 * Abstract storage layer for MVP LocalStorage persistence.
 * Swap implementation for Supabase without changing consumers.
 */

export interface StorageAdapter {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
}

class LocalStorageAdapter implements StorageAdapter {
  get<T>(key: string): T | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  set<T>(key: string, value: T): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("[Storage] Failed to persist:", error);
    }
  }

  remove(key: string): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error("[Storage] Failed to remove:", error);
    }
  }
}

let adapter: StorageAdapter = new LocalStorageAdapter();

export function setStorageAdapter(newAdapter: StorageAdapter): void {
  adapter = newAdapter;
}

export function getStorageAdapter(): StorageAdapter {
  return adapter;
}

export const storage = {
  get: <T>(key: string) => adapter.get<T>(key),
  set: <T>(key: string, value: T) => adapter.set(key, value),
  remove: (key: string) => adapter.remove(key),
};
