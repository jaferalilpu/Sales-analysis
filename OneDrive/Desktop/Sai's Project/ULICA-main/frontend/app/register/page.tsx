'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/app/providers';
import ReferralLinkHandler from '@/components/referrals/ReferralLinkHandler';
import { ulicaToasts, withToast } from '@/lib/toast';
import { getErrorMessage } from '@/types/common';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    referralCode: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [referralInfo, setReferralInfo] = useState<{name: string, email: string} | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const [isFormValid, setIsFormValid] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

  // Validation functions
  const validateEmail = (email: string): string => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (password: string): string => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters long';
    if (!/(?=.*[a-z])/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/(?=.*\d)/.test(password)) return 'Password must contain at least one number';
    if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) return 'Password must contain at least one special character';
    return '';
  };

  const validateName = (name: string): string => {
    if (!name.trim()) return 'Full name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters long';
    return '';
  };

  const validatePhone = (phone: string): string => {
    if (phone && !/^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/\s/g, ''))) {
      return 'Please enter a valid phone number';
    }
    return '';
  };

  const validateForm = useCallback((): boolean => {
    const errors: {[key: string]: string} = {};
    
    errors.name = validateName(formData.name);
    errors.email = validateEmail(formData.email);
    errors.password = validatePassword(formData.password);
    errors.phone = validatePhone(formData.phone);
    
    if (formData.password && formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }
    
    if (formData.confirmPassword && !formData.password) {
      errors.confirmPassword = 'Please enter password first';
    }

    setFieldErrors(errors);
    
    const isValid = Object.values(errors).every(error => error === '') && 
                   formData.name && formData.email && formData.password && formData.confirmPassword;
    
    setIsFormValid(!!isValid);
    return !!isValid;
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear general error
    if (error) setError('');
    if (success) setSuccess('');
  };

  // Real-time validation
  useEffect(() => {
    validateForm();
  }, [validateForm]);

  const handleReferralCodeDetected = async (code: string) => {
    setFormData(prev => ({ ...prev, referralCode: code }));
    
    // Validate the referral code and get referrer info
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
        setReferralInfo(data.data.referrer);
      }
    } catch (error) {
      
    }
  };

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
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: formData.name.trim(),
              email: formData.email.trim(),
              password: formData.password,
              // Only include phone if it has a value (Joi rejects empty strings for optional fields)
              ...(formData.phone && formData.phone.trim() !== '' ? { phone: formData.phone.trim() } : {}),
              // Only include referralCode if it has a value (Joi rejects empty strings for optional fields)
              ...(formData.referralCode && formData.referralCode.trim() !== '' ? { referralCode: formData.referralCode.trim() } : {})
            }),
          });

          let data;
          try {
            data = await response.json();
          } catch (parseError) {
            const text = await response.text();
            
            setError('Invalid response from server. Please try again.');
            throw new Error('Invalid response from server');
          }

          if (response.ok) {
            // Store email for OTP verification
            localStorage.setItem('pendingVerificationEmail', formData.email);
            
            // Show success toast
            ulicaToasts.registerSuccess(formData.email);
            
            // Redirect to OTP verification page after a short delay
            setTimeout(() => {
              router.push(`/otp-verification?email=${encodeURIComponent(formData.email)}`);
            }, 1500);
          } else {

            // Handle validation errors from backend
            if (data.errors && Array.isArray(data.errors)) {
              const newFieldErrors: {[key: string]: string} = {};
              data.errors.forEach((err: { field?: string; message?: string }) => {
                const fieldName = err.field || '';
                if (fieldName) {
                  newFieldErrors[fieldName] = err.message || 'Invalid value';
                }
              });
              setFieldErrors(prev => ({ ...prev, ...newFieldErrors }));
              
              // Set general error message
              if (Object.keys(newFieldErrors).length > 0) {
                setError('Please fix the errors below');
              } else {
                setError(data.message || 'Registration failed. Please check your input.');
              }
            } else if (data.message?.includes('email') && (data.message?.includes('already') || data.message?.includes('exists'))) {
              setFieldErrors(prev => ({
                ...prev,
                email: 'This email is already registered'
              }));
              setError('This email is already registered');
            } else {
              // Show the actual error message from backend
              const errorMsg = data.message || data.error || 'Registration failed. Please try again.';
              setError(errorMsg);
              
            }
            throw new Error(data.message || data.error || 'Registration failed');
          }
        },
        {
          loading: 'Creating your account...',
          error: (error) => `Registration failed: ${error.message}`,
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
      <ReferralLinkHandler onReferralCodeDetected={handleReferralCodeDetected} />
      <div className="max-w-md w-full">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto">
              <Image 
                src="/ulica-symbol.png?v=10" 
                alt="ULICA streetwear brand logo"
                width={120}
                height={120}
                className="h-24 w-auto object-contain saturate-150 brightness-110 contrast-125"
                priority
              />
            </div>
          </div>
          <p className="text-gray-600" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            Join the community
          </p>
        </div>

        {/* Registration Form Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <header className="mb-8">
            <h1 className="text-2xl font-bold text-black text-center mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
              Create your account
            </h1>
            <p className="text-center text-gray-600" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
              Fill in your details to get started
            </p>
          </header>
          
          <form className="space-y-6" onSubmit={handleSubmit} role="form" aria-label="Registration form">
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                  Full Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 ${
                    fieldErrors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your full name"
                  aria-describedby={fieldErrors.name ? "name-error" : undefined}
                  aria-invalid={fieldErrors.name ? "true" : "false"}
                />
                {fieldErrors.name && (
                  <p id="name-error" className="text-red-500 text-xs mt-1" role="alert" aria-live="polite" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    {fieldErrors.name}
                  </p>
                )}
              </div>

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
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 ${
                    fieldErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                  aria-describedby={fieldErrors.email ? "email-error" : undefined}
                  aria-invalid={fieldErrors.email ? "true" : "false"}
                />
                {fieldErrors.email && (
                  <p id="email-error" className="text-red-500 text-xs mt-1" role="alert" aria-live="polite" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2" >
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 ${
                    fieldErrors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your phone number"
                />
                {fieldErrors.phone && (
                  <p className="text-red-500 text-xs mt-1" >
                    {fieldErrors.phone}
                  </p>
                )}
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2" >
                  Password *
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 ${
                      fieldErrors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Create a password"
                    aria-label="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-black transition-colors duration-200"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {fieldErrors.password ? (
                  <p className="text-red-500 text-xs mt-1" >
                    {fieldErrors.password}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1" >
                    Must be at least 8 characters with uppercase, lowercase, number, and special character
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2" >
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 ${
                      fieldErrors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Confirm your password"
                    aria-label="Confirm Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-black transition-colors duration-200"
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1" >
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Referral Code Input */}
              <div>
                <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700 mb-2" >
                  Referral Code (Optional)
                </label>
                <input
                  id="referralCode"
                  name="referralCode"
                  type="text"
                  value={formData.referralCode}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                  placeholder="Enter referral code"
                />
                {referralInfo && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700" >
                      Referred by: {referralInfo.name} ({referralInfo.email})
                    </p>
                  </div>
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
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-red-700 text-sm font-medium mb-1">{error}</p>
                    <p className="text-red-600 text-xs">
                      Please check the fields highlighted in red below and try again.
                    </p>
                  </div>
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
                    Creating account...
                  </>
                ) : (
                  'Create account'
                )}
              </button>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500" >
                By creating an account, you agree to our{' '}
                <Link href="/terms" className="text-black hover:underline font-medium">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-black hover:underline font-medium">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Sign In Link */}
        <div className="text-center mt-8">
          <p className="text-gray-600" >
            Already have an account?{' '}
            <Link 
              href="/login" 
              className="font-medium text-black hover:text-gray-700 transition-colors duration-200"
            >
              Sign in to your account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}