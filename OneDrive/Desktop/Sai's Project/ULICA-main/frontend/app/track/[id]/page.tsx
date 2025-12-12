'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { OrderTracking } from '@/components/tracking/OrderTracking';
import { useAuth } from '@/app/providers';
import { Order } from '@/types/order';
import { getErrorMessage } from '@/types/common';

// Using Order type from types/order.ts

export default function TrackOrderPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        setError('');

        // Try to fetch by order ID first
        let response = await fetch(`/api/orders/${orderId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        // If not found by ID, try by order number
        if (!response.ok) {
          const trackingResponse = await fetch(`/api/orders/tracking/${orderId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });
          
          if (trackingResponse.ok) {
            const trackingData = await trackingResponse.json();
            if (trackingData.success && trackingData.data?.order) {
              setOrder(trackingData.data.order);
              setIsLoading(false);
              return;
            }
          }
        }

        const data = await response.json();

        if (response.ok && data.success) {
          setOrder(data.data.order || data.data);
        } else {
          setError(data.message || data.error || 'Order not found');
        }
      } catch (err: unknown) {
        const errorMessage = getErrorMessage(err);
        setError('Failed to load order information');
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
              <p className="text-gray-600 mb-6">{error || 'The order you are looking for does not exist or you do not have permission to view it.'}</p>
              <div className="flex justify-center space-x-4">
                <Link
                  href="/dashboard"
                  className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium"
                >
                  Go to Dashboard
                </Link>
                <Link
                  href="/"
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if order has AWB number for tracking
  const hasTracking = order.awbNumber && order.awbNumber.trim() !== '';

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="text-gray-600 hover:text-gray-900 mb-4 inline-flex items-center text-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Track Your Order</h1>
          <p className="text-gray-600 mt-2">Order #{order.orderNumber}</p>
        </div>

        {/* Order Info Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Order Number</p>
              <p className="font-medium text-gray-900">{order.orderNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Order Status</p>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Order Date</p>
              <p className="font-medium text-gray-900">
                {new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            {order.awbNumber && (
              <div>
                <p className="text-sm text-gray-500 mb-1">AWB Number</p>
                <p className="font-medium text-gray-900">{order.awbNumber}</p>
              </div>
            )}
          </div>
        </div>

        {/* Tracking Component */}
        {hasTracking ? (
          <OrderTracking awbCode={order.awbNumber!} orderId={order.orderNumber} />
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tracking Not Available Yet</h3>
              <p className="text-gray-600 mb-4">
                {order.status === 'processing' || order.status === 'pending' 
                  ? 'Your order is being processed. Tracking information will be available once your order is shipped.'
                  : 'Tracking information is not available for this order yet. Please check back later or contact support.'}
              </p>
              {order.trackingUrl && (
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium"
                >
                  Track on Courier Website
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Order Items Preview */}
        {order.items && order.items.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4">
                  {item.product?.images?.[0] && (
                    <div className="w-16 h-16 relative rounded overflow-hidden">
                      <Image
                        src={item.product.images[0].url}
                        alt={item.product.title || item.title}
                        width={64}
                        height={64}
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.product?.title || item.title || 'Product'}</p>
                    {item.variant?.title && (
                      <p className="text-sm text-gray-600">Variant: {item.variant.title}</p>
                    )}
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

