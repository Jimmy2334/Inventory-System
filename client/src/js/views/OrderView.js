import { OrderService }   from '../services/OrderService.js';
import { StorageManager } from '../utils/StorageManager.js';

export class OrderView {

  render(container) {
    document.getElementById('page-title').textContent = 'Purchase Orders';
    container.innerHTML = this._html();

    this._bindSearch();
    this._bindFilterTabs();
    this._bindOpenAdd();
    this._bindSupplierChange();
    this._bindFormSubmit();
    this._renderTable();
  }

  // ******************** HTML SKELETON ********************

  _html() {
    return `
      <div class="card">
        <div class="card-header d-flex align-items-center justify-content-between flex-wrap gap-2">
          <span><i class="bi bi-cart-check me-2"></i>Purchase orders</span>
          <div class="d-flex gap-2 flex-wrap align-items-center">

            <div class="search-wrapper">
              <i class="bi bi-search"></i>
              <input type="text" id="order-search"
                     class="form-control form-control-sm"
                     placeholder="Search orders…"
                     style="width:200px" />
            </div>

            <div class="btn-group btn-group-sm" id="order-filter-tabs">
              <button type="button" class="btn btn-outline-secondary active" data-filter="all">All</button>
              <button type="button" class="btn btn-outline-secondary" data-filter="Pending">Pending</button>
              <button type="button" class="btn btn-outline-secondary" data-filter="Received">Received</button>
            </div>

            <button id="btn-add-order" class="btn btn-primary btn-sm">
              <i class="bi bi-plus-lg me-1"></i>New order
            </button>
          </div>
        </div>

        <div class="card-body p-0">
          <div class="table-responsive-wrapper">
            <table class="table mb-0">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Supplier</th>
                  <th>Product</th>
                  <th class="text-center">Qty</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody id="orders-tbody">
                <tr>
                  <td colspan="7" class="text-center py-4">
                    <div class="spinner-border spinner-border-sm text-secondary me-2"></div>
                    Loading orders…
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div id="orders-empty" class="d-none text-center py-5" style="color:#94a3b8;">
            <i class="bi bi-cart-check"
               style="font-size:2.5rem;display:block;margin-bottom:.75rem;opacity:.4;"></i>
            <p class="mb-1" style="font-weight:500;">No orders found</p>
            <p style="font-size:13px;">Click <strong>New order</strong> to create one.</p>
          </div>
        </div>
      </div>

      <!-- New Order Modal -->
      <div class="modal fade" id="orderModal" tabindex="-1"
           aria-labelledby="orderModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="orderModalLabel">New purchase order</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <form id="orderForm" novalidate>
              <div class="modal-body">
                <div id="orderFormError"
                     class="alert alert-danger d-none mb-3"
                     style="font-size:13px;"></div>

                <div class="mb-3">
                  <label class="form-label">Supplier <span class="text-danger">*</span></label>
                  <select id="order-supplier" class="form-select">
                    <option value="">— select supplier —</option>
                  </select>
                </div>

                <div class="mb-3">
                  <label class="form-label">Product <span class="text-danger">*</span></label>
                  <select id="order-product" class="form-select" disabled>
                    <option value="">— select supplier first —</option>
                  </select>
                </div>

                <div class="mb-3">
                  <label class="form-label">Quantity <span class="text-danger">*</span></label>
                  <input type="number" id="order-qty" class="form-control"
                         min="1" step="1" placeholder="e.g. 50" />
                </div>

                <div class="mb-3">
                  <label class="form-label">Order date <span class="text-danger">*</span></label>
                  <input type="date" id="order-date" class="form-control" />
                </div>
              </div>

              <div class="modal-footer">
                <button type="button"
                        class="btn btn-outline-secondary"
                        data-bs-dismiss="modal">Cancel</button>
                <button type="submit" id="order-submit-btn" class="btn btn-primary">
                  <i class="bi bi-cart-plus me-1"></i>
                  <span id="order-submit-label">Create order</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Cancel Confirmation Modal -->
      <div class="modal fade" id="orderCancelModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-sm">
          <div class="modal-content">
            <div class="modal-header border-0 pb-0">
              <h5 class="modal-title text-warning">
                <i class="bi bi-x-circle me-2"></i>Cancel order
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body" style="font-size:14px;">
              Cancel order <strong id="cancel-order-id"></strong>?
              <br>Stock will <u>not</u> be affected.
            </div>
            <div class="modal-footer border-0 pt-0">
              <button type="button"
                      class="btn btn-outline-secondary btn-sm"
                      data-bs-dismiss="modal">Back</button>
              <button id="confirm-cancel-order" class="btn btn-warning btn-sm text-white">
                Cancel order
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div class="modal fade" id="orderDeleteModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-sm">
          <div class="modal-content">
            <div class="modal-header border-0 pb-0">
              <h5 class="modal-title text-danger">
                <i class="bi bi-trash me-2"></i>Delete order
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body" style="font-size:14px;">
              Permanently delete order <strong id="delete-order-id"></strong>?
              <br>This cannot be undone.
            </div>
            <div class="modal-footer border-0 pt-0">
              <button type="button"
                      class="btn btn-outline-secondary btn-sm"
                      data-bs-dismiss="modal">Back</button>
              <button id="confirm-delete-order" class="btn btn-danger btn-sm">Delete</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ******************** TABLE RENDERING ********************

  async _renderTable(filter = 'all', search = '') {
    const tbody = document.getElementById('orders-tbody');
    const empty = document.getElementById('orders-empty');
    if (!tbody) return;

    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-4">
          <div class="spinner-border spinner-border-sm text-secondary me-2"></div>
          Loading…
        </td>
      </tr>
    `;

    let orders, suppliers, products;
    try {
      // Fetch all three at the same time
      [orders, suppliers, products] = await Promise.all([
        OrderService.getAll(),
        StorageManager.getAll('suppliers'),
        StorageManager.getAll('products'),
      ]);
    } catch {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-4 text-danger">
            <i class="bi bi-wifi-off me-2"></i>
            Could not load orders. Is the server running?
          </td>
        </tr>
      `;
      return;
    }

    // Build lookup maps so we can resolve names by id instantly
    const supplierMap = {};
    suppliers.forEach(s => supplierMap[s.id] = s.name);

    const productMap = {};
    products.forEach(p => productMap[p.id] = p);

    // Sort newest first
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Status filter
    if (filter !== 'all') {
      orders = orders.filter(o => o.status === filter);
    }

    // Search filter — runs against resolved names not raw ids
    if (search) {
      orders = orders.filter(o => {
        const supplierName = supplierMap[o.supplierId] ?? '';
        const productName  = (productMap[o.productId])?.name ?? '';
        return (
          supplierName.toLowerCase().includes(search) ||
          productName.toLowerCase().includes(search)  ||
          o.id.toLowerCase().includes(search)
        );
      });
    }

    if (orders.length === 0) {
      tbody.innerHTML = '';
      empty?.classList.remove('d-none');
      return;
    }

    empty?.classList.add('d-none');

    tbody.innerHTML = orders.map(o => {
      // Resolve names from the maps using the stored ids
      const supplierName = supplierMap[o.supplierId] ?? '—';
      const product      = productMap[o.productId];
      const productName  = product?.name ?? '—';
      const productSku   = product?.sku  ?? '';

      return `
        <tr>
          <td>
            <span class="badge bg-light text-dark border" style="font-family:monospace;">
              ${this._esc(o.id.slice(0, 8))}
            </span>
          </td>
          <td>${this._esc(supplierName)}</td>
          <td>
            <div>${this._esc(productName)}</div>
            <div class="text-muted" style="font-size:11px;">${this._esc(productSku)}</div>
          </td>
          <td class="text-center">${o.quantity}</td>
          <td>${this._formatDate(o.orderDate)}</td>
          <td>${this._statusBadge(o.status)}</td>
          <td>${this._actionButtons(o)}</td>
        </tr>
      `;
    }).join('');

    this._bindTableActions();
  }

  // ******************** STATUS + ACTION HELPERS ********************

  _statusBadge(status) {
    const map = {
      Pending  : 'bg-warning text-dark',
      Received : 'bg-success',
      Cancelled: 'bg-secondary',
    };
    return `<span class="badge ${map[status] ?? 'bg-secondary'}">${status}</span>`;
  }

  _actionButtons(order) {
    if (order.status === 'Pending' || order.status === 'pending') {
      return `
        <button class="btn btn-sm btn-success me-1"
                data-action="receive" data-id="${order.id}">
          <i class="bi bi-box-arrow-in-down me-1"></i>Receive
        </button>
        <button class="btn btn-sm btn-outline-warning"
                data-action="cancel" data-id="${order.id}">
          <i class="bi bi-x-lg"></i>
        </button>
      `;
    }
    if (order.status === 'Cancelled' || order.status === 'cancelled') {
      return `
        <button class="btn btn-sm btn-outline-danger"
                data-action="delete" data-id="${order.id}">
          <i class="bi bi-trash"></i>
        </button>
      `;
    }
    return `<button class="btn btn-sm btn-outline-secondary" disabled>Received</button>`;
  }

  // ******************** EVENT BINDING ********************

  _bindSearch() {
    document.getElementById('order-search')
      ?.addEventListener('input', e => {
        this._renderTable(this._activeFilter(), e.target.value.trim().toLowerCase());
      });
  }

  _bindFilterTabs() {
    document.getElementById('order-filter-tabs')
      ?.addEventListener('click', e => {
        const btn = e.target.closest('[data-filter]');
        if (!btn) return;

        document.querySelectorAll('#order-filter-tabs button')
          .forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        this._renderTable(btn.dataset.filter, this._activeSearch());
      });
  }

  _bindOpenAdd() {
    document.getElementById('btn-add-order')
      ?.addEventListener('click', () => this._openModal());
  }

  _bindSupplierChange() {
    document.getElementById('order-supplier')
      ?.addEventListener('change', e => {
        this._populateProducts(e.target.value);
      });
  }

  _bindFormSubmit() {
    document.getElementById('orderForm')
      ?.addEventListener('submit', e => {
        e.preventDefault();
        this._handleSave();
      });
  }

  _bindTableActions() {
    document.querySelectorAll('[data-action="receive"]').forEach(btn => {
      btn.addEventListener('click', () => this._handleReceive(btn.dataset.id));
    });

    document.querySelectorAll('[data-action="cancel"]').forEach(btn => {
      btn.addEventListener('click', () => this._openCancelModal(btn.dataset.id));
    });

    document.querySelectorAll('[data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', () => this._openDeleteModal(btn.dataset.id));
    });
  }

  // ******************** MODAL HELPERS ********************

  async _openModal() {
    document.getElementById('orderForm').reset();
    this._hideError();
    this._setSubmitLoading(false);

    document.getElementById('order-date').value =
      new Date().toISOString().split('T')[0];

    await this._populateSuppliers();

    const productSelect = document.getElementById('order-product');
    productSelect.innerHTML = '<option value="">— select supplier first —</option>';
    productSelect.disabled  = true;

    new bootstrap.Modal(document.getElementById('orderModal')).show();
  }

  _openCancelModal(id) {
    document.getElementById('cancel-order-id').textContent = id.slice(0, 8);

    const modal = new bootstrap.Modal(document.getElementById('orderCancelModal'));
    modal.show();

    const btn    = document.getElementById('confirm-cancel-order');
    const newBtn = btn.cloneNode(true);
    btn.replaceWith(newBtn);

    newBtn.addEventListener('click', async () => {
      newBtn.disabled = true;
      newBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';

      const result = await OrderService.cancel(id);
      bootstrap.Modal.getInstance(document.getElementById('orderCancelModal')).hide();

      if (result.ok) {
        this._renderTable(this._activeFilter(), this._activeSearch());
        this._toast('Order cancelled.', 'warning');
      } else {
        this._toast(result.error, 'danger');
      }
    });
  }

  _openDeleteModal(id) {
    document.getElementById('delete-order-id').textContent = id.slice(0, 8);

    const modal = new bootstrap.Modal(document.getElementById('orderDeleteModal'));
    modal.show();

    const btn    = document.getElementById('confirm-delete-order');
    const newBtn = btn.cloneNode(true);
    btn.replaceWith(newBtn);

    newBtn.addEventListener('click', async () => {
      newBtn.disabled = true;
      newBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';

      const result = await OrderService.delete(id);
      bootstrap.Modal.getInstance(document.getElementById('orderDeleteModal')).hide();

      if (result.ok) {
        this._renderTable(this._activeFilter(), this._activeSearch());
        this._toast('Order deleted.', 'success');
      } else {
        this._toast(result.error, 'danger');
      }
    });
  }

  // ******************** DROPDOWN POPULATION ********************

  async _populateSuppliers() {
    const select = document.getElementById('order-supplier');

    let suppliers;
    try {
      suppliers = await StorageManager.getAll('suppliers');
    } catch {
      select.innerHTML = '<option value="">Could not load suppliers</option>';
      return;
    }

    if (suppliers.length === 0) {
      select.innerHTML = '<option value="">No suppliers added yet</option>';
      return;
    }

    select.innerHTML =
      '<option value="">— select supplier —</option>' +
      suppliers.map(s =>
        `<option value="${s.id}">${this._esc(s.name)}</option>`
      ).join('');
  }

  async _populateProducts(supplierId) {
    const select = document.getElementById('order-product');

    if (!supplierId) {
      select.innerHTML = '<option value="">— select supplier first —</option>';
      select.disabled  = true;
      return;
    }

    select.innerHTML = '<option value="">Loading…</option>';
    select.disabled  = true;

    let products;
    try {
      products = await StorageManager.getWhere('products', { supplierId });
    } catch {
      select.innerHTML = '<option value="">Could not load products</option>';
      return;
    }

    if (products.length === 0) {
      select.innerHTML = '<option value="">No products linked to this supplier</option>';
      return;
    }

    select.disabled  = false;
    select.innerHTML =
      '<option value="">— select product —</option>' +
      products.map(p =>
        `<option value="${p.id}">${this._esc(p.name)} (${this._esc(p.sku)})</option>`
      ).join('');
  }

  // ******************** SAVE + RECEIVE LOGIC ********************

  async _handleSave() {
    const data = {
      supplierId : document.getElementById('order-supplier').value,
      productId  : document.getElementById('order-product').value,
      quantity   : document.getElementById('order-qty').value,
      orderDate  : document.getElementById('order-date').value,
    };

    this._hideError();
    this._setSubmitLoading(true);

    const result = await OrderService.add(data);

    this._setSubmitLoading(false);

    if (!result.ok) {
      this._showError(result.error);
      return;
    }

    bootstrap.Modal.getInstance(document.getElementById('orderModal')).hide();
    this._renderTable(this._activeFilter(), this._activeSearch());
    this._toast('Order created successfully.', 'success');
  }

  async _handleReceive(id) {
    const result = await OrderService.markReceived(id);

    if (result.ok) {
      this._renderTable(this._activeFilter(), this._activeSearch());
      this._toast('Order received — stock updated.', 'success');
    } else {
      this._toast(result.error, 'danger');
    }
  }

  // ******************** UTILITIES ********************

  _activeFilter() {
    return document.querySelector('#order-filter-tabs .active')?.dataset.filter ?? 'all';
  }

  _activeSearch() {
    return (document.getElementById('order-search')?.value ?? '').trim().toLowerCase();
  }

  _showError(msg) {
    const el = document.getElementById('orderFormError');
    if (!el) return;
    el.textContent = msg;
    el.classList.remove('d-none');
  }

  _hideError() {
    document.getElementById('orderFormError')?.classList.add('d-none');
  }

  _setSubmitLoading(loading) {
    const btn   = document.getElementById('order-submit-btn');
    const label = document.getElementById('order-submit-label');
    if (!btn || !label) return;
    btn.disabled      = loading;
    label.textContent = loading ? 'Saving…' : 'Create order';
  }

  _formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  }

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
      <div id="${id}" class="toast align-items-center text-bg-${type} border-0"
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

  _esc(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}