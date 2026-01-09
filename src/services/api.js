const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Get auth token from localStorage
const getToken = () => {
  // Try to get token directly
  let token = localStorage.getItem('zestro_token');

  // If not found, try getting from user object
  if (!token) {
    try {
      const user = JSON.parse(localStorage.getItem('zestro_user') || '{}');
      token = user.token;
    } catch (e) {
      // Ignore parse errors
    }
  }

  return token;
};

// Generic fetch wrapper
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();

  const headers = {
    // Only set Content-Type to json if it's not explicitly set to something else (or empty for FormData)
    // We check if options.headers has Content-Type, or if it's not set at all we default to json
    // But for FormData, we pass empty headers object from caller, so we need to be careful.
    // Logic: Default to application/json UNLESS caller explicitly passed headers (which might be empty or have other types)
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // If Content-Type is explicitly undefined/null in options.headers, remove it
  // This allows sending FormData where browser sets the boundary
  // If Content-Type is explicitly undefined/null in options.headers, remove it
  // This allows sending FormData where browser sets the boundary
  if (options.headers && !options.headers['Content-Type'] && options.headers.hasOwnProperty('Content-Type')) {
    delete headers['Content-Type'];
  }

  // Better approach: Check if Content-Type was set to empty object or specific value in options.headers
  // If options.headers exists, use it. usage in updateProfile: headers: isFormData ? {} : ...
  // But wait, we define 'Content-Type': 'application/json' first.

  // Correct logic:
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // If options.headers is provided, merge it. If a key exists in options.headers, it overrides default.
  // To uncork Content-Type (remove it), caller needs to set it to something or we handle it here.
  // Let's modify apiRequest to be smarter.

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
};

// Auth API
export const authAPI = {
  signup: (data) => apiRequest('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  login: (data) => apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  getMe: () => apiRequest('/api/auth/me'),
};

// Restaurant API
export const restaurantAPI = {
  getAll: () => apiRequest('/api/restaurants'),

  getById: (id) => apiRequest(`/api/restaurants/${id}`),

  getMenu: (id) => apiRequest(`/api/restaurants/${id}/menu`),

  create: (data) => apiRequest('/api/restaurants', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  getMyRestaurant: () => apiRequest('/api/restaurants/me/restaurant'),

  update: (data) => apiRequest('/api/restaurants/me/restaurant', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

// Menu Items API
export const menuItemAPI = {
  getMy: () => apiRequest('/api/menu-items/my'),

  create: (data) => apiRequest('/api/menu-items', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  delete: (id) => apiRequest(`/api/menu-items/${id}`, {
    method: 'DELETE',
  }),

  update: (id, data) => apiRequest(`/api/menu-items/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

// Orders API
export const orderAPI = {
  create: (data) => apiRequest('/api/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  getMyOrders: () => apiRequest('/api/orders/my-orders'),

  getAvailable: () => apiRequest('/api/orders/available'),

  accept: (orderId) => apiRequest(`/api/orders/${orderId}/accept`, {
    method: 'POST',
  }),

  acceptRider: (orderId) => apiRequest(`/api/orders/${orderId}/accept-rider`, {
    method: 'POST',
  }),

  updateStatus: (orderId, status) => apiRequest(`/api/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
};
export const userAPI = {
  updateProfile: (data) => {
    const isFormData = data instanceof FormData;
    return apiRequest('/api/users/profile', {
      method: 'PUT',
      body: isFormData ? data : JSON.stringify(data),
      headers: isFormData ? { 'Content-Type': null } : undefined,
    });
  },
};

export const notificationAPI = {
  getAll: () => apiRequest('/api/notifications?limit=20'),
  markRead: (id) => apiRequest(`/api/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: () => apiRequest('/api/notifications/read-all', { method: 'PATCH' }),
};
