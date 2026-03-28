import { ProductService } from "../services/ProductService.js";
import { CategoryService } from "../services/CategoryService.js";
import { SupplierService } from "../services/SupplierService.js";
import { updateLowStockBadge } from "../utils/helpers.js";

export class ProductView {
  constructor() {
    this.productService = new ProductService();
    this.categoryService = new CategoryService();
  }
  template(products, categories,suppliers) {
    /******For test only  */

    /******************** */
    document.getElementById("page-title").innerText = "Products";
    return `
    
      <!-- ── Categories Card ── -->
            <div class="card mb-4">
              <div class="card-header">
                <i class="bi bi-tags me-2"></i>Categories
              </div>
              <div class="card-body">
                <div id="categories-list" class="mb-3">
  ${
    categories.length === 0
      ? `<span class="text-muted">No categories yet</span>`
      : categories
          .map(
            (
              c,
            ) => `     <span class="badge bg-secondary me-2 mb-2 py-2 px-3 category-badge" style="font-size: 13px">
                        <span class="btn-edit-category" data-id="${c.id}" data-category="${c.name}" 
                            style="cursor:pointer;" title="Click to edit">
                            ${c.name}
                        </span>
                        <button type="button"
                            class="btn-close btn-close-white ms-2 btn-delete-category"
                            style="font-size: 9px"
                            data-category="${c.name}"
                            data-id="${c.id}"
                            title="Delete">
                        </button>
                    </span>
          `,
          )
          .join("")
  }
          </div>

          <!-- Add category input -->
                <div class="d-flex gap-2" style="max-width: 380px">
                  <input
                    type="text"
                    id="new-category-input"
                    class="form-control"
                    placeholder="New category name…"
                  />
                  <button
                    id="btn-add-category"
                    class="btn btn-outline-primary text-nowrap"
                  >
                    <i class="bi bi-plus-lg me-1"></i>Add
                  </button>
                </div>
          <div id="category-error" class="text-danger mt-2 d-none" style="font-size:13px;"></div>
        </div>
      </div>

      <!-- ── Products Card ── -->
      <div class="card">
        <div class="card-header d-flex align-items-center justify-content-between flex-wrap gap-2">
          <span><i class="bi bi-box-seam me-2"></i>Products</span>
          <div class="d-flex gap-2 align-items-center">
            <div class="search-wrapper">
              <i class="bi bi-search"></i>
              <input type="text" id="product-search" class="form-control form-control-sm"
                placeholder="Search products…" style="width:200px;"/>
            </div>
            <button id="btn-add-product" class="btn btn-primary btn-sm"
              data-bs-toggle="modal" data-bs-target="#productModal">
              <i class="bi bi-plus-lg me-1"></i>Add product
            </button>
          </div>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table mb-0">
              <thead>
                <tr>
                  <th>Name</th><th>SKU</th><th>Category</th><th>Supplier</th>
                  <th>Price</th><th>Qty</th><th>Reorder</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody id="products-tbody">
                ${this.renderRows(products)}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ── Product Modal ── -->
<div class="modal fade" id="productModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-lg">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="productModalLabel">Add product</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>

      <!--  form -->
      <form id="productForm" >
        <div class="modal-body">
          <div id="productFormError" class="alert alert-danger d-none mb-3" style="font-size:13px;"></div>
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Product name <span class="text-danger">*</span></label>
              <input type="text" id="product-name" class="form-control" placeholder="e.g. Wireless Keyboard" required/>
            </div>
            <div class="col-md-6">
              <label class="form-label">SKU (unique) <span class="text-danger">*</span></label>
              <input type="text" id="product-sku" class="form-control" placeholder="e.g. KB-007" required/>
            </div>
            <div class="col-md-6">
              <label class="form-label">Category <span class="text-danger">*</span></label>
              <select id="product-category" class="form-select" required>
                <option value="">-- Select category --</option>
                ${categories.map((c) => `<option value="${c.id}">${c.name}</option>`).join("")}
              </select>
            </div>
            <!--  /****************for supplier add exact the line above of map required*************/  -->
            <div class="col-md-6">
              <label class="form-label">Supplier</label>
              <select id="product-supplier" class="form-select" >
                <option value="">-- Select supplier --</option>
                ${suppliers.map((s) => `<option value="${s.id}">${s.name}</option>`).join("")}
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label">Price ($) <span class="text-danger">*</span></label>
              <input type="number" id="product-price" class="form-control" min="0" step="0.01" placeholder="0.00" required/>
            </div>
            <div class="col-md-4">
              <label class="form-label">Quantity <span id="qty-asterisk" class="text-danger">*</span></label>
              <div id="qty-input-container">
                <input type="number" id="product-qty" class="form-control" min="0" placeholder="0" required/>
              </div>
              <div id="qty-display-container" class="form-control bg-light d-none"></div>
              <div id="qty-help" class="form-text text-warning d-none" style="font-size: 12px;">Edit via Stock Adjustments</div>
            </div>
            <div class="col-md-4">
              <label class="form-label">Reorder level <span class="text-danger">*</span></label>
              <input type="number" id="product-reorder" class="form-control" min="0" placeholder="0" required/>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
         
          <button type="submit" class="btn btn-primary">
            <i class="bi bi-check-lg me-1"></i>Save product
          </button>
        </div>
      </form>

    </div>
  </div>
</div>

<!-- ── Delete Confirmation Modal ── -->
<div class="modal fade" id="deleteConfirmModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-sm modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-body text-center p-4">
        <div id="deleteConfirmError" class="alert alert-danger d-none mb-3" style="font-size:13px;"></div>
        <i class="bi bi-exclamation-circle text-danger mb-3" style="font-size: 3rem;"></i>
        <h5 class="mb-2">Confirm Delete</h5>
        <p class="text-muted mb-4" id="deleteConfirmMessage">Are you sure you want to delete this item?</p>
        <div class="d-flex justify-content-center gap-2">
          <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-danger" id="btn-confirm-delete">Delete</button>
        </div>
      </div>
    </div>
  </div>
</div>
    `;
  }

  renderRows(products) {
    if (products.length === 0) {
      return `<tr><td colspan="9" class="text-center text-muted">No products found</td></tr>`;
    }
    const productsData = products
      .map((product) => {
        //style for product row and status
        const { rowClass, badgeClass, statusText } = this.getStatus(product);
        return `
        <tr class="${rowClass}">
          <td>${product.name}</td>
          <td style="white-space: nowrap;"><code>${product.sku}</code></td>
          <td>${product.category}</td>
          <td>${product.supplier ?? "--"}</td>
          <td>$${product.price}</td>
          <td>${product.quantity}</td>
          <td>${product.reorder}</td>
          <td><span class="badge ${badgeClass}">${statusText}</span></td>
          <td style="min-width:110px">
            <button class="btn btn-sm btn-outline-primary me-1 btn-edit"  data-bs-toggle="modal" data-bs-target="#productModal" data-id="${product.id}">
    
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger btn-delete-product" data-id="${product.id}">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>
      `;
      })
      .join("");
    return productsData;
  }

  getStatus(product) {
    if (product.quantity < product.reorder) {
      return {
        rowClass: "table-danger",
        badgeClass: "bg-danger",
        statusText: "Low stock",
      };
    } else if (product.quantity === product.reorder) {
      return {
        rowClass: "table-warning",
        badgeClass: "bg-warning text-dark",
        statusText: "At limit",
      };
    } else {
      return { rowClass: "", badgeClass: "bg-success", statusText: "OK" };
    }
  }
  /**************************************************Events*************************************************** */
  attachEvents() {
    let deleteTargetId = null;
    let deleteTargetType = null;
    const deleteModalEl = document.getElementById("deleteConfirmModal");
    const deleteModal = deleteModalEl ? new bootstrap.Modal(deleteModalEl) : null;
    const btnConfirmDelete = document.getElementById("btn-confirm-delete");
    const confirmMessage = document.getElementById("deleteConfirmMessage");

    if (btnConfirmDelete) {
      btnConfirmDelete.addEventListener("click", async () => {
        const errBox = document.getElementById("deleteConfirmError");
        errBox.classList.add("d-none");
        btnConfirmDelete.disabled = true;
        
        try {
          if (deleteTargetType === "category") {
            await this.categoryService.delete(deleteTargetId);
          } else if (deleteTargetType === "product") {
            await this.productService.delete(deleteTargetId);
            updateLowStockBadge();
          }
          deleteModal.hide();
          // wait a tiny bit to avoid bootstrap backdrop stuck issue before replacing DOM
          setTimeout(async () => {
            await this.loadData(this.container);
          }, 150);
        } catch (err) {
          errBox.textContent = err.message;
          errBox.classList.remove("d-none");
          btnConfirmDelete.disabled = false;
        }
      });
    }
    // Add category event
    document
      .getElementById("btn-add-category")
      .addEventListener("click", async () => {
        const newCategory = document.getElementById("new-category-input");
        const error = document.getElementById("category-error");
        try {
          //check if input is empty
          if (!newCategory.value.trim()) {
            throw new Error("Category is empty");
          }
          await this.categoryService.add(newCategory.value.trim());
          //clear input
          newCategory.value = "";
          //hide error div
          error.classList.add("d-none");
          await this.loadData(this.container);
        } catch (err) {
          error.textContent = err.message;
          error.classList.remove("d-none");
        }
      });

    // Delete category event
    document.querySelectorAll(".btn-delete-category").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        deleteTargetType = "category";
        const category = e.currentTarget.dataset.category;
        deleteTargetId = e.currentTarget.dataset.id;
        e.currentTarget.blur();
        
        const errBox = document.getElementById("deleteConfirmError");
        if (errBox) errBox.classList.add("d-none");
        
        confirmMessage.innerHTML = `Are you sure you want to delete the <strong>${category}</strong> category?`;
        if (deleteModal) deleteModal.show();
      });
    });
    // edit category event
    document.querySelectorAll(".btn-edit-category").forEach((categoryName) => {
      categoryName.addEventListener("click", (e) => {
        const oldCategory = e.currentTarget.dataset.category;
        const categoryId = e.currentTarget.dataset.id;
        //replace category name with input
        const badge = e.currentTarget.closest(".category-badge");
        badge.innerHTML = `<input type="text" 
                class="form-control form-control-sm d-inline-block" 
                style="width: 120px; font-size: 13px;"
                value="${oldCategory}"
                id="edit-category-input-${oldCategory}"
            />
            <button class="btn btn-sm btn-success ms-1 btn-confirm-edit" data-old="${oldCategory}">
                <i class="bi bi-check"></i>
            </button>
            <button class="btn btn-sm btn-danger ms-1 btn-cancel-edit">
                <i class="bi bi-x"></i>
            </button>`;
        //confirm btn for edit
        badge
          .querySelector(".btn-confirm-edit")
          .addEventListener("click", async (e) => {
            const newCategory = badge.querySelector("input").value.trim();
            const error = document.getElementById("category-error");
            try {
              //check if input is empty
              if (!newCategory) {
                throw new Error("Category is empty");
              }
              await this.categoryService.edit(categoryId, newCategory);
              //hide error div
              error.classList.add("d-none");
              await this.loadData(this.container);
            } catch (err) {
              error.textContent = err.message;
              error.classList.remove("d-none");
            }
          });
        //cancle btn for edit
        badge
          .querySelector(".btn-cancel-edit")
          .addEventListener("click", async (e) => {
            await this.loadData(this.container);
          });
      });
    });
    // Add  , edit submit product event
    document
      .getElementById("productForm")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        const error = document.getElementById("productFormError");
        const form = document.getElementById("productForm");

        try {
          const editProductId = form.dataset.editProductId;
          let quantityVal;
          if (editProductId) {
             const existingProduct = this.products.find(p => p.id === editProductId);
             quantityVal = existingProduct ? existingProduct.quantity : 0;
          } else {
             quantityVal = parseInt(document.getElementById("product-qty").value);
          }

          const product = {
            name: document.getElementById("product-name").value.trim(),
            sku: document.getElementById("product-sku").value.trim(),
            categoryId: document.getElementById("product-category").value,
            supplierId: document.getElementById("product-supplier").value,
            price: parseFloat(document.getElementById("product-price").value),
            quantity: quantityVal,
            reorder: parseInt(document.getElementById("product-reorder").value),
          };

          if (editProductId) {
            //  edit mode
            await this.productService.edit(editProductId, product);
            delete form.dataset.editProductId; // clear after edit
            document.getElementById("productModalLabel").textContent =
              "Add product"; // reset title to add product
          } else {
            //add mode
            await this.productService.add(product);
          }
          updateLowStockBadge();
          bootstrap.Modal.getInstance(
            document.getElementById("productModal"),
          ).hide();
          error.classList.add("d-none");
          await this.loadData(this.container);
        } catch (err) {
          error.textContent = err.message;
          error.classList.remove("d-none");
        }
      });

    //Delete product event
    document.querySelectorAll(".btn-delete-product").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        deleteTargetType = "product";
        deleteTargetId = e.currentTarget.dataset.id;
        
        const errBox = document.getElementById("deleteConfirmError");
        if (errBox) errBox.classList.add("d-none");
        
        confirmMessage.innerHTML = `Are you sure you want to delete this product?`;
        if (deleteModal) deleteModal.show();
      });
    });

    //Edit product event

    document.querySelectorAll(".btn-edit").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.id;
        const products = this.products || [];
        const editProduct = products.find((p) => p.id === id);
        if (!editProduct) {
          //   throw new Error("Product id not found");
          return;
        }

        // store edit product id on the form
        document.getElementById("productForm").dataset.editProductId =
          editProduct.id;
        //change product modal title
        document.getElementById("productModalLabel").textContent =
          "Edit Product";
        //fill inputs with products data
        document.getElementById("product-name").value = editProduct.name;
        document.getElementById("product-sku").value = editProduct.sku;
        document.getElementById("product-category").value =
          editProduct.categoryId;

        document.getElementById("product-supplier").value =
          editProduct.supplierId;
        document.getElementById("product-price").value = editProduct.price;
        
        document.getElementById("qty-input-container").classList.add("d-none");
        document.getElementById("product-qty").required = false;
        
        const displayContainer = document.getElementById("qty-display-container");
        displayContainer.textContent = editProduct.quantity;
        displayContainer.classList.remove("d-none");

        const qtyHelp = document.getElementById("qty-help");
        if(qtyHelp) qtyHelp.classList.remove("d-none");
        
        const qtyAsterisk = document.getElementById("qty-asterisk");
        if(qtyAsterisk) qtyAsterisk.classList.add("d-none");

        document.getElementById("product-reorder").value = editProduct.reorder;
      });
    });
    //add product event
    document.getElementById("btn-add-product").addEventListener("click", () => {
      const form = document.getElementById("productForm");
      // clear edit  product id
      delete form.dataset.editProductId;
      form.reset();
      document.getElementById("productModalLabel").textContent = "Add product";
      
      document.getElementById("qty-input-container").classList.remove("d-none");
      document.getElementById("product-qty").required = true;
      
      const displayContainer = document.getElementById("qty-display-container");
      displayContainer.classList.add("d-none");
      displayContainer.textContent = "";

      const qtyHelp = document.getElementById("qty-help");
      if(qtyHelp) qtyHelp.classList.add("d-none");
      
      const qtyAsterisk = document.getElementById("qty-asterisk");
      if(qtyAsterisk) qtyAsterisk.classList.remove("d-none");

      // hide error
      document.getElementById("productFormError").classList.add("d-none");
    });

    //search product event
    document
      .getElementById("product-search")
      ?.addEventListener("input", (e) => {
        const searchTerm = e.target.value.trim().toUpperCase();
        const products = this.products || [];

        // filter products by name,sku,category
        const filteredProducts = products.filter(
          (p) =>
            p.name.toUpperCase().includes(searchTerm) ||
            p.sku.toUpperCase().includes(searchTerm) ||
            p.category.toUpperCase().includes(searchTerm),
        );

        // updatethe tbody
        document.getElementById("products-tbody").innerHTML =
          this.renderRows(filteredProducts);
      });
  }
  /******************************************************************************************************************* */
  async render(container) {
    this.container = container; // save it
    document.getElementById("page-title").innerText = "Products";
    container.innerHTML = `
        <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
        <div class="spinner-border text-primary" role="status"></div>
      </div>    
    `;
    this.loadData(container);
  }

  async loadData(container) {
    try {
      const [products, categories,suppliers] = await Promise.all([
        this.productService.getAll(),
        this.categoryService.getAll(),
        SupplierService.getAll(),
      ]);
      this.products = products; // Cache for search
      this.categories = categories;
      this.suppliers = suppliers;

      container.innerHTML = this.template(products, categories,suppliers); // add suppliers
      this.attachEvents();
    } catch (err) {
      console.error(err);
      container.innerHTML = `<div class="alert alert-danger m-4">Error loading data: ${err.message}</div>`;
    }
  }
}
