/**
 * Optimized API Client with Caching and Request Management
 * Reduces unnecessary backend requests and improves scalability
 */

import { authAPI, productAPI, checkoutAPI, revenueAPI, billsAPI } from './api';
import { apiCache, cacheKeys } from './apiCache';
import { requestQueue } from './performance';

/**
 * Optimized Product API with Caching
 */
export const optimizedProductAPI = {
  /**
   * Get all categories with caching (5 min TTL)
   */
  getCategories: async (options?: { forceRefresh?: boolean }) => {
    return apiCache.fetch(
      cacheKeys.categories(),
      () => productAPI.getCategories().then((res) => res.data),
      {
        ttl: 5 * 60 * 1000, // 5 minutes
        forceRefresh: options?.forceRefresh,
        staleWhileRevalidate: true, // Return stale data while refreshing
      }
    );
  },

  /**
   * Get all products with caching and deduplication
   */
  getProducts: async (
    params?: { category?: string; search?: string; page?: number; limit?: number },
    options?: { forceRefresh?: boolean }
  ) => {
    const cacheKey = cacheKeys.products(params);
    
    return requestQueue.add(cacheKey, () =>
      apiCache.fetch(
        cacheKey,
        () => productAPI.getProducts(params).then((res) => res.data),
        {
          ttl: 3 * 60 * 1000, // 3 minutes
          forceRefresh: options?.forceRefresh,
          staleWhileRevalidate: true,
        }
      )
    );
  },

  /**
   * Get single product with caching
   */
  getProduct: async (id: string, options?: { forceRefresh?: boolean }) => {
    return apiCache.fetch(
      cacheKeys.product(id),
      () => productAPI.getProduct(id).then((res) => res.data),
      {
        ttl: 5 * 60 * 1000, // 5 minutes
        forceRefresh: options?.forceRefresh,
      }
    );
  },

  /**
   * Create product and invalidate cache
   */
  createProduct: async (formData: FormData) => {
    const result = await productAPI.createProduct(formData);
    
    // Invalidate products cache
    apiCache.invalidate(/^products/);
    
    return result;
  },

  /**
   * Update product and invalidate cache
   */
  updateProduct: async (id: string, formData: FormData) => {
    const result = await productAPI.updateProduct(id, formData);
    
    // Invalidate specific product and products list
    apiCache.invalidate(cacheKeys.product(id));
    apiCache.invalidate(/^products/);
    
    return result;
  },

  /**
   * Delete product and invalidate cache
   */
  deleteProduct: async (id: string) => {
    const result = await productAPI.deleteProduct(id);
    
    // Invalidate specific product and products list
    apiCache.invalidate(cacheKeys.product(id));
    apiCache.invalidate(/^products/);
    
    return result;
  },

  /**
   * Create category and invalidate cache
   */
  createCategory: async (data: { name: string; description?: string }) => {
    const result = await productAPI.createCategory(data);
    
    // Invalidate categories cache
    apiCache.invalidate(cacheKeys.categories());
    
    return result;
  },

  /**
   * Update category and invalidate cache
   */
  updateCategory: async (id: string, data: { name: string; description?: string }) => {
    const result = await productAPI.updateCategory(id, data);
    
    // Invalidate categories cache
    apiCache.invalidate(cacheKeys.categories());
    
    return result;
  },

  /**
   * Delete category and invalidate cache
   */
  deleteCategory: async (id: string) => {
    const result = await productAPI.deleteCategory(id);
    
    // Invalidate categories and products cache
    apiCache.invalidate(cacheKeys.categories());
    apiCache.invalidate(/^products/);
    
    return result;
  },
};

/**
 * Optimized Checkout API with Minimal Caching
 * Checkout operations should generally bypass cache
 */
export const optimizedCheckoutAPI = {
  /**
   * Create checkout - no caching (always fresh)
   */
  createCheckout: async (data: { items: any[]; customerInfo: { name: string; phone: string } }) => {
    const result = await checkoutAPI.createCheckout(data);
    
    // Invalidate revenue and bills cache
    apiCache.invalidate(/^revenue/);
    apiCache.invalidate(/^bills/);
    
    return result;
  },

  /**
   * Get bills with short cache (30 seconds)
   */
  getBills: async (
    params?: { page?: number; limit?: number; search?: string; startDate?: string; endDate?: string },
    options?: { forceRefresh?: boolean }
  ) => {
    const cacheKey = cacheKeys.bills(params);
    
    return apiCache.fetch(
      cacheKey,
      () => checkoutAPI.getBills(params).then((res) => res.data),
      {
        ttl: 30 * 1000, // 30 seconds only
        forceRefresh: options?.forceRefresh,
      }
    );
  },

  /**
   * Get sales summary with 1-minute cache
   */
  getSalesSummary: async (options?: { forceRefresh?: boolean }) => {
    return apiCache.fetch(
      'sales:summary',
      () => checkoutAPI.getSalesSummary().then((res) => res.data),
      {
        ttl: 60 * 1000, // 1 minute
        forceRefresh: options?.forceRefresh,
      }
    );
  },

  /**
   * Check loyalty status - no caching (real-time data)
   */
  checkLoyaltyStatus: async (data: { customerPhone: string; subtotal?: number }) => {
    // No caching for loyalty checks (must be real-time)
    return checkoutAPI.checkLoyaltyStatus(data).then((res) => res.data);
  },
};

/**
 * Optimized Revenue API with Smart Caching
 */
export const optimizedRevenueAPI = {
  /**
   * Get today's revenue with 2-minute cache
   */
  getTodayRevenue: async (options?: { forceRefresh?: boolean }) => {
    return apiCache.fetch(
      cacheKeys.revenue.today(),
      () => revenueAPI.getTodayRevenue().then((res) => res.data),
      {
        ttl: 2 * 60 * 1000, // 2 minutes
        forceRefresh: options?.forceRefresh,
        staleWhileRevalidate: true,
      }
    );
  },

  /**
   * Get weekly revenue with 10-minute cache
   */
  getWeeklyRevenue: async (options?: { forceRefresh?: boolean }) => {
    return apiCache.fetch(
      cacheKeys.revenue.weekly(),
      () => revenueAPI.getWeeklyRevenue().then((res) => res.data),
      {
        ttl: 10 * 60 * 1000, // 10 minutes
        forceRefresh: options?.forceRefresh,
        staleWhileRevalidate: true,
      }
    );
  },

  /**
   * Get 30-day revenue with 10-minute cache
   */
  get30DaysRevenue: async (options?: { forceRefresh?: boolean }) => {
    return apiCache.fetch(
      cacheKeys.revenue.monthly(),
      () => revenueAPI.get30DaysRevenue().then((res) => res.data),
      {
        ttl: 10 * 60 * 1000, // 10 minutes
        forceRefresh: options?.forceRefresh,
        staleWhileRevalidate: true,
      }
    );
  },

  /**
   * Export old revenue - no caching
   */
  exportOldRevenue: async () => {
    const result = await revenueAPI.exportOldRevenue();
    
    // Invalidate all revenue cache after export
    apiCache.invalidate(/^revenue/);
    apiCache.invalidate(/^bills/);
    
    return result;
  },
};

/**
 * Optimized Bills API
 */
export const optimizedBillsAPI = {
  /**
   * Get single bill with cache
   */
  getBill: async (id: string, options?: { forceRefresh?: boolean }) => {
    return apiCache.fetch(
      `bill:${id}`,
      () => billsAPI.getBill(id).then((res) => res.data),
      {
        ttl: 5 * 60 * 1000, // 5 minutes
        forceRefresh: options?.forceRefresh,
      }
    );
  },

  /**
   * Send WhatsApp - no caching
   */
  sendWhatsApp: async (billId: string, phoneNumber: string) => {
    return billsAPI.sendWhatsApp(billId, phoneNumber).then((res) => res.data);
  },

  /**
   * Get WhatsApp status with 1-minute cache
   */
  getWhatsAppStatus: async (options?: { forceRefresh?: boolean }) => {
    return apiCache.fetch(
      'whatsapp:status',
      () => billsAPI.getWhatsAppStatus().then((res) => res.data),
      {
        ttl: 60 * 1000, // 1 minute
        forceRefresh: options?.forceRefresh,
      }
    );
  },
};

/**
 * Cache management utilities
 */
export const cacheManagement = {
  /**
   * Clear all cache
   */
  clearAll: () => {
    apiCache.clear();
    console.log('🗑️ All cache cleared');
  },

  /**
   * Get cache statistics
   */
  getStats: () => {
    return apiCache.getStats();
  },

  /**
   * Refresh specific data
   */
  refresh: {
    products: () => apiCache.invalidate(/^products/),
    categories: () => apiCache.invalidate(cacheKeys.categories()),
    revenue: () => apiCache.invalidate(/^revenue/),
    bills: () => apiCache.invalidate(/^bills/),
  },
};

// Re-export auth API (no caching for auth operations)
export { authAPI };

export default {
  products: optimizedProductAPI,
  checkout: optimizedCheckoutAPI,
  revenue: optimizedRevenueAPI,
  bills: optimizedBillsAPI,
  auth: authAPI,
  cache: cacheManagement,
};
