// js/services/SupplierService.js
// Owns all CRUD operations for the 'suppliers' key in localStorage.
// Never touches the DOM — Views call these methods and handle rendering.

import { StorageManager }    from '../utils/StorageManager.js';
import { ActivityLogService } from './ActivityLogService.js';

const KEY = 'suppliers';

export const SupplierService = {

  // ── READ ──────────────────────────────────────────────────────────git checkout main

  getAll() {
    return StorageManager.get(KEY) ?? [];
  },

  /**
   * Find one supplier by id.
   * @returns {Object|undefined}
   */
  getById(id) {
    return this.getAll().find(s => s.id === id);
  },

  // ── WRITE ─────────────────────────────────────────────────────────

  /**
   * Add a brand-new supplier.
   * Validates required fields and email uniqueness before saving.
   *
   * @param {{ name:string, contact:string, phone:string, email:string }} data
   * @returns {{ ok:true, supplier:Object } | { ok:false, error:string }}
   */
  add(data) {
    const validation = this._validate(data);
    if (!validation.ok) return validation;

    const suppliers = this.getAll();

    // Email must be unique
    if (suppliers.some(s => s.email.toLowerCase() === data.email.toLowerCase())) {
      return { ok: false, error: 'A supplier with this email already exists.' };
    }

    const supplier = {
      id      : crypto.randomUUID(),
      name    : data.name.trim(),
      contact : data.contact.trim(),
      phone   : (data.phone ?? '').trim(),
      email   : data.email.trim().toLowerCase(),
      // ISO timestamp so we can sort / display "added on"
      createdAt: new Date().toISOString(),
    };

    suppliers.push(supplier);
    StorageManager.set(KEY, suppliers);

    ActivityLogService.log('supplier_add', `Added supplier: ${supplier.name}`);

    return { ok: true, supplier };
  },

  /**
   * Update an existing supplier by id.
   * Email uniqueness check excludes the supplier being edited.
   *
   * @param {string} id
   * @param {{ name:string, contact:string, phone:string, email:string }} data
   * @returns {{ ok:true, supplier:Object } | { ok:false, error:string }}
   */
  update(id, data) {
    const validation = this._validate(data);
    if (!validation.ok) return validation;

    const suppliers = this.getAll();
    const index     = suppliers.findIndex(s => s.id === id);

    if (index === -1) {
      return { ok: false, error: 'Supplier not found.' };
    }

    // Email uniqueness — skip the current record
    const emailTaken = suppliers.some(
      s => s.id !== id && s.email.toLowerCase() === data.email.toLowerCase()
    );
    if (emailTaken) {
      return { ok: false, error: 'Another supplier is already using this email.' };
    }

    const updated = {
      ...suppliers[index],          // keep id, createdAt
      name    : data.name.trim(),
      contact : data.contact.trim(),
      phone   : (data.phone ?? '').trim(),
      email   : data.email.trim().toLowerCase(),
      updatedAt: new Date().toISOString(),
    };

    suppliers[index] = updated;
    StorageManager.set(KEY, suppliers);

    ActivityLogService.log('supplier_update', `Updated supplier: ${updated.name}`);

    return { ok: true, supplier: updated };
  },

  /**
   * Delete a supplier by id.
   * Refuses if any product is linked to this supplier.
   *
   * @param {string} id
   * @returns {{ ok:true } | { ok:false, error:string }}
   */
  delete(id) {
    const supplier = this.getById(id);
    if (!supplier) return { ok: false, error: 'Supplier not found.' };

    // Safety check — do not orphan products
    const products = StorageManager.get('products') ?? [];
    const linked   = products.filter(p => p.supplierId === id);
    if (linked.length > 0) {
      return {
        ok: false,
        error: `Cannot delete — ${linked.length} product(s) are linked to this supplier. Re-assign them first.`,
      };
    }

    const updated = this.getAll().filter(s => s.id !== id);
    StorageManager.set(KEY, updated);

    ActivityLogService.log('supplier_delete', `Deleted supplier: ${supplier.name}`);

    return { ok: true };
  },

  // ── HELPERS ───────────────────────────────────────────────────────

  /**
   * How many products reference this supplier?
   * Used by the View to show the "Products" count column.
   *
   * @param {string} supplierId
   * @returns {number}
   */
  getProductCount(supplierId) {
    const products = StorageManager.get('products') ?? [];
    return products.filter(p => p.supplierId === supplierId).length;
  },

  // ── PRIVATE ───────────────────────────────────────────────────────

  /**
   * Shared field validation for both add() and update().
   * @returns {{ ok:true } | { ok:false, error:string }}
   */
  _validate(data) {
    if (!data.name?.trim())    return { ok: false, error: 'Company name is required.' };
    if (!data.contact?.trim()) return { ok: false, error: 'Contact person is required.' };
    if (!data.email?.trim())   return { ok: false, error: 'Email is required.' };

    // Basic email format check
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(data.email.trim())) {
      return { ok: false, error: 'Please enter a valid email address.' };
    }

    return { ok: true };
  },
};