// js/views/StockAdjustView.js
// import { InventoryService } from "../services/InventoryService.js";
// import { ProductService } from "../services/ProductService.js";

export class StockAdjustView {
  constructor() {
    // this.inventoryService = new InventoryService();
    // this.productService = new ProductService();
  }

  render(container) {
    // Paste your HTML section here — just wrap in backticks
    container.innerHTML = `
      <div class="row g-3">
        <div class="col-lg-5">
          <div class="card">
            <div class="card-header">
              <i class="bi bi-arrow-left-right me-2"></i>New stock adjustment
            </div>
            <div class="card-body">
              <form id="adjForm" novalidate>
                <div class="mb-3">
                  <label class="form-label">Product <span class="text-danger">*</span></label>
                  <select id="adj-product" class="form-select">
                    <option value="">Select a product...</option>
                  </select>
                </div>
                <div class="row g-2 mb-3">
                  <div class="col-6">
                    <label class="form-label">Adjustment type <span class="text-danger">*</span></label>
                    <select id="adj-type" class="form-select">
                      <option value="increase">Increase ▲</option>
                      <option value="decrease">Decrease ▼</option>
                    </select>
                  </div>
                  <div class="col-6">
                    <label class="form-label">Quantity <span class="text-danger">*</span></label>
                    <input type="number" id="adj-amount" class="form-control" min="1" placeholder="e.g. 10" />
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label">Reason <span class="text-danger">*</span></label>
                  <textarea id="adj-reason" class="form-control" rows="2"
                    placeholder="e.g. Damaged in warehouse..."></textarea>
                </div>
                <div id="adj-preview" class="alert alert-info d-none mb-3" style="font-size:13px"></div>
                <div id="adjError"    class="alert alert-danger d-none mb-3" style="font-size:13px"></div>
                <button id="adj-submit" type="submit" class="btn btn-primary w-100">
                  <i class="bi bi-check-lg me-1"></i>Save adjustment
                </button>
              </form>
            </div>
          </div>
        </div>

        <div class="col-lg-7">
          <div class="card">
            <div class="card-header">
              <i class="bi bi-clock-history me-2"></i>Adjustment history
            </div>
            <div class="card-body p-0">
              <div class="table-responsive-wrapper">
                <table class="table mb-0">
                  <thead>
                    <tr>
                      <th>Product</th><th>Type</th>
                      <th>Change</th><th>Reason</th><th>Date</th>
                    </tr>
                  </thead>
                  <tbody id="adj-history-tbody">
                    <tr><td colspan="5" class="text-center text-muted py-4">
                      No adjustments yet.
                    </td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

      // Now wire events — DOM is ready
    // this._populateProducts();
    // this._attachEvents();
  }

  // ... rest of the class
}
