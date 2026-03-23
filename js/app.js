// js/app.js
// Entry point — loaded by index.html as type="module"
// Execution order: guard → sidebar → storage → router

import { guardAuth } from "./auth/authGuard.js";
import { Router } from "./router.js";
import { StorageManager } from "./utils/StorageManager.js";

// ── View imports ─────────────────────────────────────────────────
// import { DashboardView }      from './views/DashboardView.js';
import { ProductView } from "./views/ProductView.js";
// import { CategoryView }       from './views/CategoryView.js';
// import { SupplierView }       from './views/SupplierView.js';
// import { OrderView }          from './views/OrderView.js';
import { StockAdjustView } from "./views/StockAdjustView.js";
// import { ReportsView }        from './views/ReportsView.js';
// import { ActivityLogView }    from './views/ActivityLogView.js';

// ════════════════════════════════════════════════════════════════
// 1. AUTH GUARD
//    Must run before anything else.
//    If no session → redirects to login.html and stops execution.
// ════════════════════════════════════════════════════════════════
const userName = guardAuth();

// guardAuth() already redirected if null — this just stops the
// rest of the module from executing during the redirect frame.
if (!userName) throw new Error("Redirecting to login...");

// ════════════════════════════════════════════════════════════════
// 2. SIDEBAR — inject session name + wire logout
//    Targets the IDs we placed in index.html:
//      #sidebar-username  — the name text
//      #sidebar-avatar    — the icon circle
//      #logout-btn        — the logout button
// ════════════════════════════════════════════════════════════════
function renderSidebarUser(name) {
  // Set display name
  const nameEl = document.getElementById("sidebar-username");
  if (nameEl) nameEl.textContent = name;

  // Replace generic icon with first-letter avatar
  const avatarEl = document.getElementById("sidebar-avatar");
  if (avatarEl) {
    avatarEl.innerHTML = `
      <span style="font-size:14px;font-weight:600;color:#fff;line-height:1;">
        ${name.charAt(0).toUpperCase()}
      </span>
    `;
  }

  // Wire logout — clears session and goes back to login
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      sessionStorage.clear();
      window.location.href = "login.html";
    });
  }
}

// ════════════════════════════════════════════════════════════════
// 3. SIDEBAR TOGGLE (mobile)
//    Replaces the jQuery block that was in the old HTML.
//    Creates the overlay div dynamically then wires both buttons.
// ════════════════════════════════════════════════════════════════
function initSidebarToggle() {
  // Create overlay if missing (first load)
  if (!document.getElementById("sidebar-overlay")) {
    const overlay = document.createElement("div");
    overlay.id = "sidebar-overlay";
    document.getElementById("main-area")?.prepend(overlay);
  }

  // Hamburger button opens / closes sidebar
  document.getElementById("sidebar-toggle")?.addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("show");
  });

  // Clicking the dark overlay closes sidebar
  document.getElementById("sidebar-overlay")?.addEventListener("click", () => {
    document.getElementById("sidebar").classList.remove("show");
  });
}

// ════════════════════════════════════════════════════════════════
// 4. LOCALSTORAGE SEED
//    Runs once on first ever load.
//    Every service uses ?? [] so this is a safety net,
//    but it prevents "null" errors on brand new installs.
// ════════════════════════════════════════════════════════════════
function initStorage() {
  const keys = [
    "products",
    "categories",
    "suppliers",
    "orders",
    "adjustments", // separate from activity_log
    "activity_log",
    "users",
  ];
  keys.forEach((key) => {
    if (StorageManager.get(key) === null) {
      if (key === "users") {
        StorageManager.set(key, [
          {
            id: crypto.randomUUID(),
            name: "Admin",
            username: "admin",
            password: "admin123", // In a real app, NEVER store plaintext passwords!
          },
        ]);
      } else {
        StorageManager.set(key, []);
      }
    }
  });
}

// ════════════════════════════════════════════════════════════════
// 5. LOW-STOCK BADGE
//    Reads products from storage and shows a count badge
//    on the Products sidebar link whenever qty ≤ reorderLevel.
//    Called at boot and can be called again after any adjustment.
// ════════════════════════════════════════════════════════════════
export function updateLowStockBadge() {
  const products = StorageManager.get("products") ?? [];
  const count = products.filter((p) => p.quantity <= p.reorderLevel).length;
  const badge = document.getElementById("low-stock-badge");
  if (!badge) return;

  if (count > 0) {
    badge.textContent = count;
    badge.classList.remove("d-none");
  } else {
    badge.classList.add("d-none");
  }
}

// ════════════════════════════════════════════════════════════════
// 6. ROUTE MAP
//    Hash string → View class.
//    Must match the data-section values in index.html sidebar
//    and the href="#/..." on each nav link.
// ════════════════════════════════════════════════════════════════
const routes = {
  // '#/dashboard'   : DashboardView,
  "#/products": ProductView,
  // '#/categories'  : CategoryView,
  // '#/suppliers'   : SupplierView,
  // '#/orders'      : OrderView,
  "#/adjustments": StockAdjustView,
  // '#/reports'     : ReportsView,
  // '#/log'         : ActivityLogView,
};

// ════════════════════════════════════════════════════════════════
// BOOT — everything runs in this order
// ════════════════════════════════════════════════════════════════
renderSidebarUser(userName); // name in sidebar before first render
initSidebarToggle(); // mobile hamburger
initStorage(); // seed localStorage
updateLowStockBadge(); // badge on products link

const router = new Router(routes, StockAdjustView);
router.init(); // attaches hashchange + load listeners

// If user lands on index.html with no hash, send to dashboard
if (!location.hash) {
  Router.navigateTo("#/products");
}
