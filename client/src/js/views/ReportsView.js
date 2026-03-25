import { ReportService } from "../services/ReportService.js";

export class ReportsView {
  constructor() {
    this.reportService = new ReportService();
  }

  render(container) {
    const pageTitle = document.getElementById("page-title");
    if (pageTitle) pageTitle.textContent = "Dashboard";

    container.innerHTML = `
      <div class="d-flex justify-content-center align-items-center" style="min-height: 300px;">
        <div class="spinner-border text-primary" role="status"></div>
      </div>
    `;

    this.init(container);
  }

  async init(container) {
    try {
      const [lowStock, valuation] = await Promise.all([
        this.reportService.getLowStockData(),
        this.reportService.getInventoryValueData(),
      ]);
      container.innerHTML = this.template(lowStock, valuation);
      this.attachEvents(container);
    } catch (err) {
      container.innerHTML = `
        <div class="alert alert-danger m-4">
          <i class="bi bi-wifi-off me-2"></i> Error loading report data.
        </div>
      `;
    }
  }

  template(lowStock, valuation) {
    return `
      <div class="container-fluid p-4">

        <!-- Tabs -->
        <div class="d-flex gap-2 mb-4">
          <button class="tab-btn active-tab" data-target="low-stock-panel">
            <i class="bi bi-exclamation-triangle me-1"></i> Low-stock report
          </button>
          <button class="tab-btn inactive-tab" data-target="valuation-panel">
            <i class="bi bi-currency-dollar me-1"></i> Inventory value report
          </button>
        </div>

        <!-- Low Stock Panel -->
        <div id="low-stock-panel" class="report-panel">

          ${
            lowStock.length > 0
              ? `
          <div class="alert-warning-banner mb-3">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            ${lowStock.length} product${lowStock.length > 1 ? "s are" : " is"} below their reorder level and need restocking.
          </div>
          `
              : ""
          }

          <div class="report-card">
            <div class="report-card-header">
              <i class="bi bi-exclamation-triangle me-2 text-warning"></i>
              <span class="fw-semibold">Products requiring restock</span>
            </div>
            <div class="table-responsive">
              <table class="report-table">
                <thead>
                  <tr>
                    <th>PRODUCT</th>
                    <th>SKU</th>
                    <th>CURRENT QTY</th>
                    <th>REORDER LEVEL</th>
                    <th>SHORTAGE</th>
                    <th>SUPPLIER</th>
                  </tr>
                </thead>
                <tbody>
                  ${
                    lowStock.length > 0
                      ? lowStock
                          .map((p) => {
                            const reorderLevel = p.reorderLevel || 10;
                            const shortage = p.quantity - reorderLevel;
                            const isHighShortage = shortage <= -8;
                            const rowClass = isHighShortage
                              ? "row-high-shortage"
                              : shortage < 0
                                ? "row-low-shortage"
                                : "";
                            return `
                          <tr class="${rowClass}">
                            <td>${p.name}</td>
                            <td><span class="sku-badge">${p.sku}</span></td>
                            <td>${p.quantity}</td>
                            <td>${reorderLevel}</td>
                            <td>
                              <span class="shortage-badge ${shortage < 0 ? "shortage-negative" : "shortage-zero"}">
                                ${shortage} units
                              </span>
                            </td>
                            <td>${p.supplierName || "—"}</td>
                          </tr>
                        `;
                          })
                          .join("")
                      : `<tr><td colspan="6" class="text-center py-4 text-muted">No low stock items</td></tr>`
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Inventory Value Panel -->
        <div id="valuation-panel" class="report-panel" style="display:none;">
          <div class="report-card">
            <div class="report-card-header d-flex justify-content-between align-items-center">
              <div>
                <i class="bi bi-currency-dollar me-2 text-primary"></i>
                <span class="fw-semibold">Inventory value breakdown</span>
              </div>
              <span class="total-value-inline">
                $${valuation.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div class="table-responsive">
              <table class="report-table">
                <thead>
                  <tr>
                    <th>PRODUCT</th>
                    <th>SKU</th>
                    <th>CATEGORY</th>
                    <th>UNIT PRICE</th>
                    <th>QTY</th>
                    <th>STOCK VALUE</th>
                  </tr>
                </thead>
                <tbody>
                  ${valuation.items
                    .map(
                      (p) => `
                    <tr>
                      <td>${p.name}</td>
                      <td><span class="sku-badge">${p.sku}</span></td>
                      <td>${p.categoryName}</td>
                      <td>$${(p.price || 0).toFixed(2)}</td>
                      <td>${p.quantity}</td>
                      <td class="stock-value-cell">$${p.stockValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  `,
                    )
                    .join("")}
                </tbody>
                <tfoot>
                  <tr class="total-row">
                    <td colspan="5" class="text-end fw-semibold">Total inventory value</td>
                    <td class="total-value-cell">
                      $${valuation.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

      </div>

      <style>
        /* ── Tabs ── */
        .tab-btn {
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          border: 1px solid #d1d5db;
          background: white;
          color: #374151;
          transition: all 0.15s ease;
        }
        .tab-btn.active-tab {
          background: #2563eb;
          color: white;
          border-color: #2563eb;
        }
        .tab-btn.inactive-tab:hover {
          background: #f3f4f6;
        }

        /* ── Warning Banner ── */
        .alert-warning-banner {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
          border-radius: 8px;
          padding: 12px 16px;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
        }

        /* ── Report Card ── */
        .report-card {
          background: white;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
          overflow: hidden;
        }
        .report-card-header {
          padding: 14px 20px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          font-size: 0.9rem;
        }

        /* ── Table ── */
        .report-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
        }
        .report-table thead th {
          padding: 10px 20px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #6b7280;
          letter-spacing: 0.04em;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          white-space: nowrap;
        }
        .report-table tbody tr {
          border-bottom: 1px solid #f3f4f6;
          transition: background 0.1s;
        }
        .report-table tbody tr:last-child {
          border-bottom: none;
        }
        .report-table tbody tr:hover {
          background: #f9fafb;
        }
        .report-table tbody td {
          padding: 13px 20px;
          color: #111827;
        }

        /* ── Row highlights for low stock ── */
        .row-high-shortage {
          background: #fffbeb !important;
        }
        .row-low-shortage {
          background: #fefce8 !important;
        }

        /* ── SKU Badge ── */
        .sku-badge {
          background: #eff6ff;
          color: #2563eb;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 500;
          font-family: monospace;
        }

        /* ── Shortage Badge ── */
        .shortage-badge {
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }
        .shortage-negative {
          background: #f59e0b;
          color: white;
        }
        .shortage-zero {
          background: #fbbf24;
          color: white;
        }

        /* ── Valuation ── */
        .total-value-inline {
          font-size: 1rem;
          font-weight: 700;
          color: #2563eb;
        }
        .stock-value-cell {
          font-weight: 600;
          color: #111827;
        }
        .report-table tfoot .total-row td {
          padding: 14px 20px;
          background: #f9fafb;
          border-top: 2px solid #e5e7eb;
        }
        .total-value-cell {
          font-weight: 700;
          font-size: 1rem;
          color: #2563eb;
        }
      </style>
    `;
  }

  attachEvents(container) {
    const tabs = container.querySelectorAll(".tab-btn");
    const panels = container.querySelectorAll(".report-panel");

    tabs.forEach((btn) => {
      btn.addEventListener("click", () => {
        tabs.forEach((t) => {
          t.classList.remove("active-tab");
          t.classList.add("inactive-tab");
        });
        btn.classList.remove("inactive-tab");
        btn.classList.add("active-tab");

        const target = btn.dataset.target;
        panels.forEach(
          (p) => (p.style.display = p.id === target ? "block" : "none"),
        );
      });
    });
  }
}
