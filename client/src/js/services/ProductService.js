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
    await ActivityLogService.log(`Added product: ${product.name}`);
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
    await ActivityLogService.log(`Deleted product: ${product.name}`);
  }

  /**************edit product methoud***********/
  async edit(productId, updatedData) {
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
      // getWhere returns valid matches. If any exist (that aren't this one), duplicate.
      // Since we filtered by SKU, any result is a potential duplicate.
      // But maybe check ID just in case?
      const isDuplicate = duplicates.some((d) => d.id !== productId);

      if (isDuplicate) {
        throw new Error("Duplicate SKU in Products");
      }
    }

    //update via patch
    await StorageManager.patch("products", productId, updatedData);

    //save the activity
    const newName = updatedData.name || product.name;
    await ActivityLogService.log(`Edited product: ${newName}`);
  }
}
