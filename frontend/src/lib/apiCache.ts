/**
 * API Request Cache and Deduplication System
 * Prevents unnecessary backend requests and improves scalability
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface PendingRequest<T> {
  promise: Promise<T>;
  timestamp: number;
}

class APICache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private pendingRequests: Map<string, PendingRequest<any>> = new Map();
  private defaultTTL: number = 5 * 60 * 1000; // 5 minutes default

  /**
   * Get cached data or execute request
   * Handles request deduplication automatically
   */
  async fetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: {
      ttl?: number; // Time to live in milliseconds
      forceRefresh?: boolean;
      staleWhileRevalidate?: boolean;
    } = {}
  ): Promise<T> {
    const {
      ttl = this.defaultTTL,
      forceRefresh = false,
      staleWhileRevalidate = false,
    } = options;

    // Check if there's a pending request for this key
    const pending = this.pendingRequests.get(key);
    if (pending && !forceRefresh) {
      console.log(`🔄 Deduplicating request: ${key}`);
      return pending.promise;
    }

    // Check cache
    if (!forceRefresh) {
      const cached = this.cache.get(key);
      if (cached && Date.now() < cached.expiresAt) {
        console.log(`✅ Cache hit: ${key}`);
        return cached.data;
      }

      // Stale-while-revalidate: Return stale data, refresh in background
      if (staleWhileRevalidate && cached) {
        console.log(`⚡ Returning stale data, refreshing in background: ${key}`);
        this.refreshInBackground(key, fetcher, ttl);
        return cached.data;
      }
    }

    // Execute request
    console.log(`📡 Fetching from server: ${key}`);
    const promise = this.executeRequest(key, fetcher, ttl);
    
    return promise;
  }

  /**
   * Execute request and cache result
   */
  private async executeRequest<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number
  ): Promise<T> {
    const promise = fetcher();

    // Store as pending
    this.pendingRequests.set(key, {
      promise,
      timestamp: Date.now(),
    });

    try {
      const data = await promise;

      // Cache the result
      this.cache.set(key, {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + ttl,
      });

      return data;
    } catch (error) {
      // Don't cache errors
      throw error;
    } finally {
      // Remove from pending
      this.pendingRequests.delete(key);
    }
  }

  /**
   * Refresh data in background
   */
  private refreshInBackground<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number
  ): void {
    this.executeRequest(key, fetcher, ttl).catch((error) => {
      console.warn(`Background refresh failed for ${key}:`, error);
    });
  }

  /**
   * Invalidate cache for a key or pattern
   */
  invalidate(keyOrPattern: string | RegExp): void {
    if (typeof keyOrPattern === 'string') {
      this.cache.delete(keyOrPattern);
      this.pendingRequests.delete(keyOrPattern);
      console.log(`🗑️ Invalidated cache: ${keyOrPattern}`);
    } else {
      // Pattern matching
      const keysToDelete: string[] = [];
      this.cache.forEach((_, key) => {
        if (keyOrPattern.test(key)) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach((key) => {
        this.cache.delete(key);
        this.pendingRequests.delete(key);
      });
      console.log(`🗑️ Invalidated ${keysToDelete.length} cache entries matching pattern`);
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.pendingRequests.clear();
    console.log('🗑️ Cleared all cache');
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    cacheSize: number;
    pendingRequests: number;
    entries: Array<{ key: string; age: number; expiresIn: number }>;
  } {
    const now = Date.now();
    const entries: Array<{ key: string; age: number; expiresIn: number }> = [];
    
    this.cache.forEach((entry, key) => {
      entries.push({
        key,
        age: now - entry.timestamp,
        expiresIn: entry.expiresAt - now,
      });
    });

    return {
      cacheSize: this.cache.size,
      pendingRequests: this.pendingRequests.size,
      entries,
    };
  }

  /**
   * Cleanup expired entries (automatic garbage collection)
   */
  cleanup(): void {
    const now = Date.now();
    let cleaned = 0;
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => {
      this.cache.delete(key);
      cleaned++;
    });

    if (cleaned > 0) {
      console.log(`🧹 Cleaned ${cleaned} expired cache entries`);
    }
  }
}

// Singleton instance
export const apiCache = new APICache();

// Auto cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    apiCache.cleanup();
  }, 5 * 60 * 1000);
}

/**
 * Cache key generators for common patterns
 */
export const cacheKeys = {
  products: (params?: { category?: string; search?: string }) => {
    const query = params
      ? `?category=${params.category || 'all'}&search=${params.search || ''}`
      : '';
    return `products${query}`;
  },
  product: (id: string) => `product:${id}`,
  categories: () => 'categories',
  bills: (params?: { page?: number; limit?: number }) => {
    const query = params ? `?page=${params.page || 1}&limit=${params.limit || 10}` : '';
    return `bills${query}`;
  },
  revenue: {
    today: () => 'revenue:today',
    weekly: () => 'revenue:weekly',
    monthly: () => 'revenue:30days',
  },
  loyaltyStatus: (phone: string) => `loyalty:${phone}`,
};

export default apiCache;
