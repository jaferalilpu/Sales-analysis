'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function OTPVerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [email, setEmail] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    // Get email from URL params or localStorage
    const emailParam = searchParams.get('email');
    const storedEmail = localStorage.getItem('pendingVerificationEmail');
    
    if (emailParam) {
      setEmail(emailParam);
      localStorage.setItem('pendingVerificationEmail', emailParam);
    } else if (storedEmail) {
      setEmail(storedEmail);
    } else {
      // No email found, redirect to register
      router.push('/register');
    }

    // Start resend timer
    setResendTimer(60);
    const timer = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Email verified successfully! Redirecting to login...');
        localStorage.removeItem('pendingVerificationEmail');
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/login?verified=true');
        }, 2000);
      } else {
        setError(data.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('OTP resent successfully!');
        setCanResend(false);
        setResendTimer(60);
        
        // Restart timer
        const timer = setInterval(() => {
          setResendTimer(prev => {
            if (prev <= 1) {
              setCanResend(true);
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(data.message || 'Failed to resend OTP');
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    setError('');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            Verify Your Email
          </h2>
          <p className="mt-2 text-sm text-gray-600" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            We've sent a 6-digit verification code to
          </p>
          <p className="text-sm font-medium text-gray-900" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            {email}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="otp" className="sr-only">
              Verification Code
            </label>
            <input
              id="otp"
              name="otp"
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={handleOtpChange}
              className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-black focus:border-black focus:z-10 sm:text-sm"
              placeholder="000000"
              style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700 text-sm" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-green-700 text-sm" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>{success}</p>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
            >
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
              Didn't receive the code?
            </p>
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={!canResend || isLoading}
              className="text-sm font-medium text-black hover:text-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
              style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
            >
              {canResend ? 'Resend OTP' : `Resend in ${resendTimer}s`}
            </button>
          </div>

          <div className="text-center">
            <Link 
              href="/register" 
              className="text-sm text-gray-600 hover:text-gray-900"
              style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
            >
              ← Back to Registration
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
