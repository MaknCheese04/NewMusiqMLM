// Safe storage helper with in-memory fallback for sandboxed/restricted storage contexts
class SafeStorage {
  constructor() {
    this.memoryStore = new Map();
  }

  _getLocalStorage() {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        // Accessing window.localStorage property can throw in restricted sandboxed contexts
        const storage = window.localStorage;
        // Test read/write permission
        const testKey = '__storage_test__';
        storage.setItem(testKey, '1');
        storage.removeItem(testKey);
        return storage;
      }
    } catch (e) {
      return null;
    }
    return null;
  }

  getItem(key) {
    try {
      const ls = this._getLocalStorage();
      if (ls) {
        return ls.getItem(key);
      }
    } catch (e) {
      // Fallback to memory
    }
    return this.memoryStore.get(key) || null;
  }

  setItem(key, value) {
    const valString = String(value);
    try {
      const ls = this._getLocalStorage();
      if (ls) {
        ls.setItem(key, valString);
        return;
      }
    } catch (e) {
      // Fallback to memory
    }
    this.memoryStore.set(key, valString);
  }

  removeItem(key) {
    try {
      const ls = this._getLocalStorage();
      if (ls) {
        ls.removeItem(key);
        return;
      }
    } catch (e) {
      // Fallback to memory
    }
    this.memoryStore.delete(key);
  }

  clear() {
    try {
      const ls = this._getLocalStorage();
      if (ls) {
        ls.clear();
      }
    } catch (e) {
      // Fallback to memory
    }
    this.memoryStore.clear();
  }
}

export const safeStorage = new SafeStorage();
