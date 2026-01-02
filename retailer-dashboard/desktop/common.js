// Common functions for all retailer dashboard pages

function changeTheme(theme) {
  document.body.className = theme;
  localStorage.setItem('theme', theme);
}

function updateUserDisplay() {
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const registeredUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
  const userDisplay = document.getElementById('userDisplay');
  const userAvatar = document.getElementById('userAvatar');
  
  if(userDisplay) {
    // Try to get business name from registered users
    const userInfo = registeredUsers.find(u => u.username === userData.username);
    const businessName = userInfo?.businessName || userInfo?.shopName || userData.username || 'Retailer Admin';
    const location = userInfo?.city || userInfo?.location || '';
    
    // Update name display
    const nameEl = userDisplay.querySelector('.user-name') || document.createElement('div');
    if(!userDisplay.querySelector('.user-name')) {
      nameEl.className = 'user-name';
      userDisplay.appendChild(nameEl);
      const roleEl = document.createElement('div');
      roleEl.className = 'user-role';
      userDisplay.appendChild(roleEl);
      roleEl.textContent = location ? `Retailer (${location})` : 'Retailer';
    }
    nameEl.textContent = businessName;
    
    // Update avatar
    if(userAvatar) {
      const initials = businessName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
      userAvatar.textContent = initials;
    }
  }
}

// Cart Management
function getCart() {
  return JSON.parse(localStorage.getItem('retailer_cart') || '[]');
}

function saveCart(cart) {
  localStorage.setItem('retailer_cart', JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(product) {
  const cart = getCart();
  const existingItem = cart.find(item => item.id === product.id);
  
  if(existingItem) {
    existingItem.quantity += product.quantity || 1;
  } else {
    cart.push({
      ...product,
      quantity: product.quantity || 1
    });
  }
  
  saveCart(cart);
  showToast('Item added to cart!');
}

function removeFromCart(productId) {
  const cart = getCart().filter(item => item.id !== productId);
  saveCart(cart);
  showToast('Item removed from cart');
}

function updateCartQuantity(productId, quantity) {
  const cart = getCart();
  const item = cart.find(item => item.id === productId);
  if(item) {
    if(quantity <= 0) {
      removeFromCart(productId);
    } else {
      item.quantity = quantity;
      saveCart(cart);
    }
  }
}

function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.quantity, 0);
}

function updateCartBadge() {
  const count = getCartCount();
  const badge = document.querySelector('.cart-badge');
  if(badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-block' : 'none';
  }
}

function clearCart() {
  saveCart([]);
}

// Quote Management
function getQuotes() {
  return JSON.parse(localStorage.getItem('retailer_quotes') || '[]');
}

function saveQuotes(quotes) {
  localStorage.setItem('retailer_quotes', JSON.stringify(quotes));
}

function createQuote(productId, quantity, notes) {
  const quotes = getQuotes();
  const newQuote = {
    id: Date.now(),
    productId,
    quantity,
    notes,
    status: 'Pending',
    createdAt: new Date().toISOString()
  };
  quotes.push(newQuote);
  saveQuotes(quotes);
  showToast('Quote request sent!');
  return newQuote;
}

// Invoice Management
function getInvoices() {
  return JSON.parse(localStorage.getItem('retailer_invoices') || '[]');
}

function saveInvoices(invoices) {
  localStorage.setItem('retailer_invoices', JSON.stringify(invoices));
}

function showToast(msg) {
  let toast = document.getElementById('toast');
  if(!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function openModal(id) {
  const modal = document.getElementById(id);
  if(modal) modal.classList.add('open');
}

function closeModal() {
  document.querySelectorAll('.modal').forEach(m => m.classList.remove('open'));
}

// Initialize common features on page load
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme') || '';
  document.body.className = savedTheme;
  const themeSelect = document.getElementById('themeSelect');
  if(themeSelect) themeSelect.value = savedTheme;
  updateUserDisplay();
  updateCartBadge();
  
  // Close modal on outside click
  document.querySelectorAll('.modal').forEach(m => {
    m.addEventListener('click', e => {
      if(e.target === m) closeModal();
    });
  });
});

