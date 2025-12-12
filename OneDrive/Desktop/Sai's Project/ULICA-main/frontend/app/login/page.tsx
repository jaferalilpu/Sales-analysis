'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/app/providers';
import { ulicaToasts, withToast } from '@/lib/toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const [isFormValid, setIsFormValid] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') || null;

  // Validation functions
  const validateEmail = (email: string): string => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (password: string): string => {
    if (!password) return 'Password is required';
    return '';
  };

  const validateForm = useCallback((): boolean => {
    const errors: {[key: string]: string} = {};
    
    errors.email = validateEmail(email);
    errors.password = validatePassword(password);

    setFieldErrors(errors);
    
    const isValid = Object.values(errors).every(error => error === '') && email && password;
    
    setIsFormValid(!!isValid);
    return !!isValid;
  }, [email, password]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (fieldErrors.email) {
      setFieldErrors(prev => ({ ...prev, email: '' }));
    }
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (fieldErrors.password) {
      setFieldErrors(prev => ({ ...prev, password: '' }));
    }
    if (error) setError('');
    if (success) setSuccess('');
  };

  // Real-time validation
  useEffect(() => {
    validateForm();
  }, [validateForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validate form before submission
    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      await withToast(
        async () => {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });

          const data = await response.json();

          if (response.ok) {
            // Store user in context
            login(data.data.user, {
              accessToken: data.data.accessToken,
              refreshToken: data.data.refreshToken,
            });
            
            // Show success toast
            ulicaToasts.loginSuccess(data.data.user.name || data.data.user.email);
            
            // Determine redirect destination
            const redirectTo = data.data.user.role === 'admin' 
              ? (nextUrl || '/admin')
              : (nextUrl || '/');
            
            // Wait a bit longer to ensure cookies are set by the API route
            // Then do a full page reload to ensure cookies are available
            setTimeout(() => {
              window.location.href = redirectTo;
            }, 1500);
          } else {
            // Handle specific API errors
            if (data.message?.includes('email') && data.message?.includes('not found')) {
              setFieldErrors(prev => ({
                ...prev,
                email: 'This email is not registered'
              }));
            } else if (data.message?.includes('password') || data.message?.includes('incorrect')) {
              setFieldErrors(prev => ({
                ...prev,
                password: 'Incorrect password'
              }));
            } else {
              setError(data.message || 'Login failed. Please try again.');
            }
            throw new Error(data.message || 'Login failed');
          }
        },
        {
          loading: 'Signing you in...',
          error: (error) => `Login failed: ${error.message}`,
        }
      );
    } catch (error) {
      // Error handling is done by withToast
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
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
          <p className="text-gray-600" >
            Welcome back
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-black text-center mb-2" >
              Sign in to your account
            </h2>
            <p className="text-center text-gray-600" >
              Enter your credentials to access your account
            </p>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2" >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={handleEmailChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 ${
                    fieldErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                />
                {fieldErrors.email && (
                  <p className="text-red-500 text-xs mt-1" >
                    {fieldErrors.email}
                  </p>
                )}
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2" >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={handlePasswordChange}
                    className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 ${
                      fieldErrors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your password"
                    aria-label="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-black transition-colors duration-200"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <span className="text-sm font-medium">Hide</span>
                    ) : (
                      <span className="text-sm font-medium">Show</span>
                    )}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-red-500 text-xs mt-1" >
                    {fieldErrors.password}
                  </p>
                )}
              </div>
            </div>

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-green-700 text-sm" >{success}</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-700 text-sm" >{error}</p>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading || !isFormValid}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>

            <div className="text-center">
              <Link 
                href="/forgot-password" 
                className="text-sm text-gray-600 hover:text-black transition-colors duration-200"
              >
                Forgot your password?
              </Link>
            </div>
          </form>
        </div>

        {/* Sign Up Link */}
        <div className="text-center mt-8">
          <p className="text-gray-600" >
            Don't have an account?{' '}
            <Link 
              href="/register" 
              className="font-medium text-black hover:text-gray-700 transition-colors duration-200"
            >
              Create a new account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}