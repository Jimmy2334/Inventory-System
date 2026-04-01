import { StorageManager } from "../utils/StorageManager.js";
import { Validator } from "../utils/Validator.js";
import { ActivityLogService } from "../services/ActivityLogService.js";
export class ProductService {
  /************** getAll methoud***********/
  async getAll() {
    const [products, categories, suppliers] = await Promise.all([
      StorageManager.getAll("products"),
      StorageManager.getAll("categories"),
      StorageManager.getAll("suppliers"),
    ]);

    return products.map((product) => {
      const category = categories.find((c) => c.id === product.categoryId);
      const supplier = suppliers.find((s) => s.id === product.supplierId);

      return {
        ...product,
        category: category?.name || null,
        supplier: supplier?.name || null,
      };
    });
  }

  /**************add product methoud***********/
  async add(product) {
    //  validate inputs
    if (!product.name) throw new Error("Name is required");
    if (!product.sku) throw new Error("SKU is required");
    if (!product.categoryId) throw new Error("Category is required");
    if (!product.supplierId) throw new Error("Supplier is required");
    if (isNaN(product.price) || product.price <= 0)
      throw new Error("Price must be a positive number");
    if (isNaN(product.quantity) || product.quantity < 0)
      throw new Error("Quantity must be 0 or more");
    if (isNaN(product.reorder) || product.reorder < 0)
      throw new Error("Reorder point must be 0 or more");

    //getAll products
    const products = await this.getAll();

    //check unique sku
    if (!Validator.isUniqueSKU(product.sku, products)) {
      throw new Error("Duplicate SKU in Products");
    }

    //add id to product
    product.id = crypto.randomUUID();

    //create product in API
    await StorageManager.create("products", product);

    //save the activity
    await ActivityLogService.log(
      "product added",
      `Added product: ${product.name}`,
    );
  }

  /**************delete product methoud***********/
  async delete(productId) {
    let product;
    try {
      product = await StorageManager.getById("products", productId);
    } catch (err) {
      throw new Error("Product not found");
    }

    //delete product
    await StorageManager.delete("products", productId);

    //save the activity
    await ActivityLogService.log(
      "product deleted",
      `Deleted product: ${product.name}`,
    );
  }

  /**************edit product methoud***********/
  async edit(productId, updatedData) {
    //validate inputs
    if (!updatedData.name) throw new Error("Name is required");
    if (!updatedData.sku) throw new Error("SKU is required");
    if (!updatedData.categoryId) throw new Error("Category is required");
    if (!updatedData.supplierId) throw new Error("Supplier is required");
    if (isNaN(updatedData.price) || updatedData.price <= 0)
      throw new Error("Price must be a positive number");
    if (isNaN(updatedData.reorder) || updatedData.reorder < 0)
      throw new Error("Reorder point must be 0 or more");

    let product;
    try {
      product = await StorageManager.getById("products", productId);
    } catch (err) {
      throw new Error("Product not found");
    }

    // check unique sku if changed
    if (updatedData.sku && updatedData.sku !== product.sku) {
      const duplicates = await StorageManager.getWhere("products", {
        sku: updatedData.sku,
      });

      const isDuplicate = duplicates.some((d) => d.id !== productId);

      if (isDuplicate) {
        throw new Error("Duplicate SKU in Products");
      }
    }

    //update via patch
    await StorageManager.patch("products", productId, updatedData);

    //save the activity
    const newName = updatedData.name || product.name;
    await ActivityLogService.log(
      "product edited",
      `Edited product: ${newName}`,
    );
  }
}
