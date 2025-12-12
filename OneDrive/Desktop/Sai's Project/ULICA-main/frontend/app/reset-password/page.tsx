'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function ResetPasswordPage() {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [isResetting, setIsResetting] = useState(false);
  const [resetStatus, setResetStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const resetToken = searchParams.get('token');
    if (!resetToken) {
      setResetStatus('error');
      setMessage('Invalid reset link. Please request a new password reset.');
    } else {
      setToken(resetToken);
      setResetStatus('pending');
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetting(true);

    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match');
      setIsResetting(false);
      return;
    }

    if (formData.password.length < 6) {
      setMessage('Password must be at least 6 characters long');
      setIsResetting(false);
      return;
    }

    if (!token) {
      setMessage('Invalid reset token');
      setIsResetting(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResetStatus('success');
        setMessage('Your password has been reset successfully! You can now log in with your new password.');
      } else {
        setResetStatus('error');
        setMessage(data.message || 'Password reset failed. The token may be invalid or expired.');
      }
    } catch (error) {
      setResetStatus('error');
      setMessage('Network error. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  const getStatusIcon = () => {
    switch (resetStatus) {
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
          <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
              U
            </span>
          </div>
        );
    }
  };

  const getStatusColor = () => {
    switch (resetStatus) {
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
          {getStatusIcon()}
          <div className="mb-4">
            <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto">
              <Image 
                src="/ulica-symbol.png?v=10" 
                alt="ULICA"
                width={120}
                height={120}
                className="h-24 w-auto object-contain saturate-150 brightness-110 contrast-125"
                priority
              />
            </div>
          </div>
          <p className="text-gray-600" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            {resetStatus === 'success' ? 'Password Reset Complete' : 
             resetStatus === 'error' ? 'Reset Failed' : 'Reset Your Password'}
          </p>
        </div>

        {/* Reset Form Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          {resetStatus === 'success' ? (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-green-600 mb-4" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                Password Reset Successful!
              </h2>
              <p className="text-gray-600 mb-6" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                {message}
              </p>
              <div className="space-y-3">
                <Link
                  href="/login"
                  className="w-full bg-black text-white py-3 px-6 rounded-lg font-medium text-center block hover:bg-gray-800 transition-all duration-200"
                  style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
                >
                  Sign In
                </Link>
                <Link
                  href="/"
                  className="w-full border border-gray-300 text-black py-3 px-6 rounded-lg font-medium text-center block hover:bg-gray-50 transition-all duration-200"
                  style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
                >
                  Go to Homepage
                </Link>
              </div>
            </div>
          ) : resetStatus === 'error' ? (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-4" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                Reset Failed
              </h2>
              <p className="text-gray-600 mb-6" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                {message}
              </p>
              <div className="space-y-3">
                <Link
                  href="/forgot-password"
                  className="w-full bg-black text-white py-3 px-6 rounded-lg font-medium text-center block hover:bg-gray-800 transition-all duration-200"
                  style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
                >
                  Request New Reset
                </Link>
                <Link
                  href="/login"
                  className="w-full border border-gray-300 text-black py-3 px-6 rounded-lg font-medium text-center block hover:bg-gray-50 transition-all duration-200"
                  style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
                >
                  Back to Login
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-black mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                  Reset your password
                </h2>
                <p className="text-gray-600" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                  Enter your new password below
                </p>
              </div>
              
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      New Password *
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                        placeholder="Enter your new password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600 hover:text-black transition-colors duration-200"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                            <path d="M2 2l20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        ) : (
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                          </svg>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Must be at least 6 characters long
                    </p>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password *
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                        placeholder="Confirm your new password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600 hover:text-black transition-colors duration-200"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                      >
                        {showConfirmPassword ? (
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                            <path d="M2 2l20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        ) : (
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {message && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-red-700 text-sm" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>{message}</p>
                    </div>
                  </div>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={isResetting}
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                    style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
                  >
                    {isResetting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Resetting Password...
                      </>
                    ) : (
                      'Reset Password'
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            Remember your password?{' '}
            <Link href="/login" className="text-black hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
