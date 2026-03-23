import { ReportService } from "../services/ReportService.js";

export class ReportsView {
  render(container) {
    // 1. Update the page title in the top bar
    const pageTitle = document.getElementById("page-title");
    if (pageTitle) pageTitle.textContent = "Reports";

    // 2. Fetch the data from the service
    const data = ReportService.getReports();

    // 3. Generate the full HTML
    container.innerHTML = `
      <div class="container-fluid p-4">
        
        <div class="d-flex gap-2 mb-4">
          <button class="btn btn-outline-primary active py-2 px-3 fw-medium" id="btn-low-stock">
            <i class="bi bi-exclamation-triangle me-1"></i> Low-stock report
          </button>
          <button class="btn btn-outline-secondary py-2 px-3 fw-medium text-muted" id="btn-inventory-value">
            <i class="bi bi-currency-dollar me-1"></i> Inventory value report
          </button>
        </div>

        <div class="alert alert-danger border-0 shadow-sm d-flex align-items-center mb-4" role="alert" style="background-color: #fee2e2; color: #991b1b;">
          <i class="bi bi-exclamation-triangle-fill me-3 fs-5"></i>
          <div class="fw-medium">
            <span id="low-stock-count">${data.lowStock.length}</span> products are below their reorder level and need restocking.
          </div>
        </div>

        <div id="section-low-stock" class="report-section">
          <div class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-white border-0 py-3">
              <h6 class="mb-0 fw-bold text-dark">
                <i class="bi bi-exclamation-octagon text-danger me-2"></i> Products requiring restock
              </h6>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table mb-0 align-middle table-hover">
                  <thead class="bg-light text-muted small text-uppercase">
                    <tr>
                      <th class="ps-4 py-3">Product</th>
                      <th>SKU</th>
                      <th class="text-center">Current Qty</th>
                      <th class="text-center">Reorder Level</th>
                      <th>Shortage</th>
                      <th class="pe-4">Supplier</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${this.renderLowStockRows(data.lowStock)}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div id="section-inventory-value" class="report-section d-none">
          <div class="card border-0 shadow-sm" id="inventory-table-anchor">
            <div class="card-header bg-white border-0 d-flex justify-content-between align-items-center py-3">
              <h6 class="mb-0 fw-bold text-dark">
                <i class="bi bi-currency-dollar text-success me-2"></i> Inventory value breakdown
              </h6>
              <span class="fw-bold text-success fs-5">$${data.summary.totalInventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table mb-0 align-middle table-hover">
                  <thead class="bg-light text-muted small text-uppercase">
                    <tr>
                      <th class="ps-4 py-3">Product</th>
                      <th>SKU</th>
                      <th>Category</th>
                      <th>Unit Price</th>
                      <th class="text-center">Qty</th>
                      <th class="pe-4 text-end">Stock Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${this.renderValueRows(data.inventory)}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

      </div>
    `;

    // 4. Attach logic for buttons and scrolling
    this.attachEventListeners();
  }

  renderLowStockRows(items) {
    if (items.length === 0) {
      return `<tr><td colspan="6" class="text-center py-5 text-muted">No products currently require restocking.</td></tr>`;
    }

    return items
      .map((item) => {
        const shortage = item.reorderLevel - item.currentQuantity;
        return `
        <tr style="background-color: #fffbeb;">
          <td class="ps-4 fw-medium text-dark">${item.name}</td>
          <td><span class="badge bg-light text-secondary border px-2 py-1">${item.sku}</span></td>
          <td class="text-center fw-bold">${item.currentQuantity}</td>
          <td class="text-center text-muted">${item.reorderLevel}</td>
          <td>
            <span class="badge rounded-pill px-2 py-1" style="background-color: #fef3c7; color: #92400e;">
              -${shortage} units
            </span>
          </td>
          <td class="pe-4 text-muted">${item.supplier || "TechWorld Ltd"}</td>
        </tr>
      `;
      })
      .join("");
  }

  renderValueRows(inventory) {
    return inventory
      .map(
        (item) => `
      <tr>
        <td class="ps-4 fw-medium text-dark">${item.name}</td>
        <td><span class="badge bg-light text-secondary border px-2 py-1">${item.sku}</span></td>
        <td class="text-muted">${item.category}</td>
        <td>$${item.unitPrice.toFixed(2)}</td>
        <td class="text-center">${item.quantity}</td>
        <td class="pe-4 text-end fw-bold text-dark">$${item.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
      </tr>
    `,
      )
      .join("");
  }

  attachEventListeners() {
    const btnLowStock = document.getElementById("btn-low-stock");
    const btnValue = document.getElementById("btn-inventory-value");
    const secLowStock = document.getElementById("section-low-stock");
    const secValue = document.getElementById("section-inventory-value");

    // Handle Low Stock Button Click
    btnLowStock.addEventListener("click", () => {
      this._switchTab(btnLowStock, btnValue, secLowStock, secValue);
    });

    // Handle Inventory Value Button Click (Switch + Scroll)
    btnValue.addEventListener("click", () => {
      this._switchTab(btnValue, btnLowStock, secValue, secLowStock);

      // Smooth scroll to the specific table anchor
      const tableAnchor = document.getElementById("inventory-table-anchor");
      if (tableAnchor) {
        tableAnchor.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  // Private helper to manage CSS classes for switching tabs
  _switchTab(activeBtn, inactiveBtn, showSec, hideSec) {
    // Update Button Styles
    activeBtn.classList.add("active", "btn-outline-primary");
    activeBtn.classList.remove("btn-outline-secondary", "text-muted");

    inactiveBtn.classList.remove("active", "btn-outline-primary");
    inactiveBtn.classList.add("btn-outline-secondary", "text-muted");

    // Toggle Visibility
    showSec.classList.remove("d-none");
    hideSec.classList.add("d-none");
  }
}
