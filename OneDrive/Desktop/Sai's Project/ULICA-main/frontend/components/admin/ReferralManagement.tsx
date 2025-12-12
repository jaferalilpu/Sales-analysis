'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Users, Settings, BarChart3, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { useGlobalLoading } from '@/app/providers';
import { showToast } from '@/lib/toast';

interface ReferralSettings {
  signupRewardPoints: number;
  signupRewardAmount: number;
  purchaseRewardPoints: number;
  purchaseRewardAmount: number;
  maxReferralsPerUser?: number;
  isActive: boolean;
}

interface Referral {
  id: string;
  referrer: {
    id: string;
    name: string;
    email: string;
  };
  referredUser: {
    id: string;
    name: string;
    email: string;
  };
  status: string;
  signupReward: number;
  purchaseReward: number;
  totalReward: number;
  createdAt: string;
}

interface ReferralAnalytics {
  totalReferrals: number;
  totalSignups: number;
  totalPurchases: number;
  totalRewards: number;
  conversionRate: number;
}

interface ReferralLeaderboard {
  user: {
    id: string;
    name: string;
    email: string;
  };
  referralCount: number;
  totalRewards: number;
}

const ReferralManagement: React.FC = () => {
  const { showLoading, hideLoading } = useGlobalLoading();
  const [activeTab, setActiveTab] = useState<'overview' | 'referrals' | 'settings' | 'leaderboard'>('overview');
  const [settings, setSettings] = useState<ReferralSettings | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [analytics, setAnalytics] = useState<ReferralAnalytics | null>(null);
  const [leaderboard, setLeaderboard] = useState<ReferralLeaderboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await fetch('/api/referrals/admin/analytics', {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (error) {
      
    }
  }, []);

  const fetchReferrals = useCallback(async () => {
    try {
      const response = await fetch(`/api/referrals/admin/all?page=${page}&limit=20`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setReferrals(data.data.referrals);
        setTotalPages(data.data.pagination.pages);
      }
    } catch (error) {
      
    }
  }, [page]);

  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch('/api/referrals/admin/settings', {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setSettings(data.data);
      }
    } catch (error) {
      
    }
  }, []);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const response = await fetch('/api/referrals/leaderboard?limit=10', {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setLeaderboard(data.data);
      }
    } catch (error) {
      
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        await Promise.all([
          fetchAnalytics(),
          fetchLeaderboard()
        ]);
      } else if (activeTab === 'referrals') {
        await fetchReferrals();
      } else if (activeTab === 'settings') {
        await fetchSettings();
      }
    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  }, [activeTab, fetchAnalytics, fetchLeaderboard, fetchReferrals, fetchSettings]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const saveSettings = async () => {
    if (!settings) return;
    
    setSaving(true);
    showLoading('Saving referral settings...');
    try {
      const response = await fetch('/api/referrals/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(settings)
      });
      
      const data = await response.json();
      if (data.success) {
        setSettings(data.data);
        showToast.success('Referral settings saved successfully.');
      } else {
        showToast.error('Failed to save referral settings.');
      }
    } catch (error) {
      
      showToast.error('Failed to save referral settings.');
    } finally {
      setSaving(false);
      hideLoading();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount / 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'joined':
        return 'text-blue-600 bg-blue-100';
      case 'purchased':
        return 'text-green-600 bg-green-100';
      case 'reward_given':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'joined':
        return 'Joined';
      case 'purchased':
        return 'Made Purchase';
      case 'reward_given':
        return 'Reward Given';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Josefin Sans, sans-serif' }}>
          Referral Management
        </h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'referrals', label: 'All Referrals', icon: Users },
            { id: 'leaderboard', label: 'Leaderboard', icon: TrendingUp },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && analytics && (
        <div className="space-y-6">
          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Referrals</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalReferrals}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Signups</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalSignups}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Purchases</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalPurchases}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.conversionRate}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Josefin Sans, sans-serif' }}>
                Top Referrers
              </h2>
            </div>
            <div className="p-6">
              {leaderboard.length > 0 ? (
                <div className="space-y-4">
                  {leaderboard.map((item, index) => (
                    <div key={item.user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-indigo-600">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.user.name || 'Unknown'}</p>
                          <p className="text-sm text-gray-500">{item.user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{item.referralCount} referrals</p>
                        <p className="text-sm text-gray-500">{formatCurrency(item.totalRewards)} earned</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No referrals yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Referrals Tab */}
      {activeTab === 'referrals' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Josefin Sans, sans-serif' }}>
              All Referrals
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Referrer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Referred User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Reward
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {referrals.map((referral) => (
                  <tr key={referral.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {referral.referrer.name || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {referral.referrer.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {referral.referredUser.name || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {referral.referredUser.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(referral.status)}`}>
                        {getStatusText(referral.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(referral.totalReward)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(referral.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && settings && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6" style={{ fontFamily: 'Josefin Sans, sans-serif' }}>
            Referral Settings
          </h2>
          
          <div className="space-y-6">
            {/* Signup Rewards */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">Signup Rewards</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reward Points
                  </label>
                  <input
                    type="number"
                    value={settings.signupRewardPoints}
                    onChange={(e) => setSettings({
                      ...settings,
                      signupRewardPoints: parseInt(e.target.value) || 0
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reward Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={settings.signupRewardAmount / 100}
                    onChange={(e) => setSettings({
                      ...settings,
                      signupRewardAmount: (parseInt(e.target.value) || 0) * 100
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Purchase Rewards */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">Purchase Rewards</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reward Points
                  </label>
                  <input
                    type="number"
                    value={settings.purchaseRewardPoints}
                    onChange={(e) => setSettings({
                      ...settings,
                      purchaseRewardPoints: parseInt(e.target.value) || 0
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reward Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={settings.purchaseRewardAmount / 100}
                    onChange={(e) => setSettings({
                      ...settings,
                      purchaseRewardAmount: (parseInt(e.target.value) || 0) * 100
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Other Settings */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">Other Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Referrals Per User (optional)
                  </label>
                  <input
                    type="number"
                    value={settings.maxReferralsPerUser || ''}
                    onChange={(e) => setSettings({
                      ...settings,
                      maxReferralsPerUser: e.target.value ? parseInt(e.target.value) : undefined
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="No limit"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={settings.isActive}
                    onChange={(e) => setSettings({
                      ...settings,
                      isActive: e.target.checked
                    })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Enable referral program
                  </label>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={saveSettings}
                disabled={saving}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralManagement;
