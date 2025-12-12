'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/app/providers';
import { 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  TruckIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  total: number;
  createdAt: string;
  orderItems: Array<{
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      title: string;
      slug: string;
      images: Array<{
        url: string;
        altText?: string;
      }>;
    };
    variant?: {
      title: string;
      options: Record<string, unknown>;
    };
  }>;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/orders', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data.data?.orders || []);
      } else {
        setError('Failed to fetch orders');
      }
    } catch (err) {
      setError('Failed to fetch orders');
      
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'processing':
        return <ClockIcon className="w-5 h-5 text-yellow-600" />;
      case 'cancelled':
        return <XCircleIcon className="w-5 h-5 text-red-600" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
            <h1 className="text-4xl font-bold text-black mb-4" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
              Sign in to view your orders
            </h1>
            <p className="text-gray-600 mb-8 text-lg" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
              Please sign in to access your order history.
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
              Loading your orders...
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
              Error Loading Orders
            </h1>
            <p className="text-gray-600 mb-8" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
              {error}
            </p>
            <button
              onClick={fetchOrders}
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            Order History
          </h1>
          <p className="text-gray-600 mt-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            Track and manage your orders
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
              No orders yet
            </h2>
            <p className="text-gray-600 mb-8" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
              Start shopping to see your orders here.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                        Order #{order.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-500" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2 sm:mt-0">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status}</span>
                      </span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                        <span className="capitalize">{order.paymentStatus}</span>
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-4">
                    {order.orderItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                            {item.product.images?.[0] ? (
                              <Image
                                src={item.product.images[0].url}
                                alt={item.product.title}
                                width={64}
                                height={64}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                            ) : (
                              <span className="text-gray-400 text-xs">No Image</span>
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                            {item.product.title}
                          </h4>
                          {item.variant && (
                            <p className="text-sm text-gray-500" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                              Variant: {item.variant.title}
                            </p>
                          )}
                          <p className="text-sm text-gray-500" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                            ₹{item.price * item.quantity}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-xs text-gray-500">
                              ₹{item.price} each
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Total and Actions */}
                  <div className="mt-6 pt-6 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-lg font-semibold text-gray-900 mb-4 sm:mb-0" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                      Total: ₹{order.total}
                    </div>
                    <div className="flex space-x-3">
                      <Link
                        href={`/orders/${order.id}`}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                      >
                        <EyeIcon className="w-4 h-4 mr-2" />
                        View Details
                      </Link>
                      {order.status === 'completed' && (
                        <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black">
                          <TruckIcon className="w-4 h-4 mr-2" />
                          Track Package
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
