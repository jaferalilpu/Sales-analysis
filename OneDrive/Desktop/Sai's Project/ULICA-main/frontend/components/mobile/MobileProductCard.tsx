'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { HeartIcon } from '@/components/ui/icons';
import { MobileCard } from './MobileCard';
import { useWishlist } from '@/app/providers';
import { useMobile } from '@/hooks/useMobile';

interface MobileProductCardProps {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  slug: string;
  inStock?: boolean;
  isNew?: boolean;
  isOnSale?: boolean;
  discount?: number;
}

/**
 * Mobile-optimized product card
 * - Touch-friendly
 * - Optimized image loading
 * - Quick actions
 */
export function MobileProductCard({
  id,
  name,
  price,
  compareAtPrice,
  image,
  slug,
  inStock = true,
  isNew,
  isOnSale,
  discount,
}: MobileProductCardProps) {
  const isMobile = useMobile();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const inWishlist = isInWishlist(id);

  const discountPercent = discount || (compareAtPrice && compareAtPrice > price
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0);

  return (
    <MobileCard
      className="group relative overflow-hidden"
      hoverable
    >
      <Link href={`/product/${slug}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-square bg-gray-100 overflow-hidden rounded-t-xl">
          <Image
            src={image || '/placeholder-product.jpg'}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes={isMobile ? "(max-width: 768px) 50vw, 33vw" : "33vw"}
            loading="lazy"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-2">
            {isNew && (
              <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                NEW
              </span>
            )}
            {(isOnSale || discountPercent > 0) && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist({
                productId: id,
                name,
                price,
                image,
              });
            }}
            className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md touch-target hover:bg-white transition-colors"
            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <HeartIcon
              className={`h-5 w-5 ${
                inWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'
              }`}
            />
          </button>

          {/* Out of Stock Overlay */}
          {!inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-white px-4 py-2 rounded-lg font-semibold text-sm">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
            {name}
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-gray-900">
                ₹{price.toLocaleString()}
              </span>
              {compareAtPrice && compareAtPrice > price && (
                <span className="text-sm text-gray-500 line-through">
                  ₹{compareAtPrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </MobileCard>
  );
}

