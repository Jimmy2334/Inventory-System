import { StorageManager } from "../utils/StorageManager.js";

export class ReportService {
  async _getEnrichedProducts() {
    const [products, categories,suppliers] = await Promise.all([
      StorageManager.getAll("products"),
      StorageManager.getAll("categories"),
      StorageManager.getAll("suppliers"),
    ]);

    return products.map((product) => {
      const category = categories.find((c) => c.id === product.categoryId);
      const supplier = suppliers.find((s) => s.id === product.supplierId);
      return {
        ...product,
        categoryName: category ? category.name : "General",
        supplierName: supplier ? supplier.name : "Unknown",
      };
    });
  }

  async getLowStockData() {
    const products = await this._getEnrichedProducts();
    return products.filter((p) => p.quantity <= (p.reorder || 10));
  }

  async getInventoryValueData() {
    const products = await this._getEnrichedProducts();
    const items = products.map((p) => ({
      ...p,
      stockValue: (p.price || 0) * (p.quantity || 0),
    }));
    const total = items.reduce((sum, item) => sum + item.stockValue, 0);
    return { items, total };
  }
}
