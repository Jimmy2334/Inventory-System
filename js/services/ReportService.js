import { StorageManager } from "../utils/StorageManager.js";
import { ActivityLogService } from "./ActivityLogService.js";

export class ReportService {
  // ────────────────────────────────────────────────────────
  // GET ALL REPORTS
  // ────────────────────────────────────────────────────────
  static getReports() {
    // Using your StorageManager instead of raw localStorage for consistency
    const products = StorageManager.get("products") ?? [];
    const orders = StorageManager.get("orders") ?? [];
    const suppliers = StorageManager.get("suppliers") ?? [];
    const inventory = StorageManager.get("inventory") ?? [];

    return {
      inventory: this.getInventoryReport(products, inventory),
      lowStock: this.getLowStockReport(products, inventory, suppliers),
      orders: this.getOrdersReport(orders),
      suppliers: this.getSuppliersReport(suppliers),
      summary: this.getSummaryMetrics(products, orders, suppliers, inventory),
    };
  }

  // ────────────────────────────────────────────────────────
  // INVENTORY REPORT
  // ────────────────────────────────────────────────────────
  static getInventoryReport(products, inventory) {
    return products.map((product) => {
      // Fallback: Check if quantity is in a separate 'inventory' array
      // OR directly on the product object (as seen in app.js)
      const invRecord = inventory.find((i) => i.productId === product.id);
      const quantity = invRecord
        ? invRecord.quantity || 0
        : product.quantity || 0;

      const unitPrice = product.price || product.unitPrice || 0;
      const totalValue = quantity * unitPrice;

      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        quantity: quantity,
        unitPrice: unitPrice,
        totalValue: totalValue,
        category: product.category || "Uncategorized",
        lastUpdated: invRecord?.lastUpdated || new Date().toISOString(),
      };
    });
  }

  // ────────────────────────────────────────────────────────
  // LOW STOCK REPORT
  // ────────────────────────────────────────────────────────
  static getLowStockReport(products, inventory, suppliers) {
    return products
      .map((product) => {
        const invRecord = inventory.find((i) => i.productId === product.id);
        const currentQty = invRecord
          ? invRecord.quantity || 0
          : product.quantity || 0;
        const limit = product.reorderLevel || 10;

        // Find supplier name for the UI table
        const supplier = suppliers.find((s) => s.id === product.supplierId);

        return {
          id: product.id,
          name: product.name,
          sku: product.sku,
          currentQuantity: currentQty,
          reorderLevel: limit,
          supplier: supplier ? supplier.name : "Unassigned",
          status: currentQty <= limit ? "Low Stock" : "Adequate",
        };
      })
      .filter((item) => item.status === "Low Stock")
      .sort((a, b) => a.currentQuantity - b.currentQuantity);
  }

  // ────────────────────────────────────────────────────────
  // SUMMARY METRICS
  // ────────────────────────────────────────────────────────
  static getSummaryMetrics(products, orders, suppliers, inventory) {
    const reportData = this.getInventoryReport(products, inventory);

    const totalValue = reportData.reduce(
      (sum, item) => sum + item.totalValue,
      0,
    );
    const totalItems = reportData.reduce((sum, item) => sum + item.quantity, 0);

    return {
      totalProducts: products.length,
      totalInventoryValue: totalValue,
      totalInventoryItems: totalItems,
      totalSuppliers: suppliers.length,
      totalOrders: orders.length,
      avgOrderValue:
        orders.length > 0
          ? orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0) /
            orders.length
          : 0,
      outOfStock: reportData.filter((item) => item.quantity <= 0).length,
    };
  }

  // ────────────────────────────────────────────────────────
  // ORDERS & EXPORT LOGIC (Kept from your original)
  // ────────────────────────────────────────────────────────
  static getOrdersReport(orders) {
    return {
      totalOrders: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      completed: orders.filter((o) => o.status === "completed").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
      byStatus: [
        {
          status: "Pending",
          count: orders.filter((o) => o.status === "pending").length,
        },
        {
          status: "Completed",
          count: orders.filter((o) => o.status === "completed").length,
        },
        {
          status: "Cancelled",
          count: orders.filter((o) => o.status === "cancelled").length,
        },
      ],
    };
  }

  static getSuppliersReport(suppliers) {
    const orders = StorageManager.get("orders") ?? [];
    return suppliers.map((supplier) => {
      const suppliedOrders = orders.filter((o) => o.supplierId === supplier.id);
      return {
        id: supplier.id,
        name: supplier.name,
        contact: supplier.contact,
        email: supplier.email,
        totalOrders: suppliedOrders.length,
        rating: supplier.rating || 4.5,
      };
    });
  }

  static exportReport(reportType) {
    const reports = this.getReports();
    const data = reports[reportType] || [];
    if (typeof ActivityLogService !== "undefined") {
      ActivityLogService.log("REPORT_EXPORT", `Exported ${reportType} report`, {
        reportType,
      });
    }
    return data;
  }
}
