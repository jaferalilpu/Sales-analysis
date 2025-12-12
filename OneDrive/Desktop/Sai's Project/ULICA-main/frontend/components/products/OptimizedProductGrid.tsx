'use client';

import { memo, useState, useCallback, useMemo } from 'react';
import { OptimizedProductCard } from './OptimizedProductCard';
import { MagnifyingGlassIcon, FunnelIcon } from '@/components/ui/icons';
import { Product } from '@/types/product';

interface OptimizedProductGridProps {
  products: Product[];
  isLoading?: boolean;
  onToggleWishlist?: (productId: string) => void;
  onQuickView?: (productId: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  filters?: {
    category?: string;
    priceRange?: { min: number; max: number };
    sortBy?: string;
  };
  onFilterChange?: (filters: any) => void;
}

export const OptimizedProductGrid = memo<OptimizedProductGridProps>(({
  products,
  isLoading = false,
  onToggleWishlist,
  onQuickView,
  onLoadMore,
  hasMore = false,
  searchQuery = '',
  onSearchChange,
  filters = {},
  onFilterChange
}) => {
  const [showFilters, setShowFilters] = useState(false);

  // Memoize filtered and sorted products
  const processedProducts = useMemo(() => {
    let filtered = [...products];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(product => {
        const titleMatch = product.title?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
        const categoryMatch = typeof product.category === 'string' 
          ? product.category.toLowerCase().includes(searchQuery.toLowerCase())
          : (product.category && typeof product.category === 'object' && 'name' in product.category
            ? String(product.category.name || '').toLowerCase().includes(searchQuery.toLowerCase())
            : false);
        const tagsMatch = product.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) || false;
        return titleMatch || categoryMatch || tagsMatch;
      });
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    // Apply price range filter
    if (filters.priceRange) {
      filtered = filtered.filter(product => 
        product.price >= filters.priceRange!.min && 
        product.price <= filters.priceRange!.max
      );
    }

    // Apply sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price-low':
          filtered.sort((a, b) => a.price - b.price);
          break;
        case 'price-high':
          filtered.sort((a, b) => b.price - a.price);
          break;
        case 'newest':
          filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
          break;
        case 'rating':
          filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        default:
          break;
      }
    }

    return filtered;
  }, [products, searchQuery, filters]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSearchChange) {
      onSearchChange(e.target.value);
    }
  }, [onSearchChange]);

  const handleFilterChange = useCallback((key: string, value: any) => {
    if (onFilterChange) {
      onFilterChange({
        ...filters,
        [key]: value
      });
    }
  }, [filters, onFilterChange]);

  const handleLoadMore = useCallback(() => {
    if (onLoadMore && hasMore && !isLoading) {
      onLoadMore();
    }
  }, [onLoadMore, hasMore, isLoading]);

  // Loading skeleton
  const LoadingSkeleton = memo(() => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
          <div className="aspect-square bg-gray-200" />
          <div className="p-4">
            <div className="h-4 bg-gray-200 rounded mb-2" />
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-6 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  ));

  LoadingSkeleton.displayName = 'LoadingSkeleton';

  if (isLoading && products.length === 0) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <FunnelIcon className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                <option value="t-shirts">T-Shirts</option>
                <option value="hoodies">Hoodies</option>
                <option value="pants">Pants</option>
                <option value="accessories">Accessories</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy || ''}
                onChange={(e) => handleFilterChange('sortBy', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest First</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.priceRange?.min || ''}
                  onChange={(e) => handleFilterChange('priceRange', {
                    ...filters.priceRange,
                    min: e.target.value ? parseInt(e.target.value) : undefined
                  })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.priceRange?.max || ''}
                  onChange={(e) => handleFilterChange('priceRange', {
                    ...filters.priceRange,
                    max: e.target.value ? parseInt(e.target.value) : undefined
                  })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {processedProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {processedProducts.map((product) => {
              // Transform Product to OptimizedProductCard format
              const firstImage = product.images?.[0];
              const imageUrl = typeof firstImage === 'string' 
                ? firstImage 
                : (typeof firstImage === 'object' && firstImage && 'url' in firstImage 
                  ? firstImage.url 
                  : '/placeholder-product.jpg');
              
              return (
                <OptimizedProductCard
                  key={product.id}
                  product={{
                    id: product.id,
                    title: product.title || product.name || 'Product',
                    price: product.price || 0,
                    originalPrice: product.compareAtPrice || product.comparePrice,
                    discount: product.discount,
                    images: [{ url: imageUrl }],
                    isInWishlist: false, // Will be determined by wishlist context
                    rating: product.rating,
                    reviewCount: product.reviewCount,
                    isNew: product.isNew,
                    isOnSale: product.isOnSale,
                  }}
                  onToggleWishlist={onToggleWishlist}
                  onQuickView={onQuickView}
                />
              );
            })}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center pt-8">
              <button
                onClick={handleLoadMore}
                disabled={isLoading}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isLoading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">No products found</div>
          <p className="text-gray-400">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
});

OptimizedProductGrid.displayName = 'OptimizedProductGrid';
