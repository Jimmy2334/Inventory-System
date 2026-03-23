// js/services/ActivityLogService.js

import { StorageManager } from '../utils/StorageManager.js';

export class ActivityLogService {

  // Called by every other service after a successful action
  static log(message) {
    const logs = StorageManager.get('activity_log') ?? [];

    logs.unshift({
      id        : crypto.randomUUID(),
      message,
      timestamp : new Date().toISOString(),  // ISO string → easy to format in views
    });

    // Cap at 200 entries so localStorage never bloats
    if (logs.length > 200) logs.pop();

    StorageManager.set('activity_log', logs);
  }

  static getLogs() {
    return StorageManager.get('activity_log') ?? [];
  }

  static clear() {
    StorageManager.set('activity_log', []);
  }
}
