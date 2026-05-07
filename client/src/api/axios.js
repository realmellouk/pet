// api/axios.js — Configured Axios instance
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pm_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global response error handling
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('pm_token');
      localStorage.removeItem('pm_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// ─── API Helper Functions ─────────────────────────────────────
export const authAPI = {
  register:      (data)    => api.post('/auth/register', data),
  login:         (data)    => api.post('/auth/login', data),
  me:            ()        => api.get('/auth/me'),
  updateProfile: (data)    => api.put('/auth/profile', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

export const productAPI = {
  getAll:      (params) => api.get('/products', { params }),
  getOne:      (id)     => api.get(`/products/${id}`),
  getCategories: ()     => api.get('/products/categories'),
  create:      (data)   => api.post('/products', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update:      (id, data) => api.put(`/products/${id}`, data),
  delete:      (id)       => api.delete(`/products/${id}`),
  getMyProducts: (params) => api.get('/products/seller/mine', { params }),
  addReview:   (id, data) => api.post(`/products/${id}/reviews`, data),
};

export const cartAPI = {
  get:    ()             => api.get('/cart'),
  add:    (data)         => api.post('/cart', data),
  update: (id, quantity) => api.put(`/cart/${id}`, { quantity }),
  remove: (id)           => api.delete(`/cart/${id}`),
  clear:  ()             => api.delete('/cart'),
};

export const orderAPI = {
  create:       (data)   => api.post('/orders', data),
  getMyOrders:  (params) => api.get('/orders/user', { params }),
  getSellerOrders: (params) => api.get('/orders/seller', { params }),
  getOne:       (id)     => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
};

export const adminAPI = {
  getStats:    ()        => api.get('/admin/stats'),
  getUsers:    (params)  => api.get('/admin/users', { params }),
  approveSeller: (id, approved) => api.put(`/admin/users/${id}/approve`, { approved }),
  toggleUser:  (id)      => api.put(`/admin/users/${id}/toggle`),
  deleteUser:  (id)      => api.delete(`/admin/users/${id}`),
  getOrders:   (params)  => api.get('/admin/orders', { params }),
  getProducts: (params)  => api.get('/admin/products', { params }),
};
