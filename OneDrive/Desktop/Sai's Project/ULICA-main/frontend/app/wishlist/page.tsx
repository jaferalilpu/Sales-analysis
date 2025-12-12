'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useWishlist, useCart, useAuth, type WishlistItem } from '@/app/providers';

export default function WishlistPage() {
  const { items: wishlistItems, removeFromWishlist } = useWishlist();
  const itemCount = wishlistItems.length;
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [isClearing, setIsClearing] = useState(false);

  const handleClearWishlist = async () => {
    if (confirm('Are you sure you want to clear your entire wishlist?')) {
      setIsClearing(true);
      try {
        // Remove all items one by one
        for (const item of wishlistItems) {
          await removeFromWishlist(item.id);
        }
      } catch (error) {
        
      } finally {
        setIsClearing(false);
      }
    }
  };

  const handleAddToCart = (item: WishlistItem) => {
    // Transform wishlist item to cart item format
    addToCart({
      productId: String(item.productId),
      variantId: undefined, // WishlistItem doesn't have variantId, use variant.name if needed
      name: item.name,
      price: item.price,
      image: item.image,
      variant: item.variant ? {
        name: item.variant.name,
        options: item.variant.options
      } : undefined,
      quantity: 1
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-black mb-4" >
              Sign in to view your wishlist
            </h1>
            <p className="text-gray-600 mb-8 text-lg" >
              Please sign in to access your saved items and wishlist.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-lg text-white bg-black hover:bg-gray-800 transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-black mb-4" >
              Your wishlist is empty
            </h1>
            <p className="text-gray-600 mb-8 text-lg" >
              Save items you love by clicking the heart icon. Your wishlist items will appear here.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-lg text-white bg-black hover:bg-gray-800 transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-black mb-2" >
                My Wishlist
              </h1>
              <p className="text-gray-600" >
                {itemCount} {itemCount === 1 ? 'item' : 'items'} saved for later
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-black hover:text-gray-600 transition-colors duration-200 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                </svg>
                <span>Continue Shopping</span>
              </Link>
              <button
                onClick={handleClearWishlist}
                disabled={isClearing}
                className="text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors duration-200 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Clear All</span>
              </button>
            </div>
          </div>
        </div>

        {/* Wishlist Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 group">
              <Link href={`/product/${item.productId}`} className="block">
                <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden mb-3">
                  <Image
                    src={item.image || '/placeholder.jpg'}
                    alt={item.name}
                    width={300}
                    height={300}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </Link>
              
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-black line-clamp-2" >
                  <Link href={`/product/${item.productId}`} className="hover:text-gray-700 transition-colors">
                    {item.name}
                  </Link>
                </h3>
                
                <p className="text-xs text-gray-600" >
                  {item.variant?.name || 'Default'}
                </p>
                
                <div className="flex items-center space-x-2">
                  <div className="text-lg font-bold text-black" >
                    ₹{item.price}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 pt-1">
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="flex-1 bg-black text-white text-center py-2 px-3 rounded-lg hover:bg-gray-800 transition-colors duration-200 text-sm font-medium"
                  >
                    Add to Cart
                  </button>
                  <Link
                    href={`/product/${item.productId}`}
                    className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-lg text-white bg-black hover:bg-gray-800 transition-all duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
            </svg>
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
