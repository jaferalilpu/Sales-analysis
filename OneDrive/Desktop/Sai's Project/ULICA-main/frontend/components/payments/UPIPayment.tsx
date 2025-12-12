'use client';

import { useState } from 'react';
import { useAuth } from '@/app/providers';

interface UPIPaymentResponse {
  type: 'qr';
  qrCode: string;
  transactionId: string;
}

interface UPIPaymentProps {
  amount: number;
  orderId: string;
  customerDetails: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  };
  onSuccess: (response: UPIPaymentResponse) => void;
  onError: (error: string) => void;
}

export function UPIPayment({ amount, orderId, customerDetails, onSuccess, onError }: UPIPaymentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [showUPIForm, setShowUPIForm] = useState(false);
  const { user } = useAuth();

  const handleUPIPayment = async (upiDetails?: { upiId?: string; vpa?: string }) => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          orderId,
          paymentMethod: 'upi',
          customerDetails: {
            ...customerDetails,
            name: customerDetails.name || user?.name,
            email: customerDetails.email || user?.email,
          },
          upiDetails: upiDetails || { upiId: upiId || undefined }
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.data.upiDeepLink) {
          // Open UPI app directly
          window.location.href = data.data.upiDeepLink;
        } else if (data.data.qrCode) {
          // Show QR code for scanning
          onSuccess({
            type: 'qr',
            qrCode: data.data.qrCode as string,
            transactionId: data.data.transactionId as string
          } as UPIPaymentResponse);
        } else {
          onError('Invalid UPI response');
        }
      } else {
        onError(data.error || 'Failed to create UPI payment');
      }
    } catch (error) {
      
      onError('Failed to process UPI payment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickUPI = () => {
    handleUPIPayment();
  };

  const handleCustomUPI = () => {
    if (upiId.trim()) {
      handleUPIPayment({ upiId: upiId.trim() });
    } else {
      onError('Please enter a valid UPI ID');
    }
  };

  return (
    <div className="space-y-4">
      {/* Quick UPI Payment */}
      <button
        onClick={handleQuickUPI}
        disabled={isLoading}
        className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-gray-300 border-t-black rounded-full animate-spin mr-2" />
        ) : (
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        )}
        <span className="font-medium text-gray-900">
          {isLoading ? 'Processing...' : 'Pay with UPI'}
        </span>
      </button>

      {/* Custom UPI ID */}
      <div className="space-y-2">
        <button
          onClick={() => setShowUPIForm(!showUPIForm)}
          className="text-sm text-gray-600 hover:text-gray-800 underline"
        >
          {showUPIForm ? 'Hide' : 'Enter Custom UPI ID'}
        </button>

        {showUPIForm && (
          <div className="space-y-3">
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="Enter UPI ID (e.g., 9876543210@paytm)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
            <button
              onClick={handleCustomUPI}
              disabled={isLoading || !upiId.trim()}
              className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Pay with Custom UPI
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
