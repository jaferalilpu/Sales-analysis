'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@/components/ui/icons';

interface CouponForm {
  code: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: number;
  minAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  validFrom: string;
  validUntil: string;
}

export default function NewCouponPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CouponForm>({
    code: '',
    name: '',
    description: '',
    type: 'percentage',
    value: 0,
    minAmount: 0,
    maxDiscount: 0,
    usageLimit: 0,
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
  });

  const handleInputChange = (field: keyof CouponForm, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, code: result }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/admin/coupons');
      } else {
        
      }
    } catch (error) {
      
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
              Create New Coupon
            </h1>
            <p className="text-gray-600" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
              Create a discount coupon for your customers
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                Coupon Code *
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="WELCOME10"
                  required
                />
                <button
                  type="button"
                  onClick={generateCode}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
                >
                  Generate
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                Coupon Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Welcome Discount"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Get 10% off on your first order"
              />
            </div>
          </div>
        </div>

        {/* Discount Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            Discount Settings
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                Discount Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                Discount Value *
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => handleInputChange('value', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  min="0"
                  max={formData.type === 'percentage' ? 100 : undefined}
                  step={formData.type === 'percentage' ? 1 : 0.01}
                  required
                />
                {formData.type === 'percentage' && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm">%</span>
                  </div>
                )}
                {formData.type === 'fixed' && (
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm">₹</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                Minimum Order Amount
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-sm">₹</span>
                </div>
                <input
                  type="number"
                  value={formData.minAmount || ''}
                  onChange={(e) => handleInputChange('minAmount', parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {formData.type === 'percentage' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                  Maximum Discount
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm">₹</span>
                  </div>
                  <input
                    type="number"
                    value={formData.maxDiscount || ''}
                    onChange={(e) => handleInputChange('maxDiscount', parseFloat(e.target.value) || 0)}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                Usage Limit
              </label>
              <input
                type="number"
                value={formData.usageLimit || ''}
                onChange={(e) => handleInputChange('usageLimit', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                min="0"
                placeholder="Unlimited if empty"
              />
            </div>
          </div>
        </div>

        {/* Validity Period */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            Validity Period
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                Valid From *
              </label>
              <input
                type="date"
                value={formData.validFrom}
                onChange={(e) => handleInputChange('validFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                Valid Until *
              </label>
              <input
                type="date"
                value={formData.validUntil}
                onChange={(e) => handleInputChange('validUntil', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                required
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            Preview
          </h2>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                  {formData.name || 'Coupon Name'}
                </h3>
                <p className="text-sm text-gray-600" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                  {formData.description || 'Coupon description'}
                </p>
                <p className="text-xs text-gray-500 mt-1" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                  Code: {formData.code || 'COUPON_CODE'}
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-green-600" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                  {formData.type === 'percentage' 
                    ? `${formData.value}% OFF`
                    : `₹${formData.value} OFF`
                  }
                </div>
                {formData.minAmount && formData.minAmount > 0 && (
                  <div className="text-xs text-gray-500" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    Min. order: ₹{formData.minAmount}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
          >
            {isLoading ? 'Creating...' : 'Create Coupon'}
          </button>
        </div>
      </form>
    </div>
  );
}
