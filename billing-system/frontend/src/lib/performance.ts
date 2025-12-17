/**
 * Performance optimization utilities
 * Debouncing, throttling, and request optimization
 */

/**
 * Debounce function - delays execution until after wait time
 * Perfect for search inputs, resize handlers
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function - limits execution to once per wait time
 * Perfect for scroll handlers, resize events
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, wait);
    }
  };
}

/**
 * Async debounce with cancellation support
 */
export function debounceAsync<T extends (...args: any[]) => Promise<any>>(
  func: T,
  wait: number
): {
  execute: (...args: Parameters<T>) => Promise<ReturnType<T>>;
  cancel: () => void;
} {
  let timeout: NodeJS.Timeout | null = null;
  let pendingPromise: Promise<any> | null = null;

  const cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    pendingPromise = null;
  };

  const execute = (...args: Parameters<T>): Promise<ReturnType<T>> => {
    cancel();

    return new Promise((resolve, reject) => {
      timeout = setTimeout(async () => {
        try {
          const result = await func(...args);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, wait);
    });
  };

  return { execute, cancel };
}

/**
 * Request queue to prevent parallel duplicate requests
 */
class RequestQueue {
  private queue: Map<string, Promise<any>> = new Map();

  async add<T>(key: string, request: () => Promise<T>): Promise<T> {
    // If request is already in progress, return existing promise
    if (this.queue.has(key)) {
      console.log(`⏳ Request queued (duplicate): ${key}`);
      return this.queue.get(key) as Promise<T>;
    }

    // Execute new request
    const promise = request();
    this.queue.set(key, promise);

    try {
      const result = await promise;
      return result;
    } finally {
      this.queue.delete(key);
    }
  }

  cancel(key: string): void {
    this.queue.delete(key);
  }

  clear(): void {
    this.queue.clear();
  }

  getSize(): number {
    return this.queue.size;
  }
}

export const requestQueue = new RequestQueue();

/**
 * Batch multiple requests into a single execution
 */
export class BatchProcessor<T, R> {
  private batch: T[] = [];
  private timeout: NodeJS.Timeout | null = null;
  private processor: (items: T[]) => Promise<R[]>;
  private wait: number;

  constructor(processor: (items: T[]) => Promise<R[]>, wait: number = 50) {
    this.processor = processor;
    this.wait = wait;
  }

  add(item: T): Promise<R> {
    return new Promise((resolve, reject) => {
      const index = this.batch.length;
      this.batch.push(item);

      // Clear existing timeout
      if (this.timeout) {
        clearTimeout(this.timeout);
      }

      // Set new timeout
      this.timeout = setTimeout(async () => {
        const currentBatch = [...this.batch];
        this.batch = [];

        try {
          const results = await this.processor(currentBatch);
          resolve(results[index]);
        } catch (error) {
          reject(error);
        }
      }, this.wait);
    });
  }

  flush(): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    this.batch = [];
  }
}

/**
 * Memory-efficient pagination helper
 */
export class PaginationManager<T> {
  private items: T[] = [];
  private pageSize: number;
  private currentPage: number = 1;

  constructor(pageSize: number = 10) {
    this.pageSize = pageSize;
  }

  setItems(items: T[]): void {
    this.items = items;
    this.currentPage = 1;
  }

  getCurrentPage(): T[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.items.slice(start, end);
  }

  nextPage(): T[] {
    if (this.hasNextPage()) {
      this.currentPage++;
    }
    return this.getCurrentPage();
  }

  previousPage(): T[] {
    if (this.hasPreviousPage()) {
      this.currentPage--;
    }
    return this.getCurrentPage();
  }

  goToPage(page: number): T[] {
    const totalPages = this.getTotalPages();
    if (page >= 1 && page <= totalPages) {
      this.currentPage = page;
    }
    return this.getCurrentPage();
  }

  hasNextPage(): boolean {
    return this.currentPage < this.getTotalPages();
  }

  hasPreviousPage(): boolean {
    return this.currentPage > 1;
  }

  getTotalPages(): number {
    return Math.ceil(this.items.length / this.pageSize);
  }

  getPageInfo(): {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
  } {
    return {
      currentPage: this.currentPage,
      totalPages: this.getTotalPages(),
      pageSize: this.pageSize,
      totalItems: this.items.length,
    };
  }
}

/**
 * Lazy loading helper for images
 */
export const createImageLoader = () => {
  if (typeof window === 'undefined') return null;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        }
      });
    },
    {
      rootMargin: '50px', // Start loading 50px before element enters viewport
    }
  );

  return {
    observe: (element: HTMLElement) => observer.observe(element),
    unobserve: (element: HTMLElement) => observer.unobserve(element),
    disconnect: () => observer.disconnect(),
  };
};

export default {
  debounce,
  throttle,
  debounceAsync,
  requestQueue,
  BatchProcessor,
  PaginationManager,
  createImageLoader,
};
