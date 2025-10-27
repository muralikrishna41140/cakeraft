import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 5000, // Reduced from 10000 to 5000ms for faster response
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('admin');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// API functions
export const authAPI = {
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  
  getProfile: () => 
    api.get('/auth/profile'),
  
  changePassword: (currentPassword: string, newPassword: string) => 
    api.put('/auth/change-password', { currentPassword, newPassword }),
  
  verifyToken: () => 
    api.get('/auth/verify'),
};

export const productAPI = {
  // Categories
  getCategories: () => 
    api.get('/products/categories'),
  
  createCategory: (data: { name: string; description?: string }) => 
    api.post('/products/categories', data),
  
  updateCategory: (id: string, data: { name: string; description?: string }) => 
    api.put(`/products/categories/${id}`, data),
  
  deleteCategory: (id: string) => 
    api.delete(`/products/categories/${id}`),
  
  // Products
  getProducts: (params?: { 
    category?: string; 
    search?: string; 
    page?: number; 
    limit?: number; 
  }) => 
    api.get('/products', { params }),
  
  getProduct: (id: string) => 
    api.get(`/products/${id}`),
  
  createProduct: (formData: FormData) => 
    api.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  updateProduct: (id: string, formData: FormData) => 
    api.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  deleteProduct: (id: string) => 
    api.delete(`/products/${id}`),
};

export const checkoutAPI = {
  createCheckout: (data: { items: any[], customerInfo: { name: string, phone: string } }) => 
    api.post('/checkout', data),
  
  getBills: (params?: { page?: number, limit?: number, search?: string, startDate?: string, endDate?: string }) => 
    api.get('/checkout/bills', { params }),
  
  getBill: (id: string) => 
    api.get(`/checkout/bills/${id}`),
  
  getSalesSummary: () => 
    api.get('/checkout/summary'),

  checkLoyaltyStatus: (data: { customerPhone: string, subtotal?: number }) => 
    api.post('/checkout/loyalty/check', data),
};

export const revenueAPI = {
  getTodayRevenue: () => 
    api.get('/revenue/today'),
  
  getWeeklyRevenue: () => 
    api.get('/revenue/weekly'),
  
  get30DaysRevenue: () => 
    api.get('/revenue/30days'),
  
  exportOldRevenue: () => 
    api.post('/revenue/export'),
  
  testGoogleSheets: () => 
    api.get('/revenue/export/test'),
};

export const billsAPI = {
  getBill: (id: string) => 
    api.get(`/bills/${id}`),
  
  getAllBills: (params?: { page?: number, limit?: number }) => 
    api.get('/bills', { params }),
  
  sendWhatsApp: (billId: string, phoneNumber: string) => 
    api.post(`/bills/${billId}/send-whatsapp`, { phoneNumber }),
  
  getWhatsAppStatus: () => 
    api.get('/bills/whatsapp/status'),
  
  testWhatsApp: (phoneNumber: string) => 
    api.post('/bills/whatsapp/test', { phoneNumber }),
};

export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;