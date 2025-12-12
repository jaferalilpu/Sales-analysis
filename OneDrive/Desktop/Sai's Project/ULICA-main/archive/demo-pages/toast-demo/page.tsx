'use client';

import React from 'react';
import { ulicaToasts, showToast, withToast } from '@/lib/toast';

export default function ToastDemoPage() {
  const handleSuccessToast = () => {
    showToast.success('This is a success message!');
  };

  const handleErrorToast = () => {
    showToast.error('This is an error message!');
  };

  const handleInfoToast = () => {
    showToast.info('This is an info message!');
  };

  const handleLoadingToast = () => {
    const toastId = showToast.loading('This is a loading message...');
    setTimeout(() => {
      showToast.dismiss(toastId);
      showToast.success('Loading completed!');
    }, 3000);
  };

  const handleCartToasts = () => {
    ulicaToasts.addedToCart('Sample Product');
    setTimeout(() => ulicaToasts.removedFromCart('Sample Product'), 2000);
    setTimeout(() => ulicaToasts.quantityUpdated('Sample Product', 3), 4000);
  };

  const handleOrderToasts = () => {
    ulicaToasts.processingOrder();
    setTimeout(() => {
      showToast.dismissAll();
      ulicaToasts.orderPlaced('UL-2024-001');
    }, 2000);
  };

  const handleAuthToasts = () => {
    ulicaToasts.loginSuccess('John Doe');
    setTimeout(() => ulicaToasts.registerSuccess('jane@example.com'), 2000);
    setTimeout(() => ulicaToasts.logoutSuccess(), 4000);
  };

  const handlePaymentToasts = () => {
    ulicaToasts.processingPayment();
    setTimeout(() => {
      showToast.dismissAll();
      ulicaToasts.paymentSuccess(2500);
    }, 2000);
  };

  const handleWishlistToasts = () => {
    ulicaToasts.addedToWishlist('Cool T-Shirt');
    setTimeout(() => ulicaToasts.removedFromWishlist('Cool T-Shirt'), 2000);
  };

  const handleErrorToasts = () => {
    ulicaToasts.networkError();
    setTimeout(() => ulicaToasts.serverError(), 2000);
    setTimeout(() => ulicaToasts.orderFailed('Payment declined'), 4000);
  };

  const handleAsyncAction = async () => {
    await withToast(
      async () => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        return { message: 'Async action completed successfully!' };
      },
      {
        loading: 'Processing async action...',
        success: (result) => result.message,
        error: 'Async action failed',
      }
    );
  };

  const handleAsyncError = async () => {
    await withToast(
      async () => {
        // Simulate API error
        await new Promise(resolve => setTimeout(resolve, 1000));
        throw new Error('Simulated API error');
      },
      {
        loading: 'Processing async action...',
        error: (error) => `Async error: ${error.message}`,
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ULICA Toast Notifications Demo
          </h1>
          <p className="text-lg text-gray-600">
            Test all the toast notification features implemented in the ULICA project
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Basic Toast Types */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Toast Types</h3>
            <div className="space-y-3">
              <button
                onClick={handleSuccessToast}
                className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors duration-200"
              >
                Success Toast
              </button>
              <button
                onClick={handleErrorToast}
                className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors duration-200"
              >
                Error Toast
              </button>
              <button
                onClick={handleInfoToast}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                Info Toast
              </button>
              <button
                onClick={handleLoadingToast}
                className="w-full bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors duration-200"
              >
                Loading Toast
              </button>
            </div>
          </div>

          {/* Cart Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cart Actions</h3>
            <div className="space-y-3">
              <button
                onClick={handleCartToasts}
                className="w-full bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors duration-200"
              >
                Cart Flow Demo
              </button>
              <button
                onClick={() => ulicaToasts.cartCleared()}
                className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors duration-200"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Order Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Actions</h3>
            <div className="space-y-3">
              <button
                onClick={handleOrderToasts}
                className="w-full bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-600 transition-colors duration-200"
              >
                Order Flow Demo
              </button>
              <button
                onClick={() => ulicaToasts.orderFailed('Insufficient inventory')}
                className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors duration-200"
              >
                Order Failed
              </button>
            </div>
          </div>

          {/* Authentication */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Authentication</h3>
            <div className="space-y-3">
              <button
                onClick={handleAuthToasts}
                className="w-full bg-teal-500 text-white py-2 px-4 rounded-lg hover:bg-teal-600 transition-colors duration-200"
              >
                Auth Flow Demo
              </button>
              <button
                onClick={() => ulicaToasts.loginFailed('Invalid credentials')}
                className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors duration-200"
              >
                Login Failed
              </button>
            </div>
          </div>

          {/* Payment Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Actions</h3>
            <div className="space-y-3">
              <button
                onClick={handlePaymentToasts}
                className="w-full bg-emerald-500 text-white py-2 px-4 rounded-lg hover:bg-emerald-600 transition-colors duration-200"
              >
                Payment Flow Demo
              </button>
              <button
                onClick={() => ulicaToasts.paymentFailed('Card declined')}
                className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors duration-200"
              >
                Payment Failed
              </button>
            </div>
          </div>

          {/* Wishlist Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Wishlist Actions</h3>
            <div className="space-y-3">
              <button
                onClick={handleWishlistToasts}
                className="w-full bg-pink-500 text-white py-2 px-4 rounded-lg hover:bg-pink-600 transition-colors duration-200"
              >
                Wishlist Flow Demo
              </button>
            </div>
          </div>

          {/* Error Scenarios */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Error Scenarios</h3>
            <div className="space-y-3">
              <button
                onClick={handleErrorToasts}
                className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors duration-200"
              >
                Error Scenarios
              </button>
            </div>
          </div>

          {/* Async Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Async Actions</h3>
            <div className="space-y-3">
              <button
                onClick={handleAsyncAction}
                className="w-full bg-cyan-500 text-white py-2 px-4 rounded-lg hover:bg-cyan-600 transition-colors duration-200"
              >
                Async Success
              </button>
              <button
                onClick={handleAsyncError}
                className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors duration-200"
              >
                Async Error
              </button>
            </div>
          </div>

          {/* Utility Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Utility Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => showToast.dismissAll()}
                className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors duration-200"
              >
                Dismiss All
              </button>
              <button
                onClick={() => {
                  for (let i = 0; i < 5; i++) {
                    setTimeout(() => {
                      showToast.info(`Toast ${i + 1}`, { icon: '🔔' });
                    }, i * 500);
                  }
                }}
                className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors duration-200"
              >
                Multiple Toasts
              </button>
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Implemented Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">✅ Toast Types</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Success notifications (green)</li>
                <li>• Error notifications (red)</li>
                <li>• Info notifications (blue)</li>
                <li>• Loading notifications (yellow)</li>
                <li>• Custom styled notifications</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">✅ ULICA Actions</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Cart operations (add, remove, update)</li>
                <li>• Order processing and placement</li>
                <li>• Authentication flows</li>
                <li>• Payment processing</li>
                <li>• Wishlist management</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">✅ Behavior</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Auto-dismiss after 3-5 seconds</li>
                <li>• Manual close button</li>
                <li>• Toast stacking support</li>
                <li>• Top-right positioning</li>
                <li>• Responsive design</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">✅ Advanced Features</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Async action wrapper</li>
                <li>• Loading state management</li>
                <li>• Error handling</li>
                <li>• Accessibility support</li>
                <li>• Custom icons and styling</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
