// js/views/SupplierView.js
// Renders the Suppliers page inside #content.
// Owns: table, live search, add/edit modal, delete confirmation, toasts.
// Data: delegates everything to SupplierService — no direct localStorage here.

import { SupplierService } from '../services/SupplierService.js';
import { Router }          from '../router.js';

export class SupplierView {

  render(container) {
    document.getElementById('page-title').textContent = 'Suppliers';
    container.innerHTML = this._html();

    this._bindSearch();
    this._bindOpenAdd();
    this._bindFormSubmit();
    this._renderTable();   // initial paint
  }


  // ══════════════════════════════════════════════════════════════════
  // HTML SKELETON
  // ══════════════════════════════════════════════════════════════════
  _html() {
    return `
      <!-- ── Suppliers card ── -->
      <div class="card">
        <div class="card-header d-flex align-items-center justify-content-between flex-wrap gap-2">
          <span><i class="bi bi-truck me-2"></i>Suppliers</span>
          <div class="d-flex gap-2 flex-wrap">
            <div class="search-wrapper">
              <i class="bi bi-search"></i>
              <input type="text" id="supplier-search"
                     class="form-control form-control-sm"
                     placeholder="Search suppliers…"
                     style="width:220px" />
            </div>
            <button id="btn-add-supplier" class="btn btn-primary btn-sm">
              <i class="bi bi-plus-lg me-1"></i>Add supplier
            </button>
          </div>
        </div>

        <div class="card-body p-0">
          <div class="table-responsive-wrapper">
            <table class="table mb-0">
              <thead>
                <tr>
                  <th>Company name</th>
                  <th>Contact person</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Products</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="suppliers-tbody"></tbody>
            </table>
          </div>

          <!-- Empty state — hidden while rows exist -->
          <div id="suppliers-empty"
               class="d-none text-center py-5"
               style="color:#94a3b8;">
            <i class="bi bi-truck"
               style="font-size:2.5rem;display:block;margin-bottom:.75rem;opacity:.4;"></i>
            <p class="mb-1" style="font-weight:500;">No suppliers yet</p>
            <p style="font-size:13px;">Click <strong>Add supplier</strong> to get started.</p>
          </div>
        </div>
      </div>

      <!-- ── Add / Edit Modal ── -->
      <div class="modal fade" id="supplierModal" tabindex="-1"
           aria-labelledby="supplierModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">

            <div class="modal-header">
              <h5 class="modal-title" id="supplierModalLabel">Add supplier</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <form id="supplierForm" novalidate>
              <!-- hidden id — empty on add, filled on edit -->
              <input type="hidden" id="supplier-id" />

              <div class="modal-body">
                <div id="supplierFormError"
                     class="alert alert-danger d-none mb-3"
                     style="font-size:13px;"></div>

                <div class="mb-3">
                  <label class="form-label">
                    Company name <span class="text-danger">*</span>
                  </label>
                  <input type="text" id="supplier-name" class="form-control"
                         placeholder="e.g. TechWorld Ltd" />
                </div>

                <div class="mb-3">
                  <label class="form-label">
                    Contact person <span class="text-danger">*</span>
                  </label>
                  <input type="text" id="supplier-contact" class="form-control"
                         placeholder="e.g. Ahmed Hassan" />
                </div>

                <div class="mb-3">
                  <label class="form-label">Phone</label>
                  <input type="tel" id="supplier-phone" class="form-control"
                         placeholder="+20 100 000 0000" />
                </div>

                <div class="mb-3">
                  <label class="form-label">
                    Email <span class="text-danger">*</span>
                  </label>
                  <input type="email" id="supplier-email" class="form-control"
                         placeholder="email@company.com" />
                </div>
              </div>

              <div class="modal-footer">
                <button type="button"
                        class="btn btn-outline-secondary"
                        data-bs-dismiss="modal">Cancel</button>
                <button type="submit" class="btn btn-primary">
                  <i class="bi bi-check-lg me-1"></i>
                  <span id="supplier-submit-label">Save supplier</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      </div>

      <!-- ── Delete Confirmation Modal ── -->
      <div class="modal fade" id="supplierDeleteModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-sm">
          <div class="modal-content">
            <div class="modal-header border-0 pb-0">
              <h5 class="modal-title text-danger">
                <i class="bi bi-exclamation-triangle me-2"></i>Delete supplier
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body" style="font-size:14px;">
              Delete <strong id="supplier-delete-name"></strong>?
              <br>This action cannot be undone.
            </div>
            <div class="modal-footer border-0 pt-0">
              <button type="button"
                      class="btn btn-outline-secondary btn-sm"
                      data-bs-dismiss="modal">Cancel</button>
              <button id="supplier-confirm-delete"
                      class="btn btn-danger btn-sm">Delete</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }


  // ══════════════════════════════════════════════════════════════════
  // TABLE RENDERING
  // ══════════════════════════════════════════════════════════════════

  /**
   * (Re)paint the tbody — called on load, after save, after delete,
   * and while the user types in the search box.
   *
   * @param {string} [filter=''] - lower-cased search term
   */
  _renderTable(filter = '') {
    const tbody  = document.getElementById('suppliers-tbody');
    const empty  = document.getElementById('suppliers-empty');
    if (!tbody) return;

    let rows = SupplierService.getAll();

    // Live filter across name / contact / email
    if (filter) {
      rows = rows.filter(s =>
        s.name.toLowerCase().includes(filter)    ||
        s.contact.toLowerCase().includes(filter) ||
        s.email.toLowerCase().includes(filter)
      );
    }

    if (rows.length === 0) {
      tbody.innerHTML = '';
      empty?.classList.remove('d-none');
      return;
    }

    empty?.classList.add('d-none');

    tbody.innerHTML = rows.map(s => {
      const count = SupplierService.getProductCount(s.id);
      return `
        <tr>
          <td>${this._esc(s.name)}</td>
          <td>${this._esc(s.contact)}</td>
          <td>${this._esc(s.phone || '—')}</td>
          <td>
            <a href="mailto:${this._esc(s.email)}"
               style="color:var(--brand);">
              ${this._esc(s.email)}
            </a>
          </td>
          <td>
            <span class="badge bg-info text-dark rounded-pill">${count}</span>
          </td>
          <td>
            <button class="btn btn-sm btn-outline-primary me-1"
                    data-action="edit"
                    data-id="${s.id}"
                    title="Edit supplier">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger"
                    data-action="delete"
                    data-id="${s.id}"
                    data-name="${this._esc(s.name)}"
                    title="Delete supplier">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Wire action buttons after innerHTML is set
    this._bindTableActions();
  }


  // ══════════════════════════════════════════════════════════════════
  // EVENT BINDING
  // ══════════════════════════════════════════════════════════════════

  _bindSearch() {
    document.getElementById('supplier-search')
      ?.addEventListener('input', e => {
        this._renderTable(e.target.value.trim().toLowerCase());
      });
  }

  // "Add supplier" button → clear form, set modal title, open modal
  _bindOpenAdd() {
    document.getElementById('btn-add-supplier')
      ?.addEventListener('click', () => {
        this._openModal();  // no id = add mode
      });
  }

  // Edit / Delete buttons inside the table rows
  _bindTableActions() {
    document.querySelectorAll('[data-action="edit"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const supplier = SupplierService.getById(btn.dataset.id);
        if (supplier) this._openModal(supplier);
      });
    });

    document.querySelectorAll('[data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', () => {
        this._openDeleteModal(btn.dataset.id, btn.dataset.name);
      });
    });
  }

  // Form submit handles both add and edit
  _bindFormSubmit() {
    document.getElementById('supplierForm')
      ?.addEventListener('submit', e => {
        e.preventDefault();
        this._handleSave();
      });
  }


  // ══════════════════════════════════════════════════════════════════
  // MODAL HELPERS
  // ══════════════════════════════════════════════════════════════════

  /**
   * Open the add/edit modal.
   * @param {Object} [supplier] - pass to pre-fill for editing; omit for add.
   */
  _openModal(supplier = null) {
    // Title and button label
    document.getElementById('supplierModalLabel').textContent =
      supplier ? 'Edit supplier' : 'Add supplier';
    document.getElementById('supplier-submit-label').textContent =
      supplier ? 'Save changes' : 'Save supplier';

    // Fill or clear fields
    document.getElementById('supplier-id').value      = supplier?.id      ?? '';
    document.getElementById('supplier-name').value    = supplier?.name    ?? '';
    document.getElementById('supplier-contact').value = supplier?.contact ?? '';
    document.getElementById('supplier-phone').value   = supplier?.phone   ?? '';
    document.getElementById('supplier-email').value   = supplier?.email   ?? '';

    // Clear any previous error banner
    this._hideError();

    const modal = new bootstrap.Modal(
      document.getElementById('supplierModal')
    );
    modal.show();
  }

  _openDeleteModal(id, name) {
    document.getElementById('supplier-delete-name').textContent = name;

    const modal = new bootstrap.Modal(
      document.getElementById('supplierDeleteModal')
    );
    modal.show();

    // Attach the confirmation click — remove old listener first
    const confirmBtn = document.getElementById('supplier-confirm-delete');
    const newBtn = confirmBtn.cloneNode(true);
    confirmBtn.replaceWith(newBtn);

    newBtn.addEventListener('click', () => {
      const result = SupplierService.delete(id);
      bootstrap.Modal.getInstance(
        document.getElementById('supplierDeleteModal')
      ).hide();

      if (result.ok) {
        this._renderTable(this._currentFilter());
        this._toast('Supplier deleted.', 'success');
      } else {
        this._toast(result.error, 'danger');
      }
    });
  }


  // ══════════════════════════════════════════════════════════════════
  // SAVE LOGIC (add + edit)
  // ══════════════════════════════════════════════════════════════════

  _handleSave() {
    const id = document.getElementById('supplier-id').value.trim();

    const data = {
      name    : document.getElementById('supplier-name').value,
      contact : document.getElementById('supplier-contact').value,
      phone   : document.getElementById('supplier-phone').value,
      email   : document.getElementById('supplier-email').value,
    };

    const result = id
      ? SupplierService.update(id, data)
      : SupplierService.add(data);

    if (!result.ok) {
      this._showError(result.error);
      return;
    }

    // Close modal, refresh table, show toast
    bootstrap.Modal.getInstance(
      document.getElementById('supplierModal')
    ).hide();

    this._renderTable(this._currentFilter());
    this._toast(
      id ? 'Supplier updated successfully.' : 'Supplier added successfully.',
      'success'
    );
  }


  // ══════════════════════════════════════════════════════════════════
  // SMALL UTILITIES
  // ══════════════════════════════════════════════════════════════════

  /** Current text in the search box (lower-cased). */
  _currentFilter() {
    return (document.getElementById('supplier-search')?.value ?? '').trim().toLowerCase();
  }

  _showError(msg) {
    const el = document.getElementById('supplierFormError');
    if (!el) return;
    el.textContent = msg;
    el.classList.remove('d-none');
  }

  _hideError() {
    const el = document.getElementById('supplierFormError');
    el?.classList.add('d-none');
  }

  /**
   * Append a self-dismissing toast to #toast-container.
   * @param {string} message
   * @param {'success'|'danger'|'warning'|'info'} type
   */
  _toast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const id   = `toast-${Date.now()}`;
    const icon = {
      success : 'bi-check-circle-fill',
      danger  : 'bi-x-circle-fill',
      warning : 'bi-exclamation-triangle-fill',
      info    : 'bi-info-circle-fill',
    }[type] ?? 'bi-info-circle-fill';

    container.insertAdjacentHTML('beforeend', `
      <div id="${id}"
           class="toast align-items-center text-bg-${type} border-0"
           role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body">
            <i class="bi ${icon} me-2"></i>${message}
          </div>
          <button type="button"
                  class="btn-close btn-close-white me-2 m-auto"
                  data-bs-dismiss="toast"></button>
        </div>
      </div>
    `);

    const toastEl = document.getElementById(id);
    const toast   = new bootstrap.Toast(toastEl, { delay: 3500 });
    toast.show();
    toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
  }

  /** XSS-safe string escape for rendering user data into HTML. */
  _esc(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}