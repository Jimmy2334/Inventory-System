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
        <div class="row g-3 mb-3">
          ${this._createMetricCard("TOTAL PRODUCTS", metrics.totalProducts, "bi-box-seam-fill", "#e0f2fe", "#0369a1")}
          ${this._createMetricCard("LOW STOCK ALERTS", metrics.lowStockCount, "bi-exclamation-triangle-fill", "#fef2f2", "#dc2626", metrics.lowStockCount > 0)}
          ${this._createMetricCard("PENDING ORDERS", metrics.pendingOrders, "bi-cart-fill", "#fffbeb", "#d97706")}
          ${this._createMetricCard("INVENTORY VALUE", "$" + metrics.totalValue, "bi-currency-dollar", "#f0fdf4", "#16a34a")}
        </div>

        <!-- Bottom Row -->
        <div class="row g-3">

          <!-- Low Stock Table -->
          <div class="col-lg-6">
            <div class="dash-card">
              <div class="dash-card-header">
                <div class="d-flex align-items-center gap-2">
                  <i class="bi bi-exclamation-triangle text-warning"></i>
                  <span class="fw-semibold">Low stock items</span>
                </div>
                <a href="#/reports" class="view-report-link">View full report &rarr;</a>
              </div>
              <table class="dash-table low-stock-table">
                <thead>
                  <tr>
                    <th style="width:45%">PRODUCT</th>
                    <th style="width:15%">QTY</th>
                    <th style="width:20%">REORDER AT</th>
                    <th style="width:20%">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  ${
                    lowStockItems.length > 0
                      ? lowStockItems
                          .map((item) => {
                            const isLow = item.status === "Low";
                            const rowClass = isLow ? "row-low" : "row-at-limit";
                            const badgeClass = isLow
                              ? "badge-low"
                              : "badge-at-limit";
                            return `
                            <tr class="${rowClass}">
                              <td>${item.name}</td>
                              <td>${item.currentQty}</td>
                              <td>${item.reorder || 10}</td>
                              <td><span style="white-space: nowrap;" class="status-badge ${badgeClass}">${item.status}</span></td>
                            </tr>
                          `;
                          })
                          .join("")
                      : `<tr><td colspan="4" class="text-center py-3 text-muted">No stock alerts</td></tr>`
                  }
                </tbody>
              </table>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="col-lg-6">
            <div class="dash-card">
              <div class="dash-card-header">
                <div class="d-flex align-items-center gap-2">
                  <i class="bi bi-clock text-muted"></i>
                  <span class="fw-semibold">Recent activity</span>
                </div>
              </div>
              ${
                recentActivity.length > 0
                  ? `
                  <table class="dash-table activity-table">
                    <thead>
                      <tr>
                        <th style="width:18%">TIME</th>
                        <th style="width:25%">ACTION</th>
                        <th style="width:57%">DETAILS</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${recentActivity
                        .map((log) => {
                          let actionClass = "bg-secondary";
                          if (log.action.includes("added")) {
                            actionClass = "bg-primary";
                          } else if (log.action.includes("deleted")) {
                            actionClass = "bg-danger";
                          } else if (log.action.includes("edited")) {
                            actionClass = "bg-secondary";
                          } else if (log.action.includes("adjustment")) {
                            actionClass = "bg-warning text-dark";
                          } else if (log.action.includes("received")) {
                            actionClass = "bg-success";
                          } else {
                            actionClass = "bg-dark text-white";
                          }
                          const timeStr = new Date(
                            log.timestamp,
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          });
                          return `
                          <tr>
                            <td class="activity-time">${timeStr}</td>
                            <td class="activity-action d-flex justify-content-center justify-content-md-start"><span class="badge ${actionClass}">${log.action[0].toUpperCase() + log.action.slice(1)}</span></td>
                            <td>
                              <div class="activity-details-wrap" title="${(log.message || log.details || "").replace(/"/g, "&quot;")}">
                                ${log.message || log.details || ""}
                              </div>
                            </td>
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
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .metric-icon {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.35rem;
          flex-shrink: 0;
        }
        .metric-label {
          font-size: 0.68rem;
          font-weight: 700;
          color: #9ca3af;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .metric-value {
          font-size: 1.65rem;
          font-weight: 700;
          color: #111827;
          line-height: 1;
        }
        .metric-value.alert-red { color: #dc2626; }
        .metric-value.green     { color: #16a34a; }

        /* ── Dash Card ── */
        .dash-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          overflow: hidden;
        }
        .dash-card-header {
          padding: 12px 16px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.875rem;
        }
        .view-report-link {
          font-size: 0.78rem;
          color: #2563eb;
          text-decoration: none;
          font-weight: 500;
        }
        .view-report-link:hover { text-decoration: underline; }

        /* ── Dash Table ── */
        .dash-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.855rem;
          table-layout: fixed;
        }
        .dash-table thead th {
          padding: 8px 16px;
          font-size: 0.68rem;
          font-weight: 700;
          color: #9ca3af;
          letter-spacing: 0.05em;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
        }
        .dash-table tbody tr {
          border-bottom: 1px solid #e5e7eb;
        }
        .dash-table tbody tr:last-child {
          border-bottom: none;
        }
        .dash-table tbody td {
          padding: 10px 16px;
          color: #111827;
        }

        /* ── Low Stock Row Colors (vivid) ── */
        .row-low      { background: #fecaca; }
        .row-at-limit { background: #fef9c3; }

        /* ── Status Badges ── */
        .status-badge {
          padding: 3px 12px;
          border-radius: 20px;
          font-size: 0.76rem;
          font-weight: 600;
        }
        .badge-low      { background: #dc2626; color: white; }
        .badge-at-limit { background: #f59e0b; color: white; }

        /* ── Low Stock Table padding ── */
        .dash-table tbody td:first-child { padding-left: 20px; }
        .dash-table thead th:first-child  { padding-left: 20px; }
        .dash-table tbody td:last-child   { padding-right: 20px; }
        .dash-table thead th:last-child   { padding-right: 20px; }

        /* ── Low stock table: spaced full-width rows ── */
        .low-stock-table {
          border-collapse: collapse;
          border-spacing: 0;
          padding: 0;
        }
        .low-stock-table thead th {
          background: transparent;
          border-bottom: 1px solid #e5e7eb;
          padding-top: 4px;
          padding-bottom: 4px;
        }
        .low-stock-table tbody tr td {
          border-bottom: 1px solid #e9eaec;
          padding-top: 11px;
          padding-bottom: 11px;
        }
        .low-stock-table tbody tr:last-child td:first-child {
          border-bottom-left-radius: 10px;
        }
        .low-stock-table tbody tr:last-child td:last-child {
          border-bottom-right-radius: 10px;
        }

        /* ── Activity Table ── */
        .activity-table tbody td {
          vertical-align: top;
        }
        .activity-time {
          color: #6b7280;
          font-size: 0.78rem;
          white-space: nowrap;
        }
        .activity-action {
          font-weight: 500;
          font-size: 0.82rem;
        }
        .activity-details-wrap {
          color: #374151;
          font-size: 0.82rem;
          line-height: 1.45;
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;

        }

        /* ── RESPONSIVE FIXES (small screens only) ── */
        @media (max-width: 992px) {
          .dashboard-wrapper {
            padding: 1rem !important;
          }
          .metric-card {
            padding: 12px;
            gap: 12px;
          }
          .metric-value {
            font-size: 1.4rem;
          }
          .metric-label {
            font-size: 0.6rem;
          }
          .dash-card-header {
            flex-wrap: wrap;
            gap: 8px;
          }
          .view-report-link {
            font-size: 0.7rem;
          }
        }

        @media (max-width: 768px) {
          .dashboard-wrapper {
            padding: 0.75rem !important;
          }
          .metric-card {
            padding: 10px;
            gap: 10px;
          }
          .metric-icon {
            width: 36px;
            height: 36px;
            font-size: 1rem;
          }
          .metric-value {
            font-size: 1.2rem;
          }
          .metric-label {
            font-size: 0.55rem;
          }

          /* Make tables horizontally scrollable on small screens */
          .dash-card {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
          .dash-table {
            min-width: 500px;
            font-size: 0.8rem;
          }
          .low-stock-table {
            min-width: 400px;
          }
          .activity-table {
            min-width: 400px;
          }

          .dash-card-header {
            padding: 10px 12px;
          }
          .dash-table tbody td,
          .dash-table thead th {
            padding: 8px 12px;
          }
        }

        @media (max-width: 576px) {
          .metric-value {
            font-size: 1rem;
          }
          .metric-label {
            font-size: 0.5rem;
          }
          .dash-table {
            font-size: 0.75rem;
          }
          .status-badge {
            padding: 2px 8px;
            font-size: 0.7rem;
          }
          .activity-time,
          .activity-action,
          .activity-details-wrap {
            font-size: 0.7rem;
          }
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
      <div class="col-lg-4 col-md-6 col-xl-3">
        <div class="metric-card">
          <div class="metric-icon" style="background:${bgColor}; color:${iconColor};">
            <i class="bi ${icon}"></i>
          </div>
          <div>
            <div style="white-space: nowrap;" class="metric-label">${label}</div>
            <div class="${valueClass}">${value}</div>
          </div>
        </div>
      </div>
    `;
  }
}
