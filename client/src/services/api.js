import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API functions
export const apiService = {
  // Auth endpoints
  auth: {
    register: (userData) => api.post('/api/auth/register', userData),
    login: (credentials) => api.post('/api/auth/login', credentials),
    getMe: () => api.get('/api/auth/me')
  },

  // Image upload endpoints
  uploadImages: (formData) => {
    return api.post('/api/upload/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  uploadImage: (formData) => {
    return api.post('/api/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Items endpoints
  items: {
    // Get all items with optional filters
    getAll: (params = {}) => api.get('/api/items', { params }),
    
    // Get single item by ID
    getById: (id) => api.get(`/api/items/${id}`),
    
    // Create new item
    create: (itemData) => api.post('/api/items', itemData),
    
    // Update item
    update: (id, itemData) => api.put(`/api/items/${id}`, itemData),
    
    // Delete item
    delete: (id) => api.delete(`/api/items/${id}`),
    
    // Get user's items
    getMyItems: () => api.get('/api/items/user/my-items')
  }
};

// Helper functions for common operations
export const itemHelpers = {
  // Search items
  searchItems: (searchTerm, filters = {}) => {
    const params = { search: searchTerm, ...filters };
    return apiService.items.getAll(params);
  },

  // Filter items by category
  filterByCategory: (category, otherFilters = {}) => {
    const params = { category, ...otherFilters };
    return apiService.items.getAll(params);
  },

  // Filter items by price range
  filterByPrice: (minPrice, maxPrice, otherFilters = {}) => {
    const params = { minPrice, maxPrice, ...otherFilters };
    return apiService.items.getAll(params);
  },

  // Get items with pagination
  getItemsWithPagination: (page, limit = 12, filters = {}) => {
    const params = { page, limit, ...filters };
    return apiService.items.getAll(params);
  }
};

// Constants
export const CATEGORIES = [
  'All',
  'Books',
  'Electronics',
  'Furniture',
  'Clothing',
  'Kitchen Items',
  'Sports Equipment',
  'Stationery',
  'Decoration',
  'Others'
];

export const CONDITIONS = [
  'New',
  'Like New',
  'Good',
  'Fair',
  'Poor'
];

export default api;