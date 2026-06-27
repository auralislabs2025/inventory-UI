/* InventoryPro — Shared App Shell
   Injects the glass sidebar + topbar into every dashboard page.
   Pages opt in by setting on <body>:
     data-page="dashboard|inventory|orders|fleet|retailers|reports|settings"
     data-title="Page Title"
*/
(function () {
  "use strict";

  var NAV = [
    {
      section: "Menu",
      items: [
        { page: "dashboard",   href: "index.html",       icon: "⌂",  label: "Dashboard" },
        { page: "marketspace", href: "marketspace.html",  icon: "🏪", label: "Market Space" },
        { page: "inventory",   href: "inventory.html",    icon: "▦",  label: "Inventory" }
      ]
    },
    {
      section: "Procurement",
      items: [
        { page: "cart",      href: "cart.html",      icon: "🛒", label: "My Cart" },
        { page: "orders",    href: "orders.html",    icon: "⌘",  label: "My Orders" },
        { page: "invoices",  href: "invoices.html",  icon: "🧾", label: "Invoices" },
        { page: "quotes",    href: "quotes.html",    icon: "💬", label: "Active Quotes" },
        { page: "purchases", href: "purchases.html", icon: "📥", label: "Purchases" },
        { page: "suppliers", href: "suppliers.html", icon: "🏭", label: "Suppliers" }
      ]
    },
    {
      section: "Account",
      items: [
        { page: "reports",  href: "reports.html",  icon: "◔", label: "Reports" },
        { page: "settings", href: "settings.html", icon: "⚙", label: "Settings" }
      ]
    }
  ];

  var currentPage = document.body.getAttribute("data-page") || "";
  var pageTitle = document.body.getAttribute("data-title") || document.title;

  /* ---------- Current user (from login/signup, with a sensible default) ---------- */
  function getUser() {
    try {
      var u = JSON.parse(localStorage.getItem("user"));
      if (u && (u.name || u.username)) return u;
    } catch (e) {}
    return { name: "Retailer Admin", username: "admin@inventory.pro", role: "retailer" };
  }
  function initials(name) {
    return (name || "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(function (w) { return w[0].toUpperCase(); })
      .join("") || "WA";
  }

  var user = getUser();
  var displayName = user.name || (user.username && user.username.indexOf("@") === -1 ? user.username : null) || "Retailer Admin";
  var displayEmail = (user.email) || (user.username && user.username.indexOf("@") > -1 ? user.username : null) || "admin@inventory.pro";

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------- Sidebar ---------- */
  function buildSidebar() {
    var html = "";
    html += '<div class="brand">' +
              '<div class="brand-mark">IP</div>' +
              '<div><h2>InventoryPro</h2><small>Retailer Suite</small></div>' +
            '</div>';

    NAV.forEach(function (group) {
      html += '<div class="nav-section">' + esc(group.section) + '</div>';
      html += '<ul class="nav">';
      group.items.forEach(function (item) {
        var liClass = item.page === currentPage ? ' class="active"' : "";
        html += '<li' + liClass + '>' +
                  '<a href="' + item.href + '">' +
                    '<span class="icon">' + item.icon + '</span>' + esc(item.label) +
                  '</a>' +
                '</li>';
      });
      html += '</ul>';
    });

    html += '<div class="sidebar-footer">' +
              '<div class="avatar">' + esc(initials(displayName)) + '</div>' +
              '<div class="meta"><b>' + esc(displayName) + '</b><span>' + esc(displayEmail) + '</span></div>' +
              '<button class="icon-btn" id="shellLogoutSidebar" title="Sign out" aria-label="Sign out" style="margin-left:auto">⏻</button>' +
            '</div>';
    return html;
  }

  /* ---------- Topbar ---------- */
  function buildTopbar() {
    var section = "Overview";
    NAV.forEach(function (g) {
      g.items.forEach(function (i) { if (i.page === currentPage) section = g.section; });
    });

    var html = "";
    html += '<button class="icon-btn" id="menuToggle" aria-label="Toggle navigation" title="Menu">☰</button>';
    html += '<div class="topbar-titles">' +
              '<div class="crumbs"><b>InventoryPro</b> / ' + esc(section) + '</div>' +
              '<h1>' + esc(pageTitle) + '</h1>' +
            '</div>';
    html += '<div class="topbar-actions">' +
              '<div class="search-wrap"><input class="search" id="globalSearch" placeholder="Quick search…" /></div>' +
              '<button class="icon-btn" title="Notifications" aria-label="Notifications">🔔</button>' +
              '<div class="user-menu">' +
                '<button class="avatar avatar-btn" id="userMenuBtn" aria-label="Account menu">' + esc(initials(displayName)) + '</button>' +
                '<div class="user-dropdown" id="userDropdown">' +
                  '<div class="user-dropdown-head"><b>' + esc(displayName) + '</b><span>' + esc(displayEmail) + '</span></div>' +
                  '<a href="settings.html"><span class="icon">⚙</span>Settings</a>' +
                  '<a href="#" id="shellLogoutMenu"><span class="icon">⏻</span>Sign out</a>' +
                '</div>' +
              '</div>' +
            '</div>';
    return html;
  }

  /* ---------- Mount + wire up ---------- */
  function logout() {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    location.href = "../../login/desktop/login.html";
  }

  function init() {
    var app = document.querySelector(".app");
    var main = document.querySelector(".main");
    if (!app || !main) return;

    var sidebar = document.createElement("aside");
    sidebar.className = "sidebar";
    sidebar.innerHTML = buildSidebar();
    app.insertBefore(sidebar, app.firstChild);

    var topbar = document.createElement("div");
    topbar.className = "topbar";
    topbar.innerHTML = buildTopbar();
    main.insertBefore(topbar, main.firstChild);

    // Sign out (sidebar + dropdown)
    var lb1 = document.getElementById("shellLogoutSidebar");
    var lb2 = document.getElementById("shellLogoutMenu");
    if (lb1) lb1.addEventListener("click", logout);
    if (lb2) lb2.addEventListener("click", function (e) { e.preventDefault(); logout(); });

    // Account dropdown
    var userBtn = document.getElementById("userMenuBtn");
    var dropdown = document.getElementById("userDropdown");
    if (userBtn && dropdown) {
      userBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        dropdown.classList.toggle("open");
      });
      document.addEventListener("click", function () {
        dropdown.classList.remove("open");
      });
    }

    // Mobile sidebar toggle
    var menuToggle = document.getElementById("menuToggle");
    if (menuToggle) {
      menuToggle.addEventListener("click", function (e) {
        e.stopPropagation();
        app.classList.toggle("sidebar-open");
      });
    }
    app.addEventListener("click", function (e) {
      if (!app.classList.contains("sidebar-open")) return;
      if (sidebar.contains(e.target) || (menuToggle && menuToggle.contains(e.target))) return;
      app.classList.remove("sidebar-open");
    });

    // Quick search → jump to a page's own search box if it exists
    var globalSearch = document.getElementById("globalSearch");
    var pageSearch = document.getElementById("searchInput");
    if (globalSearch && pageSearch) {
      globalSearch.addEventListener("input", function () {
        pageSearch.value = globalSearch.value;
        pageSearch.dispatchEvent(new Event("input"));
        pageSearch.dispatchEvent(new Event("keyup"));
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
