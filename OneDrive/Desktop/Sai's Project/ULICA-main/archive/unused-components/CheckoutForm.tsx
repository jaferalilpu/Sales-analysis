'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/app/providers';
import { useAuth } from '@/app/providers';
import { ulicaToasts, withToast, showToast } from '@/lib/toast';

interface CheckoutFormProps {
  onSuccess?: (orderNumber: string) => void;
}

export default function CheckoutForm({ onSuccess }: CheckoutFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'razorpay',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      showToast.error('Please login to place an order');
      router.push('/login');
      return;
    }

    if (items.length === 0) {
      showToast.error('Your cart is empty');
      return;
    }

    setIsProcessing(true);

    try {
      await withToast(
        async () => {
          // Show processing toast
          const processingToast = ulicaToasts.processingOrder();

          // Create order
          const orderResponse = await fetch('/api/orders', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            },
            body: JSON.stringify({
              items: items.map(item => ({
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity,
                price: item.price,
              })),
              shippingAddress: {
                firstName: formData.firstName,
                lastName: formData.lastName,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,
                phone: formData.phone,
              },
              billingAddress: {
                firstName: formData.firstName,
                lastName: formData.lastName,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,
                phone: formData.phone,
              },
              paymentMethod: formData.paymentMethod,
            }),
          });

          const orderData = await orderResponse.json();

          if (!orderResponse.ok) {
            throw new Error(orderData.message || 'Failed to create order');
          }

          // Dismiss processing toast
          showToast.dismiss(processingToast);

          // Handle payment based on method
          if (formData.paymentMethod === 'razorpay') {
            await handleRazorpayPayment(orderData.data.order);
          } else if (formData.paymentMethod === 'phonepe') {
            await handlePhonePePayment(orderData.data.order);
          } else {
            // COD - order is already created
            await handleCODPayment(orderData.data.order);
          }
        },
        {
          error: 'Failed to process order',
        }
      );
    } catch (error) {
      // Error handling is done by withToast
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRazorpayPayment = async (order: any) => {
    return new Promise((resolve, reject) => {
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: total * 100, // Razorpay expects amount in paise
        currency: 'INR',
        name: 'ULICA',
        description: `Order #${order.orderNumber}`,
        order_id: order.razorpayOrderId,
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/payments/verify-razorpay', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
              },
              body: JSON.stringify({
                orderId: order.id,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyResponse.ok) {
              ulicaToasts.paymentSuccess(total);
              ulicaToasts.orderPlaced(order.orderNumber);
              await clearCart();
              onSuccess?.(order.orderNumber);
              router.push(`/orders/${order.id}`);
            } else {
              throw new Error(verifyData.message || 'Payment verification failed');
            }
          } catch (error) {
            ulicaToasts.paymentFailed(error instanceof Error ? error.message : 'Payment verification failed');
            reject(error);
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#000000',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        ulicaToasts.paymentFailed(response.error.description);
        reject(new Error(response.error.description));
      });
      rzp.open();
    });
  };

  const handlePhonePePayment = async (order: any) => {
    try {
      const paymentResponse = await fetch('/api/payments/phonepe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          orderId: order.id,
          amount: total,
          customerInfo: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            phone: formData.phone,
          },
        }),
      });

      const paymentData = await paymentResponse.json();

      if (paymentResponse.ok) {
        // Redirect to PhonePe payment page
        window.location.href = paymentData.data.paymentUrl;
      } else {
        throw new Error(paymentData.message || 'Failed to initiate PhonePe payment');
      }
    } catch (error) {
      ulicaToasts.paymentFailed(error instanceof Error ? error.message : 'Failed to initiate payment');
      throw error;
    }
  };

  const handleCODPayment = async (order: any) => {
    ulicaToasts.orderPlaced(order.orderNumber);
    await clearCart();
    onSuccess?.(order.orderNumber);
    router.push(`/orders/${order.id}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              required
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              required
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Address *
            </label>
            <textarea
              id="address"
              name="address"
              required
              rows={3}
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                type="text"
                id="city"
                name="city"
                required
                value={formData.city}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                State *
              </label>
              <input
                type="text"
                id="state"
                name="state"
                required
                value={formData.state}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">
                Pincode *
              </label>
              <input
                type="text"
                id="pincode"
                name="pincode"
                required
                value={formData.pincode}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h3>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="radio"
              name="paymentMethod"
              value="razorpay"
              checked={formData.paymentMethod === 'razorpay'}
              onChange={handleChange}
              className="h-4 w-4 text-black focus:ring-black border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">Razorpay (Cards, UPI, Net Banking)</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="paymentMethod"
              value="phonepe"
              checked={formData.paymentMethod === 'phonepe'}
              onChange={handleChange}
              className="h-4 w-4 text-black focus:ring-black border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">PhonePe</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="paymentMethod"
              value="cod"
              checked={formData.paymentMethod === 'cod'}
              onChange={handleChange}
              className="h-4 w-4 text-black focus:ring-black border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">Cash on Delivery</span>
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <button
          type="submit"
          disabled={isProcessing || items.length === 0}
          className="w-full bg-black text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isProcessing ? (
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Processing Order...</span>
            </div>
          ) : (
            `Place Order - ₹${total.toLocaleString()}`
          )}
        </button>
      </div>
    </form>
  );
}
