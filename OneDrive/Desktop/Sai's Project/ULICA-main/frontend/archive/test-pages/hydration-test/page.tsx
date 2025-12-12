'use client';

import { useState } from 'react';
import { showToast, ulicaToasts } from '@/lib/toast';
import { useAuth, useCart, useWishlist } from '@/app/providers';

export default function HydrationTestPage() {
  const [testMessage, setTestMessage] = useState('Hydration Test Page');
  const { user, isLoading } = useAuth();
  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();

  const testGenericToast = () => {
    showToast.success('Generic toast test successful!');
  };

  const testUlicaToast = () => {
    ulicaToasts.addedToCart('Test Product');
  };

  const testCartAction = async () => {
    try {
      await addToCart({
        productId: 'test-1',
        name: 'Test Product',
        price: 99.99,
        quantity: 1,
        image: '/placeholder.jpg',
      });
      ulicaToasts.addedToCart('Test Product');
    } catch (error) {
      showToast.error('Failed to add test product to cart');
    }
  };

  const testWishlistAction = async () => {
    try {
      await addToWishlist({
        productId: 'test-1',
        name: 'Test Product',
        price: 99.99,
        image: '/placeholder.jpg',
      });
      ulicaToasts.addedToWishlist('Test Product');
    } catch (error) {
      showToast.error('Failed to add test product to wishlist');
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-black mb-8">{testMessage}</h1>
        
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Context Status</h2>
          <div className="bg-gray-100 p-4 rounded-lg">
            <p><strong>Auth Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
            <p><strong>User:</strong> {user ? user.email : 'Not logged in'}</p>
            <p><strong>Is Client:</strong> {typeof window !== 'undefined' ? 'Yes' : 'No'}</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Toast Tests</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={testGenericToast}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Test Generic Toast
            </button>
            
            <button
              onClick={testUlicaToast}
              className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
            >
              Test ULICA Toast
            </button>
            
            <button
              onClick={testCartAction}
              className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors"
            >
              Test Cart Action
            </button>
            
            <button
              onClick={testWishlistAction}
              className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors"
            >
              Test Wishlist Action
            </button>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Hydration Status</h2>
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <p className="font-semibold">✅ Hydration Test Successful!</p>
            <p>If you can see this page without any console errors, the hydration mismatch has been resolved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
