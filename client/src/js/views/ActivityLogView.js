import { ActivityLogService } from "../services/ActivityLogService.js";
export class ActivityLogView {
  constructor() {
    this.logs = [];
  }
  async render(container) {
    this.logs = await ActivityLogService.getLogs();
    document.getElementById("page-title").textContent = "Activity Log";
    container.innerHTML = `
            <div class="card">
              <div
                class="card-header d-flex align-items-center justify-content-between flex-wrap gap-2"
              >
                <span
                  ><i class="bi bi-clock-history me-2"></i>Activity log</span
                >
                <div class="search-wrapper">
                  <i class="bi bi-search"></i>
                  <input
                    type="text"
                    id="log-search"
                    class="form-control form-control-sm"
                    placeholder="Search log…"
                    style="width: 220px"
                  />
                </div>
              </div>
              <div class="card-body p-0">
                <div class="table-responsive-wrapper">
                  <table class="table mb-0">
                    <thead>
                      <tr>
                        <th style="width: 160px">Timestamp</th>
                        <th style="width: 180px">Action</th>
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody id="log-tbody">
                     ${this.renderRows(this.logs)}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        `;
    this.attachEvents(container);
  }
  renderRows(logs=this.logs) {
    if (logs.length === 0) {
      return `
            <tr><td colspan="3" class="text-center text-muted py-4">
                      No activity logs yet.
                    </td></tr>
            `;
    }
    return logs
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
        }
        return `<tr>
                  <td class="text-muted" style="font-size: 12px">
                  ${new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td>
                  <span class="badge ${actionClass}">${log.action[0].toUpperCase() + log.action.slice(1)}</span>
                  </td>
                  <td style="max-width: 130px;" title="${log.message}">
                    <div class="text-truncate">${log.message}</div>
                  </td>
            </tr>`;
      })
      .join("");
  }
  attachEvents(container) {
    const inputSearch = container.querySelector("#log-search");
    inputSearch.addEventListener("input", () => {
      let query = inputSearch.value;
      let filteredLogs = this.logs.filter(
        (log) => log.action.includes(query) || log.message.includes(query),
      );
      const tableBody = container.querySelector("#log-tbody");
      tableBody.innerHTML = this.renderRows(filteredLogs);
    });
  }
}
