import { useState, useEffect, useCallback } from 'react';
import { cachedFetch, invalidateCache } from './api-cache';

// API endpoints with caching and pagination
export const optimizedAPI = {
  // Products API with pagination and caching
  products: {
    list: async (params: {
      page?: number;
      limit?: number;
      search?: string;
      category?: string;
      sortBy?: string;
      priceRange?: { min: number; max: number };
    } = {}) => {
      const searchParams = new URLSearchParams();
      
      if (params.page) searchParams.set('page', params.page.toString());
      if (params.limit) searchParams.set('limit', params.limit.toString());
      if (params.search) searchParams.set('search', params.search);
      if (params.category) searchParams.set('category', params.category);
      if (params.sortBy) searchParams.set('sortBy', params.sortBy);
      if (params.priceRange) {
        searchParams.set('minPrice', params.priceRange.min.toString());
        searchParams.set('maxPrice', params.priceRange.max.toString());
      }

      const url = `/api/products?${searchParams.toString()}`;
      return cachedFetch(url, {}, 2 * 60 * 1000); // 2 minutes cache
    },

    get: async (id: string) => {
      const url = `/api/products/${id}`;
      return cachedFetch(url, {}, 5 * 60 * 1000); // 5 minutes cache
    },

    featured: async () => {
      const url = '/api/products/featured/list';
      return cachedFetch(url, {}, 10 * 60 * 1000); // 10 minutes cache
    },

    create: async (data: any) => {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        invalidateCache.products();
      }
      
      return response.json();
    },

    update: async (id: string, data: any) => {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        invalidateCache.products();
      }
      
      return response.json();
    },

    delete: async (id: string) => {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        invalidateCache.products();
      }
      
      return response.json();
    }
  },

  // Orders API with caching
  orders: {
    list: async (params: {
      page?: number;
      limit?: number;
      status?: string;
      userId?: string;
    } = {}) => {
      const searchParams = new URLSearchParams();
      
      if (params.page) searchParams.set('page', params.page.toString());
      if (params.limit) searchParams.set('limit', params.limit.toString());
      if (params.status) searchParams.set('status', params.status);
      if (params.userId) searchParams.set('userId', params.userId);

      const url = `/api/orders?${searchParams.toString()}`;
      return cachedFetch(url, {}, 1 * 60 * 1000); // 1 minute cache
    },

    get: async (id: string) => {
      const url = `/api/orders/${id}`;
      return cachedFetch(url, {}, 2 * 60 * 1000); // 2 minutes cache
    },

    create: async (data: any) => {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        invalidateCache.orders();
      }
      
      return response.json();
    },

    update: async (id: string, data: any) => {
      const response = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        invalidateCache.orders();
      }
      
      return response.json();
    }
  },

  // Admin Dashboard API with caching
  admin: {
    dashboard: async () => {
      const url = '/api/admin/dashboard';
      return cachedFetch(url, {}, 2 * 60 * 1000); // 2 minutes cache
    },

    analytics: async (params: {
      startDate?: string;
      endDate?: string;
      type?: string;
    } = {}) => {
      const searchParams = new URLSearchParams();
      
      if (params.startDate) searchParams.set('startDate', params.startDate);
      if (params.endDate) searchParams.set('endDate', params.endDate);
      if (params.type) searchParams.set('type', params.type);

      const url = `/api/analytics/dashboard?${searchParams.toString()}`;
      return cachedFetch(url, {}, 5 * 60 * 1000); // 5 minutes cache
    },

    products: {
      list: async (params: {
        page?: number;
        limit?: number;
        search?: string;
        category?: string;
        status?: string;
      } = {}) => {
        const searchParams = new URLSearchParams();
        
        if (params.page) searchParams.set('page', params.page.toString());
        if (params.limit) searchParams.set('limit', params.limit.toString());
        if (params.search) searchParams.set('search', params.search);
        if (params.category) searchParams.set('category', params.category);
        if (params.status) searchParams.set('status', params.status);

        const url = `/api/admin/products?${searchParams.toString()}`;
        return cachedFetch(url, {}, 1 * 60 * 1000); // 1 minute cache
      }
    },

    orders: {
      list: async (params: {
        page?: number;
        limit?: number;
        status?: string;
        fulfillmentStatus?: string;
      } = {}) => {
        const searchParams = new URLSearchParams();
        
        if (params.page) searchParams.set('page', params.page.toString());
        if (params.limit) searchParams.set('limit', params.limit.toString());
        if (params.status) searchParams.set('status', params.status);
        if (params.fulfillmentStatus) searchParams.set('fulfillmentStatus', params.fulfillmentStatus);

        const url = `/api/admin/orders?${searchParams.toString()}`;
        return cachedFetch(url, {}, 1 * 60 * 1000); // 1 minute cache
      }
    }
  },

  // Search API with debouncing
  search: {
    products: async (query: string, limit: number = 10) => {
      if (!query.trim()) return { data: { products: [] } };
      
      const url = `/api/products?search=${encodeURIComponent(query)}&limit=${limit}`;
      return cachedFetch(url, {}, 30 * 1000); // 30 seconds cache
    }
  }
};

// Debounced search hook
export function useDebouncedSearch<T>(
  searchFn: (query: string) => Promise<T>,
  delay: number = 300
) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await searchFn(query);
        setResults(data);
      } catch (error) {
        console.error('Search error:', error);
        setResults(null);
      } finally {
        setIsLoading(false);
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [query, searchFn, delay]);

  return {
    query,
    setQuery,
    results,
    isLoading
  };
}
