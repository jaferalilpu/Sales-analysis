'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { HeartIcon, ShoppingBagIcon, HeartSolidIcon } from '@/components/ui/icons';

interface Product {
  id: string;
  title: string;
  slug: string;
  minPrice: number;
  avgRating: number;
  images: { url: string; altText?: string }[];
  isInWishlist?: boolean;
}

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await fetch('/api/products/featured/list');
        if (response.ok) {
          const data = await response.json();
          setProducts(data.data.products || []);
        }
      } catch (error) {
        console.error('Failed to fetch featured products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const toggleWishlist = async (productId: string) => {
    // TODO: Implement wishlist toggle
    console.log('Toggle wishlist for product:', productId);
  };

  if (isLoading) {
    return (
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Products
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our handpicked selection of premium streetwear pieces
            </p>
          </div>
          
          <div className="product-grid">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="card animate-pulse">
                <div className="aspect-square bg-gray-200" />
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured Products
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our handpicked selection of premium streetwear pieces
          </p>
        </div>

        <div className="product-grid">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="card-hover group"
            >
              <div className="relative aspect-square overflow-hidden">
                <Link href={`/products/${product.slug}`}>
                  <Image
                    src={product.images[0]?.url || '/images/placeholder.jpg'}
                    alt={product.images[0]?.altText || product.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>
                
                {/* Wishlist button */}
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-200 opacity-0 group-hover:opacity-100"
                  aria-label="Add to wishlist"
                >
                  {product.isInWishlist ? (
                    <HeartSolidIcon className="h-5 w-5 text-red-500" />
                  ) : (
                    <HeartIcon className="h-5 w-5 text-gray-600" />
                  )}
                </button>

                {/* Quick add button */}
                <button className="absolute bottom-3 left-3 right-3 btn-primary opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                  <ShoppingBagIcon className="h-4 w-4 mr-2" />
                  Quick Add
                </button>
              </div>

              <div className="p-4">
                <Link href={`/products/${product.slug}`}>
                  <h3 className="font-medium text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-200">
                    {product.title}
                  </h3>
                </Link>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-lg text-gray-900">
                      ₹{Math.round(product.minPrice / 100)}
                    </span>
                    <span className="text-sm text-gray-500">₹{Math.round(product.minPrice / 100 * 1.2)}</span>
                  </div>
                  
                  {product.avgRating > 0 && (
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-400">★</span>
                      <span className="text-sm text-gray-600">
                        {product.avgRating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/products" className="btn-outline">
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}
