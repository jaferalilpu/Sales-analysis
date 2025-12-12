'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/providers';

interface EditProfileFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profileData: ProfileData) => void;
}

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
}

export function EditProfileForm({ isOpen, onClose, onSave }: EditProfileFormProps) {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<ProfileData>({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
  });

  const [errors, setErrors] = useState<Partial<ProfileData>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: '',
        gender: '',
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors: Partial<ProfileData> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (formData.phone && !/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof ProfileData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 animate-in slide-in-from-bottom-4 duration-300">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-black" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                  Edit Profile
                </h2>
                <p className="text-gray-500 text-sm" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                  Update your personal information
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-full"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                  Full Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-black/10 focus:border-black transition-all duration-200 bg-gray-50/50 ${
                      errors.name ? 'border-red-400 bg-red-50/50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    placeholder="Enter your full name"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                {errors.name && (
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-500 text-sm" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                      {errors.name}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                  Email Address *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-black/10 focus:border-black transition-all duration-200 bg-gray-50/50 ${
                      errors.email ? 'border-red-400 bg-red-50/50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    placeholder="Enter your email address"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                {errors.email && (
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-500 text-sm" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                      {errors.email}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                  Phone Number *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-black/10 focus:border-black transition-all duration-200 bg-gray-50/50 ${
                      errors.phone ? 'border-red-400 bg-red-50/50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    placeholder="Enter your phone number"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                </div>
                {errors.phone && (
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-500 text-sm" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                      {errors.phone}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                  Date of Birth
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-black/10 focus:border-black transition-all duration-200 bg-gray-50/50 hover:border-gray-300"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                Gender
              </label>
              <div className="relative">
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-black/10 focus:border-black transition-all duration-200 bg-gray-50/50 hover:border-gray-300 appearance-none cursor-pointer"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
                style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-black text-white rounded-xl hover:bg-gray-800 hover:shadow-lg transition-all duration-200 font-medium transform hover:scale-105"
                style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
