'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setMessage(data.message || 'If an account with that email exists, a password reset link has been sent.');
      } else {
        setMessage(data.message || 'Failed to send reset email. Please try again.');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setIsLoading(false);
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
            {isSuccess ? 'Check Your Email' : 'Forgot Password'}
          </p>
        </div>

        {/* Reset Form Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          {isSuccess ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-black mb-4" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                Check Your Email
              </h2>
              <p className="text-gray-600 mb-6" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                {message}
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-blue-700 text-sm" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                      <strong>Important:</strong> The password reset link will expire in 30 minutes. 
                      If you don't see the email, check your spam folder.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <Link
                  href="/login"
                  className="w-full bg-black text-white py-3 px-6 rounded-lg font-medium text-center block hover:bg-gray-800 transition-all duration-200"
                  style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
                >
                  Back to Login
                </Link>
                <button
                  onClick={() => {
                    setIsSuccess(false);
                    setEmail('');
                    setMessage('');
                  }}
                  className="w-full border border-gray-300 text-black py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200"
                  style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
                >
                  Send Another Email
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-black mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                  Forgot your password?
                </h2>
                <p className="text-gray-600" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                  No worries! Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>
              
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    Email Address *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                    style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
                    placeholder="Enter your email address"
                  />
                </div>

                {message && (
                  <div className={`p-4 rounded-lg ${message.includes('sent') ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <div className="flex items-center">
                      <svg className={`w-5 h-5 mr-2 ${message.includes('sent') ? 'text-green-500' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {message.includes('sent') ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        )}
                      </svg>
                      <p className={`text-sm ${message.includes('sent') ? 'text-green-700' : 'text-red-700'}`} style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                        {message}
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                    style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending Reset Link...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        {/* Back to Login */}
        <div className="mt-8 text-center">
          <p className="text-gray-600" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            Remember your password?{' '}
            <Link href="/login" className="text-black hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>

        {/* Help Section */}
        <div className="mt-4 text-center">
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
