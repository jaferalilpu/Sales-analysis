'use client';

import { memo, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HeartIcon, EyeIcon, HeartSolidIcon } from '@/components/ui/icons';

interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images: { url: string; altText?: string }[];
  isInWishlist?: boolean;
  rating?: number;
  reviewCount?: number;
  isNew?: boolean;
  isOnSale?: boolean;
}

interface OptimizedProductCardProps {
  product: Product;
  onToggleWishlist?: (productId: string) => void;
  onQuickView?: (productId: string) => void;
}

export const OptimizedProductCard = memo<OptimizedProductCardProps>(({
  product,
  onToggleWishlist,
  onQuickView
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleToggleWishlist = useCallback(() => {
    if (onToggleWishlist) {
      onToggleWishlist(product.id);
    }
  }, [product.id, onToggleWishlist]);

  const handleQuickView = useCallback(() => {
    if (onQuickView) {
      onQuickView(product.id);
    }
  }, [product.id, onQuickView]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const discountPercentage = product.discount 
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  return (
    <div 
      className="group relative bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-200 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Link href={`/product/${product.id}`}>
          <Image
            src={product.images[0]?.url || '/placeholder-product.jpg'}
            alt={product.images[0]?.altText || product.title}
            fill
            className={`object-cover transition-transform duration-300 ${
              isHovered ? 'scale-105' : 'scale-100'
            }`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          />
        </Link>

        {/* Loading Skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isNew && (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              NEW
            </span>
          )}
          {product.isOnSale && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              SALE
            </span>
          )}
          {discountPercentage > 0 && (
            <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              -{discountPercentage}%
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className={`absolute top-2 right-2 flex flex-col gap-2 transition-opacity duration-200 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <button
            onClick={handleToggleWishlist}
            className="p-2 bg-white/90 hover:bg-white rounded-full shadow-sm transition-colors duration-200"
            aria-label={product.isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            {product.isInWishlist ? (
              <HeartSolidIcon className="w-4 h-4 text-red-500" />
            ) : (
              <HeartIcon className="w-4 h-4 text-gray-600" />
            )}
          </button>
          <button
            onClick={handleQuickView}
            className="p-2 bg-white/90 hover:bg-white rounded-full shadow-sm transition-colors duration-200"
            aria-label="Quick view"
          >
            <EyeIcon className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <Link href={`/product/${product.id}`}>
          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors duration-200">
            {product.title}
          </h3>
        </Link>

        {/* Rating */}
        {product.rating && product.reviewCount && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(product.rating!)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-gray-500">
              ({product.reviewCount})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-gray-900">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

OptimizedProductCard.displayName = 'OptimizedProductCard';
