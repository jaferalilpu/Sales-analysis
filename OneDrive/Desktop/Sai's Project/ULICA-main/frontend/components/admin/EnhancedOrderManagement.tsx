'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShoppingBagIcon, 
  CurrencyDollarIcon, 
  TruckIcon, 
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  FunnelIcon,
  CalendarIcon,
  UserIcon,
  PrinterIcon,
  ArrowPathIcon,
  CheckIcon
} from '@/components/ui/icons';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  totalAmount: number;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    variant: {
      title: string;
      product: {
        title: string;
        images: Array<{
          url: string;
          alt?: string;
          isPrimary: boolean;
        }>;
      };
    };
  }>;
}

interface OrderFilters {
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  search: string;
  dateRange: string;
}

export default function EnhancedOrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [filters, setFilters] = useState<OrderFilters>({
    status: '',
    paymentStatus: '',
    fulfillmentStatus: '',
    search: '',
    dateRange: ''
  });
  const [bulkAction, setBulkAction] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const loadOrders = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(filters.status && { status: filters.status }),
        ...(filters.paymentStatus && { paymentStatus: filters.paymentStatus }),
        ...(filters.fulfillmentStatus && { fulfillmentStatus: filters.fulfillmentStatus }),
        ...(filters.search && { search: filters.search }),
        ...(filters.dateRange && { dateRange: filters.dateRange })
      });

      const response = await fetch(`/api/admin/orders?${params}`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.data.orders);
        setTotalPages(data.data.totalPages);
      }
    } catch (error) {
      
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleBulkAction = async () => {
    if (!bulkAction || selectedOrders.length === 0) return;

    setIsProcessing(true);
    try {
      let endpoint = '';
      let body: { orderIds: string[]; [key: string]: unknown } = { orderIds: selectedOrders };

      switch (bulkAction) {
        case 'picked':
        case 'packed':
        case 'shipped':
        case 'delivered':
          endpoint = '/api/fulfillment/bulk-status';
          body.status = bulkAction;
          break;
        case 'generate_labels':
          endpoint = '/api/fulfillment/bulk-shipping-labels';
          break;
        default:
          endpoint = '/api/admin/orders/bulk-update';
          body.status = bulkAction;
      }

      const response = await fetch(endpoint, {
        method: bulkAction === 'generate_labels' ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(body)
      });

      const data = await response.json();
      if (data.success) {
        await loadOrders();
        setSelectedOrders([]);
        setBulkAction('');
      }
    } catch (error) {
      
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const selectAllOrders = () => {
    setSelectedOrders(orders.map(order => order.id));
  };

  const clearSelection = () => {
    setSelectedOrders([]);
  };

  const getStatusColor = (status: string, type: 'order' | 'payment' | 'fulfillment') => {
    const colors = {
      order: {
        pending: 'bg-yellow-100 text-yellow-800',
        confirmed: 'bg-blue-100 text-blue-800',
        shipped: 'bg-purple-100 text-purple-800',
        delivered: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800'
      },
      payment: {
        unpaid: 'bg-red-100 text-red-800',
        paid: 'bg-green-100 text-green-800',
        failed: 'bg-red-100 text-red-800',
        refunded: 'bg-gray-100 text-gray-800'
      },
      fulfillment: {
        unfulfilled: 'bg-red-100 text-red-800',
        picked: 'bg-yellow-100 text-yellow-800',
        packed: 'bg-blue-100 text-blue-800',
        shipped: 'bg-purple-100 text-purple-800',
        delivered: 'bg-green-100 text-green-800'
      }
    };

    return (colors[type] as any)[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string, type: 'order' | 'payment' | 'fulfillment') => {
    const icons = {
      order: {
        pending: <ClockIcon className="w-4 h-4" />,
        confirmed: <CheckCircleIcon className="w-4 h-4" />,
        shipped: <TruckIcon className="w-4 h-4" />,
        delivered: <CheckCircleIcon className="w-4 h-4" />,
        cancelled: <XCircleIcon className="w-4 h-4" />
      },
      payment: {
        unpaid: <XCircleIcon className="w-4 h-4" />,
        paid: <CheckCircleIcon className="w-4 h-4" />,
        failed: <XCircleIcon className="w-4 h-4" />,
        refunded: <ArrowPathIcon className="w-4 h-4" />
      },
      fulfillment: {
        unfulfilled: <ClockIcon className="w-4 h-4" />,
        picked: <ClockIcon className="w-4 h-4" />,
        packed: <CheckCircleIcon className="w-4 h-4" />,
        shipped: <TruckIcon className="w-4 h-4" />,
        delivered: <CheckCircleIcon className="w-4 h-4" />
      }
    };

    return (icons[type] as any)[status] || <ClockIcon className="w-4 h-4" />;
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Josefin Sans, sans-serif' }}>
          Order Management
        </h1>
        <button
          onClick={loadOrders}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <ArrowPathIcon className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Status
            </label>
            <select
              value={filters.paymentStatus}
              onChange={(e) => setFilters(prev => ({ ...prev, paymentStatus: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Payments</option>
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fulfillment Status
            </label>
            <select
              value={filters.fulfillmentStatus}
              onChange={(e) => setFilters(prev => ({ ...prev, fulfillmentStatus: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Fulfillment</option>
              <option value="unfulfilled">Unfulfilled</option>
              <option value="picked">Picked</option>
              <option value="packed">Packed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Order number, customer..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-indigo-700">
              {selectedOrders.length} orders selected
            </span>
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="px-3 py-2 border border-indigo-300 rounded-lg text-sm"
            >
              <option value="">Select action</option>
              <option value="confirmed">Mark as Confirmed</option>
              <option value="picked">Mark as Picked</option>
              <option value="packed">Mark as Packed</option>
              <option value="shipped">Mark as Shipped</option>
              <option value="delivered">Mark as Delivered</option>
              <option value="generate_labels">Generate Shipping Labels</option>
            </select>
            <button
              onClick={handleBulkAction}
              disabled={!bulkAction || isProcessing}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isProcessing ? 'Processing...' : 'Apply'}
            </button>
            <button
              onClick={clearSelection}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedOrders.length === orders.length && orders.length > 0}
                    onChange={selectedOrders.length === orders.length ? clearSelection : selectAllOrders}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fulfillment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => toggleOrderSelection(order.id)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      #{order.orderNumber}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {order.user.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status, 'order')}`}>
                      {getStatusIcon(order.status, 'order')}
                      <span className="ml-1">{order.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.paymentStatus, 'payment')}`}>
                      {getStatusIcon(order.paymentStatus, 'payment')}
                      <span className="ml-1">{order.paymentStatus}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.fulfillmentStatus, 'fulfillment')}`}>
                      {getStatusIcon(order.fulfillmentStatus, 'fulfillment')}
                      <span className="ml-1">{order.fulfillmentStatus}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{(order.totalAmount / 100).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-indigo-600 hover:text-indigo-900">
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      {order.fulfillmentStatus === 'packed' && (
                        <button className="text-green-600 hover:text-green-900">
                          <PrinterIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {orders.length === 0 && (
          <div className="text-center py-12">
            <ShoppingBagIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2" style={{ fontFamily: 'Josefin Sans, sans-serif' }}>
              No orders found
            </h3>
            <p className="text-gray-500">
              Try adjusting your filters or check back later.
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing page {currentPage} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
