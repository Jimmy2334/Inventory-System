import { DashboardService } from "../services/DashboardService.js";

export class DashboardView {
  render(container) {
    const data = DashboardService.getDashboardData();
    const { metrics, lowStockItems, recentActivity } = data;

    container.innerHTML = `
      <div class="dashboard-wrapper p-4">
        
        <div class="row g-3 mb-4">
          ${this._createMetricCard("TOTAL PRODUCTS", metrics.totalProducts, "bi-box-seam", "icon-blue")}
          ${this._createMetricCard("LOW STOCK ALERTS", metrics.lowStockCount, "bi-exclamation-triangle", "icon-red", true)}
          ${this._createMetricCard("PENDING ORDERS", metrics.pendingOrders, "bi-cart", "icon-orange")}
          ${this._createMetricCard("INVENTORY VALUE", "$" + metrics.totalValue, "bi-currency-dollar", "icon-green")}
        </div>

        <div class="row g-4">
          <div class="col-lg-7">
            <div class="card border-0 shadow-sm custom-card h-100">
              <div class="card-header bg-transparent border-0 d-flex justify-content-between align-items-center pt-4 px-4">
                <h6 class="fw-bold mb-0 text-navy"><i class="bi bi-exclamation-circle me-2 text-danger"></i>Low stock items</h6>
                <a href="#/reports" class="text-primary text-decoration-none small fw-medium">View full report &rarr;</a>
              </div>
              <div class="card-body px-4">
                <div class="table-responsive">
                  <table class="table align-middle custom-table">
                    <thead>
                      <tr>
                        <th>PRODUCT</th>
                        <th class="text-center">QTY</th>
                        <th class="text-center">REORDER AT</th>
                        <th class="text-center">STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${lowStockItems
                        .map(
                          (item) => `
                        <tr class="${item.status === "Low" ? "row-low" : "row-limit"}">
                          <td class="fw-medium">${item.name}</td>
                          <td class="text-center">${item.currentQty}</td>
                          <td class="text-center">${item.reorderLevel}</td>
                          <td class="text-center">
                            <span class="status-badge badge-${item.status === "Low" ? "red" : "orange"}">
                              ${item.status}
                            </span>
                          </td>
                        </tr>
                      `,
                        )
                        .join("")}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-5">
            <div class="card border-0 shadow-sm custom-card h-100">
              <div class="card-header bg-transparent border-0 pt-4 px-4">
                <h6 class="fw-bold mb-0 text-navy"><i class="bi bi-clock-history me-2"></i>Recent activity</h6>
              </div>
              <div class="card-body px-4">
                ${
                  recentActivity.length > 0
                    ? this._renderActivity(recentActivity)
                    : `
                  <div class="text-center py-5">
                    <p class="text-muted small">No recent activity</p>
                  </div>
                `
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById("page-title").innerText = "Dashboard";
  }

  _createMetricCard(label, value, icon, iconClass, isAlert = false) {
    return `
      <div class="col-md-3">
        <div class="card border-0 shadow-sm metric-card p-3">
          <div class="d-flex align-items-center gap-3">
            <div class="metric-icon-box ${iconClass}">
              <i class="bi ${icon}"></i>
            </div>
            <div>
              <div class="metric-label">${label}</div>
              <div class="metric-value ${isAlert && value > 0 ? "text-danger" : ""}">${value}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  _renderActivity(logs) {
    return `<div class="activity-list">
      ${logs
        .map(
          (log) => `
        <div class="activity-item d-flex gap-3 mb-4">
          <div class="activity-time text-muted small">${log.time || "12:00"}</div>
          <div class="activity-content">
            <div class="fw-bold small text-navy">${log.action}</div>
            <div class="text-muted extra-small">${log.details}</div>
          </div>
        </div>
      `,
        )
        .join("")}
     </div>`;
  }
}
