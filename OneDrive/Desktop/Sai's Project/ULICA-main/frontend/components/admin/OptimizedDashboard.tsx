'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { 
  ShoppingBagIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon,
  ExclamationTriangleIcon,
  TruckIcon,
  ShoppingCartIcon
} from '@/components/ui/icons';

// Dynamic imports for heavy components
const Chart = dynamic(() => import('./OptimizedChart'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />
});

const OrderFulfillmentWidget = dynamic(() => import('./OrderFulfillmentWidget'), {
  ssr: false,
  loading: () => <div className="h-32 bg-gray-100 animate-pulse rounded-lg" />
});

interface DashboardStats {
  orders: {
    total: number;
    revenue: number;
  };
  products: {
    total: number;
    lowStock: number;
  };
  customers: {
    total: number;
  };
  reviews: {
    pending: number;
  };
  fulfillment: {
    unfulfilled: number;
  };
  marketing: {
    abandonedCarts: number;
  };
}

interface CachedData {
  stats: DashboardStats | null;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const CACHE_KEY = 'dashboard_stats';

export default function OptimizedDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize the cache check function
  const getCachedData = useCallback((): CachedData | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const data: CachedData = JSON.parse(cached);
        if (Date.now() - data.timestamp < data.ttl) {
          return data;
        }
        // Cache expired, remove it
        localStorage.removeItem(CACHE_KEY);
      }
    } catch (error) {
      
    }
    return null;
  }, []);

  // Memoize the cache set function
  const setCachedData = useCallback((data: DashboardStats) => {
    try {
      const cacheData: CachedData = {
        stats: data,
        timestamp: Date.now(),
        ttl: CACHE_TTL
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      
    }
  }, []);

  // Memoize the fetch function
  const fetchStats = useCallback(async (useCache = true) => {
    // Check cache first
    if (useCache) {
      const cached = getCachedData();
      if (cached?.stats) {
        setStats(cached.stats);
        setIsLoading(false);
        return;
      }
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Cache-Control': 'max-age=300', // 5 minutes
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const statsData = data.data.stats;
        setStats(statsData);
        setCachedData(statsData);
      } else if (response.status === 401) {
        window.location.href = '/login';
      } else if (response.status === 403) {
        setError('Admin access required');
      } else {
        setError('Failed to fetch dashboard data');
      }
    } catch (error) {
      
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [getCachedData, setCachedData]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Memoize the stat cards data
  const statCards = useMemo(() => {
    if (!stats) return [];

    return [
      {
        title: 'Total Orders',
        value: stats.orders.total,
        icon: ShoppingBagIcon,
        color: 'blue',
        change: '+12%',
        changeType: 'positive' as const
      },
      {
        title: 'Revenue',
        value: `₹${(stats.orders.revenue / 100).toLocaleString()}`,
        icon: CurrencyDollarIcon,
        color: 'green',
        change: '+8%',
        changeType: 'positive' as const
      },
      {
        title: 'Total Products',
        value: stats.products.total,
        icon: ChartBarIcon,
        color: 'purple',
        change: '+5%',
        changeType: 'positive' as const
      },
      {
        title: 'Total Customers',
        value: stats.customers.total,
        icon: UserGroupIcon,
        color: 'indigo',
        change: '+15%',
        changeType: 'positive' as const
      },
      {
        title: 'Low Stock',
        value: stats.products.lowStock,
        icon: ExclamationTriangleIcon,
        color: 'red',
        change: '-2%',
        changeType: 'negative' as const
      },
      {
        title: 'Pending Reviews',
        value: stats.reviews.pending,
        icon: ChartBarIcon,
        color: 'yellow',
        change: '+3%',
        changeType: 'positive' as const
      },
      {
        title: 'Unfulfilled Orders',
        value: stats.fulfillment.unfulfilled,
        icon: TruckIcon,
        color: 'orange',
        change: '+7%',
        changeType: 'positive' as const
      },
      {
        title: 'Abandoned Carts',
        value: stats.marketing.abandonedCarts,
        icon: ShoppingCartIcon,
        color: 'pink',
        change: '+4%',
        changeType: 'positive' as const
      }
    ];
  }, [stats]);

  // Memoize the refresh function
  const handleRefresh = useCallback(() => {
    fetchStats(false); // Force refresh, bypass cache
  }, [fetchStats]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 text-lg font-medium mb-2">{error}</div>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your store.</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                <div className="flex items-center mt-2">
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs last month</span>
                </div>
              </div>
              <div className={`p-3 rounded-full ${
                stat.color === 'blue' ? 'bg-blue-100' :
                stat.color === 'green' ? 'bg-green-100' :
                stat.color === 'purple' ? 'bg-purple-100' :
                stat.color === 'indigo' ? 'bg-indigo-100' :
                stat.color === 'red' ? 'bg-red-100' :
                stat.color === 'yellow' ? 'bg-yellow-100' :
                stat.color === 'orange' ? 'bg-orange-100' :
                'bg-pink-100'
              }`}>
                <stat.icon className={`w-6 h-6 ${
                  stat.color === 'blue' ? 'text-blue-600' :
                  stat.color === 'green' ? 'text-green-600' :
                  stat.color === 'purple' ? 'text-purple-600' :
                  stat.color === 'indigo' ? 'text-indigo-600' :
                  stat.color === 'red' ? 'text-red-600' :
                  stat.color === 'yellow' ? 'text-yellow-600' :
                  stat.color === 'orange' ? 'text-orange-600' :
                  'text-pink-600'
                }`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Overview</h3>
          <Chart />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Order Fulfillment</h3>
          <OrderFulfillmentWidget />
        </div>
      </div>
    </div>
  );
}
