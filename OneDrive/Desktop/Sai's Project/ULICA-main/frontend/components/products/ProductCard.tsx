'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart, useWishlist } from '@/app/providers';
import { ulicaToasts, showToast } from '@/lib/toast';
import { Product as ProductType, ProductVariant } from '@/types/product';

interface Product extends Omit<ProductType, 'variants'> {
  variants?: Array<ProductVariant>;
}

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className = '' }: ProductCardProps) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0]);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  
  const { addToCart, isInCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const currentPrice = selectedVariant?.price || product.price;
  const currentStock = selectedVariant?.stockQty ?? 0;
  const isOutOfStock = currentStock === 0;
  const isInCartItem = isInCart(product.id, selectedVariant?.id);
  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = async () => {
    if (isOutOfStock) {
      showToast.error('This item is out of stock');
      return;
    }

    setIsAddingToCart(true);
    try {
      const firstImage = product.images?.[0];
      const imageUrl = typeof firstImage === 'string' 
        ? firstImage 
        : (typeof firstImage === 'object' && firstImage && 'url' in firstImage 
          ? firstImage.url 
          : undefined);
      
      await addToCart({
        productId: product.id,
        variantId: selectedVariant?.id,
        name: product.name || product.title || 'Product',
        price: currentPrice,
        quantity: 1,
        image: imageUrl,
        variant: selectedVariant ? {
          name: selectedVariant.name || 'Default',
          options: selectedVariant.options || {},
        } : undefined,
      });
    } catch (error) {
      // Error handling is done in the context
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    setIsAddingToWishlist(true);
    try {
      const firstImage = product.images?.[0];
      const imageUrl = typeof firstImage === 'string' 
        ? firstImage 
        : (typeof firstImage === 'object' && firstImage && 'url' in firstImage 
          ? firstImage.url 
          : undefined);
      
      await toggleWishlist({
        productId: product.id,
        name: product.name || product.title || 'Product',
        price: currentPrice,
        image: imageUrl,
        variant: selectedVariant ? {
          name: selectedVariant.name || 'Default',
          options: selectedVariant.options || {},
        } : undefined,
      });
    } catch (error) {
      // Error handling is done in the context
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  const discountPercentage = product.comparePrice 
    ? Math.round(((product.comparePrice - currentPrice) / product.comparePrice) * 100)
    : 0;

  return (
    <div className={`group relative bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 ${className}`}>
      {/* Wishlist Button */}
      <button
        onClick={handleToggleWishlist}
        disabled={isAddingToWishlist}
        className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-all duration-200 ${
          isWishlisted
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
        } ${isAddingToWishlist ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        {isAddingToWishlist ? (
          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        )}
      </button>

      {/* Discount Badge */}
      {discountPercentage > 0 && (
        <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
          -{discountPercentage}%
        </div>
      )}

      {/* Product Image */}
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          {product.images?.[0] ? (
            <Image
              src={typeof product.images[0] === 'string' 
                ? product.images[0] 
                : (typeof product.images[0] === 'object' && product.images[0] && 'url' in product.images[0]
                  ? product.images[0].url
                  : '/placeholder-product.jpg')}
              alt={product.name || product.title || 'Product'}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        {/* Product Name */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-medium text-gray-900 hover:text-black transition-colors duration-200 line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Variant Selection */}
        {product.variants && product.variants.length > 1 && (
          <div className="mt-2">
            <select
              value={selectedVariant?.id || ''}
              onChange={(e) => {
                const variant = product.variants?.find(v => v.id === e.target.value);
                setSelectedVariant(variant);
              }}
              className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            >
              {product.variants.map((variant) => (
                <option key={variant.id} value={variant.id}>
                  {variant.name} - ₹{variant.price}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Price */}
        <div className="mt-2 flex items-center space-x-2">
          <span className="text-lg font-bold text-gray-900">
            ₹{currentPrice.toLocaleString()}
          </span>
          {product.comparePrice && product.comparePrice > currentPrice && (
            <span className="text-sm text-gray-500 line-through">
              ₹{product.comparePrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Stock Status */}
        <div className="mt-1 text-xs text-gray-500">
          {isOutOfStock ? (
            <span className="text-red-500">Out of Stock</span>
          ) : currentStock < 10 ? (
            <span className="text-orange-500">Only {currentStock} left</span>
          ) : (
            <span className="text-green-500">In Stock</span>
          )}
        </div>

        {/* Cart Quantity Display */}
        {isInCartItem && (
          <div className="mt-1 text-xs text-blue-600">
            In cart
          </div>
        )}

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || isAddingToCart}
          className={`w-full mt-3 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
            isOutOfStock
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : isAddingToCart
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-black text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2'
          }`}
        >
          {isAddingToCart ? (
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Adding...</span>
            </div>
          ) : isOutOfStock ? (
            'Out of Stock'
          ) : (
            'Add to Cart'
          )}
        </button>
      </div>
    </div>
  );
}
