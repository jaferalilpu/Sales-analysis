'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { showToast } from '@/lib/toast';
import {
  ChartBarIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  CubeIcon,
  PlusIcon,
  ClockIcon,
} from '@/components/ui/icons';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface MonthlyRevenuePoint {
  month: string;
  revenue: number;
  orders: number;
}

interface OrderSummary {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  user?: {
    name?: string | null;
    email?: string | null;
  };
}

interface DropPerformanceSummary {
  id: string;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
  productCount: number;
  unitsSold: number;
  revenue: number;
  customerCount: number;
}

interface DashboardStats {
  orders: {
    total: number;
    pending: number;
    revenue: number;
  };
  products: {
    total: number;
    lowStock: number;
  };
  customers: {
    total: number;
  };
  fulfillment: {
    unfulfilled: number;
  };
  marketing: {
    abandonedCarts: number;
  };
  recentOrders: OrderSummary[];
  monthlyRevenue: MonthlyRevenuePoint[];
  drop?: {
    overview: {
      total: number;
      published: number;
      live: number;
      upcoming: number;
      ended: number;
      activeAlerts: number;
    };
    performance: DropPerformanceSummary[];
  };
}

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard');
      const data = await response.json();
      if (data.success && data.data?.stats) {
        setStats(data.data.stats);
      }
    } catch (error) {
      
      showToast.error('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-950">
        <div className="mx-auto w-full max-w-7xl space-y-6">
          <div>
            <Skeleton className="h-10 w-56" />
            <Skeleton className="mt-3 h-4 w-64" />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
              >
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-3 h-10 w-28" />
                <Skeleton className="mt-4 h-3 w-32" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="mt-4 h-64 w-full" />
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="mt-4 h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Prepare chart data
  const revenueData: MonthlyRevenuePoint[] =
    stats?.monthlyRevenue?.map((item) => ({
      month: new Date(item.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      revenue: Number(item.revenue ?? 0),
      orders: Number(item.orders ?? 0),
    })) ?? [];

  const orderTrendData = revenueData.map((point) => ({
    month: point.month,
    orders: point.orders,
  }));

  const dropOverview = stats?.drop?.overview;
  const dropPerformance =
    stats?.drop?.performance?.map((drop) => ({
      ...drop,
      unitsSold: Number(drop.unitsSold ?? 0),
      revenue: Number(drop.revenue ?? 0),
      customerCount: Number(drop.customerCount ?? 0),
      productCount: Number(drop.productCount ?? 0),
    })) ?? [];

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        <div className="mx-auto w-full max-w-7xl space-y-6">
          <div>
            <Skeleton className="h-10 w-56" />
            <Skeleton className="mt-3 h-4 w-64" />
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900">
            Unable to load dashboard data right now. Please try again shortly.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-gray-900 transition-colors duration-200 dark:bg-gray-950 dark:text-gray-100">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">Overview of your store performance</p>
      </div>

      {dropOverview && (
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard
            title="Total Drops"
            subtitle={`${dropOverview.published} published`}
            value={dropOverview.total}
            tone="neutral"
          />
          <MetricCard
            title="Live Now"
            subtitle={`${dropOverview.upcoming} upcoming`}
            value={dropOverview.live}
            tone="accent"
          />
          <MetricCard
            title="Recently Ended"
            subtitle="Completed campaigns"
            value={dropOverview.ended}
            tone="muted"
          />
          <MetricCard
            title="Inventory Alerts"
            subtitle="Low-stock variants"
            value={dropOverview.activeAlerts}
            tone={dropOverview.activeAlerts > 0 ? 'danger' : 'success'}
          />
          <MetricCard
            title="Abandoned Carts"
            subtitle="Requires follow-up"
            value={stats.marketing.abandonedCarts}
            tone="warning"
          />
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-800 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats?.orders?.revenue || 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-800 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.orders?.total || 0}</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats?.orders?.pending || 0} pending
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <ShoppingBagIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-800 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Products</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.products?.total || 0}</p>
              <p className="text-xs text-red-500 mt-1">
                {stats?.products?.lowStock || 0} low stock
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <CubeIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-800 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Customers</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.customers?.total || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Total registered</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1 bg-white rounded-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-800 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/admin/products/new"
              className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group touch-target"
            >
              <PlusIcon className="h-5 w-5 text-gray-600 group-hover:text-black mr-3" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-black">
                Add New Product
              </span>
            </Link>
            <Link
              href="/admin/drops/new"
              className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group touch-target"
            >
              <ClockIcon className="h-5 w-5 text-gray-600 group-hover:text-black mr-3" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-black">
                Create Drop
              </span>
            </Link>
            <Link
              href="/admin/orders"
              className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group touch-target"
            >
              <ShoppingBagIcon className="h-5 w-5 text-gray-600 group-hover:text-black mr-3" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-black">
                View All Orders
              </span>
            </Link>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-800 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue (Last 6 Months)</h2>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#000000"
                  strokeWidth={2}
                  name="Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 bg-gray-50 border border-dashed border-gray-300 rounded flex items-center justify-center text-gray-500 text-sm">
              No revenue data available
            </div>
          )}
        </div>
      </div>

      {/* Orders Chart and Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-800 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Orders Trend</h2>
          {orderTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={orderTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="orders" fill="#000000" name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 bg-gray-50 border border-dashed border-gray-300 rounded flex items-center justify-center text-gray-500 text-sm">
              No order data available
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-1 bg-white rounded-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-800 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
          {stats?.recentOrders && stats.recentOrders.length > 0 ? (
            <ul className="space-y-3">
              {stats.recentOrders.slice(0, 5).map((order: OrderSummary) => (
                <li
                  key={order.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {order.user?.name || order.user?.email || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(order.totalAmount || 0)}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      order.status === 'delivered'
                        ? 'bg-green-100 text-green-800'
                        : order.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {order.status}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">
              No recent orders
            </div>
          )}
        </div>
      </div>

      {/* System Status & Drops */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-800 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone="success">All systems operational</Badge>
              {stats?.fulfillment?.unfulfilled > 0 && (
                <Badge tone="warning">{stats.fulfillment.unfulfilled} unfulfilled orders</Badge>
              )}
              {stats?.products?.lowStock > 0 && (
                <Badge tone="danger">{stats.products.lowStock} products low in stock</Badge>
              )}
              {dropOverview && dropOverview.activeAlerts > 0 && (
                <Badge tone="danger">{dropOverview.activeAlerts} inventory alerts</Badge>
              )}
            </div>
            <span className="text-xs text-gray-500">
              Last updated {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>

        {dropPerformance.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-800 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Drop Performance</h2>
            <div className="space-y-4">
              {dropPerformance.map((drop) => (
                <div
                  key={drop.id}
                  className="rounded-lg border border-gray-200 bg-gray-50/60 px-4 py-3 dark:border-gray-800 dark:bg-gray-900/40"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{drop.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(drop.startDate).toLocaleDateString()} –{' '}
                        {new Date(drop.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge
                      tone={
                        drop.status === 'live'
                          ? 'accent'
                          : drop.status === 'upcoming'
                          ? 'neutral'
                          : 'muted'
                      }
                    >
                      {drop.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-gray-600 sm:grid-cols-4">
                    <MetricStat label="Revenue" value={formatCurrency(drop.revenue)} />
                    <MetricStat label="Units Sold" value={drop.unitsSold.toLocaleString()} />
                    <MetricStat label="Customers" value={drop.customerCount.toLocaleString()} />
                    <MetricStat label="Products" value={drop.productCount.toLocaleString()} />
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

interface MetricCardProps {
  title: string;
  subtitle?: string;
  value: number | string;
  tone?: 'neutral' | 'accent' | 'danger' | 'warning' | 'success' | 'muted';
}

function MetricCard({ title, subtitle, value, tone = 'neutral' }: MetricCardProps) {
  const palette: Record<NonNullable<MetricCardProps['tone']>, string> = {
    neutral: 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800',
    accent: 'bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900',
    danger: 'bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-900',
    warning: 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-100 dark:border-yellow-900/70',
    success: 'bg-green-50 dark:bg-green-950/30 border-green-100 dark:border-green-900',
    muted: 'bg-gray-100 dark:bg-gray-900/70 border-gray-200 dark:border-gray-800',
  };

  const displayValue = typeof value === 'number' ? value.toLocaleString() : value;

  return (
    <div
      className={`rounded-lg border p-4 shadow-sm transition hover:shadow-md ${palette[tone]}`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {title}
      </p>
      <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">{displayValue}</p>
      {subtitle && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {subtitle}
        </p>
      )}
    </div>
  );
}

interface BadgeProps {
  tone?: 'success' | 'warning' | 'danger' | 'accent' | 'neutral' | 'muted';
  children: ReactNode;
}

function Badge({ tone = 'neutral', children }: BadgeProps) {
  const palette: Record<NonNullable<BadgeProps['tone']>, string> = {
    success: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
    accent: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
    neutral: 'bg-gray-200 text-gray-800 dark:bg-gray-700/50 dark:text-gray-100',
    muted: 'bg-gray-100 text-gray-500 dark:bg-gray-800/40 dark:text-gray-300',
  };

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${palette[tone]}`}>
      {children}
    </span>
  );
}

function MetricStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{value}</p>
    </div>
  );
}
