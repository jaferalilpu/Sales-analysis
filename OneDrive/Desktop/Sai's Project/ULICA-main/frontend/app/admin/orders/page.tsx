'use client';

import { useState, useEffect, useCallback } from 'react';
import { MagnifyingGlassIcon, DocumentArrowDownIcon } from '@/components/ui/icons';
import Link from 'next/link';
import { useGlobalLoading } from '@/app/providers';
import { showToast } from '@/lib/toast';

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
  };
  total: number;
  status: 'pending' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: string;
  createdAt: string;
  infoSheetUrl?: string;
  infoSheetStatus?: 'pending' | 'generated' | 'failed';
  infoSheetGeneratedAt?: string;
  items: Array<{
    product: { title: string };
    variant: { title?: string };
    quantity: number;
    price: number;
  }>;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { showLoading, hideLoading } = useGlobalLoading();

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: '1',
        limit: '50',
        ...(statusFilter !== 'all' && { status: statusFilter }),
      });
      
      const res = await fetch(`/api/admin/orders?${params}`);
      const data = await res.json();
      
      if (data.success) {
        setOrders(data.data.orders || []);
      } else {
        showToast.error(data.error || 'Failed to fetch orders.');
      }
    } catch (error) {
      
      showToast.error('Failed to fetch orders. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      showLoading('Updating order...');
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        showToast.success('Order status updated.');
        fetchOrders();
      } else {
        showToast.error('Failed to update order status.');
      }
    } catch (error) {
      
      showToast.error('Failed to update order status.');
    } finally {
      hideLoading();
    }
  };

  const generateInfoSheet = async (order: Order) => {
    try {
      showLoading('Generating info sheet...');
      
      // If already generated, open it
      if (order.infoSheetStatus === 'generated' && order.infoSheetUrl) {
        window.open(order.infoSheetUrl, '_blank');
        hideLoading();
        return;
      }

      // Generate or get info sheet
      const res = await fetch(`/api/admin/orders/${order.id}/info-sheet`, {
        credentials: 'include'
      });

      const data = await res.json();

      if (data.success && data.data.url) {
        showToast.success('Info sheet ready!');
        window.open(data.data.url, '_blank');
        fetchOrders(); // Refresh to show updated status
      } else {
        // If generation failed, try manual generation
        const generateRes = await fetch(`/api/admin/orders/${order.id}/info-sheet/generate`, {
          method: 'POST',
          credentials: 'include'
        });

        const generateData = await generateRes.json();

        if (generateData.success && generateData.data.url) {
          showToast.success('Info sheet generated successfully!');
          window.open(generateData.data.url, '_blank');
          fetchOrders();
        } else {
          showToast.error(generateData.error || 'Failed to generate info sheet.');
        }
      }
    } catch (error) {
      
      showToast.error('Failed to generate info sheet. Please try again.');
    } finally {
      hideLoading();
    }
  };

  const filteredOrders = orders.filter(order =>
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    packed: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Orders</h1>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order number, customer name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="packed">Packed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No orders found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Info Sheet</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.customer.name}</div>
                      <div className="text-xs text-gray-500">{order.customer.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {order.items.slice(0, 2).map(item => item.product.title).join(', ')}
                        {order.items.length > 2 && '...'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{order.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className={`px-2 py-1 text-xs font-medium rounded border-0 ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="packed">Packed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.infoSheetStatus === 'generated' ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          Ready
                        </span>
                      ) : order.infoSheetStatus === 'pending' ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                          Generating...
                        </span>
                      ) : order.infoSheetStatus === 'failed' ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                          Failed
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                          Not Generated
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => generateInfoSheet(order)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        title={
                          order.infoSheetStatus === 'generated'
                            ? 'View Info Sheet'
                            : 'Generate Info Sheet'
                        }
                        disabled={order.infoSheetStatus === 'pending'}
                      >
                        <DocumentArrowDownIcon className="h-4 w-4" />
                        <span>
                          {order.infoSheetStatus === 'generated' ? 'View' : 'Generate'}
                        </span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
