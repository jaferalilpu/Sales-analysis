'use client';

import { useState, useEffect } from 'react';
import { 
  TruckIcon, 
  MapPinIcon, 
  ClockIcon,
  PlusIcon,
  EyeIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon
} from '@/components/ui/icons';
import { ShippingLabelGenerator } from './ShippingLabelGenerator';
import { ShippingTracker } from './ShippingTracker';

interface ShippingOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  status: string;
  trackingNumber?: string;
  courierName?: string;
  labelGenerated: boolean;
  createdAt: string;
  estimatedDelivery?: string;
}

export default function ShippingManagement() {
  const [orders, setOrders] = useState<ShippingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<ShippingOrder | null>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'generate' | 'track'>('orders');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/shipping/orders');
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.shippingAddress.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'label_generated':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'in_transit':
        return 'bg-indigo-100 text-indigo-800';
      case 'out_for_delivery':
        return 'bg-orange-100 text-orange-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleGenerateLabel = (order: ShippingOrder) => {
    setSelectedOrder(order);
    setActiveTab('generate');
  };

  const handleTrackOrder = (order: ShippingOrder) => {
    setSelectedOrder(order);
    setActiveTab('track');
  };

  const handleLabelGenerated = (labelData: { trackingNumber?: string; courierName?: string; [key: string]: unknown }) => {
    // Update the order status
    setOrders(prev => prev.map(order => 
      order.id === selectedOrder?.id 
        ? { ...order, status: 'label_generated', trackingNumber: labelData.trackingNumber, courierName: labelData.courierName }
        : order
    ));
    
    // Switch back to orders tab
    setActiveTab('orders');
    setSelectedOrder(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shipping Management</h1>
          <p className="text-gray-600">Manage shipping labels, tracking, and delivery</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setActiveTab('generate')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Generate Label
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'orders', name: 'Orders', icon: TruckIcon },
            { id: 'generate', name: 'Generate Label', icon: PlusIcon },
            { id: 'track', name: 'Track Package', icon: MapPinIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white p-4 border rounded-lg">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="label_generated">Label Generated</option>
                  <option value="shipped">Shipped</option>
                  <option value="in_transit">In Transit</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Orders List */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tracking</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                            <div className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{order.customerName}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {order.shippingAddress.city}, {order.shippingAddress.state}
                          </div>
                          <div className="text-sm text-gray-500">{order.shippingAddress.pincode}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {order.trackingNumber ? (
                            <div>
                              <div className="text-sm text-gray-900">{order.trackingNumber}</div>
                              <div className="text-sm text-gray-500">{order.courierName}</div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">No tracking</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {!order.labelGenerated && (
                              <button
                                onClick={() => handleGenerateLabel(order)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Generate Label
                              </button>
                            )}
                            {order.trackingNumber && (
                              <button
                                onClick={() => handleTrackOrder(order)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Track
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'generate' && (
        <div>
          {selectedOrder ? (
            <ShippingLabelGenerator
              orderId={selectedOrder.id}
              onLabelGenerated={handleLabelGenerated}
            />
          ) : (
            <div className="text-center py-12">
              <TruckIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Order</h3>
              <p className="text-gray-500">Choose an order from the Orders tab to generate a shipping label</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'track' && (
        <div>
          {selectedOrder && selectedOrder.trackingNumber ? (
            <ShippingTracker
              trackingNumber={selectedOrder.trackingNumber}
              courierName={selectedOrder.courierName || ''}
            />
          ) : (
            <div className="text-center py-12">
              <MapPinIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Tracking Available</h3>
              <p className="text-gray-500">Select an order with a tracking number to view tracking details</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
