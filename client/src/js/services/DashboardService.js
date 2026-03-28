import { StorageManager } from "../utils/StorageManager.js";

export class DashboardService {
  static async getDashboardData() {
    const [products, orders, activityLog] = await Promise.all([
      StorageManager.getAll("products"),
      StorageManager.getAll("orders").catch(() => []),
      StorageManager.getAll("activity_log").catch(() => []),
    ]);

    const lowStockItems = products
      .map((p) => {
        const qty = p.quantity || 0;
        const limit = p.reorder || 10;
        let status = "Adequate";
        if (qty === limit) status = "At limit";
        if (qty < limit) status = "Low";
        return { ...p, currentQty: qty, status };
      })
      .filter((p) => p.status !== "Adequate");

    const pendingOrders = orders.filter((o) => o.status === "pending").length;

    const totalValue = products.reduce((sum, p) => {
      return sum + (p.quantity || 0) * (p.price || 0);
    }, 0);

    return {
      metrics: {
        totalProducts: products.length,
        lowStockCount: lowStockItems.length,
        pendingOrders,
        totalValue: totalValue.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      },
      lowStockItems: lowStockItems.slice(0, 5),
      recentActivity: activityLog.slice(-5).reverse(),
    };
  }
}
