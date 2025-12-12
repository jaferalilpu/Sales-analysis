'use client';

import React, { useState, useEffect } from 'react';
import { 
  TruckIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon,
  PrinterIcon
} from '@/components/ui/icons';

interface FulfillmentStats {
  totalOrders: number;
  unfulfilledOrders: number;
  pickedOrders: number;
  packedOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  recentFulfillments: Array<{
    id: string;
    orderNumber: string;
    fulfillmentStatus: string;
    user: {
      name: string;
      email: string;
    };
    updatedAt: string;
  }>;
  urgentOrders: Array<{
    id: string;
    orderNumber: string;
    fulfillmentStatus: string;
    user: {
      name: string;
      email: string;
    };
    createdAt: string;
  }>;
}

interface OrderFulfillmentWidgetProps {
  className?: string;
}

function OrderFulfillmentWidget({ className = '' }: OrderFulfillmentWidgetProps) {
  const [stats, setStats] = useState<FulfillmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchFulfillmentStats();
  }, []);

  const fetchFulfillmentStats = async () => {
    try {
      const response = await fetch('/api/fulfillment/dashboard', {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedOrders.length === 0) return;

    setIsProcessing(true);
    try {
      const response = await fetch('/api/fulfillment/bulk-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          orderIds: selectedOrders,
          status: bulkAction
        })
      });

      const data = await response.json();
      if (data.success) {
        await fetchFulfillmentStats();
        setSelectedOrders([]);
        setBulkAction('');
      }
    } catch (error) {
      
    } finally {
      setIsProcessing(false);
    }
  };

  const generateShippingLabels = async () => {
    if (selectedOrders.length === 0) return;

    setIsProcessing(true);
    try {
      const response = await fetch('/api/fulfillment/bulk-shipping-labels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          orderIds: selectedOrders
        })
      });

      const data = await response.json();
      if (data.success) {
        // Download the generated labels
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'shipping-labels.zip';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unfulfilled': return 'bg-red-100 text-red-800';
      case 'picked': return 'bg-yellow-100 text-yellow-800';
      case 'packed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'unfulfilled': return <ExclamationTriangleIcon className="w-4 h-4" />;
      case 'picked': return <ClockIcon className="w-4 h-4" />;
      case 'packed': return <CheckCircleIcon className="w-4 h-4" />;
      case 'shipped': return <TruckIcon className="w-4 h-4" />;
      case 'delivered': return <CheckCircleIcon className="w-4 h-4" />;
      default: return <ClockIcon className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <p className="text-gray-500">Failed to load fulfillment data</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Josefin Sans, sans-serif' }}>
          Order Fulfillment
        </h3>
        <button
          onClick={fetchFulfillmentStats}
          className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowPathIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Fulfillment Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{stats.unfulfilledOrders}</div>
          <div className="text-sm text-gray-600">Unfulfilled</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.pickedOrders}</div>
          <div className="text-sm text-gray-600">Picked</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.packedOrders}</div>
          <div className="text-sm text-gray-600">Packed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.shippedOrders}</div>
          <div className="text-sm text-gray-600">Shipped</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.deliveredOrders}</div>
          <div className="text-sm text-gray-600">Delivered</div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">
              {selectedOrders.length} orders selected
            </span>
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Select action</option>
              <option value="picked">Mark as Picked</option>
              <option value="packed">Mark as Packed</option>
              <option value="shipped">Mark as Shipped</option>
              <option value="delivered">Mark as Delivered</option>
            </select>
            <button
              onClick={handleBulkAction}
              disabled={!bulkAction || isProcessing}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isProcessing ? 'Processing...' : 'Apply'}
            </button>
            <button
              onClick={generateShippingLabels}
              disabled={isProcessing}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <PrinterIcon className="w-4 h-4" />
              <span>Generate Labels</span>
            </button>
          </div>
        </div>
      )}

      {/* Recent Fulfillments */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900" style={{ fontFamily: 'Josefin Sans, sans-serif' }}>
          Recent Activity
        </h4>
        <div className="space-y-2">
          {stats.recentFulfillments.slice(0, 5).map((order) => (
            <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedOrders.includes(order.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedOrders([...selectedOrders, order.id]);
                    } else {
                      setSelectedOrders(selectedOrders.filter(id => id !== order.id));
                    }
                  }}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div className={`p-1 rounded-full ${getStatusColor(order.fulfillmentStatus)}`}>
                  {getStatusIcon(order.fulfillmentStatus)}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Order #{order.orderNumber}
                  </div>
                  <div className="text-xs text-gray-500">
                    {order.user.name} • {new Date(order.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.fulfillmentStatus)}`}>
                {order.fulfillmentStatus.charAt(0).toUpperCase() + order.fulfillmentStatus.slice(1)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Urgent Orders */}
      {stats.urgentOrders.length > 0 && (
        <div className="mt-6 space-y-4">
          <h4 className="text-md font-medium text-red-600" style={{ fontFamily: 'Josefin Sans, sans-serif' }}>
            Urgent Orders (24h)
          </h4>
          <div className="space-y-2">
            {stats.urgentOrders.slice(0, 3).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center space-x-3">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      Order #{order.orderNumber}
                    </div>
                    <div className="text-xs text-gray-500">
                      {order.user.name} • {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                  {order.fulfillmentStatus.charAt(0).toUpperCase() + order.fulfillmentStatus.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderFulfillmentWidget;
