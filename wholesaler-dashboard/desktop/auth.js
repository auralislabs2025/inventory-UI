/* =========================
   AUTHENTICATION CHECK
========================= */

// Check if user is logged in
function checkAuth() {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const userRole = localStorage.getItem('userRole');
  
  if (!isLoggedIn || userRole !== 'wholesaler') {
    window.location.href = '../../login/desktop/login.html';
    return false;
  }
  return true;
}

// Logout function
function logout() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
    window.location.href = '../../login/desktop/login.html';
  }
}

// Run auth check on page load
if (typeof window !== 'undefined') {
  if (!checkAuth()) {
    throw new Error('Not authenticated');
  }
}

