/* =========================
   ROUTING SYSTEM
========================= */

let currentPage = 'dashboard';
let pageViews = {};

function navigateToPage(page) {
  // Hide all views
  Object.values(pageViews).forEach(view => {
    if (view) view.style.display = 'none';
  });
  
  // Show selected view
  if (pageViews[page]) {
    pageViews[page].style.display = 'block';
    currentPage = page;
    
    // Update page title
    const titles = {
      dashboard: "Dashboard",
      orders: "Orders",
      inventory: "Inventory",
      purchases: "Purchases",
      suppliers: "Suppliers",
      reports: "Reports",
      settings: "Settings"
    };
    document.getElementById("pageTitle").textContent = titles[page] || "Dashboard";
    
    // Update bottom bar active state
    document.querySelectorAll('.bottom-bar .action-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    const activeBtn = Array.from(document.querySelectorAll('.bottom-bar .action-btn')).find(btn => {
      const btnText = btn.textContent.toLowerCase();
      return btnText.includes(titles[page]?.toLowerCase() || '');
    });
    if (activeBtn) activeBtn.classList.add('active');
    
    // Load page-specific data
    loadPageData(page);
  }
}

function loadPageData(page) {
  switch(page) {
    case 'dashboard':
      updateDashboard();
      break;
    case 'orders':
      renderOrdersView();
      break;
    case 'inventory':
      renderInventoryView();
      break;
    case 'purchases':
      renderPurchasesView();
      break;
    case 'suppliers':
      renderSuppliersView();
      break;
    case 'reports':
      renderReportsView();
      break;
    case 'settings':
      renderSettingsView();
      break;
  }
}

/* =========================
   DASHBOARD
========================= */

function updateDashboard() {
  // Load data from localStorage
  const inventory = JSON.parse(localStorage.getItem('inventory') || '[]');
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  
  // Calculate KPIs
  const today = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter(o => o.date === today);
  const todaySales = todayOrders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
  
  const inventoryValue = inventory.reduce((sum, item) => {
    const qty = parseFloat(item.qty || item.quantity || 0);
    const cost = parseFloat(item.cost || item.price || 0);
    return sum + (qty * cost);
  }, 0);
  
  const pendingOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Shipped').length;
  
  const lowStockItems = inventory.filter(item => {
    const qty = parseFloat(item.qty || item.quantity || 0);
    const reorder = parseFloat(item.reorder || 10);
    return qty < reorder && qty > 0;
  }).length;
  
  // Update KPI cards
  document.getElementById('todaySales').textContent = '₹' + todaySales.toLocaleString('en-IN');
  document.getElementById('inventoryValue').textContent = '₹' + inventoryValue.toLocaleString('en-IN');
  document.getElementById('pendingOrders').textContent = pendingOrders;
  document.getElementById('lowStock').textContent = lowStockItems;
  
  // Update recent sales
  updateRecentSales(orders);
  
  // Update low stock alerts
  updateLowStockAlerts(inventory);
}

function updateRecentSales(orders) {
  const container = document.getElementById('recentSalesList');
  const recentOrders = orders.slice(-5).reverse();
  
  if (recentOrders.length === 0) {
    container.innerHTML = '<p style="color: var(--muted); text-align: center; padding: 20px;">No recent sales</p>';
    return;
  }
  
  container.innerHTML = recentOrders.map(order => `
    <div class="sale-item">
      <div class="sale-info">
        <strong>${order.orderId || 'Order #' + order.id}</strong>
        <span>${order.customer || 'Customer'}</span>
      </div>
      <div class="sale-amount">₹${parseFloat(order.total || 0).toLocaleString('en-IN')}</div>
    </div>
  `).join('');
}

function updateLowStockAlerts(inventory) {
  const container = document.getElementById('lowStockList');
  const lowStock = inventory.filter(item => {
    const qty = parseFloat(item.qty || item.quantity || 0);
    const reorder = parseFloat(item.reorder || 10);
    return qty < reorder && qty > 0;
  }).slice(0, 5);
  
  if (lowStock.length === 0) {
    container.innerHTML = '<p style="color: var(--muted); text-align: center; padding: 20px;">No low stock items</p>';
    return;
  }
  
  container.innerHTML = lowStock.map(item => `
    <div class="alert-item">
      <strong>${item.name || item.sku}</strong>
      <span>Stock: ${item.qty || item.quantity || 0}</span>
    </div>
  `).join('');
}

/* =========================
   ORDERS VIEW
========================= */

function renderOrdersView() {
  const container = document.getElementById('ordersSearchContainer');
  if (!container.querySelector('.search-container')) {
    createSearchInput('ordersSearchContainer', {
      placeholder: "Search orders...",
      onSearch: (term) => filterOrders(term)
    });
  }
  
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  const list = document.getElementById('ordersList');
  
  if (orders.length === 0) {
    list.innerHTML = '<p style="color: var(--muted); text-align: center; padding: 40px 20px;">No orders found</p>';
    return;
  }
  
  list.innerHTML = orders.map(order => `
    <div class="list-card">
      <div class="list-card-header">
        <div class="list-card-title">${order.orderId || 'Order #' + order.id}</div>
        <span class="badge badge-${order.status?.toLowerCase() || 'info'}">${order.status || 'Pending'}</span>
      </div>
      <div class="list-card-row">
        <span class="list-card-label">Customer</span>
        <span class="list-card-value">${order.customer || 'N/A'}</span>
      </div>
      <div class="list-card-row">
        <span class="list-card-label">Items</span>
        <span class="list-card-value">${order.items || 0}</span>
      </div>
      <div class="list-card-row">
        <span class="list-card-label">Total</span>
        <span class="list-card-value" style="color: var(--primary);">₹${parseFloat(order.total || 0).toLocaleString('en-IN')}</span>
      </div>
      <div class="list-card-row">
        <span class="list-card-label">Date</span>
        <span class="list-card-value">${order.date || 'N/A'}</span>
      </div>
    </div>
  `).join('');
}

function filterOrders(term) {
  const cards = document.querySelectorAll('#ordersList .list-card');
  cards.forEach(card => {
    const text = card.textContent.toLowerCase();
    card.style.display = text.includes(term.toLowerCase()) ? '' : 'none';
  });
}

/* =========================
   INVENTORY VIEW
========================= */

function renderInventoryView() {
  const container = document.getElementById('inventorySearchContainer');
  if (!container.querySelector('.search-container')) {
    createSearchInput('inventorySearchContainer', {
      placeholder: "Search inventory...",
      onSearch: (term) => filterInventory(term)
    });
  }
  
  const inventory = JSON.parse(localStorage.getItem('inventory') || '[]');
  const list = document.getElementById('inventoryList');
  
  if (inventory.length === 0) {
    list.innerHTML = '<p style="color: var(--muted); text-align: center; padding: 40px 20px;">No inventory items</p>';
    return;
  }
  
  list.innerHTML = inventory.map(item => {
    const qty = parseFloat(item.qty || item.quantity || 0);
    const reorder = parseFloat(item.reorder || 10);
    const isLowStock = qty < reorder && qty > 0;
    const isOutOfStock = qty === 0;
    const borderColor = isOutOfStock ? 'var(--danger)' : isLowStock ? 'var(--warning)' : 'var(--primary)';
    
    return `
    <div class="list-card" style="border-left-color: ${borderColor};">
      <div class="list-card-header">
        <div class="list-card-title">${item.name || item.sku}</div>
        ${isOutOfStock ? '<span class="badge badge-danger">Out of Stock</span>' : isLowStock ? '<span class="badge badge-warning">Low Stock</span>' : ''}
      </div>
      <div class="list-card-row">
        <span class="list-card-label">SKU</span>
        <span class="list-card-value">${item.sku || 'N/A'}</span>
      </div>
      <div class="list-card-row">
        <span class="list-card-label">Category</span>
        <span class="list-card-value">${item.category || 'N/A'}</span>
      </div>
      <div class="list-card-row">
        <span class="list-card-label">Quantity</span>
        <span class="list-card-value" style="color: ${isOutOfStock ? 'var(--danger)' : isLowStock ? 'var(--warning)' : 'var(--success)'};">
          ${qty} ${qty < reorder ? '(Reorder: ' + reorder + ')' : ''}
        </span>
      </div>
      <div class="list-card-row">
        <span class="list-card-label">Location</span>
        <span class="list-card-value">${item.location || 'N/A'}</span>
      </div>
      <div class="list-card-row">
        <span class="list-card-label">Value</span>
        <span class="list-card-value">₹${((qty * (parseFloat(item.cost || item.price || 0))).toLocaleString('en-IN'))}</span>
      </div>
    </div>
  `;
  }).join('');
}

function filterInventory(term) {
  const cards = document.querySelectorAll('#inventoryList .list-card');
  cards.forEach(card => {
    const text = card.textContent.toLowerCase();
    card.style.display = text.includes(term.toLowerCase()) ? '' : 'none';
  });
}

/* =========================
   PURCHASES VIEW
========================= */

function renderPurchasesView() {
  const container = document.getElementById('purchasesSearchContainer');
  if (!container.querySelector('.search-container')) {
    createSearchInput('purchasesSearchContainer', {
      placeholder: "Search purchase orders...",
      onSearch: (term) => filterPurchases(term)
    });
  }
  
  const pos = JSON.parse(localStorage.getItem('pos') || '[]');
  const list = document.getElementById('purchasesList');
  
  if (pos.length === 0) {
    list.innerHTML = '<p style="color: var(--muted); text-align: center; padding: 40px 20px;">No purchase orders</p>';
    return;
  }
  
  list.innerHTML = pos.map(po => {
    const statusColors = {
      draft: 'var(--muted)',
      pending: 'var(--warning)',
      approved: 'var(--success)',
      received: 'var(--success)',
      cancelled: 'var(--danger)'
    };
    const statusColor = statusColors[po.status] || 'var(--muted)';
    
    return `
    <div class="list-card">
      <div class="list-card-header">
        <div class="list-card-title">${po.poNumber || 'PO-' + po.id}</div>
        <span class="badge" style="background: ${statusColor}20; color: ${statusColor};">
          ${(po.status || 'draft').charAt(0).toUpperCase() + (po.status || 'draft').slice(1)}
        </span>
      </div>
      <div class="list-card-row">
        <span class="list-card-label">Supplier</span>
        <span class="list-card-value">${po.supplier || 'N/A'}</span>
      </div>
      <div class="list-card-row">
        <span class="list-card-label">Items</span>
        <span class="list-card-value">${po.itemsCount || 0}</span>
      </div>
      <div class="list-card-row">
        <span class="list-card-label">Total</span>
        <span class="list-card-value" style="color: var(--primary);">₹${parseFloat(po.totalValue || 0).toLocaleString('en-IN')}</span>
      </div>
      <div class="list-card-row">
        <span class="list-card-label">Expected</span>
        <span class="list-card-value">${po.expectedDate || 'N/A'}</span>
      </div>
    </div>
  `;
  }).join('');
}

function filterPurchases(term) {
  const cards = document.querySelectorAll('#purchasesList .list-card');
  cards.forEach(card => {
    const text = card.textContent.toLowerCase();
    card.style.display = text.includes(term.toLowerCase()) ? '' : 'none';
  });
}

/* =========================
   SUPPLIERS VIEW
========================= */

function renderSuppliersView() {
  const container = document.getElementById('suppliersSearchContainer');
  if (!container.querySelector('.search-container')) {
    createSearchInput('suppliersSearchContainer', {
      placeholder: "Search suppliers...",
      onSearch: (term) => filterSuppliers(term)
    });
  }
  
  const suppliers = JSON.parse(localStorage.getItem('suppliers') || '[]');
  const list = document.getElementById('suppliersList');
  
  if (suppliers.length === 0) {
    list.innerHTML = '<p style="color: var(--muted); text-align: center; padding: 40px 20px;">No suppliers found</p>';
    return;
  }
  
  list.innerHTML = suppliers.map(supplier => `
    <div class="list-card">
      <div class="list-card-header">
        <div class="list-card-title">${supplier.name || supplier.companyName || 'Supplier'}</div>
        <span class="badge badge-${supplier.status === 'Active' ? 'success' : 'danger'}">${supplier.status || 'Active'}</span>
      </div>
      <div class="list-card-row">
        <span class="list-card-label">Contact</span>
        <span class="list-card-value">${supplier.contact || supplier.contactPerson || 'N/A'}</span>
      </div>
      <div class="list-card-row">
        <span class="list-card-label">Email</span>
        <span class="list-card-value">${supplier.email || 'N/A'}</span>
      </div>
      <div class="list-card-row">
        <span class="list-card-label">Phone</span>
        <span class="list-card-value">${supplier.phone || 'N/A'}</span>
      </div>
    </div>
  `).join('');
}

function filterSuppliers(term) {
  const cards = document.querySelectorAll('#suppliersList .list-card');
  cards.forEach(card => {
    const text = card.textContent.toLowerCase();
    card.style.display = text.includes(term.toLowerCase()) ? '' : 'none';
  });
}

/* =========================
   REPORTS VIEW
========================= */

function renderReportsView() {
  const inventory = JSON.parse(localStorage.getItem('inventory') || '[]');
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  
  // Calculate totals
  const totalSales = orders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
  const inventoryValue = inventory.reduce((sum, item) => {
    const qty = parseFloat(item.qty || item.quantity || 0);
    const cost = parseFloat(item.cost || item.price || 0);
    return sum + (qty * cost);
  }, 0);
  
  document.getElementById('totalSales').textContent = '₹' + totalSales.toLocaleString('en-IN');
  document.getElementById('totalOrders').textContent = orders.length;
  document.getElementById('reportInventoryValue').textContent = '₹' + inventoryValue.toLocaleString('en-IN');
  
  const container = document.getElementById('reportsContent');
  container.innerHTML = `
    <div class="content-section">
      <div class="section-header">
        <h4>Summary</h4>
      </div>
      <div class="list-card">
        <div class="list-card-row">
          <span class="list-card-label">Total Items</span>
          <span class="list-card-value">${inventory.length}</span>
        </div>
        <div class="list-card-row">
          <span class="list-card-label">Low Stock Items</span>
          <span class="list-card-value" style="color: var(--warning);">
            ${inventory.filter(item => {
              const qty = parseFloat(item.qty || item.quantity || 0);
              const reorder = parseFloat(item.reorder || 10);
              return qty < reorder && qty > 0;
            }).length}
          </span>
        </div>
        <div class="list-card-row">
          <span class="list-card-label">Out of Stock</span>
          <span class="list-card-value" style="color: var(--danger);">
            ${inventory.filter(item => (item.qty || item.quantity || 0) === 0).length}
          </span>
        </div>
      </div>
    </div>
  `;
}

/* =========================
   SETTINGS VIEW
========================= */

function renderSettingsView() {
  const container = document.getElementById('settingsContent');
  const settings = JSON.parse(localStorage.getItem('appSettings') || '{}');
  const theme = localStorage.getItem('theme') || '';
  
  container.innerHTML = `
    <div class="content-section">
      <div class="section-header">
        <h4>Appearance</h4>
      </div>
      <div class="list-card">
        <div class="list-card-row">
          <span class="list-card-label">Theme</span>
          <select id="themeSelect" onchange="changeTheme(this.value)" style="padding: 8px; border: 1px solid var(--border); border-radius: 8px; background: var(--card); color: var(--text);">
            <option value="" ${theme === '' ? 'selected' : ''}>Light</option>
            <option value="dark" ${theme === 'dark' ? 'selected' : ''}>Dark</option>
          </select>
        </div>
      </div>
    </div>
    <div class="content-section">
      <div class="section-header">
        <h4>Data Management</h4>
      </div>
      <div class="list-card">
        <button onclick="exportData()" class="quick-action-btn" style="width: 100%; margin-bottom: 12px;">Export Data</button>
        <button onclick="clearAllData()" class="quick-action-btn" style="width: 100%; background: var(--danger); color: white; border-color: var(--danger);">
          Clear All Data
        </button>
      </div>
    </div>
  `;
}

function changeTheme(theme) {
  document.body.className = theme;
  localStorage.setItem('theme', theme);
  showToast('Theme updated');
}

function exportData() {
  const data = {
    inventory: JSON.parse(localStorage.getItem('inventory') || '[]'),
    orders: JSON.parse(localStorage.getItem('orders') || '[]'),
    suppliers: JSON.parse(localStorage.getItem('suppliers') || '[]'),
    purchases: JSON.parse(localStorage.getItem('pos') || '[]')
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'inventory-data-' + new Date().toISOString().split('T')[0] + '.json';
  a.click();
  URL.revokeObjectURL(url);
  showToast('Data exported');
}

function clearAllData() {
  if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
    localStorage.clear();
    showToast('All data cleared');
    setTimeout(() => location.reload(), 1000);
  }
}

/* =========================
   SEARCH UTILITIES
========================= */

function createSearchHandler(callback, delay = 300) {
  let timeout;
  return (e) => {
    const value = e.target ? e.target.value : e;
    clearTimeout(timeout);
    timeout = setTimeout(() => callback(value), delay);
  };
}

function createSearchInput(containerId, options = {}) {
  const {
    placeholder = "Search...",
    onSearch = () => {},
    onClear = () => {}
  } = options;

  const container = document.getElementById(containerId);
  if (!container) return null;

  const searchHTML = `
    <div class="search-container">
      <div class="search-input-wrapper">
        <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input type="search" 
               class="search-input" 
               placeholder="${placeholder}"
               inputmode="search"
               autocomplete="off"
               aria-label="${placeholder}">
        <button class="search-clear" aria-label="Clear search" style="display: none;">×</button>
      </div>
    </div>
  `;

  container.innerHTML = searchHTML;

  const input = container.querySelector('.search-input');
  const clearBtn = container.querySelector('.search-clear');
  const searchHandler = createSearchHandler(onSearch);

  input.addEventListener('input', (e) => {
    const value = e.target.value;
    searchHandler(e);
    
    if (value.length > 0) {
      clearBtn.style.display = 'flex';
    } else {
      clearBtn.style.display = 'none';
    }
  });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    clearBtn.style.display = 'none';
    onClear();
    onSearch('');
  });

  return { input, clear: () => { input.value = ''; clearBtn.style.display = 'none'; onClear(); onSearch(''); } };
}

/* =========================
   DRAWER
========================= */

function openDrawer() {
  const drawer = document.getElementById("drawer");
  const backdrop = document.getElementById("drawerBackdrop");
  
  document.body.style.overflow = 'hidden';
  backdrop.classList.add("open");
  setTimeout(() => {
    drawer.classList.add("open");
  }, 10);
}

function closeDrawer() {
  const drawer = document.getElementById("drawer");
  const backdrop = document.getElementById("drawerBackdrop");
  
  document.body.style.overflow = '';
  drawer.classList.remove("open");
  setTimeout(() => {
    backdrop.classList.remove("open");
  }, 200);
}

/* =========================
   UTILITIES
========================= */

function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

/* =========================
   INITIALIZATION
========================= */

function init() {
  // Initialize page views
  pageViews = {
    dashboard: document.getElementById('dashboardView'),
    orders: document.getElementById('ordersView'),
    inventory: document.getElementById('inventoryView'),
    purchases: document.getElementById('purchasesView'),
    suppliers: document.getElementById('suppliersView'),
    reports: document.getElementById('reportsView'),
    settings: document.getElementById('settingsView')
  };
  
  // Show dashboard by default
  navigateToPage('dashboard');
  
  // Hamburger menu
  document.getElementById('hamburger').addEventListener('click', openDrawer);
  document.getElementById('closeDrawer').addEventListener('click', closeDrawer);
  document.getElementById('drawerBackdrop').addEventListener('click', closeDrawer);
  
  // Apply saved theme
  const savedTheme = localStorage.getItem('theme') || '';
  document.body.className = savedTheme;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

