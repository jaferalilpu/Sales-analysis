'use client';

import React, { useState, useEffect } from 'react';
import { Copy, Share2, Users, Gift, TrendingUp, CheckCircle } from 'lucide-react';

interface ReferralStats {
  totalReferrals: number;
  totalRewards: number;
  pendingRewards: number;
  referrals: Array<{
    id: string;
    referredUser: {
      id: string;
      name: string;
      email: string;
      createdAt: string;
    };
    status: string;
    signupReward: number;
    purchaseReward: number;
    totalReward: number;
    createdAt: string;
  }>;
}

interface ReferralData {
  referralCode: string;
  referralLink: string;
}

const ReferralDashboard: React.FC = () => {
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchReferralData();
    fetchReferralStats();
  }, []);

  const fetchReferralData = async () => {
    try {
      const response = await fetch('/api/referrals/code', {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setReferralData(data.data);
      }
    } catch (error) {
      
    }
  };

  const fetchReferralStats = async () => {
    try {
      const response = await fetch('/api/referrals/stats', {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      
    }
  };

  const shareReferralLink = async () => {
    if (!referralData) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join me on Ulica!',
          text: 'Get amazing fashion at Ulica with my referral link',
          url: referralData.referralLink
        });
      } catch (error) {
        
      }
    } else {
      copyToClipboard(referralData.referralLink);
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
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
          Referral Program
        </h1>
      </div>

      {/* Referral Code Section */}
      {referralData && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Josefin Sans, sans-serif' }}>
            Your Referral Code
          </h2>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="text-2xl font-mono font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg">
                {referralData.referralCode}
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(referralData.referralCode)}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Copy className="w-4 h-4" />
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Referral Link
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={referralData.referralLink}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
              />
              <button
                onClick={shareReferralLink}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Referrals</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalReferrals}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Gift className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Rewards</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalRewards)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Rewards</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.pendingRewards)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Referral History */}
      {stats && stats.referrals.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Josefin Sans, sans-serif' }}>
              Referral History
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Referred User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Signup Reward
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Purchase Reward
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
                {stats.referrals.map((referral) => (
                  <tr key={referral.id}>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(referral.signupReward)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(referral.purchaseReward)}
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
        </div>
      )}

      {/* Empty State */}
      {stats && stats.referrals.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2" style={{ fontFamily: 'Josefin Sans, sans-serif' }}>
            No referrals yet
          </h3>
          <p className="text-gray-500 mb-6">
            Share your referral link with friends and start earning rewards!
          </p>
          {referralData && (
            <button
              onClick={shareReferralLink}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Referral Link</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ReferralDashboard;
