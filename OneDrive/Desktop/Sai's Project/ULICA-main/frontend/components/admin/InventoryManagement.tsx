'use client';

import { useState, useEffect } from 'react';
import {
  PlusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon
} from '@/components/ui/icons';

interface InventoryStats {
  totalVariants: number;
  lowStockVariants: number;
  outOfStockVariants: number;
  totalStockValue: number;
  recentMovements: Array<{
    id: string;
    type: string;
    quantity: number;
    reason: string;
    createdAt: string;
    variant: {
      product: {
        title: string;
      };
    };
  }>;
}

interface LowStockAlert {
  id: string;
  currentStock: number;
  reorderPoint: number;
  message: string;
  variant: {
    product: {
      title: string;
      sku: string;
    };
  };
}

interface StockAdjustmentData {
  variantId: string;
  quantity: number;
  reason: string;
  reference?: string;
}

export default function InventoryManagement() {
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [alerts, setAlerts] = useState<LowStockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdjustmentForm, setShowAdjustmentForm] = useState(false);
  const [adjustmentData, setAdjustmentData] = useState<StockAdjustmentData>({
    variantId: '',
    quantity: 0,
    reason: '',
    reference: ''
  });

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const [statsResponse, alertsResponse] = await Promise.all([
        fetch('/api/inventory/stats'),
        fetch('/api/inventory/alerts')
      ]);
      
      const [statsData, alertsData] = await Promise.all([
        statsResponse.json(),
        alertsResponse.json()
      ]);
      
      if (statsData.success) {
        setStats(statsData.data);
      }
      
      if (alertsData.success) {
        setAlerts(alertsData.data);
      }
    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  };

  const handleStockAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/inventory/adjust', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adjustmentData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setShowAdjustmentForm(false);
        setAdjustmentData({
          variantId: '',
          quantity: 0,
          reason: '',
          reference: ''
        });
        fetchInventoryData();
      }
    } catch (error) {
      
    }
  };

  const exportInventory = async () => {
    try {
      const response = await fetch('/api/inventory/export');
      const data = await response.json();
      
      if (data.success) {
        // Convert to CSV
        const csvContent = [
          Object.keys(data.data[0]).join(','),
          ...data.data.map((row: Record<string, unknown>) => Object.values(row).join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'inventory-export.csv';
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600">Manage stock levels, adjustments, and transfers</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportInventory}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            Export
          </button>
          <button
            onClick={() => setShowAdjustmentForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Adjust Stock
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Variants</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalVariants}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Low Stock</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.lowStockVariants}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Out of Stock</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.outOfStockVariants}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Stock Value</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalStockValue}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Low Stock Alerts */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
              Low Stock Alerts
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{alert.variant.product.title}</p>
                    <p className="text-sm text-gray-600">SKU: {alert.variant.product.sku}</p>
                    <p className="text-sm text-yellow-700">{alert.message}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">Current: {alert.currentStock}</p>
                    <p className="text-sm text-gray-600">Reorder at: {alert.reorderPoint}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Movements */}
      {stats && stats.recentMovements.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Stock Movements</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentMovements.map((movement) => (
                  <tr key={movement.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {movement.variant.product.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        movement.type === 'stock_in' 
                          ? 'bg-green-100 text-green-800' 
                          : movement.type === 'stock_out'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {movement.type.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {movement.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(movement.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {showAdjustmentForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Adjust Stock</h3>
                <button
                  onClick={() => setShowAdjustmentForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleStockAdjustment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Variant ID *</label>
                  <input
                    type="text"
                    required
                    value={adjustmentData.variantId}
                    onChange={(e) => setAdjustmentData({...adjustmentData, variantId: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter variant ID"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity *</label>
                  <input
                    type="number"
                    required
                    value={adjustmentData.quantity}
                    onChange={(e) => setAdjustmentData({...adjustmentData, quantity: parseInt(e.target.value)})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Positive for stock in, negative for stock out"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reason *</label>
                  <input
                    type="text"
                    required
                    value={adjustmentData.reason}
                    onChange={(e) => setAdjustmentData({...adjustmentData, reason: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Stock adjustment, Return, etc."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reference</label>
                  <input
                    type="text"
                    value={adjustmentData.reference || ''}
                    onChange={(e) => setAdjustmentData({...adjustmentData, reference: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Order ID, Transfer ID, etc."
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAdjustmentForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Adjust Stock
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
