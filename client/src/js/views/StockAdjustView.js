// js/views/StockAdjustView.js
import { updateLowStockBadge } from "../utils/helpers.js";
import { InventoryService } from "../services/InventoryService.js";
import { ProductService } from "../services/ProductService.js";

export class StockAdjustView {
  constructor() {
    this.inventoryService = new InventoryService();
    this.productService = new ProductService();
    this.products = [];
    this.adjustments = [];
  }

  async render(container) {
    this.products = await this.productService.getAll();
    this.adjustments = await this.inventoryService.getAdjustmentHistory();
    document.getElementById("page-title").innerText = "Stock Adjustments";
    // Paste your HTML section here — just wrap in backticks
    container.innerHTML = `
      <div class="row g-3">
        <div class="col-lg-5 col-12">
          <div class="card">
            <div class="card-header">
              <i class="bi bi-arrow-left-right me-2"></i>New stock adjustment
            </div>
            <div class="card-body">
              <form id="adjForm">
                <div class="mb-3">
                  <label class="form-label" for="adj-product">Product <span class="text-danger">*</span></label>
                  <select id="adj-product" class="form-select" required>
                    <option value="">Select a product...</option>
                    ${this.products.map((product) => `<option value="${product.id}">${product.name}</option>`).join("")}
                  </select>
                </div>
                <div class="row g-2 mb-3">
                  <div class="col-6">
                    <label class="form-label" for="adj-type">Adjustment type <span class="text-danger">*</span></label>
                    <select id="adj-type" class="form-select" required>
                      <option value="increase">Increase ▲</option>
                      <option value="decrease">Decrease ▼</option>
                    </select>
                  </div>
                  <div class="col-6">
                    <label class="form-label" for="adj-amount">Quantity <span class="text-danger">*</span></label>
                    <input type="number" id="adj-amount" class="form-control" min="1" placeholder="e.g. 10" required />
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label" for="adj-reason">Reason <span class="text-danger">*</span></label>
                  <textarea id="adj-reason" class="form-control" rows="2"
                    placeholder="e.g. Damaged in warehouse..." required></textarea>
                </div>
                <div id="adj-preview" class="alert alert-info d-none mb-3" style="font-size:13px"></div>
                <div id="adjError"    class="alert alert-danger d-none mb-3" style="font-size:13px"></div>
                <button id="adj-submit" type="button" class="btn btn-primary w-100">
                  <i class="bi bi-check-lg me-1"></i>Save adjustment
                </button>
              </form>
            </div>
          </div>
        </div>

        <div class="col-lg-7 col-12">
          <div class="card">
            <div class="card-header">
              <i class="bi bi-clock-history me-2"></i>Adjustment history
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table mb-0">
                  <thead>
                    <tr>
                      <th>Product</th><th>Type</th>
                      <th>Change</th><th>Reason</th><th>Date</th>
                    </tr>
                  </thead>
                  <tbody id="adj-history-tbody">
                  ${
                    this.adjustments.length > 0
                      ? this.adjustments
                          .map(
                            (adj) => `
                          <tr>
                            <td>
                              <div>${adj.productName}</div>
                              <div
                                class="text-muted mt-1"
                                style="font-size: 11px"
                              >
                                ${adj.productCode}
                              </div>
                            </td>
                            <td>
                              <span class="badge ${adj.type === "increase" ? "bg-success" : "bg-danger"}">
                                ${adj.type.charAt(0).toUpperCase() + adj.type.slice(1)}
                              </span>
                            </td>
                            <td class="${adj.type === "increase" ? "text-success" : "text-danger"}">
                              ${adj.type === "increase" ? "+" : "-"}${adj.quantity}
                            </td>
                            <td style="max-width: 130px;" title="${adj.reason}">
                              <div class="text-truncate">${adj.reason}</div>
                            </td>
                            <td class="text-muted" style="font-size: 12px">
                              ${new Date(adj.date).toLocaleDateString()} ${new Date(adj.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </td>
                          </tr>
                      `,
                          )
                          .join("")
                      : ` <tr><td colspan="5" class="text-center text-muted py-4">
                      No adjustments yet.
                    </td></tr>`
                  }
                   
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;


    this.attachEvents(container);
  }

  attachEvents(container) {
    const productSelect = container.querySelector("#adj-product");
    const typeSelect = container.querySelector("#adj-type");
    const amountInput = container.querySelector("#adj-amount");
    const reasonInput = container.querySelector("#adj-reason");
    const previewBox = container.querySelector("#adj-preview");
    const errorBox = container.querySelector("#adjError");
    const submitBtn = container.querySelector("#adj-submit");

    //^update the preview box whenever product, type or amount changes
    const updatePreview = () => {
      errorBox.classList.add("d-none");
      if (productSelect.value && typeSelect.value == "decrease") {
        amountInput.max = this.products.find(
          (p) => p.id === productSelect.value,
        ).quantity;
      }
      const productId = productSelect.value;
      const type = typeSelect.value;
      const amount = parseInt(amountInput.value);
      if (productId && type && amount) {
        if (amount > amountInput.max && type === "decrease") {
          errorBox.innerText = `Cannot decrease more than current stock (${amountInput.max})`;
          errorBox.classList.remove("d-none");
          previewBox.classList.add("d-none");
          amountInput.value = amountInput.max; // reset to max
          return;
        }
        const product = this.products.find((p) => p.id === productId);
        const newQty =
          type === "increase"
            ? product.quantity + amount
            : product.quantity - amount;
        previewBox.innerHTML = `
          <div>Current stock: <strong>${product.quantity}</strong>${type === "increase" ? " + " : " - "}${amount}</div>
          <div>New stock: <strong>${newQty}</strong></div>
        `;
        type === "increase"
          ? previewBox.classList.add("alert-info")
          : previewBox.classList.add("alert-danger");
        previewBox.classList.remove("d-none");
        errorBox.classList.add("d-none");
      } else {
        previewBox.classList.add("d-none");
      }
    };
    productSelect.addEventListener("change", updatePreview);
    typeSelect.addEventListener("change", updatePreview);
    amountInput.addEventListener("input", updatePreview);

    //^handle form submission
    submitBtn.addEventListener("click", async () => {
      const productId = productSelect.value;
      const type = typeSelect.value;
      const amount = parseInt(amountInput.value);
      const reason = reasonInput.value.trim();
      if (!productId || !type || !amount || !reason) {
        errorBox.innerText = "Please fill in all fields.";
        errorBox.classList.remove("d-none");
        return;
      }
      try {
        await this.inventoryService.adjustStock(productId, type, amount, reason, this.products.find(p => p.id === productId).name);
        // Optionally, reset the form or show a success message
      } catch (error) {
        errorBox.innerText = error.message;
        errorBox.classList.remove("d-none");
      }
      productSelect.value = "";
      typeSelect.value = "increase";
      amountInput.value = "";
      reasonInput.value = "";
      previewBox.classList.add("d-none");
      errorBox.classList.add("d-none");
      this.render(container);
      //^update low stock badge in sidebar
      updateLowStockBadge();
    });
  }
}
