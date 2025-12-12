'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBagIcon } from '@/components/ui/icons';
import { useAuth } from '@/app/providers';
import { useCart } from '@/app/providers';

export function CartWidget() {
  const { user } = useAuth();
  const { itemCount: contextItemCount } = useCart();
  const [serverItemCount, setServerItemCount] = useState(0);
  const [localItemCount, setLocalItemCount] = useState(0);

  // Get count from localStorage for guest users
  useEffect(() => {
    const updateLocalCount = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('ulica_cart') || '[]') as Array<{ quantity?: number }>;
        const count = cart.reduce((sum: number, item) => sum + (item.quantity || 0), 0);
        setLocalItemCount(count);
      } catch (error) {
        setLocalItemCount(0);
      }
    };

    updateLocalCount();
    
    // Listen for storage changes (when cart is updated in other tabs/windows)
    window.addEventListener('storage', updateLocalCount);
    
    // Listen for custom events when cart is updated
    const handleCartUpdate = () => {
      updateLocalCount();
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('cartItemAdded', handleCartUpdate);
    window.addEventListener('cartItemRemoved', handleCartUpdate);
    
    // Poll localStorage every second for updates
    const interval = setInterval(updateLocalCount, 1000);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', updateLocalCount);
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('cartItemAdded', handleCartUpdate);
      window.removeEventListener('cartItemRemoved', handleCartUpdate);
    };
  }, []);

  // Get count from server for logged-in users
  useEffect(() => {
    if (!user) {
      setServerItemCount(0);
      return;
    }

    const fetchCartCount = async () => {
      // Double-check user exists before fetching - stop if user is null
      if (!user) {
        setServerItemCount(0);
        return;
      }

      try {
        const response = await fetch('/api/cart', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            const totalItems = data.data.totalItems || 
              data.data.items?.reduce((sum: number, item: { quantity?: number }) => sum + (item.quantity || 0), 0) || 0;
            setServerItemCount(totalItems);
          } else {
            setServerItemCount(0);
          }
        } else if (response.status === 401) {
          // 401 is expected when not logged in - handle silently
          // Stop polling if we get 401 and user is null
          setServerItemCount(0);
        } else {
          setServerItemCount(0);
        }
      } catch (error) {
        // Only log unexpected errors (not 401s which are expected for guests)
        // Network errors are also expected in some cases, so we'll be conservative
        setServerItemCount(0);
      }
    };

    fetchCartCount();
    
    // Listen for cart update events
    const handleCartUpdate = () => {
      // Only fetch if user exists
      if (user) {
        fetchCartCount();
      }
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('cartItemAdded', handleCartUpdate);
    window.addEventListener('cartItemRemoved', handleCartUpdate);
    
    // Poll for cart updates every 3 seconds (as fallback) - only if user exists
    const interval = setInterval(() => {
      if (user) {
        fetchCartCount();
      } else {
        clearInterval(interval);
      }
    }, 3000);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('cartItemAdded', handleCartUpdate);
      window.removeEventListener('cartItemRemoved', handleCartUpdate);
    };
  }, [user]);

  // Determine which count to use
  // Priority: contextItemCount > serverItemCount (for logged in) > localItemCount (for guest)
  const displayCount = user 
    ? (serverItemCount > 0 ? serverItemCount : contextItemCount)
    : (localItemCount > 0 ? localItemCount : contextItemCount);

  return (
    <Link
      href="/cart"
      className="relative p-2 text-gray-300 hover:text-white transition-colors duration-200"
      aria-label="Shopping cart"
    >
      <ShoppingBagIcon className="h-5 w-5" />
      {displayCount > 0 && (
        <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
          {displayCount > 99 ? '99+' : displayCount}
        </span>
      )}
    </Link>
  );
}
