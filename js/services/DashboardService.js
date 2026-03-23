import { StorageManager } from "../utils/StorageManager.js";

export class DashboardService {
  static getDashboardData() {
    const products = StorageManager.get("products") ?? [];
    const inventory = StorageManager.get("inventory") ?? [];
    const orders = StorageManager.get("orders") ?? [];
    const activityLog = StorageManager.get("activity_log") ?? [];

    const totalProducts = products.length;

    // logic to find and categorize low stock
    const lowStockItems = products
      .map((p) => {
        const inv = inventory.find((i) => i.productId === p.id);
        const qty = inv ? inv.quantity : 0;
        const limit = p.reorderLevel || 10;

        let status = "Adequate";
        if (qty === limit) status = "At limit";
        if (qty < limit) status = "Low";

        return { ...p, currentQty: qty, status };
      })
      .filter((p) => p.status !== "Adequate");

    const pendingOrders = orders.filter((o) => o.status === "pending").length;

    const totalValue = products.reduce((sum, p) => {
      const inv = inventory.find((i) => i.productId === p.id);
      const qty = inv ? inv.quantity : 0;
      return sum + qty * (p.price || 0);
    }, 0);

    return {
      metrics: {
        totalProducts,
        lowStockCount: lowStockItems.length,
        pendingOrders,
        totalValue: totalValue.toLocaleString("en-US", {
          minimumFractionDigits: 2,
        }),
      },
      lowStockItems: lowStockItems.slice(0, 5),
      recentActivity: activityLog.slice(-5).reverse(),
    };
  }
}
