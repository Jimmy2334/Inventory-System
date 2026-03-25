import { DashboardService } from "../services/DashboardService.js";

export class DashboardView {
  render(container) {
    document.getElementById("page-title").innerText = "Dashboard";

    container.innerHTML = `
      <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
        <div class="spinner-border text-primary" role="status"></div>
      </div>
    `;

    this.loadData(container);
  }

  async loadData(container) {
    try {
      const data = await DashboardService.getDashboardData();
      container.innerHTML = this.template(data);
    } catch (error) {
      container.innerHTML = `
        <div class="alert alert-danger m-4">
          Failed to load dashboard data. Please check if the server is running.
        </div>
      `;
    }
  }

  template(data) {
    const { metrics, lowStockItems, recentActivity } = data;

    return `
      <div class="dashboard-wrapper p-3">

        <!-- Metric Cards -->
        <div class="row g-3 mb-4">
          ${this._createMetricCard("TOTAL PRODUCTS", metrics.totalProducts, "bi-box-seam", "#dbeafe", "#2563eb")}
          ${this._createMetricCard("LOW STOCK ALERTS", metrics.lowStockCount, "bi-exclamation-triangle-fill", "#fee2e2", "#dc2626", metrics.lowStockCount > 0)}
          ${this._createMetricCard("PENDING ORDERS", metrics.pendingOrders, "bi-cart-fill", "#fef9c3", "#ca8a04")}
          ${this._createMetricCard("INVENTORY VALUE", "$" + metrics.totalValue, "bi-currency-dollar", "#dcfce7", "#16a34a")}
        </div>

        <!-- Bottom Row -->
        <div class="row g-4">

          <!-- Low Stock Table -->
          <div class="col-lg-7">
            <div class="dash-card h-100">
              <div class="dash-card-header">
                <div class="d-flex align-items-center gap-2">
                  <i class="bi bi-exclamation-triangle text-warning"></i>
                  <span class="fw-semibold">Low stock items</span>
                </div>
                <a href="#/reports" class="view-report-link">View full report &rarr;</a>
              </div>
              <div class="table-responsive">
                <table class="dash-table">
                  <thead>
                    <tr>
                      <th>PRODUCT</th>
                      <th>QTY</th>
                      <th>REORDER AT</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${
                      lowStockItems.length > 0
                        ? lowStockItems
                            .map((item) => {
                              const isLow = item.status === "Low";
                              const rowClass = isLow
                                ? "row-low"
                                : "row-at-limit";
                              const badgeClass = isLow
                                ? "badge-low"
                                : "badge-at-limit";
                              return `
                              <tr class="${rowClass}">
                                <td>${item.name}</td>
                                <td>${item.currentQty}</td>
                                <td>${item.reorderLevel || 10}</td>
                                <td><span class="status-badge ${badgeClass}">${item.status}</span></td>
                              </tr>
                            `;
                            })
                            .join("")
                        : `<tr><td colspan="4" class="text-center py-4 text-muted">No stock alerts</td></tr>`
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="col-lg-5">
            <div class="dash-card h-100">
              <div class="dash-card-header">
                <div class="d-flex align-items-center gap-2">
                  <i class="bi bi-clock text-muted"></i>
                  <span class="fw-semibold">Recent activity</span>
                </div>
              </div>
              ${
                recentActivity.length > 0
                  ? `
                <table class="dash-table">
                  <thead>
                    <tr>
                      <th>TIME</th>
                      <th>ACTION</th>
                      <th>DETAILS</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${recentActivity
                      .map((log) => {
                        const date = new Date(log.timestamp);
                        const dateStr = date.toLocaleDateString("en-CA"); // YYYY-MM-DD
                        const timeStr = date.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        });
                        return `
                        <tr>
                          <td class="activity-time">${dateStr} ${timeStr}</td>
                          <td class="activity-action">${log.action || ""}</td>
                          <td class="activity-details">${log.message || log.details || ""}</td>
                        </tr>
                      `;
                      })
                      .join("")}
                  </tbody>
                </table>
              `
                  : `<p class="text-center text-muted py-4">No recent activity</p>`
              }
            </div>
          </div>

        </div>
      </div>

      <style>
        /* ── Metric Cards ── */
        .metric-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 22px 22px;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .metric-icon {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
          flex-shrink: 0;
        }
        .metric-label {
          font-size: 0.7rem;
          font-weight: 700;
          color: #9ca3af;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 5px;
        }
        .metric-value {
          font-size: 1.7rem;
          font-weight: 700;
          color: #111827;
          line-height: 1;
        }
        .metric-value.alert-red {
          color: #dc2626;
        }
        .metric-value.green {
          color: #16a34a;
        }

        /* ── Dash Card ── */
        .dash-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          overflow: hidden;
        }
        .dash-card-header {
          padding: 14px 20px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.9rem;
        }
        .view-report-link {
          font-size: 0.8rem;
          color: #2563eb;
          text-decoration: none;
          font-weight: 500;
        }
        .view-report-link:hover {
          text-decoration: underline;
        }

        /* ── Dash Table ── */
        .dash-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
        }
        .dash-table thead th {
          padding: 10px 20px;
          font-size: 0.7rem;
          font-weight: 700;
          color: #9ca3af;
          letter-spacing: 0.05em;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
        }
        .dash-table tbody tr {
          border-bottom: 1px solid #f3f4f6;
        }
        .dash-table tbody tr:last-child {
          border-bottom: none;
        }
        .dash-table tbody td {
          padding: 10px 20px;
          color: #111827;
        }

        /* ── Low Stock Row Colors ── */
        .row-low {
          background: #fef2f2;
        }
        .row-at-limit {
          background: #fefce8;
        }

        /* ── Status Badges ── */
        .status-badge {
          padding: 3px 12px;
          border-radius: 20px;
          font-size: 0.78rem;
          font-weight: 600;
        }
        .badge-low {
          background: #dc2626;
          color: white;
        }
        .badge-at-limit {
          background: #f59e0b;
          color: white;
        }

        /* ── Activity Table ── */
        .activity-time {
          color: #6b7280;
          font-size: 0.8rem;
          white-space: nowrap;
        }
        .activity-action {
          font-weight: 500;
          white-space: nowrap;
        }
        .activity-details {
          color: #374151;
          font-size: 0.82rem;
        }
      </style>
    `;
  }

  _createMetricCard(label, value, icon, bgColor, iconColor, isAlert = false) {
    const valueClass = isAlert
      ? "metric-value alert-red"
      : label === "INVENTORY VALUE"
        ? "metric-value green"
        : "metric-value";
    return `
      <div class="col-md-3">
        <div class="metric-card">
          <div class="metric-icon" style="background:${bgColor}; color:${iconColor};">
            <i class="bi ${icon}"></i>
          </div>
          <div>
            <div class="metric-label">${label}</div>
            <div class="${valueClass}">${value}</div>
          </div>
        </div>
      </div>
    `;
  }
}
