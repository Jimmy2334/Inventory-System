/* ============================================
   UI MODULE - Page Navigation & Dashboard
   ============================================ */

const UIModule = {
  // ===== INITIALIZATION =====
  init() {
    this.attachPageEvents();
    console.log("UIModule initialized");
  },

  // ===== PAGE LOADING =====
  loadPage(pageName) {
    console.log("Loading page:", pageName);

    // Hide all pages
    document.querySelectorAll(".page").forEach((page) => {
      page.style.display = "none";
    });

    // Show selected page
    const page = document.getElementById(`page-${pageName}`);
    if (page) {
      page.style.display = "block";
      console.log("Page loaded:", pageName);
    } else {
      console.warn("Page not found:", `page-${pageName}`);
    }

    // Update sidebar active state if sidebar exists
    if (window.SidebarModule && SidebarModule.setActivePageByName) {
      SidebarModule.setActivePageByName(pageName);
    }
  },

  attachPageEvents() {
    // Add any page-specific event listeners here
    // This will be expanded as you add more pages
  },

  // ===== RENDER DASHBOARD =====
  renderDashboard() {
    console.log("Rendering dashboard");
    // Add dashboard rendering here later
  },
};

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  UIModule.init();
});

// Export for use in other modules
window.UIModule = UIModule;
