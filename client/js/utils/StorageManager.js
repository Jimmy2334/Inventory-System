// js/utils/StorageManager.js
//
// Talks to json-server running at BASE_URL.
// All methods are async and return the parsed JSON response.
//
// json-server REST conventions used here:
//   GET    /resource          → array of all items
//   GET    /resource/:id      → single item
//   POST   /resource          → create (body = object WITHOUT id)
//   PUT    /resource/:id      → full replace
//   PATCH  /resource/:id      → partial update
//   DELETE /resource/:id      → delete
//
// Start the server with:
//   npx json-server --watch db.json --port 3000

const BASE_URL = 'http://localhost:3000';

export class StorageManager {

  // ── Internal fetch wrapper ──────────────────────────────────────
  // Centralises error handling so every method stays clean.
  static async _request(path, options = {}) {
    try {
      const res = await fetch(`${BASE_URL}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server error ${res.status}: ${text}`);
      }

      // DELETE returns 200 with {} — still valid
      const text = await res.text();
      return text ? JSON.parse(text) : {};

    } catch (err) {
      // Network errors (server not running, CORS, etc.)
      if (err.name === 'TypeError') {
        console.error(
          'StorageManager: cannot reach json-server. Is it running on port 3000?'
        );
      } else {
        console.error(`StorageManager error [${path}]:`, err.message);
      }
      throw err; // re-throw so the calling service can catch it
    }
  }

  // ── GET all ────────────────────────────────────────────────────
  // Returns: array
  // e.g.  const products = await StorageManager.getAll('products');
  static async getAll(resource) {
    return this._request(`/${resource}`);
  }

  // ── GET one by id ───────────────────────────────────────────────
  // Returns: object or throws 404
  // e.g.  const p = await StorageManager.getById('products', 'prod-001');
  static async getById(resource, id) {
    return this._request(`/${resource}/${id}`);
  }

  // ── GET with filter params ──────────────────────────────────────
  // json-server supports ?field=value filtering natively.
  // Pass params as a plain object: { categoryId: 'cat-001' }
  // Returns: array
  // e.g.  await StorageManager.getWhere('products', { categoryId: 'cat-002' })
  static async getWhere(resource, params = {}) {
    const query = new URLSearchParams(params).toString();
    return this._request(`/${resource}?${query}`);
  }

  // ── POST — create new record ────────────────────────────────────
  // Always pass a pre-generated id from crypto.randomUUID() in the service.
  // Returns: the created object (echoed back by json-server)
  static async create(resource, data) {
    return this._request(`/${resource}`, {
      method : 'POST',
      body   : JSON.stringify(data),
    });
  }

  // ── PUT — full replace ──────────────────────────────────────────
  // Replaces the entire object. Use for edit/update operations.
  // Returns: the updated object
  static async update(resource, id, data) {
    return this._request(`/${resource}/${id}`, {
      method : 'PUT',
      body   : JSON.stringify(data),
    });
  }

  // ── PATCH — partial update ──────────────────────────────────────
  // Only the fields you pass are changed. Use for status updates.
  // e.g.  await StorageManager.patch('orders', id, { status: 'received' })
  // Returns: the updated object
  static async patch(resource, id, data) {
    return this._request(`/${resource}/${id}`, {
      method : 'PATCH',
      body   : JSON.stringify(data),
    });
  }

  // ── DELETE ──────────────────────────────────────────────────────
  // Returns: {}
  static async delete(resource, id) {
    return this._request(`/${resource}/${id}`, {
      method: 'DELETE',
    });
  }

  // ── DELETE all records in a resource ───────────────────────────
  // json-server has no bulk-delete, so we fetch all IDs then delete
  // one by one. Useful for clearing the activity log.
  static async deleteAll(resource) {
    const items = await this.getAll(resource);
    await Promise.all(items.map(item => this.delete(resource, item.id)));
  }
}