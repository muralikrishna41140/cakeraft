/**
 * Custom React hooks for optimized data fetching
 * Implements caching, deduplication, and error handling
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import optimizedAPI from '@/lib/optimizedApi';

interface UseQueryOptions {
  enabled?: boolean;
  refetchOnMount?: boolean;
  refetchInterval?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

interface UseQueryResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Generic query hook with caching
 */
export function useQuery<T>(
  queryKey: string,
  queryFn: () => Promise<T>,
  options: UseQueryOptions = {}
): UseQueryResult<T> {
  const {
    enabled = true,
    refetchOnMount = false,
    refetchInterval,
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await queryFn();
      
      if (isMounted.current) {
        setData(result);
        setError(null);
        onSuccess?.(result);
      }
    } catch (err) {
      const error = err as Error;
      
      if (isMounted.current) {
        setError(error);
        onError?.(error);
        console.error(`Query error [${queryKey}]:`, error);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [queryKey, queryFn, enabled, onSuccess, onError]);

  useEffect(() => {
    isMounted.current = true;

    if (enabled) {
      if (refetchOnMount || data === null) {
        fetchData();
      }

      // Setup interval if specified
      if (refetchInterval && refetchInterval > 0) {
        intervalRef.current = setInterval(fetchData, refetchInterval);
      }
    }

    return () => {
      isMounted.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, refetchOnMount, refetchInterval, fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}

/**
 * Hook for fetching products with caching
 */
export function useProducts(
  params?: { category?: string; search?: string },
  options?: UseQueryOptions
) {
  const queryKey = `products-${JSON.stringify(params || {})}`;
  
  return useQuery(
    queryKey,
    () => optimizedAPI.products.getProducts(params),
    options
  );
}

/**
 * Hook for fetching single product
 */
export function useProduct(id: string | null, options?: UseQueryOptions) {
  const queryKey = `product-${id}`;
  
  return useQuery(
    queryKey,
    () => (id ? optimizedAPI.products.getProduct(id) : Promise.resolve(null)),
    { ...options, enabled: !!id && (options?.enabled !== false) }
  );
}

/**
 * Hook for fetching categories with caching
 */
export function useCategories(options?: UseQueryOptions) {
  return useQuery(
    'categories',
    () => optimizedAPI.products.getCategories(),
    options
  );
}

/**
 * Hook for fetching revenue data
 */
export function useTodayRevenue(options?: UseQueryOptions) {
  return useQuery(
    'revenue-today',
    () => optimizedAPI.revenue.getTodayRevenue(),
    {
      refetchInterval: 2 * 60 * 1000, // Auto-refresh every 2 minutes
      ...options,
    }
  );
}

export function useWeeklyRevenue(options?: UseQueryOptions) {
  return useQuery(
    'revenue-weekly',
    () => optimizedAPI.revenue.getWeeklyRevenue(),
    {
      refetchInterval: 10 * 60 * 1000, // Auto-refresh every 10 minutes
      ...options,
    }
  );
}

export function use30DaysRevenue(options?: UseQueryOptions) {
  return useQuery(
    'revenue-30days',
    () => optimizedAPI.revenue.get30DaysRevenue(),
    {
      refetchInterval: 10 * 60 * 1000, // Auto-refresh every 10 minutes
      ...options,
    }
  );
}

/**
 * Hook for fetching bills
 */
export function useBills(
  params?: { page?: number; limit?: number },
  options?: UseQueryOptions
) {
  const queryKey = `bills-${JSON.stringify(params || {})}`;
  
  return useQuery(
    queryKey,
    () => optimizedAPI.checkout.getBills(params),
    options
  );
}

/**
 * Hook for fetching sales summary
 */
export function useSalesSummary(options?: UseQueryOptions) {
  return useQuery(
    'sales-summary',
    () => optimizedAPI.checkout.getSalesSummary(),
    {
      refetchInterval: 60 * 1000, // Auto-refresh every minute
      ...options,
    }
  );
}

/**
 * Mutation hook for create/update/delete operations
 */
interface UseMutationOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData>
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (variables: TVariables) => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await mutationFn(variables);
        options?.onSuccess?.(data);
        return data;
      } catch (err) {
        const error = err as Error;
        setError(error);
        options?.onError?.(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [mutationFn, options]
  );

  return {
    mutate,
    isLoading,
    error,
  };
}

/**
 * Debounced search hook
 */
export function useDebouncedSearch(initialValue: string = '', delay: number = 500) {
  const [value, setValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return [debouncedValue, value, setValue] as const;
}

/**
 * Optimistic update hook
 */
export function useOptimisticUpdate<T>(
  initialData: T,
  updateFn: (newData: T) => Promise<void>
) {
  const [data, setData] = useState<T>(initialData);
  const [isUpdating, setIsUpdating] = useState(false);
  const previousDataRef = useRef<T>(initialData);

  const update = useCallback(
    async (newData: T) => {
      // Save current data for rollback
      previousDataRef.current = data;
      
      // Optimistically update UI
      setData(newData);
      setIsUpdating(true);

      try {
        await updateFn(newData);
      } catch (error) {
        // Rollback on error
        setData(previousDataRef.current);
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [data, updateFn]
  );

  return {
    data,
    update,
    isUpdating,
  };
}

/**
 * Intersection observer hook for lazy loading
 */
export function useIntersectionObserver(
  elementRef: React.RefObject<HTMLElement>,
  options: IntersectionObserverInit = {}
) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, options);

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [elementRef, options]);

  return isVisible;
}

export default {
  useQuery,
  useProducts,
  useProduct,
  useCategories,
  useTodayRevenue,
  useWeeklyRevenue,
  use30DaysRevenue,
  useBills,
  useSalesSummary,
  useMutation,
  useDebouncedSearch,
  useOptimisticUpdate,
  useIntersectionObserver,
};
