/* ============================================
   SIDEBAR JAVASCRIPT
   Add this to your js/modules/sidebar.js
   or add to your app.js file
   ============================================ */

const SidebarModule = {
    // ===== STATE =====
    state: {
        isOpen: window.innerWidth > 991,
        activeDropdown: null,
    },

    // ===== INITIALIZATION =====
    init() {
        this.cacheDOM();
        this.attachEventListeners();
        this.setInitialState();
        this.handleResponsive();
    },

    // ===== CACHE DOM ELEMENTS =====
    cacheDOM() {
        this.sidebar = document.getElementById('sidebar');
        this.sidebarOverlay = document.getElementById('sidebarOverlay');
        this.closeSidebarBtn = document.getElementById('closeSidebarBtn');
        this.mobileMenuBtn = document.getElementById('mobileMenuBtn');
        this.logoutBtn = document.getElementById('logoutBtn');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.navDropdowns = document.querySelectorAll('.nav-dropdown');
        this.dropdownLinks = document.querySelectorAll('.dropdown-link');
    },

    // ===== EVENT LISTENERS =====
    attachEventListeners() {
        // Mobile menu button (from navbar)
        if (this.mobileMenuBtn) {
            this.mobileMenuBtn.addEventListener('click', () => this.toggleSidebar());
        }

        // Close sidebar button
        if (this.closeSidebarBtn) {
            this.closeSidebarBtn.addEventListener('click', () => this.closeSidebar());
        }

        // Overlay click to close
        if (this.sidebarOverlay) {
            this.sidebarOverlay.addEventListener('click', () => this.closeSidebar());
        }

        // Logout button
        if (this.logoutBtn) {
            this.logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Navigation links
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavClick(e));
        });

        // Dropdown toggles
        this.navDropdowns.forEach(dropdown => {
            dropdown.addEventListener('click', (e) => this.handleDropdownToggle(e));
        });

        // Dropdown links
        this.dropdownLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleDropdownLinkClick(e));
        });

        // Window resize
        window.addEventListener('resize', () => this.handleWindowResize());

        // Close sidebar when clicking outside (on mobile)
        document.addEventListener('click', (e) => this.handleOutsideClick(e));
    },

    // ===== SIDEBAR TOGGLE =====
    toggleSidebar() {
        if (this.state.isOpen) {
            this.closeSidebar();
        } else {
            this.openSidebar();
        }
    },

    openSidebar() {
        if (window.innerWidth <= 991) {
            this.sidebar.classList.add('show');
            this.sidebarOverlay.classList.add('show');
            this.state.isOpen = true;
            document.body.style.overflow = 'hidden';
        }
    },

    closeSidebar() {
        this.sidebar.classList.remove('show');
        this.sidebarOverlay.classList.remove('show');
        this.state.isOpen = false;
        document.body.style.overflow = '';
    },

    // ===== NAVIGATION HANDLING =====
    handleNavClick(e) {
        const link = e.currentTarget;
        const page = link.dataset.page;

        // Skip if it's a dropdown
        if (link.classList.contains('nav-dropdown')) {
            return;
        }

        // Update active state
        this.setActiveNavLink(link);

        // Load page (you'll implement this function later)
        if (window.UIModule && window.UIModule.loadPage) {
            window.UIModule.loadPage(page);
        }

        // Close sidebar on mobile
        if (window.innerWidth <= 991) {
            this.closeSidebar();
        }
    },

    // ===== DROPDOWN HANDLING =====
    handleDropdownToggle(e) {
        e.preventDefault();
        const dropdown = e.currentTarget;
        const isExpanded = dropdown.getAttribute('aria-expanded') === 'true';

        // Close other dropdowns
        this.navDropdowns.forEach(d => {
            if (d !== dropdown) {
                d.setAttribute('aria-expanded', 'false');
            }
        });

        // Toggle this dropdown
        dropdown.setAttribute('aria-expanded', !isExpanded);
        this.state.activeDropdown = !isExpanded ? dropdown : null;
    },

    handleDropdownLinkClick(e) {
        const link = e.currentTarget;
        const page = link.dataset.page;

        // Update active state
        this.setActiveDropdownLink(link);

        // Load page
        if (window.UIModule && window.UIModule.loadPage) {
            window.UIModule.loadPage(page);
        }

        // Close sidebar on mobile
        if (window.innerWidth <= 991) {
            this.closeSidebar();
        }
    },

    // ===== ACTIVE STATE MANAGEMENT =====
    setActiveNavLink(link) {
        // Remove active from all nav links
        this.navLinks.forEach(l => {
            if (!l.classList.contains('nav-dropdown')) {
                l.classList.remove('active');
            }
        });

        // Add active to clicked link
        link.classList.add('active');
    },

    setActiveDropdownLink(link) {
        // Remove active from all dropdown links
        this.dropdownLinks.forEach(l => l.classList.remove('active'));

        // Add active to clicked link
        link.classList.add('active');
    },

    setActivePageByName(pageName) {
        // Find and activate the correct nav link
        this.navLinks.forEach(link => {
            const page = link.dataset.page;
            if (page === pageName) {
                this.setActiveNavLink(link);
            }
        });

        // Find and activate dropdown links
        this.dropdownLinks.forEach(link => {
            const page = link.dataset.page;
            if (page === pageName) {
                this.setActiveDropdownLink(link);
            }
        });
    },

    // ===== LOGOUT =====
    handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            // Clear any user data if needed
            console.log('User logged out');
            // Redirect to login page (implement based on your needs)
            // window.location.href = '/login';
            alert('Logged out successfully!');
        }
    },

    // ===== RESPONSIVE HANDLING =====
    handleWindowResize() {
        const width = window.innerWidth;

        if (width > 991) {
            // Desktop - keep sidebar visible
            this.sidebar.classList.remove('show');
            this.sidebarOverlay.classList.remove('show');
            this.state.isOpen = true;
            document.body.style.overflow = '';
        } else {
            // Mobile/Tablet - hide sidebar
            this.closeSidebar();
        }
    },

    handleOutsideClick(e) {
        // Close sidebar if clicking outside on mobile
        if (window.innerWidth <= 991) {
            const clickedOnSidebar = this.sidebar.contains(e.target);
            const clickedOnMenuBtn = this.mobileMenuBtn && this.mobileMenuBtn.contains(e.target);
            const clickedOnOverlay = this.sidebarOverlay.contains(e.target);

            if (!clickedOnSidebar && !clickedOnMenuBtn && !clickedOnOverlay) {
                // Don't close, let the overlay handle it
            }
        }
    },

    // ===== INITIAL STATE =====
    setInitialState() {
        if (window.innerWidth <= 991) {
            this.closeSidebar();
        } else {
            this.state.isOpen = true;
        }
    },

    // ===== UTILITY FUNCTIONS =====
    
    // Add notification badge to nav link
    addBadge(pageName, count = 1) {
        const link = Array.from(this.navLinks).find(l => l.dataset.page === pageName);
        if (link) {
            const badge = link.querySelector('.nav-badge');
            if (badge) {
                badge.textContent = count;
                badge.classList.add('show');
            }
        }
    },

    // Remove notification badge
    removeBadge(pageName) {
        const link = Array.from(this.navLinks).find(l => l.dataset.page === pageName);
        if (link) {
            const badge = link.querySelector('.nav-badge');
            if (badge) {
                badge.classList.remove('show');
                badge.textContent = '';
            }
        }
    },

    // Enable/disable nav link
    setNavLinkDisabled(pageName, disabled = true) {
        const link = Array.from(this.navLinks).find(l => l.dataset.page === pageName);
        if (link) {
            if (disabled) {
                link.classList.add('disabled');
                link.style.pointerEvents = 'none';
                link.style.opacity = '0.5';
            } else {
                link.classList.remove('disabled');
                link.style.pointerEvents = 'auto';
                link.style.opacity = '1';
            }
        }
    },

    // Show loading state on nav link
    setNavLinkLoading(pageName, loading = true) {
        const link = Array.from(this.navLinks).find(l => l.dataset.page === pageName);
        if (link) {
            if (loading) {
                link.classList.add('loading');
            } else {
                link.classList.remove('loading');
            }
        }
    },

    // Collapse specific dropdown
    collapseDropdown(dropdownElement) {
        if (dropdownElement) {
            dropdownElement.setAttribute('aria-expanded', 'false');
        }
    },

    // Expand specific dropdown
    expandDropdown(dropdownElement) {
        if (dropdownElement) {
            dropdownElement.setAttribute('aria-expanded', 'true');
        }
    },

    // Collapse all dropdowns
    collapseAllDropdowns() {
        this.navDropdowns.forEach(dropdown => {
            dropdown.setAttribute('aria-expanded', 'false');
        });
    },

    // Get current active page
    getActivePage() {
        const activeLink = document.querySelector('.nav-link.active');
        return activeLink ? activeLink.dataset.page : null;
    },

    // Navigate to page programmatically
    navigateToPage(pageName) {
        const link = Array.from(this.navLinks).concat(Array.from(this.dropdownLinks))
            .find(l => l.dataset.page === pageName);
        
        if (link) {
            link.click();
        }
    }
};

// Initialize sidebar when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    SidebarModule.init();
});

// Export for use in other modules
window.SidebarModule = SidebarModule;
