// js/services/SupplierService.js
// Owns all CRUD operations for the 'suppliers' resource on json-server.
// All methods are async — always await them in the View.
// Never touches the DOM.

import { StorageManager }     from '../utils/StorageManager.js';
import { ActivityLogService } from './ActivityLogService.js';

const RESOURCE = 'suppliers';

export const SupplierService = {

  // ── READ ──────────────────────────────────────────────────────────

  /** Return every supplier as an array. */
  async getAll() {
    return StorageManager.getAll(RESOURCE);
  },

  /**
   * Find one supplier by id.
   * @returns {Object}
   */
  async getById(id) {
    return StorageManager.getById(RESOURCE, id);
  },

  // ── WRITE ─────────────────────────────────────────────────────────

  /**
   * Add a brand-new supplier.
   * Validates required fields and email uniqueness before saving.
   *
   * @param {{ name:string, contact:string, phone:string, email:string }} data
   * @returns {{ ok:true, supplier:Object } | { ok:false, error:string }}
   */
  async add(data) {
    const validation = this._validate(data);
    if (!validation.ok) return validation;

    // Email must be unique across all suppliers
    const existing = await StorageManager.getWhere(RESOURCE, {
      email: data.email.trim().toLowerCase(),
    });
    if (existing.length > 0) {
      return { ok: false, error: 'A supplier with this email already exists.' };
    }

    const supplier = {
      id       : crypto.randomUUID(),
      name     : data.name.trim(),
      contact  : data.contact.trim(),
      phone    : (data.phone ?? '').trim(),
      email    : data.email.trim().toLowerCase(),
      createdAt: new Date().toISOString(),
    };

    const created = await StorageManager.create(RESOURCE, supplier);

    await ActivityLogService.log(
      'supplier_add',
      `Added supplier: ${supplier.name}`
    );

    return { ok: true, supplier: created };
  },

  /**
   * Update an existing supplier by id.
   * Email uniqueness check excludes the supplier being edited.
   *
   * @param {string} id
   * @param {{ name:string, contact:string, phone:string, email:string }} data
   * @returns {{ ok:true, supplier:Object } | { ok:false, error:string }}
   */
  async update(id, data) {
    const validation = this._validate(data);
    if (!validation.ok) return validation;

    // Check email uniqueness — exclude current record
    const existing = await StorageManager.getWhere(RESOURCE, {
      email: data.email.trim().toLowerCase(),
    });
    const emailTaken = existing.some(s => s.id !== id);
    if (emailTaken) {
      return { ok: false, error: 'Another supplier is already using this email.' };
    }

    // Get current record so we preserve createdAt and any other fields
    const current = await StorageManager.getById(RESOURCE, id);

    const updated = {
      ...current,
      name     : data.name.trim(),
      contact  : data.contact.trim(),
      phone    : (data.phone ?? '').trim(),
      email    : data.email.trim().toLowerCase(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await StorageManager.update(RESOURCE, id, updated);

    await ActivityLogService.log(
      'supplier_update',
      `Updated supplier: ${updated.name}`
    );

    return { ok: true, supplier: saved };
  },

  /**
   * Delete a supplier by id.
   * Refuses if any product is still linked to this supplier.
   *
   * @param {string} id
   * @returns {{ ok:true } | { ok:false, error:string }}
   */
  async delete(id) {
    // Safety check — do not orphan products
    const linked = await StorageManager.getWhere('products', { supplierId: id });
    if (linked.length > 0) {
      return {
        ok: false,
        error: `Cannot delete — ${linked.length} product(s) are linked to this supplier. Re-assign them first.`,
      };
    }

    const supplier = await StorageManager.getById(RESOURCE, id);
    await StorageManager.delete(RESOURCE, id);

    await ActivityLogService.log(
      'supplier_delete',
      `Deleted supplier: ${supplier.name}`
    );

    return { ok: true };
  },

  // ── HELPERS ───────────────────────────────────────────────────────

  /**
   * How many products reference this supplier?
   * Used by the View to show the Products count column.
   *
   * @param {string} supplierId
   * @returns {number}
   */
  async getProductCount(supplierId) {
    const products = await StorageManager.getWhere('products', { supplierId });
    return products.length;
  },

  // ── PRIVATE ───────────────────────────────────────────────────────

  /**
   * Shared field validation for add() and update().
   * Synchronous — no DB calls needed here.
   * @returns {{ ok:true } | { ok:false, error:string }}
   */
  _validate(data) {
    if (!data.name?.trim())    return { ok: false, error: 'Company name is required.' };
    if (!data.contact?.trim()) return { ok: false, error: 'Contact person is required.' };
    if (!data.email?.trim())   return { ok: false, error: 'Email is required.' };

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(data.email.trim())) {
      return { ok: false, error: 'Please enter a valid email address.' };
    }

    return { ok: true };
  },
};