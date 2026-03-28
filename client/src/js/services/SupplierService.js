import { StorageManager }     from '../utils/StorageManager.js';
import { ActivityLogService } from './ActivityLogService.js';

const RESOURCE = 'suppliers';

export const SupplierService = {

  // ******************** READ ********************

  async getAll() {
    return StorageManager.getAll(RESOURCE);
  },

  async getById(id) {
    return StorageManager.getById(RESOURCE, id);
  },

  // ******************** WRITE ********************

  async add(data) {
    const validation = this._validate(data);
    if (!validation.ok) return validation;

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
    await ActivityLogService.log('supplier added', `Added supplier: ${supplier.name}`);
    return { ok: true, supplier: created };
  },

  async update(id, data) {
    const validation = this._validate(data);
    if (!validation.ok) return validation;

    const existing = await StorageManager.getWhere(RESOURCE, {
      email: data.email.trim().toLowerCase(),
    });
    const emailTaken = existing.some(s => s.id !== id);
    if (emailTaken) {
      return { ok: false, error: 'Another supplier is already using this email.' };
    }

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
    await ActivityLogService.log('supplier edited', `Updated supplier: ${updated.name}`);
    return { ok: true, supplier: saved };
  },

  async delete(id) {
    const linked = await StorageManager.getWhere('products', { supplierId: id });
    if (linked.length > 0) {
      return {
        ok: false,
        error: `Cannot delete — ${linked.length} product(s) are linked to this supplier. Re-assign them first.`,
      };
    }

    const supplier = await StorageManager.getById(RESOURCE, id);
    await StorageManager.delete(RESOURCE, id);
    await ActivityLogService.log('supplier deleted', `Deleted supplier: ${supplier.name}`);
    return { ok: true };
  },

  // ******************** HELPERS ********************

  async getProductCount(supplierId) {
    const products = await StorageManager.getWhere('products', { supplierId });
    return products.length;
  },

  // ******************** VALIDATION ********************

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