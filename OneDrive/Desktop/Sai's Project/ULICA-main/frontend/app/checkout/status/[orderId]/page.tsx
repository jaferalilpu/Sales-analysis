'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ArrowPathIcon
} from '@/components/ui/icons';
import { getErrorMessage } from '@/types/common';

interface OrderResponseData {
  order: {
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    totalAmount: number;
    createdAt: string;
  };
}

interface OrderResponse {
  success: boolean;
  data?: OrderResponseData;
  message?: string;
}

const POLL_INTERVAL = 2500;
const MAX_POLLS = 12;

export default function CheckoutStatusPage() {
  const params = useParams<{ orderId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<OrderResponseData['order'] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);

  const provider = searchParams.get('provider') ?? 'online';
  const initialVerified = searchParams.get('verified');
  const initialMessage = searchParams.get('message');

  const orderId = params.orderId;

  useEffect(() => {
    let isMounted = true;
    let pollTimer: NodeJS.Timeout;

    const fetchStatus = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`, {
          method: 'GET',
          credentials: 'include'
        });

        const data: OrderResponse = await response.json();

        if (!isMounted) return;

        if (!response.ok || !data.success || !data.data || !data.data.order) {
          throw new Error(data.message || 'Unable to fetch order status');
        }

        setOrder(data.data.order);
        setLoading(false);

        // Stop polling once payment settled
        const isSettled =
          data.data.order.paymentStatus !== 'pending' &&
          data.data.order.paymentStatus !== 'failed_pending';

        if (!isSettled && pollCount < MAX_POLLS) {
          pollTimer = setTimeout(() => {
            setPollCount((count) => count + 1);
          }, POLL_INTERVAL);
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        setError(getErrorMessage(err) || 'Failed to load order');
        setLoading(false);
      }
    };

    fetchStatus();

    return () => {
      isMounted = false;
      if (pollTimer) clearTimeout(pollTimer);
    };
  }, [orderId, pollCount]);

  const statusConfig = useMemo(() => {
    if (loading) {
      return {
        icon: <ClockIcon className="w-16 h-16 text-blue-500" />,
        title: 'Confirming your payment…',
        description: 'Please wait while we verify the final status of your order.'
      };
    }

    if (error || !order) {
      return {
        icon: <XCircleIcon className="w-16 h-16 text-red-500" />,
        title: 'Unable to retrieve order',
        description:
          error ||
          'We could not fetch your order details. Please contact support if the issue persists.'
      };
    }

    const isPaid = order.paymentStatus === 'paid';
    const isFailed = order.paymentStatus === 'failed';

    if (isPaid) {
      return {
        icon: <CheckCircleIcon className="w-16 h-16 text-green-500" />,
        title: 'Payment confirmed',
        description: 'Your payment has been processed successfully. Thank you for shopping with us!'
      };
    }

    if (isFailed) {
      return {
        icon: <XCircleIcon className="w-16 h-16 text-red-500" />,
        title: 'Payment failed',
        description:
          initialMessage ||
          'Your payment could not be completed. You can retry from your cart or choose another method.'
      };
    }

    if (pollCount >= MAX_POLLS) {
      return {
        icon: <ClockIcon className="w-16 h-16 text-amber-500" />,
        title: 'Payment is taking longer than usual',
        description: 'We are still waiting for confirmation from the payment provider.'
      };
    }

    return {
      icon: <ClockIcon className="w-16 h-16 text-blue-500" />,
      title: 'Confirming your payment…',
      description: 'Please wait while we verify the final status of your order.'
    };
  }, [error, initialMessage, loading, order, pollCount]);

  const handleViewOrder = () => {
    if (!order) return;
    router.push(`/orders/${order.id}`);
  };

  const handleContinueShopping = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-lg p-10">
        <div className="flex flex-col items-center text-center gap-4">
          {statusConfig.icon}
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Payment Status</p>
            <h1 className="text-2xl font-semibold text-gray-900">{statusConfig.title}</h1>
            <p className="text-gray-600 mt-2">{statusConfig.description}</p>
            {initialVerified === 'false' && initialMessage && (
              <p className="mt-2 text-sm text-red-500">{initialMessage}</p>
            )}
          </div>

          <div className="w-full border-t border-gray-200 pt-6 mt-4 text-left">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
              Order summary
            </h2>
            {loading || !order ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                Fetching latest order details…
              </div>
            ) : (
              <dl className="space-y-2 text-sm text-gray-700">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Order ID</dt>
                  <dd className="font-medium">#{order.orderNumber}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Payment status</dt>
                  <dd className="font-medium capitalize">{order.paymentStatus}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Order status</dt>
                  <dd className="font-medium capitalize">{order.status}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Total paid</dt>
                  <dd className="font-semibold">₹{(order.totalAmount / 100).toFixed(2)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Payment provider</dt>
                  <dd className="font-medium capitalize">{provider}</dd>
                </div>
              </dl>
            )}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full">
            <button
              onClick={handleViewOrder}
              disabled={!order}
              className="w-full sm:w-auto inline-flex justify-center items-center gap-2 rounded-xl border border-gray-900 bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-black disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
            >
              View order details
            </button>
            <button
              onClick={handleContinueShopping}
              className="w-full sm:w-auto inline-flex justify-center items-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
            >
              Continue shopping
            </button>
          </div>

          <div className="mt-6 text-xs text-gray-400">
            Need help? <Link href="/support" className="text-gray-600 underline">Contact support</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
