// js/router.js

export class Router {

  /**
   * @param {Object} routes   - map of '#/hash' → ViewClass
   * @param {Function} fallback - ViewClass to use when hash matches nothing
   */
  constructor(routes, fallback) {
    this.routes    = routes;
    this.fallback  = fallback;
    this.container = document.getElementById('content');
  }

  // ── Call once at boot ────────────────────────────────────────────
  init() {
    // Handle back/forward and manual hash changes
    window.addEventListener('hashchange', () => this._handleRoute());

    // Handle the very first load (page open / refresh)
    window.addEventListener('load', () => this._handleRoute());
  }

  // ── Core routing logic ───────────────────────────────────────────
  _handleRoute() {
    // Normalize: strip query strings, default to dashboard
    const hash = location.hash || '#/dashboard';

    // Look up the view — fall back to DashboardView if unknown hash
    const ViewClass = this.routes[hash] ?? this.fallback;

    // Highlight the correct sidebar link
    this._setActiveLink(hash);

    // Instantiate and render — each render() call replaces #content
    const view = new ViewClass();
    view.render(this.container);
  }

  // ── Sidebar active state ─────────────────────────────────────────
  // Matches '#/adjustments' → data-section="adjustments"
  // Works for every link in the sidebar without touching hrefs
  _setActiveLink(hash) {
    // '#/adjustments' → 'adjustments'
    const section = hash.replace('#/', '');

    document.querySelectorAll('#sidebar .nav-link').forEach(link => {
      const linkSection = link.getAttribute('data-section');
      link.classList.toggle('active', linkSection === section);
    });
  }

  // ── Programmatic navigation ──────────────────────────────────────
  // Any view can call Router.navigateTo('#/products') without
  // holding a reference to the router instance.
  static navigateTo(hash) {
    location.hash = hash;
  }
}
