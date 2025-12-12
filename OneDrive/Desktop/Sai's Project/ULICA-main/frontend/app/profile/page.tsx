'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/providers';
import { 
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  LockClosedIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (user) {
      setFormData({
         firstName: user.name?.split(' ')[0] || '',
         lastName: user.name?.split(' ').slice(1).join(' ') || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePasswordForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters long';
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        const data = await response.json();
        updateUser(data.data.user);
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('Failed to update profile');
      
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) return;
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(passwordData),
      });
      
      if (response.ok) {
        setSuccess('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setIsChangingPassword(false);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to change password');
      }
    } catch (err) {
      setError('Failed to change password');
      
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <UserIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-4xl font-bold text-black mb-4" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
              Sign in to view your profile
            </h1>
            <p className="text-gray-600 mb-8 text-lg" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
              Please sign in to access your profile settings.
            </p>
            <a
              href="/login"
              className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-lg text-white bg-black hover:bg-gray-800 transition-all duration-200"
            >
              <UserIcon className="w-5 h-5 mr-2" />
              Sign In
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            Profile Settings
          </h1>
          <p className="text-gray-600 mt-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            Manage your account information and preferences
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <CheckCircleIcon className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{success}</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <XCircleIcon className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-8">
          {/* Profile Information */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                  Personal Information
                </h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
            
            <div className="px-6 py-4">
              {isEditing ? (
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                        First Name *
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                          fieldErrors.firstName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        aria-describedby={fieldErrors.firstName ? "firstName-error" : undefined}
                        aria-invalid={fieldErrors.firstName ? "true" : "false"}
                      />
                      {fieldErrors.firstName && (
                        <p id="firstName-error" className="mt-1 text-sm text-red-600" role="alert">
                          {fieldErrors.firstName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                        Last Name *
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                          fieldErrors.lastName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        aria-describedby={fieldErrors.lastName ? "lastName-error" : undefined}
                        aria-invalid={fieldErrors.lastName ? "true" : "false"}
                      />
                      {fieldErrors.lastName && (
                        <p id="lastName-error" className="mt-1 text-sm text-red-600" role="alert">
                          {fieldErrors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                        fieldErrors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      aria-describedby={fieldErrors.email ? "email-error" : undefined}
                      aria-invalid={fieldErrors.email ? "true" : "false"}
                    />
                    {fieldErrors.email && (
                      <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                        fieldErrors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      aria-describedby={fieldErrors.phone ? "phone-error" : undefined}
                      aria-invalid={fieldErrors.phone ? "true" : "false"}
                    />
                    {fieldErrors.phone && (
                      <p id="phone-error" className="mt-1 text-sm text-red-600" role="alert">
                        {fieldErrors.phone}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setFieldErrors({});
                        setError(null);
                        setSuccess(null);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center">
                    <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                         {user.name || 'User'}
                      </p>
                      <p className="text-sm text-gray-500">Full Name</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                        {user.email}
                      </p>
                      <p className="text-sm text-gray-500">Email Address</p>
                    </div>
                  </div>
                  {user.phone && (
                    <div className="flex items-center">
                      <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                          {user.phone}
                        </p>
                        <p className="text-sm text-gray-500">Phone Number</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Password Change */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                  Change Password
                </h2>
                {!isChangingPassword && (
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                  >
                    <LockClosedIcon className="w-4 h-4 mr-2" />
                    Change
                  </button>
                )}
              </div>
            </div>
            
            <div className="px-6 py-4">
              {isChangingPassword ? (
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                      Current Password *
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                        fieldErrors.currentPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      aria-describedby={fieldErrors.currentPassword ? "currentPassword-error" : undefined}
                      aria-invalid={fieldErrors.currentPassword ? "true" : "false"}
                    />
                    {fieldErrors.currentPassword && (
                      <p id="currentPassword-error" className="mt-1 text-sm text-red-600" role="alert">
                        {fieldErrors.currentPassword}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                      New Password *
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                        fieldErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      aria-describedby={fieldErrors.newPassword ? "newPassword-error" : undefined}
                      aria-invalid={fieldErrors.newPassword ? "true" : "false"}
                    />
                    {fieldErrors.newPassword && (
                      <p id="newPassword-error" className="mt-1 text-sm text-red-600" role="alert">
                        {fieldErrors.newPassword}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                      Confirm New Password *
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                        fieldErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      aria-describedby={fieldErrors.confirmPassword ? "confirmPassword-error" : undefined}
                      aria-invalid={fieldErrors.confirmPassword ? "true" : "false"}
                    />
                    {fieldErrors.confirmPassword && (
                      <p id="confirmPassword-error" className="mt-1 text-sm text-red-600" role="alert">
                        {fieldErrors.confirmPassword}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsChangingPassword(false);
                        setPasswordData({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: '',
                        });
                        setFieldErrors({});
                        setError(null);
                        setSuccess(null);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
                    >
                      {isLoading ? 'Changing...' : 'Change Password'}
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-sm text-gray-500" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                  Click the "Change" button to update your password.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
