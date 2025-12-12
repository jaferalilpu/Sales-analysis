'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FireIcon, 
  StarIcon, 
  ShoppingBagIcon,
  ArrowTrendingUpIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface TrendingProduct {
  id: string;
  title: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  images: Array<{
    url: string;
    altText?: string;
  }>;
  variants: Array<{
    id: string;
    stock: number;
    price: number;
    compareAtPrice?: number;
  }>;
  _count: {
    orderItems: number;
    reviews: number;
    wishlistItems: number;
  };
  averageRating: number;
  totalSales: number;
  views: number;
}

export default function TrendingPage() {
  const [trendingProducts, setTrendingProducts] = useState<TrendingProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'sales' | 'rating' | 'views' | 'recent'>('sales');

  const fetchTrendingProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/products/trending?sortBy=${sortBy}&limit=20`);
      
      if (response.ok) {
        const data = await response.json();
        setTrendingProducts(data.data?.products || []);
      } else {
        setError('Failed to fetch trending products');
      }
    } catch (err) {
      setError('Failed to fetch trending products');
      
    } finally {
      setIsLoading(false);
    }
  }, [sortBy]);

  useEffect(() => {
    fetchTrendingProducts();
  }, [fetchTrendingProducts]);

  const getSortLabel = (sort: string) => {
    switch (sort) {
      case 'sales': return 'Best Sellers';
      case 'rating': return 'Highest Rated';
      case 'views': return 'Most Viewed';
      case 'recent': return 'Recently Added';
      default: return 'Best Sellers';
    }
  };

  const getTrendingBadge = (index: number) => {
    if (index === 0) return { text: '🔥 #1', color: 'bg-red-500 text-white' };
    if (index === 1) return { text: '🥈 #2', color: 'bg-gray-400 text-white' };
    if (index === 2) return { text: '🥉 #3', color: 'bg-orange-500 text-white' };
    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
              Loading trending products...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
              Error Loading Trending Products
            </h1>
            <p className="text-gray-600 mb-8" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
              {error}
            </p>
            <button
              onClick={fetchTrendingProducts}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            <FireIcon className="inline w-10 h-10 text-red-500 mr-3" />
            Trending Now
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            Discover our most popular and best-selling products. These items are flying off the shelves!
          </p>
        </div>

        {/* Sort Options */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {(['sales', 'rating', 'views', 'recent'] as const).map((sort) => (
            <button
              key={sort}
              onClick={() => setSortBy(sort)}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                sortBy === sort
                  ? 'bg-black text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
            >
              {getSortLabel(sort)}
            </button>
          ))}
        </div>

        {trendingProducts.length === 0 ? (
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ArrowTrendingUpIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
              No Trending Products Yet
            </h2>
            <p className="text-gray-600 mb-8" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
              Check back later for trending products and best sellers.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              Browse All Products
            </Link>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-6 mb-12">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    {trendingProducts.length}
                  </div>
                  <div className="text-gray-600" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    Trending Products
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    {trendingProducts.reduce((total, product) => total + product.totalSales, 0)}
                  </div>
                  <div className="text-gray-600" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    Total Sales
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    {trendingProducts.reduce((total, product) => total + product.views, 0).toLocaleString()}
                  </div>
                  <div className="text-gray-600" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    Total Views
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    {trendingProducts.reduce((total, product) => total + product._count.reviews, 0)}
                  </div>
                  <div className="text-gray-600" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    Total Reviews
                  </div>
                </div>
              </div>
            </div>

            {/* Trending Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {trendingProducts.map((product, index) => {
                const trendingBadge = getTrendingBadge(index);
                const discountPercentage = product.compareAtPrice 
                  ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
                  : 0;

                return (
                  <div
                    key={product.id}
                    className="group relative bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 hover:-translate-y-1 transition-all duration-300 ease-in-out transform"
                  >
                    {/* Trending Badge */}
                    {trendingBadge && (
                      <div className={`absolute top-3 left-3 z-10 px-2 py-1 rounded-full text-xs font-bold ${trendingBadge.color}`}>
                        {trendingBadge.text}
                      </div>
                    )}

                    {/* Discount Badge */}
                    {discountPercentage > 0 && (
                      <div className="absolute top-3 right-3 z-10 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        -{discountPercentage}%
                      </div>
                    )}

                    <Link href={`/product/${product.id}`}>
                      {/* Product Image */}
                      <div className="relative overflow-hidden bg-gray-100 aspect-[4/5] group-hover:bg-gray-300 transition-colors duration-300">
                        {product.images?.[0] ? (
                          <Image
                            src={product.images[0].url}
                            alt={product.images[0].altText || product.title}
                            width={300}
                            height={375}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400 text-sm">No Image</span>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-4">
                        <h3 className="font-medium text-sm text-black mb-3 leading-tight group-hover:text-gray-700 transition-colors duration-300 line-clamp-2">
                          {product.title}
                        </h3>
                        
                        {/* Rating */}
                        <div className="flex items-center mb-3">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <StarIcon
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= Math.round(product.averageRating)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="ml-2 text-xs text-gray-500">
                            ({product._count.reviews})
                          </span>
                        </div>
                        
                        {/* Pricing */}
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {product.compareAtPrice && product.compareAtPrice > product.price && (
                              <div className="text-xs text-gray-500 font-medium line-through">
                                ₹{product.compareAtPrice.toFixed(2)}
                              </div>
                            )}
                            <div className="text-sm text-black font-bold">
                              ₹{product.price.toFixed(2)}
                            </div>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center">
                            <ShoppingBagIcon className="w-3 h-3 mr-1" />
                            {product.totalSales} sold
                          </div>
                          <div className="flex items-center">
                            <EyeIcon className="w-3 h-3 mr-1" />
                            {product.views.toLocaleString()} views
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* CTA Section */}
            <div className="mt-16 text-center">
              <div className="bg-gray-50 rounded-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                  Find Your Next Favorite
                </h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                  These trending products are popular for a reason. Don't miss out on what everyone's talking about!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/products"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                  >
                    View All Products
                  </Link>
                  <Link
                    href="/drops"
                    className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                  >
                    Check Drops
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
