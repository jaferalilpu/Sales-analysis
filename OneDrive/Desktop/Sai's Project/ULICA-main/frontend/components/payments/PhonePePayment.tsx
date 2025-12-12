'use client';

import { useState } from 'react';
import { CreditCardIcon, DevicePhoneMobileIcon } from '@/components/ui/icons';

interface PaymentData {
  orderId: string;
  amount: number;
  paymentMethod: 'phonepe' | 'upi';
  customerDetails: {
    name: string;
    email: string;
    phone: string;
  };
  upiDetails?: { upiId: string };
}

interface PaymentResponse {
  success: boolean;
  data?: {
    paymentSession?: {
      redirectUrl?: string;
    };
  };
  message?: string;
}

interface PhonePePaymentProps {
  orderId: string;
  amount: number;
  customerDetails: {
    name: string;
    email: string;
    phone: string;
  };
  onPaymentInitiated: (paymentData: PaymentData) => void;
  onPaymentSuccess: (response: PaymentResponse) => void;
  onPaymentError: (error: string) => void;
}

export function PhonePePayment({
  orderId,
  amount,
  customerDetails,
  onPaymentInitiated,
  onPaymentSuccess,
  onPaymentError
}: PhonePePaymentProps) {
  const [paymentMethod, setPaymentMethod] = useState<'phonepe' | 'upi'>('phonepe');
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);
      
      const paymentData: PaymentData = {
        orderId,
        amount,
        paymentMethod,
        customerDetails,
        ...(paymentMethod === 'upi' && { upiDetails: { upiId } })
      };

      onPaymentInitiated(paymentData);

      const response = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [], // This should be passed from parent
          paymentMethod,
          email: customerDetails.email,
          phone: customerDetails.phone,
          ...(paymentMethod === 'upi' && { upiDetails: { upiId } })
        })
      });

      const result = await response.json() as PaymentResponse;

      if (result.success && result.data?.paymentSession) {
        const { redirectUrl } = result.data.paymentSession;
        
        // Redirect to PhonePe payment page
        if (redirectUrl) {
          window.location.href = redirectUrl;
        } else {
          onPaymentError('Payment redirect URL is missing');
        }
      } else {
        onPaymentError(result.message || 'Failed to initiate payment');
      }
    } catch (error) {
      
      onPaymentError('An error occurred while initiating payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Payment Options
      </h3>

      {/* Payment Method Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select Payment Method
        </label>
        <div className="space-y-3">
          <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="paymentMethod"
              value="phonepe"
              checked={paymentMethod === 'phonepe'}
              onChange={(e) => setPaymentMethod(e.target.value as 'phonepe')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <div className="ml-3 flex items-center">
              <DevicePhoneMobileIcon className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm font-medium text-gray-900">PhonePe</span>
            </div>
          </label>

          <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="paymentMethod"
              value="upi"
              checked={paymentMethod === 'upi'}
              onChange={(e) => setPaymentMethod(e.target.value as 'upi')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <div className="ml-3 flex items-center">
              <CreditCardIcon className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm font-medium text-gray-900">UPI</span>
            </div>
          </label>
        </div>
      </div>

      {/* UPI ID Input (only for UPI method) */}
      {paymentMethod === 'upi' && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            UPI ID
          </label>
          <input
            type="text"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="yourname@paytm or yourname@phonepe"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter your UPI ID (e.g., yourname@paytm, yourname@phonepe, yourname@googlepay)
          </p>
        </div>
      )}

      {/* Payment Summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Order Total</span>
          <span className="text-lg font-semibold text-gray-900">
            ₹{(amount / 100).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Pay Button */}
      <button
        onClick={handlePayment}
        disabled={loading || (paymentMethod === 'upi' && !upiId)}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Processing...
          </div>
        ) : (
          `Pay with ${paymentMethod === 'phonepe' ? 'PhonePe' : 'UPI'}`
        )}
      </button>

      {/* Security Notice */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          🔒 Your payment is secure and encrypted
        </p>
      </div>
    </div>
  );
}