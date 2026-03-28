import { StorageManager } from "../utils/StorageManager.js";
import { ActivityLogService } from "./ActivityLogService.js";
export class InventoryService {
  async adjustStock(productId, type, quantity, reason, productName,productSku) {
    try {
      let product = await StorageManager.getById("products", productId);
      if (!product) {
        throw new Error("Product not found");
      }
      let response = await StorageManager.create("adjustments", {
        id: crypto.randomUUID(),
        productId,
        productName: product.name,
        productSku,
        type,
        quantity,
        reason,
        date: new Date().toISOString(),
      });
      if (response) {
        let newQty =
          product.quantity + (type === "increase" ? quantity : -quantity);
        try {
          await StorageManager.update("products", productId, {
            ...product,
            quantity: newQty,
          });
        } catch (err) {
          // Rollback adjustment if product update fails
          await StorageManager.delete("adjustments", response.id);
          throw new Error(
            "Failed to update product stock. Adjustment rolled back.",
          );
        }
      }
    } catch (error) {
      throw new Error("Failed to adjust stock. Please try again.");
    }
    ActivityLogService.log('stock adjustment',
      `Adjusted stock for product ${productName}: ${type} ${quantity}. Reason: ${reason}`,
    );
  }
  async getAdjustmentHistory() {
    let products = await StorageManager.getAll("products");
    let adjustments = await StorageManager.getAll("adjustments");
    return adjustments
      .map((adj) => {
        let product = products.find((p) => p.id === adj.productId);
        return {
          ...adj,
          productName: product ? product.name : "Unknown Product",
        };
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }
}
