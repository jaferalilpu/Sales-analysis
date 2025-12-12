'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [email, setEmail] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    setIsVerifying(true);
    setVerificationStatus('pending');

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: verificationToken }),
      });

      const data = await response.json();

      if (response.ok) {
        setVerificationStatus('success');
        setMessage('Your email has been verified successfully! Welcome to ULICA.');
      } else {
        setVerificationStatus('error');
        setMessage(data.message || 'Verification failed. The token may be invalid or expired.');
      }
    } catch (error) {
      setVerificationStatus('error');
      setMessage('Network error. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const resendVerification = async () => {
    if (!email.trim()) {
      setResendMessage('Please enter your email address');
      return;
    }

    setIsResending(true);
    setResendMessage('');

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setResendMessage('Verification email sent successfully! Check your inbox.');
      } else {
        setResendMessage(data.message || 'Failed to send verification email.');
      }
    } catch (error) {
      setResendMessage('Network error. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'success':
        return (
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
          </div>
        );
    }
  };

  const getStatusColor = () => {
    switch (verificationStatus) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
              U
            </span>
          </div>
          <h1 className="text-3xl font-bold text-black mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            ULICA
          </h1>
          <p className="text-gray-600" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            Email Verification
          </p>
        </div>

        {/* Verification Status Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          {getStatusIcon()}

          {isVerifying ? (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-black mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                Verifying your email...
              </h2>
              <p className="text-gray-600" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                Please wait while we verify your email address.
              </p>
            </div>
          ) : (
            <div className="text-center">
              <h2 className={`text-2xl font-bold mb-4 ${getStatusColor()}`} style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                {verificationStatus === 'success' ? 'Email Verified!' : 
                 verificationStatus === 'error' ? 'Verification Failed' : 'Verifying Email'}
              </h2>
              <p className="text-gray-600 mb-6" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                {message}
              </p>

              {verificationStatus === 'success' && (
                <div className="space-y-4">
                  <Link
                    href="/"
                    className="w-full bg-black text-white py-3 px-6 rounded-lg font-medium text-center block hover:bg-gray-800 transition-all duration-200"
                    style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
                  >
                    Start Shopping
                  </Link>
                  <Link
                    href="/dashboard"
                    className="w-full border border-gray-300 text-black py-3 px-6 rounded-lg font-medium text-center block hover:bg-gray-50 transition-all duration-200"
                    style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
                  >
                    Go to Dashboard
                  </Link>
                </div>
              )}

              {verificationStatus === 'error' && (
                <div className="space-y-4">
                  <Link
                    href="/"
                    className="w-full bg-black text-white py-3 px-6 rounded-lg font-medium text-center block hover:bg-gray-800 transition-all duration-200"
                    style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
                  >
                    Go to Homepage
                  </Link>
                  <Link
                    href="/register"
                    className="w-full border border-gray-300 text-black py-3 px-6 rounded-lg font-medium text-center block hover:bg-gray-50 transition-all duration-200"
                    style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
                  >
                    Register Again
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Resend Verification Section */}
        {verificationStatus === 'error' && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-black mb-4 text-center" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
              Didn't receive the email?
            </h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                  style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
                  placeholder="Enter your email address"
                />
              </div>
              
              {resendMessage && (
                <div className={`p-3 rounded-lg text-sm ${resendMessage.includes('successfully') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`} style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                  {resendMessage}
                </div>
              )}

              <button
                onClick={resendVerification}
                disabled={isResending}
                className="w-full bg-black text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
              >
                {isResending ? 'Sending...' : 'Resend Verification Email'}
              </button>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            Need help?{' '}
            <Link href="/contact" className="text-black hover:underline font-medium">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
