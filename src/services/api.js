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
    'Content-Type': 'application/json',
    ...options.headers,
  };

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
  updateProfile: async (data) => {
    const response = await fetch(`${API_URL}/users/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
};

export const notificationAPI = {
  getAll: () => apiRequest('/api/notifications?limit=20'),
  markRead: (id) => apiRequest(`/api/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: () => apiRequest('/api/notifications/read-all', { method: 'PATCH' }),
};
