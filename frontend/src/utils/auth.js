// Helper utilities for Role-Based Access Control (RBAC)

export function getAuthToken() {
  return localStorage.getItem('dealflow_token');
}

export function getUserRole() {
  const role = localStorage.getItem('dealflow_role');
  if (role) return role;
  
  const token = getAuthToken();
  if (token) return 'SALES_REP'; // Default fallback role if logged in
  
  return null;
}

export function getCurrentUser() {
  const userStr = localStorage.getItem('dealflow_user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      /* fallback */
    }
  }
  return {
    fullName: 'Demo User',
    email: 'user@dealflow360.com',
    role: getUserRole() || 'SALES_REP'
  };
}

export function setSession(token, role, user = {}) {
  if (token) localStorage.setItem('dealflow_token', token);
  if (role) localStorage.setItem('dealflow_role', role);
  if (user) localStorage.setItem('dealflow_user', JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem('dealflow_token');
  localStorage.removeItem('dealflow_role');
  localStorage.removeItem('dealflow_user');
}

export function hasAccess(allowedRoles = []) {
  const role = getUserRole();
  if (!role) return false;
  if (allowedRoles.length === 0) return true;
  return allowedRoles.includes(role);
}

export function getDefaultRouteForRole(role) {
  switch (role) {
    case 'CUSTOMER':
      return '/portal';
    case 'FINANCE':
      return '/invoices';
    case 'ADMIN':
      return '/products';
    case 'SALES_MANAGER':
      return '/dashboard';
    case 'SALES_REP':
    default:
      return '/dashboard';
  }
}
