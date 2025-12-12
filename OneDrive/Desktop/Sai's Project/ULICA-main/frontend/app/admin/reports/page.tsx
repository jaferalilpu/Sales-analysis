'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  ShoppingBagIcon, 
  UserIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@/components/ui/icons';

interface ReportData {
  sales: {
    total: number;
    change: number;
    period: string;
  };
  orders: {
    total: number;
    change: number;
    period: string;
  };
  customers: {
    total: number;
    change: number;
    period: string;
  };
  revenue: {
    total: number;
    change: number;
    period: string;
  };
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
  recentOrders: Array<{
    id: string;
    customerName: string;
    total: number;
    status: string;
    createdAt: string;
  }>;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
  }>;
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const fetchReportData = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/reports?range=${dateRange}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setReportData(data.data);
      }
    } catch (error) {
      
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-4xl font-bold text-gray-900" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            Reports & Analytics
          </h1>
          <p className="text-gray-600 mt-2 text-lg" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            Track business performance, sales insights, and customer analytics
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 rounded-xl border border-blue-200 shadow-sm">
            <div className="flex items-center space-x-3">
              <span className="text-base text-blue-600 font-medium" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                Date Range
              </span>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="bg-transparent border-none text-blue-700 font-semibold focus:ring-0 focus:outline-none text-base"
                style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                Total Revenue
              </p>
              <p className="text-2xl font-bold text-gray-900" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                {reportData ? formatCurrency(reportData.revenue.total) : '₹0'}
              </p>
              <div className="flex items-center mt-1">
                {reportData && reportData.revenue.change > 0 ? (
                  <ArrowUpIcon className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm ${
                  reportData && reportData.revenue.change > 0 ? 'text-green-600' : 'text-red-600'
                }`} style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                  {reportData ? Math.abs(reportData.revenue.change) : 0}%
                </span>
                <span className="text-sm text-gray-500 ml-1" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                  vs last period
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <ShoppingBagIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                Total Orders
              </p>
              <p className="text-2xl font-bold text-gray-900" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                {reportData?.orders.total || 0}
              </p>
              <div className="flex items-center mt-1">
                {reportData && reportData.orders.change > 0 ? (
                  <ArrowUpIcon className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm ${
                  reportData && reportData.orders.change > 0 ? 'text-green-600' : 'text-red-600'
                }`} style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                  {reportData ? Math.abs(reportData.orders.change) : 0}%
                </span>
                <span className="text-sm text-gray-500 ml-1" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                  vs last period
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <UserIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                New Customers
              </p>
              <p className="text-2xl font-bold text-gray-900" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                {reportData?.customers.total || 0}
              </p>
              <div className="flex items-center mt-1">
                {reportData && reportData.customers.change > 0 ? (
                  <ArrowUpIcon className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm ${
                  reportData && reportData.customers.change > 0 ? 'text-green-600' : 'text-red-600'
                }`} style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                  {reportData ? Math.abs(reportData.customers.change) : 0}%
                </span>
                <span className="text-sm text-gray-500 ml-1" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                  vs last period
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                Avg. Order Value
              </p>
              <p className="text-2xl font-bold text-gray-900" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                {reportData && reportData.orders.total > 0 
                  ? formatCurrency(reportData.revenue.total / reportData.orders.total)
                  : '₹0'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            Top Selling Products
          </h3>
          <div className="space-y-4">
            {reportData?.topProducts.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                      {product.name}
                    </p>
                    <p className="text-sm text-gray-500" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                      {product.sales} sales
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    {formatCurrency(product.revenue)}
                  </p>
                </div>
              </div>
            )) || (
              <p className="text-gray-500 text-center py-4" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                No data available
              </p>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            Recent Orders
          </h3>
          <div className="space-y-4">
            {reportData?.recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    {order.customerName}
                  </p>
                  <p className="text-sm text-gray-500" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    {formatCurrency(order.total)}
                  </p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    order.status === 'completed' 
                      ? 'bg-green-100 text-green-800'
                      : order.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            )) || (
              <p className="text-gray-500 text-center py-4" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                No recent orders
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Revenue Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
          Monthly Revenue Trend
        </h3>
        <div className="h-64 flex items-end justify-between space-x-2">
          {reportData?.monthlyRevenue.map((month, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="bg-black rounded-t w-full transition-all duration-300 hover:bg-gray-800"
                style={{
                  height: `${Math.max(20, (month.revenue / Math.max(...reportData.monthlyRevenue.map(m => m.revenue))) * 200)}px`
                }}
                title={`${month.month}: ${formatCurrency(month.revenue)}`}
              />
              <span className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-left">
                {month.month}
              </span>
            </div>
          )) || (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-gray-500" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                No revenue data available
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
