import { StorageManager } from "./StorageManager.js";


export async function updateLowStockBadge() {
  try {
    const products = await StorageManager.getAll("products");
    const count = products.filter((p) => p.quantity <= p.reorder).length;
    const badge = document.getElementById("low-stock-badge");
    if (!badge) return;

    if (count > 0) {
      badge.textContent = count;
      badge.classList.remove("d-none");
    } else {
      badge.classList.add("d-none");
    }
  } catch {
    // Server unreachable — silently hide badge
    document.getElementById("low-stock-badge")?.classList.add("d-none");
  }
}
