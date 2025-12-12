'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { OptimizedProductGrid } from '@/components/products/OptimizedProductGrid';
import { PerformanceMonitor } from '@/components/PerformanceMonitor';
import { MagnifyingGlassIcon, FunnelIcon, BarsArrowUpIcon } from '@/components/ui/icons';
import { MobileFilterDrawer } from '@/components/mobile/MobileFilterDrawer';
import { Product } from '@/types/product';

interface ProductFilters {
  search: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  inStock: boolean | null;
  sortBy: 'title' | 'price' | 'createdAt';
  sortOrder: 'asc' | 'desc';
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<ProductFilters>({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: 0,
    maxPrice: 10000,
    inStock: null,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Memoized filter function
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      if (filters.search && !product.title?.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.category && product.category !== filters.category) {
        return false;
      }
      if (product.price < filters.minPrice || product.price > filters.maxPrice) {
        return false;
      }
      if (filters.inStock !== null && product.inStock !== filters.inStock) {
        return false;
      }
      return true;
    });
  }, [products, filters]);

  // Memoized sort function
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      let aValue: string | number | undefined;
      let bValue: string | number | undefined;
      
      if (filters.sortBy === 'price') {
        aValue = a.price;
        bValue = b.price;
      } else if (filters.sortBy === 'title') {
        aValue = (a.title || '').toLowerCase();
        bValue = (b.title || '').toLowerCase();
      }
      
      if (filters.sortOrder === 'asc') {
        if (aValue === undefined && bValue === undefined) return 0;
        if (aValue === undefined) return 1;
        if (bValue === undefined) return -1;
        return aValue > bValue ? 1 : -1;
      } else {
        if (aValue === undefined && bValue === undefined) return 0;
        if (aValue === undefined) return 1;
        if (bValue === undefined) return -1;
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [filteredProducts, filters.sortBy, filters.sortOrder]);

  // Load products with pagination
  const loadProducts = useCallback(async (pageNum: number, reset = false) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pageNum.toString(),
        limit: '12',
        search: filters.search,
        category: filters.category,
        minPrice: filters.minPrice.toString(),
        maxPrice: filters.maxPrice.toString(),
        inStock: filters.inStock?.toString() || '',
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      });

      const response = await fetch(`/api/products?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      
      const data = await response.json();
      
      if (reset) {
        setProducts(data.products || []);
      } else {
        setProducts(prev => [...prev, ...(data.products || [])]);
      }
      
      setHasMore(data.hasMore || false);
    } catch (error) {
      // Error loading products - handled by error boundary
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Load initial products
  useEffect(() => {
    loadProducts(1, true);
  }, [loadProducts]);

  // Handle infinite scroll
  const handleScroll = useCallback(() => {
    if (loading || !hasMore) return;
    
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 1000) {
      setPage(prev => {
        const nextPage = prev + 1;
        loadProducts(nextPage, false);
        return nextPage;
      });
    }
  }, [loading, hasMore, loadProducts]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: Partial<ProductFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1);
  }, []);

  // Handle search
  const handleSearch = useCallback((search: string) => {
    handleFilterChange({ search });
  }, [handleFilterChange]);

  // Handle category filter
  const handleCategoryChange = useCallback((category: string) => {
    handleFilterChange({ category });
  }, [handleFilterChange]);

  // Handle price range
  const handlePriceRangeChange = useCallback((minPrice: number, maxPrice: number) => {
    handleFilterChange({ minPrice, maxPrice });
  }, [handleFilterChange]);

  // Handle stock filter
  const handleStockFilter = useCallback((inStock: boolean | null) => {
    handleFilterChange({ inStock });
  }, [handleFilterChange]);

  // Handle sort
  const handleSort = useCallback((sortBy: ProductFilters['sortBy'], sortOrder: ProductFilters['sortOrder']) => {
    handleFilterChange({ sortBy, sortOrder });
  }, [handleFilterChange]);

  const [isFilterOpen, setIsFilterOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <PerformanceMonitor />
      
      {/* Header - Mobile Optimized */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="w-full sm:w-auto">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Products</h1>
              <p className="mt-1 text-sm text-gray-500">
                {sortedProducts.length} products found
              </p>
            </div>
            
            {/* Search & Filter - Mobile Optimized */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={filters.search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full sm:w-auto pl-10 pr-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  style={{ fontSize: '16px' }}
                />
              </div>
              
              {/* Mobile Filter Button */}
              <button
                onClick={() => setIsFilterOpen(true)}
                className="lg:hidden p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors touch-target"
                aria-label="Open filters"
              >
                <FunnelIcon className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Filters Sidebar - Hidden on mobile, shown in drawer */}
          <div className="hidden lg:block lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
              
              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  <option value="electronics">Electronics</option>
                  <option value="clothing">Clothing</option>
                  <option value="home">Home & Garden</option>
                  <option value="sports">Sports</option>
                  <option value="books">Books</option>
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => handlePriceRangeChange(Number(e.target.value), filters.maxPrice)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => handlePriceRangeChange(filters.minPrice, Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Stock Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Status
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="stock"
                      checked={filters.inStock === null}
                      onChange={() => handleStockFilter(null)}
                      className="mr-2"
                    />
                    All Products
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="stock"
                      checked={filters.inStock === true}
                      onChange={() => handleStockFilter(true)}
                      className="mr-2"
                    />
                    In Stock
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="stock"
                      checked={filters.inStock === false}
                      onChange={() => handleStockFilter(false)}
                      className="mr-2"
                    />
                    Out of Stock
                  </label>
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-');
                    handleSort(sortBy as ProductFilters['sortBy'], sortOrder as ProductFilters['sortOrder']);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="name-asc">Name A-Z</option>
                  <option value="name-desc">Name Z-A</option>
                  <option value="price-asc">Price Low to High</option>
                  <option value="price-desc">Price High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <OptimizedProductGrid
              products={sortedProducts}
              isLoading={loading}
              hasMore={hasMore}
              onLoadMore={() => {
                if (!loading && hasMore) {
                  setPage(prev => {
                    const nextPage = prev + 1;
                    loadProducts(nextPage, false);
                    return nextPage;
                  });
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={() => {}}
        onReset={() => {
          setFilters({
            search: '',
            category: '',
            minPrice: 0,
            maxPrice: 10000,
            inStock: null,
            sortBy: 'createdAt',
            sortOrder: 'desc'
          });
        }}
      >
        {/* Category Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
            style={{ fontSize: '16px' }}
          >
            <option value="">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="home">Home & Garden</option>
            <option value="sports">Sports</option>
            <option value="books">Books</option>
          </select>
        </div>

        {/* Price Range */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price Range
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => handlePriceRangeChange(Number(e.target.value), filters.maxPrice)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              style={{ fontSize: '16px' }}
            />
            <span className="text-gray-500">to</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => handlePriceRangeChange(filters.minPrice, Number(e.target.value))}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              style={{ fontSize: '16px' }}
            />
          </div>
        </div>

        {/* Stock Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stock Status
          </label>
          <div className="space-y-3">
            <label className="flex items-center touch-target">
              <input
                type="radio"
                name="stock-mobile"
                checked={filters.inStock === null}
                onChange={() => handleStockFilter(null)}
                className="mr-3 w-5 h-5"
              />
              <span>All Products</span>
            </label>
            <label className="flex items-center touch-target">
              <input
                type="radio"
                name="stock-mobile"
                checked={filters.inStock === true}
                onChange={() => handleStockFilter(true)}
                className="mr-3 w-5 h-5"
              />
              <span>In Stock</span>
            </label>
            <label className="flex items-center touch-target">
              <input
                type="radio"
                name="stock-mobile"
                checked={filters.inStock === false}
                onChange={() => handleStockFilter(false)}
                className="mr-3 w-5 h-5"
              />
              <span>Out of Stock</span>
            </label>
          </div>
        </div>

        {/* Sort Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-');
              handleSort(sortBy as ProductFilters['sortBy'], sortOrder as ProductFilters['sortOrder']);
            }}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
            style={{ fontSize: '16px' }}
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="title-asc">Name A-Z</option>
            <option value="title-desc">Name Z-A</option>
            <option value="price-asc">Price Low to High</option>
            <option value="price-desc">Price High to Low</option>
          </select>
        </div>
      </MobileFilterDrawer>
    </div>
  );
}
