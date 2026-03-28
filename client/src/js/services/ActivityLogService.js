// js/services/ActivityLogService.js

import { StorageManager } from '../utils/StorageManager.js';

export class ActivityLogService {

  // Called by every service after a successful action.
  // fire-and-forget — callers don't need to await this.
  static async log(action,message) {
    message = `${sessionStorage.getItem('user_name') || 'Unknown user'}: ${message}`;
    try {
      await StorageManager.create('activity_log', {
        id        : crypto.randomUUID(),
        message,
        timestamp: new Date().toISOString(),
        action
      });
    } catch (err) {
      // Log failure should never crash the main operation
      console.warn('ActivityLogService: failed to write log entry.', err.message);
    }
  }

  // Returns array sorted newest first (_sort + _order are json-server params)
  static async getLogs() {
    try {
      return await StorageManager._request('/activity_log?_sort=timestamp&_order=desc');
    } catch {
      return [];
    }
  }

  static async clear() {
    try {
      await StorageManager.deleteAll('activity_log');
    } catch (err) {
      console.error('ActivityLogService.clear failed:', err.message);
    }
  }
}