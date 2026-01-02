/* =========================
   AUTHENTICATION CHECK
========================= */

// Check if user is logged in
function checkAuth() {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const userRole = localStorage.getItem('userRole');
  
  if (!isLoggedIn || userRole !== 'retailer') {
    window.location.href = '../../login/desktop/login.html';
    return false;
  }
  return true;
}

// Run auth check - stop execution if not authenticated
if (!checkAuth()) {
  // Redirect will happen, stop execution
  throw new Error('Not authenticated');
}

/* =========================
   DASHBOARD DATA & INIT
========================= */

// Load dashboard data from localStorage
function loadDashboardData() {
  // Load inventory data
  const inventory = JSON.parse(localStorage.getItem('inventory') || '[]');
  
  // Load orders data
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  
  // Calculate KPIs
  updateKPIs(inventory, orders);
  
  // Load recent sales
  updateRecentSales(orders);
  
  // Load low stock alerts
  updateLowStockAlerts(inventory);
  
  // Load top products
  updateTopProducts(inventory);
}

function updateKPIs(inventory, orders) {
  // Today Sales
  const today = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter(o => o.date === today);
  const todaySales = todayOrders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
  document.getElementById('todaySales').textContent = '₹' + todaySales.toLocaleString('en-IN');
  
  // Inventory Value
  const inventoryValue = inventory.reduce((sum, item) => {
    const qty = parseFloat(item.qty || item.quantity || 0);
    const cost = parseFloat(item.cost || item.price || 0);
    return sum + (qty * cost);
  }, 0);
  document.getElementById('inventoryValue').textContent = '₹' + inventoryValue.toLocaleString('en-IN');
  
  // Pending Orders
  const pendingOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Shipped').length;
  document.getElementById('pendingOrders').textContent = pendingOrders;
  
  // Low Stock Items
  const lowStockItems = inventory.filter(item => {
    const qty = parseFloat(item.qty || item.quantity || 0);
    const reorder = parseFloat(item.reorder || 10);
    return qty < reorder && qty > 0;
  }).length;
  document.getElementById('lowStock').textContent = lowStockItems;
}

function updateRecentSales(orders) {
  const container = document.getElementById('recentSales');
  const recentOrders = orders.slice(-5).reverse();
  
  if (recentOrders.length === 0) {
    container.innerHTML = '<p style="color: var(--muted); text-align: center; padding: 20px;">No recent sales</p>';
    return;
  }
  
  container.innerHTML = recentOrders.map(order => `
    <div class="activity-item">
      <div class="activity-info">
        <strong>${order.orderId || 'Order #' + order.id}</strong>
        <span>Customer: ${order.customer || 'N/A'}</span>
      </div>
      <div class="activity-meta">
        <span class="amount">₹${parseFloat(order.total || 0).toLocaleString('en-IN')}</span>
        <span class="time">${formatTime(order.date || new Date())}</span>
      </div>
    </div>
  `).join('');
}

function updateLowStockAlerts(inventory) {
  const container = document.getElementById('lowStockAlerts');
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

function updateTopProducts(inventory) {
  const container = document.getElementById('topProducts');
  
  // Mock top products for now (you can enhance with actual sales data)
  const topProducts = [
    { name: 'Wireless Mouse Pro', sales: '48 units' },
    { name: 'USB-C Hub 7-in-1', sales: '31 units' },
    { name: 'Mechanical Keyboard', sales: '19 units' }
  ];
  
  container.innerHTML = topProducts.map(product => `
    <div class="product-item">
      <span class="product-name">${product.name}</span>
      <span class="product-sales">${product.sales}</span>
    </div>
  `).join('');
}

function formatTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 60) return diffMins + ' minutes ago';
  if (diffHours < 24) return diffHours + ' hours ago';
  if (diffDays < 7) return diffDays + ' days ago';
  return date.toLocaleDateString();
}

// Theme management
function changeTheme(theme) {
  document.body.className = theme;
  localStorage.setItem('theme', theme);
}

// Logout function - defined in auth.js, kept here for backward compatibility
// The logout function is now defined in auth.js which is included in all pages

// Update user display
function updateUserDisplay() {
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const userDisplay = document.getElementById('userDisplay');
  if (userDisplay && userData.username) {
    userDisplay.textContent = userData.username;
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Apply saved theme
  const savedTheme = localStorage.getItem('theme') || '';
  document.body.className = savedTheme;
  const themeSelect = document.getElementById('themeSelect');
  if (themeSelect) {
    themeSelect.value = savedTheme;
  }
  
  // Update user display
  updateUserDisplay();
  
  // Load dashboard data
  loadDashboardData();
  
  // Refresh data every 30 seconds
  setInterval(loadDashboardData, 30000);
});

