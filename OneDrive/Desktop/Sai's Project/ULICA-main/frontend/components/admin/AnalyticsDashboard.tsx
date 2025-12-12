'use client';

import { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  CalendarIcon,
  FunnelIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon
} from '@/components/ui/icons';

interface DashboardData {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  topProducts: Array<{
    id: string;
    title: string;
    variants: Array<{
      price: number;
      stockQty: number;
    }>;
    reviews: Array<{
      rating: number;
    }>;
  }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    totalAmount: number;
    createdAt: string;
    user: {
      name: string;
      email: string;
    };
  }>;
  customerSegments: Array<{
    segment: string;
    count: number;
  }>;
}

interface CohortData {
  cohortMonth: string;
  totalUsers: number;
  retentionRates: Array<{
    period: number;
    rate: number;
  }>;
}

interface LTVData {
  userId: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate: string | null;
  firstOrderDate: string | null;
  daysSinceLastOrder: number | null;
  predictedLTV: number | null;
  segment: string | null;
}

export default function AnalyticsDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [cohortData, setCohortData] = useState<CohortData[]>([]);
  const [ltvData, setLtvData] = useState<LTVData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics/dashboard');
      const data = await response.json();
      
      if (data.success) {
        setDashboardData(data.data);
      }
    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  };

  const fetchCohortData = async () => {
    try {
      const response = await fetch(`/api/analytics/cohort?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
      const data = await response.json();
      
      if (data.success) {
        setCohortData(data.data);
      }
    } catch (error) {
      
    }
  };

  const fetchLTVData = async () => {
    try {
      const response = await fetch('/api/analytics/ltv');
      const data = await response.json();
      
      if (data.success) {
        setLtvData(data.data.data);
      }
    } catch (error) {
      
    }
  };

  const exportData = async (type: string) => {
    try {
      const response = await fetch(`/api/analytics/export/${type}?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&format=csv`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-export.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
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
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive analytics and reporting</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => exportData('orders')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            Export Data
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: ChartBarIcon },
            { id: 'cohort', name: 'Cohort Analysis', icon: UsersIcon },
            { id: 'ltv', name: 'Customer LTV', icon: CurrencyDollarIcon },
            { id: 'funnel', name: 'Funnel Analysis', icon: FunnelIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'cohort') fetchCohortData();
                if (tab.id === 'ltv') fetchLTVData();
              }}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && dashboardData && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    ₹{(dashboardData.totalRevenue / 100).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ShoppingBagIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Orders</p>
                  <p className="text-2xl font-semibold text-gray-900">{dashboardData.totalOrders}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UsersIcon className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Customers</p>
                  <p className="text-2xl font-semibold text-gray-900">{dashboardData.totalCustomers}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Avg Order Value</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    ₹{(dashboardData.averageOrderValue / 100).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Segments */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Customer Segments</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {dashboardData.customerSegments.map((segment) => (
                  <div key={segment.segment} className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{segment.count}</div>
                    <div className="text-sm text-gray-500 capitalize">{segment.segment.replace('_', ' ')}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
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
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dashboardData.recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.orderNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.user.name || order.user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{(order.totalAmount / 100).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Cohort Analysis Tab */}
      {activeTab === 'cohort' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cohort Analysis</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <div className="flex gap-4">
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                  className="border border-gray-300 rounded-md px-3 py-2"
                />
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                  className="border border-gray-300 rounded-md px-3 py-2"
                />
                <button
                  onClick={fetchCohortData}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Update
                </button>
              </div>
            </div>
            
            {cohortData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cohort Month
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Users
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        1 Month
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        3 Months
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        6 Months
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        12 Months
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {cohortData.map((cohort) => (
                      <tr key={cohort.cohortMonth}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {cohort.cohortMonth}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {cohort.totalUsers}
                        </td>
                        {cohort.retentionRates.map((rate) => (
                          <td key={rate.period} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {(rate.rate * 100).toFixed(1)}%
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No cohort data available for the selected date range.</p>
            )}
          </div>
        </div>
      )}

      {/* Customer LTV Tab */}
      {activeTab === 'ltv' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Customer Lifetime Value</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Orders
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Spent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Order Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Predicted LTV
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Segment
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ltvData.map((customer) => (
                    <tr key={customer.userId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Customer {customer.userId.substring(0, 8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {customer.totalOrders}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{(customer.totalSpent / 100).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{(customer.averageOrderValue / 100).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {customer.predictedLTV ? `₹${(customer.predictedLTV / 100).toLocaleString()}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          customer.segment === 'high_value' 
                            ? 'bg-green-100 text-green-800'
                            : customer.segment === 'medium_value'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {customer.segment?.replace('_', ' ') || 'Unknown'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Funnel Analysis Tab */}
      {activeTab === 'funnel' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Funnel Analysis</h3>
            <p className="text-gray-500">Funnel analysis functionality will be implemented here.</p>
          </div>
        </div>
      )}
    </div>
  );
}
