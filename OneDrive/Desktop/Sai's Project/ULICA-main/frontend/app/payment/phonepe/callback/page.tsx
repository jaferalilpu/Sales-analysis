'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowPathIcon } from '@/components/ui/icons';

export default function PhonePeCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const responseParam = searchParams.get('response');
      const orderId = searchParams.get('orderId');

      if (!responseParam || !orderId) {
        router.replace(`/checkout/status/${orderId ?? ''}?verified=false&message=Invalid%20payment%20response`);
        return;
      }

      try {
        const decodedResponse = JSON.parse(atob(responseParam));
        const transactionId = decodedResponse?.data?.transactionId ?? decodedResponse?.transactionId;
        const checksum = decodedResponse?.checksum ?? decodedResponse?.responseChecksum;

        const verifyResponse = await fetch('/api/checkout/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            orderId,
            paymentId: transactionId,
            signature: checksum,
            paymentMethod: 'phonepe',
            responsePayload: decodedResponse
          })
        });

        const result = await verifyResponse.json();

        const url = new URL(`/checkout/status/${orderId}`, window.location.origin);
        url.searchParams.set('provider', 'phonepe');
        url.searchParams.set('verified', result.success ? 'true' : 'false');
        if (!result.success && result.message) {
          url.searchParams.set('message', result.message);
        }

        router.replace(url.pathname + url.search);
      } catch (error) {
        
        router.replace(`/checkout/status/${orderId}?verified=false&message=Payment%20verification%20failed`);
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center space-y-4">
        <div className="w-14 h-14 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
          <ArrowPathIcon className="h-6 w-6 text-blue-600 animate-spin" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Processing your payment…</h2>
        <p className="text-sm text-gray-600">
          Please do not close this window. We are confirming your PhonePe transaction.
        </p>
      </div>
    </div>
  );
}
