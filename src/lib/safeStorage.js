// Safe storage helper with in-memory fallback for sandboxed/restricted contexts
class SafeStorage {
  constructor() {
    this.memoryStore = new Map();
  }

  getItem(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      return this.memoryStore.get(key) || null;
    }
  }

  setItem(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      this.memoryStore.set(key, String(value));
    }
  }

  removeItem(key) {
    try {
      window.localStorage.removeItem(key);
    } catch (e) {
      this.memoryStore.delete(key);
    }
  }
}

export const safeStorage = new SafeStorage();
