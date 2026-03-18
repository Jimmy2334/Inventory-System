const SidebarModule = {
  init() {
    this.attachEventListeners();
  },

  attachEventListeners() {
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", (e) => this.handleNavClick(e));
    });

    document.querySelector(".btn-logout")?.addEventListener("click", () => {
      if (confirm("Logout?")) {
        console.log("Logged out");
      }
    });
  },

  handleNavClick(e) {
    e.preventDefault();
    const link = e.currentTarget;
    const pageName = link.dataset.page;

    document.querySelectorAll(".nav-link").forEach((l) => {
      l.classList.remove("active");
    });
    link.classList.add("active");

    document.querySelectorAll(".page").forEach((page) => {
      page.style.display = "none";
    });

    const page = document.getElementById(`page-${pageName}`);
    if (page) {
      page.style.display = "block";
    }
  },
};

document.addEventListener("DOMContentLoaded", () => {
  SidebarModule.init();
});
