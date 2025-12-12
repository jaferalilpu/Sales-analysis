'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowPathIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  WalletIcon,
  ShoppingBagIcon,
  SparklesIcon
} from '@/components/ui/icons';
import { format } from 'date-fns';
import { showToast } from '@/lib/toast';
import { getErrorMessage } from '@/types/common';

interface CustomerSummary {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  isActive: boolean;
  createdAt: string;
  orderCount: number;
  totalSpend: number;
}

interface CustomersResponse {
  success: boolean;
  data?: {
    customers: CustomerSummary[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    metrics: {
      totalCustomers: number;
      totalOrders: number;
      totalRevenue: number;
    };
  };
  message?: string;
}

interface CustomerDetail {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  isActive: boolean;
  createdAt: string;
  orderCount: number;
  reviewCount: number;
  totalSpend: number;
  addresses: Array<{
    id: string;
    type: string;
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    phone: string;
    isDefault?: boolean;
  }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    totalAmount: number;
    createdAt: string;
  }>;
}

interface CustomerDetailResponse {
  success: boolean;
  data?: {
    customer: CustomerDetail;
  };
  message?: string;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [metrics, setMetrics] = useState({
    totalCustomers: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customerDetail, setCustomerDetail] = useState<CustomerDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchCustomers = async (pageParam = 1): Promise<void> => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('page', pageParam.toString());
      params.set('limit', '20');
      if (search.trim()) {
        params.set('search', search.trim());
      }

      const response = await fetch(`/api/admin/customers?${params.toString()}`);
      const data: CustomersResponse = await response.json();
      if (!response.ok || !data.success || !data.data) {
        throw new Error(data?.message || 'Failed to load customers');
      }

      setCustomers(data.data.customers);
      setMetrics(data.data.metrics);
      setPage(data.data.pagination.page);
      setPages(data.data.pagination.pages);
    } catch (error: unknown) {
      
      showToast.error(getErrorMessage(error) || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerDetail = async (id: string): Promise<void> => {
    try {
      setDetailLoading(true);
      const response = await fetch(`/api/admin/customers/${id}`);
      const data: CustomerDetailResponse = await response.json();
      if (!response.ok || !data.success || !data.data || !data.data.customer) {
        throw new Error(data?.message || 'Failed to fetch customer profile');
      }
      setCustomerDetail(data.data.customer);
    } catch (error: unknown) {
      
      showToast.error(getErrorMessage(error) || 'Failed to fetch details');
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleInspect = (id: string) => {
    setSelectedCustomerId(id);
    fetchCustomerDetail(id);
  };

  const leaderboards = useMemo(() => {
    const sortedBySpend = [...customers].sort((a, b) => b.totalSpend - a.totalSpend).slice(0, 5);
    const sortedByOrders = [...customers].sort((a, b) => b.orderCount - a.orderCount).slice(0, 5);
    return { sortedBySpend, sortedByOrders };
  }, [customers]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500">
            Monitor customer engagement, orders, and lifetime value.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 items-center rounded-lg border border-gray-300 px-3">
            <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search customers"
              className="ml-2 w-48 border-none text-sm outline-none"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Total customers</p>
          <div className="mt-2 flex items-baseline gap-2">
            <UserCircleIcon className="h-8 w-8 text-gray-400" />
            <p className="text-2xl font-semibold text-gray-900">{metrics.totalCustomers}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Total orders</p>
          <div className="mt-2 flex items-baseline gap-2">
            <ShoppingBagIcon className="h-8 w-8 text-gray-400" />
            <p className="text-2xl font-semibold text-gray-900">{metrics.totalOrders}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Lifetime revenue</p>
          <div className="mt-2 flex items-baseline gap-2">
            <WalletIcon className="h-8 w-8 text-gray-400" />
            <p className="text-2xl font-semibold text-gray-900">
              {formatCurrency(metrics.totalRevenue)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-4">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 text-sm text-gray-500">
              <span>Customer</span>
              <span>Orders</span>
              <span>Total spend</span>
              <span>Joined</span>
            </div>
            <div className="divide-y divide-gray-100">
              {loading ? (
                <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-gray-500">
                  <ArrowPathIcon className="h-4 w-4 animate-spin" /> Loading customers…
                </div>
              ) : customers.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-500">
                  No customers found
                </div>
              ) : (
                customers.map((customer) => (
                  <button
                    key={customer.id}
                    onClick={() => handleInspect(customer.id)}
                    className={`flex w-full items-center justify-between px-4 py-4 text-left transition hover:bg-gray-50 ${
                      selectedCustomerId === customer.id ? 'bg-gray-100' : ''
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900">{customer.name}</span>
                      <span className="text-xs text-gray-500">{customer.email}</span>
                    </div>
                    <span className="text-sm text-gray-600">{customer.orderCount}</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(customer.totalSpend)}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      {format(new Date(customer.createdAt), 'dd MMM yyyy')}
                      <ChevronRightIcon className="h-3 w-3" />
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          {pages > 1 && (
            <div className="flex items-center justify-between text-sm text-gray-500">
              <button
                onClick={() => fetchCustomers(page - 1)}
                disabled={page <= 1 || loading}
                className="rounded-lg border border-gray-200 px-3 py-1.5 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span>
                Page {page} of {pages}
              </span>
              <button
                onClick={() => fetchCustomers(page + 1)}
                disabled={page >= pages || loading}
                className="rounded-lg border border-gray-200 px-3 py-1.5 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>

        <aside className="lg:col-span-4 space-y-4">
          <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <SparklesIcon className="h-4 w-4 text-gray-400" /> Top customers
            </div>
            <div className="space-y-2">
              {leaderboards.sortedBySpend.map((customer) => (
                <div key={customer.id} className="flex items-center justify-between text-xs text-gray-600">
                  <span className="truncate">{customer.name}</span>
                  <span className="font-medium text-gray-900">{formatCurrency(customer.totalSpend)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            {detailLoading ? (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <ArrowPathIcon className="h-4 w-4 animate-spin" /> Loading profile…
              </div>
            ) : customerDetail ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Customer</p>
                  <p className="text-lg font-semibold text-gray-900">{customerDetail.name}</p>
                  <p className="text-sm text-gray-500">{customerDetail.email}</p>
                  {customerDetail.phone && (
                    <p className="text-sm text-gray-500">{customerDetail.phone}</p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="rounded-lg bg-gray-50 p-3 text-center">
                    <p className="font-semibold text-gray-900">{customerDetail.orderCount}</p>
                    <p className="text-gray-500">Orders</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3 text-center">
                    <p className="font-semibold text-gray-900">{customerDetail.reviewCount}</p>
                    <p className="text-gray-500">Reviews</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3 text-center">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(customerDetail.totalSpend)}
                    </p>
                    <p className="text-gray-500">Total spend</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Recent orders
                  </p>
                  <div className="mt-2 space-y-2">
                    {customerDetail.recentOrders.length === 0 ? (
                      <p className="text-xs text-gray-500">No recent orders</p>
                    ) : (
                      customerDetail.recentOrders.map((order: {
                        id: string;
                        orderNumber: string;
                        status: string;
                        paymentStatus: string;
                        totalAmount: number;
                        createdAt: string;
                      }) => (
                        <div key={order.id} className="rounded-lg border border-gray-200 p-3 text-xs">
                          <div className="flex justify-between">
                            <span className="font-semibold text-gray-900">#{order.orderNumber}</span>
                            <span className="capitalize text-gray-500">{order.status}</span>
                          </div>
                          <div className="mt-1 flex justify-between text-gray-500">
                            <span>{formatCurrency(order.totalAmount ?? 0)}</span>
                            <span>{format(new Date(order.createdAt), 'dd MMM yyyy')}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Addresses</p>
                  {customerDetail.addresses.length === 0 ? (
                    <p className="text-xs text-gray-500">No addresses on file</p>
                  ) : (
                    <div className="mt-2 space-y-2 text-xs text-gray-600">
                      {customerDetail.addresses.map((address: {
                        id: string;
                        type: string;
                        firstName: string;
                        lastName: string;
                        address: string;
                        city: string;
                        state: string;
                        pincode: string;
                        country: string;
                        phone: string;
                        isDefault?: boolean;
                      }) => (
                        <div key={address.id} className="rounded-lg border border-gray-200 p-3">
                          <p className="font-medium text-gray-900">
                            {address.firstName} {address.lastName}
                          </p>
                          <p>{address.address}</p>
                          <p>
                            {address.city}, {address.state} {address.pincode}
                          </p>
                          <p>{address.country}</p>
                          {address.phone && <p className="mt-1 text-gray-500">{address.phone}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : selectedCustomerId ? (
              <div className="text-sm text-gray-500">Unable to load customer details</div>
            ) : (
              <div className="text-sm text-gray-500">Select a customer to view details</div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
