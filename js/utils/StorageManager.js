// js/utils/StorageManager.js

export class StorageManager {

  static get(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch {
      console.error(`StorageManager.get: failed to parse key "${key}"`);
      return null;
    }
  }

  static set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      console.error(`StorageManager.set: failed to save key "${key}"`);
      return false;
    }
  }

  static delete(key) {
    localStorage.removeItem(key);
  }

  static clear() {
    localStorage.clear();
  }
}
