import { StorageManager } from "../utils/StorageManager.js";
import { Validator } from "../utils/Validator.js";
import { ActivityLogService } from "../services/ActivityLogService.js";
export class ProductService {
  /************** getAll methoud***********/
  getAll() {
    return StorageManager.get("products") ?? [];
  }

  /**************add product methoud***********/
  add(product) {
    //getAll products
    const products = this.getAll();

    //check unique sku
    if (!Validator.isUniqueSKU(product.sku, products)) {
      throw new Error("Duplicate SKU in Products");
    }

    //add id to product
    product.id = crypto.randomUUID();

    //push product
    products.push(product);

    //add the product array to the local storage
    StorageManager.set("products", products);

    //save the activity
    ActivityLogService.log(`Added product: ${product.name}`);
  }

  /**************delete product methoud***********/
  delete(productId) {
    //getAll products
    const products = this.getAll();
    //get the product i want to delete
    const product = products.find((product) => product.id === productId);
    if (!product) throw new Error("Product not found");
    //delete product from array
    const updatedProducts = products.filter(
      (product) => product.id !== productId,
    );
    //update the local storage
    StorageManager.set("products", updatedProducts);
    //save the activity
    ActivityLogService.log(`Deleted product: ${product.name}`);
  }

  /**************edit product methoud***********/
  edit(productId, updatedData) {
    //getAll products
    const products = this.getAll();
    //get the product i want to delete
    const product = products.find((product) => product.id === productId);
    if (!product) throw new Error("Product not found");
    //edit product from array
    Object.assign(product, updatedData);
    //update the local storage
    StorageManager.set("products", products);
    //save the activity
    ActivityLogService.log(`Edited product: ${product.name}`);
  }
}
