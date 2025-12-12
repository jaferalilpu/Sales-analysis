'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlusIcon, PencilIcon, TrashIcon, TagIcon, CheckCircleIcon, CurrencyDollarIcon, ClockIcon } from '@/components/ui/icons';

interface Coupon {
  id: string;
  code: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: number;
  minAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  validFrom: string;
  validUntil: string;
  createdAt: string;
}

export default function CouponsPage() {
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await fetch('/api/admin/coupons', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setCoupons(data.data.coupons || []);
      }
    } catch (error) {
      
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/coupons/${couponId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setCoupons(prev => prev.filter(coupon => coupon.id !== couponId));
      }
    } catch (error) {
      
    }
  };

  const toggleCouponStatus = async (couponId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/coupons/${couponId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        setCoupons(prev => prev.map(coupon => 
          coupon.id === couponId 
            ? { ...coupon, isActive: !currentStatus }
            : coupon
        ));
      }
    } catch (error) {
      
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
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
            Coupons Management
          </h1>
          <p className="text-gray-600 mt-2 text-lg" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            Create and manage discount coupons and promotional codes
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.push('/admin/coupons/new')}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-black to-gray-800 text-white rounded-xl hover:from-gray-800 hover:to-black transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
          >
            <PlusIcon className="h-5 w-5" />
            <span>New Coupon</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-xl shadow-sm">
              <TagIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                Total Coupons
              </p>
              <p className="text-2xl font-bold text-gray-900" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                {coupons.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-xl shadow-sm">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                Active Coupons
              </p>
              <p className="text-2xl font-bold text-gray-900" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                {coupons.filter(c => c.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-xl shadow-sm">
              <CurrencyDollarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                Total Usage
              </p>
              <p className="text-2xl font-bold text-gray-900" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                {coupons.reduce((sum, c) => sum + c.usedCount, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-xl shadow-sm">
              <ClockIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                Expired Soon
              </p>
              <p className="text-2xl font-bold text-gray-900" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                {coupons.filter(c => {
                  const expiryDate = new Date(c.validUntil);
                  const now = new Date();
                  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {coupons.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <PlusIcon className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            No coupons found
          </h3>
          <p className="text-gray-600 mb-6" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            Create your first coupon to start offering discounts to customers
          </p>
          <button
            onClick={() => router.push('/admin/coupons/new')}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
          >
            Create Coupon
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    Discount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    Valid Until
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                        {coupon.code}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                        {coupon.name}
                      </div>
                      <div className="text-sm text-gray-500" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                        {coupon.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                        {coupon.type === 'percentage' 
                          ? `${coupon.value}%` 
                          : `₹${coupon.value}`
                        }
                      </div>
                      {coupon.minAmount && (
                        <div className="text-xs text-gray-500" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                          Min: ₹{coupon.minAmount}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                        {coupon.usedCount}
                        {coupon.usageLimit && ` / ${coupon.usageLimit}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleCouponStatus(coupon.id, coupon.isActive)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          coupon.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                        style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
                      >
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                      {new Date(coupon.validUntil).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => router.push(`/admin/coupons/${coupon.id}/edit`)}
                          className="text-indigo-600 hover:text-indigo-900 p-1"
                          title="Edit"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCoupon(coupon.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
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
  );
}
