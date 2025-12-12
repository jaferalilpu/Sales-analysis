'use client';

import { useState, useEffect } from 'react';
import { 
  CheckIcon, 
  XMarkIcon, 
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon
} from '@/components/ui/icons';

interface OrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  items: Array<{
    productName: string;
    variant: string;
    quantity: number;
    unitPrice: number;
  }>;
}

interface BulkOrderManagementProps {
  orders: OrderItem[];
  onUpdateStatus: (orderIds: string[], status: string) => void;
  onUpdatePaymentStatus: (orderIds: string[], paymentStatus: string) => void;
  onExportOrders: (orderIds: string[]) => void;
  onImportOrders: (file: File) => void;
}

export function BulkOrderManagement({
  orders,
  onUpdateStatus,
  onUpdatePaymentStatus,
  onExportOrders,
  onImportOrders
}: BulkOrderManagementProps) {
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState('');

  useEffect(() => {
    setSelectAll(selectedOrders.size === orders.length && orders.length > 0);
  }, [selectedOrders, orders.length]);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(orders.map(order => order.id)));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectOrder = (orderId: string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const handleBulkStatusUpdate = () => {
    if (selectedOrders.size > 0 && newStatus) {
      onUpdateStatus(Array.from(selectedOrders), newStatus);
      setSelectedOrders(new Set());
      setNewStatus('');
      setShowBulkActions(false);
    }
  };

  const handleBulkPaymentStatusUpdate = () => {
    if (selectedOrders.size > 0 && newPaymentStatus) {
      onUpdatePaymentStatus(Array.from(selectedOrders), newPaymentStatus);
      setSelectedOrders(new Set());
      setNewPaymentStatus('');
      setShowBulkActions(false);
    }
  };

  const handleExport = () => {
    if (selectedOrders.size > 0) {
      onExportOrders(Array.from(selectedOrders));
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImportOrders(file);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Bulk Order Management
          </h2>
          <span className="text-sm text-gray-500">
            {selectedOrders.size} of {orders.length} selected
          </span>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Import Orders */}
          <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
            <ArrowUpTrayIcon className="w-4 h-4 mr-2" />
            Import Orders
            <input
              type="file"
              accept=".csv,.xlsx"
              onChange={handleImport}
              className="hidden"
            />
          </label>

          {/* Export Selected */}
          <button
            onClick={handleExport}
            disabled={selectedOrders.size === 0}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
            Export Selected
          </button>

          {/* Bulk Actions */}
          <button
            onClick={() => setShowBulkActions(!showBulkActions)}
            disabled={selectedOrders.size === 0}
            className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Bulk Actions
          </button>
        </div>
      </div>

      {/* Bulk Actions Panel */}
      {showBulkActions && selectedOrders.size > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Update Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="">Select Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Update Payment Status
              </label>
              <select
                value={newPaymentStatus}
                onChange={(e) => setNewPaymentStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="">Select Payment Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleBulkStatusUpdate}
                disabled={!newStatus}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update Status
              </button>
              <button
                onClick={handleBulkPaymentStatusUpdate}
                disabled={!newPaymentStatus}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
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
                      checked={selectedOrders.has(order.id)}
                      onChange={() => handleSelectOrder(order.id)}
                      className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        #{order.orderNumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {order.customerName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.customerEmail}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{order.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-black hover:text-gray-600">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {orders.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExclamationTriangleIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Found</h3>
          <p className="text-gray-600">There are no orders to display at the moment.</p>
        </div>
      )}
    </div>
  );
}
