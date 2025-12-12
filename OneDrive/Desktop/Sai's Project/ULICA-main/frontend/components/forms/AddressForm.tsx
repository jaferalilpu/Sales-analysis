'use client';

import { useState, useEffect } from 'react';
import { fetchAddressByPincode, type AddressData as PincodeAddressData } from '@/utils/fetchAddressByPincode';

interface AddressFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: AddressData) => void;
  editingAddress?: AddressData | null;
}

interface AddressData {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

export function AddressForm({ isOpen, onClose, onSave, editingAddress }: AddressFormProps) {
  const [formData, setFormData] = useState<AddressData>({
    id: '',
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    isDefault: false,
  });

  const [errors, setErrors] = useState<Partial<AddressData>>({});
  const [isPincodeLoading, setIsPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState('');

  // Handle editing address
  useEffect(() => {
    if (editingAddress) {
      setFormData(editingAddress);
    } else {
      // Reset form for new address
      setFormData({
        id: '',
        fullName: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        isDefault: false,
      });
    }
    // Clear errors when form opens
    setErrors({});
    setPincodeError('');
  }, [editingAddress, isOpen]);

  const handlePincodeChange = async (pincode: string) => {
    // Update pincode immediately
    setFormData(prev => ({
      ...prev,
      pincode: pincode
    }));

    // Clear previous error
    setPincodeError('');

    // Only fetch if pincode is 6 digits
    if (pincode.length === 6 && /^\d{6}$/.test(pincode)) {
      setIsPincodeLoading(true);
      
      try {
        const addressData = await fetchAddressByPincode(pincode);
        
        // Auto-fill city, state, and country
        setFormData(prev => ({
          ...prev,
          city: addressData.city,
          state: addressData.state,
          country: addressData.country
        }));
      } catch (error) {
        setPincodeError(error instanceof Error ? error.message : 'Invalid pincode or not found');
      } finally {
        setIsPincodeLoading(false);
      }
    }
  };

  const validateForm = () => {
    const newErrors: Partial<AddressData> = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.country.trim()) newErrors.country = 'Country is required';

    // Phone validation
    if (formData.phone && !/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    // Pincode validation
    if (formData.pincode && !/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Please enter a valid 6-digit pincode';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const addressData = {
        ...formData,
        id: Date.now().toString(),
      };
      
      onSave(addressData);
      onClose();
      
      // Reset form
      setFormData({
        id: '',
        fullName: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        isDefault: false,
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof AddressData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide shadow-2xl border border-gray-100 animate-in slide-in-from-bottom-4 duration-300">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-black" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                  {editingAddress ? 'Edit Address' : 'Add New Address'}
                </h2>
                <p className="text-gray-500 text-sm" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                  {editingAddress ? 'Update your address information' : 'Save your address for faster checkout'}
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
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-black/10 focus:border-black transition-all duration-200 bg-gray-50/50 ${
                      errors.fullName ? 'border-red-400 bg-red-50/50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    placeholder="Enter your full name"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                {errors.fullName && (
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-500 text-sm" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                      {errors.fullName}
                    </p>
                  </div>
                )}
              </div>

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
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                Address *
              </label>
              <div className="relative">
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-black/10 focus:border-black transition-all duration-200 bg-gray-50/50 resize-none ${
                    errors.address ? 'border-red-400 bg-red-50/50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  placeholder="Enter your complete address"
                />
                <div className="absolute top-3 right-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
              {errors.address && (
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-500 text-sm" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    {errors.address}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                Pincode *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={(e) => handlePincodeChange(e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-black/10 focus:border-black transition-all duration-200 bg-gray-50/50 ${
                    errors.pincode ? 'border-red-400 bg-red-50/50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  placeholder="Enter 6-digit pincode"
                  maxLength={6}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  {isPincodeLoading ? (
                    <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V1a1 1 0 011-1h2a1 1 0 011 1v3m0 0h8M7 4h8" />
                    </svg>
                  )}
                </div>
              </div>
              {pincodeError && (
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-500 text-sm" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    {pincodeError}
                  </p>
                </div>
              )}
              {errors.pincode && (
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-500 text-sm" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    {errors.pincode}
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                  City *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-black/10 focus:border-black transition-all duration-200 bg-gray-50/50 ${
                      errors.city ? 'border-red-400 bg-red-50/50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    placeholder="Enter city"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
                {errors.city && (
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-500 text-sm" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                      {errors.city}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                  State *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-black/10 focus:border-black transition-all duration-200 bg-gray-50/50 ${
                      errors.state ? 'border-red-400 bg-red-50/50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    placeholder="Enter state"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                {errors.state && (
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-500 text-sm" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                      {errors.state}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                  Country *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-black/10 focus:border-black transition-all duration-200 bg-gray-50/50 ${
                      errors.country ? 'border-red-400 bg-red-50/50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    placeholder="Enter country"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                {errors.country && (
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-500 text-sm" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                      {errors.country}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleChange}
                  className="h-5 w-5 text-black focus:ring-4 focus:ring-black/10 border-2 border-gray-300 rounded transition-all duration-200"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-800 cursor-pointer" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                  Set as default address
                </label>
                <p className="text-xs text-gray-500 mt-1" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                  This address will be used for future orders
                </p>
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
                {editingAddress ? 'Update Address' : 'Save Address'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
