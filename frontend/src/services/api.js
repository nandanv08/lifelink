/**
 * LifeLink - API Service Layer
 * Centralized API calls to the backend
 */

const API_BASE = '/api';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  // Add auth token if available
  const token = localStorage.getItem('lifelink_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error('Unable to connect to server. Please check if the backend is running.');
    }
    throw error;
  }
}

// ========================
// Donor API
// ========================

export const donorAPI = {
  // Get all donors with filters
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchAPI(`/donors?${query}`);
  },

  // Get single donor
  getById: (id) => fetchAPI(`/donors/${id}`),

  // Get donor profile (full details for dashboard)
  getProfile: (id) => fetchAPI(`/donors/${id}/profile`),

  // Register new donor
  register: (donorData) => fetchAPI('/donors', {
    method: 'POST',
    body: JSON.stringify(donorData)
  }),

  // Update donor
  update: (id, donorData) => fetchAPI(`/donors/${id}`, {
    method: 'PUT',
    body: JSON.stringify(donorData)
  }),

  // Toggle availability
  toggleAvailability: (id) => fetchAPI(`/donors/${id}/availability`, {
    method: 'PATCH'
  }),

  // Delete donor
  delete: (id) => fetchAPI(`/donors/${id}`, {
    method: 'DELETE'
  }),

  // Emergency search
  emergency: (bloodGroup, city = '', state = '') => {
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (state) params.set('state', state);
    const query = params.toString();
    return fetchAPI(`/donors/emergency/${encodeURIComponent(bloodGroup)}${query ? '?' + query : ''}`);
  },

  // Check eligibility
  checkEligibility: (data) => fetchAPI('/donors/check-eligibility', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Add health record
  addHealthRecord: (donorId, data) => fetchAPI(`/donors/${donorId}/health-record`, {
    method: 'POST',
    body: JSON.stringify(data)
  })
};

// ========================
// Request API
// ========================

export const requestAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchAPI(`/requests?${query}`);
  },

  getById: (id) => fetchAPI(`/requests/${id}`),

  create: (requestData) => fetchAPI('/requests', {
    method: 'POST',
    body: JSON.stringify(requestData)
  }),

  accept: (id, donorId) => fetchAPI(`/requests/${id}/accept`, {
    method: 'PATCH',
    body: JSON.stringify({ donorId })
  }),

  complete: (id) => fetchAPI(`/requests/${id}/complete`, {
    method: 'PATCH'
  }),

  cancel: (id, reason) => fetchAPI(`/requests/${id}/cancel`, {
    method: 'PATCH',
    body: JSON.stringify({ cancelReason: reason })
  }),

  delete: (id) => fetchAPI(`/requests/${id}`, {
    method: 'DELETE'
  })
};

// ========================
// Analytics API
// ========================

export const analyticsAPI = {
  getAll: () => fetchAPI('/analytics'),
  getRecentDonors: () => fetchAPI('/analytics/recent-donors')
};

// ========================
// User/Auth API
// ========================

export const userAPI = {
  register: (userData) => fetchAPI('/users/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),

  login: (credentials) => fetchAPI('/users/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),

  getMe: () => fetchAPI('/users/me'),

  updateProfile: (data) => fetchAPI('/users/me', {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  linkDonor: (donorId) => fetchAPI('/users/link-donor', {
    method: 'POST',
    body: JSON.stringify({ donorId })
  }),

  // Admin endpoints
  getAllUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchAPI(`/users?${query}`);
  },

  verifyHospital: (id) => fetchAPI(`/users/${id}/verify`, {
    method: 'PATCH'
  }),

  revokeHospital: (id) => fetchAPI(`/users/${id}/revoke`, {
    method: 'PATCH'
  }),

  deactivateUser: (id) => fetchAPI(`/users/${id}/deactivate`, {
    method: 'PATCH'
  })
};
