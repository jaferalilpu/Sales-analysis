'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

interface ReferralLinkHandlerProps {
  onReferralCodeDetected: (code: string) => void;
}

const ReferralLinkHandler: React.FC<ReferralLinkHandlerProps> = ({ onReferralCodeDetected }) => {
  const searchParams = useSearchParams();
  const [isValidating, setIsValidating] = useState(false);

  const validateReferralCode = useCallback(async (code: string) => {
    setIsValidating(true);
    try {
      const response = await fetch('/api/referrals/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
      });

      const data = await response.json();
      if (data.success && data.data.valid) {
        onReferralCodeDetected(code);
      } else {
        
      }
    } catch (error) {
      
    } finally {
      setIsValidating(false);
    }
  }, [onReferralCodeDetected]);

  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      validateReferralCode(refCode);
    }
  }, [searchParams, validateReferralCode]);

  return null; // This component doesn't render anything
};

export default ReferralLinkHandler;
