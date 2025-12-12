'use client';

import { useState } from 'react';
import { fetchAddressByPincode, isValidPincode, normalizePincode } from '../../utils/fetchAddressByPincode';

export default function TestPincodeUpdatedPage() {
  const [pincode, setPincode] = useState('');
  const [address, setAddress] = useState({ city: '', state: '', country: '', pincode: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiSource, setApiSource] = useState('');

  const handlePincodeChange = async (value: string) => {
    const normalizedPincode = normalizePincode(value);
    setPincode(normalizedPincode);
    setError('');
    setApiSource('');

    if (isValidPincode(normalizedPincode)) {
      setIsLoading(true);
      
      try {
        const addressData = await fetchAddressByPincode(normalizedPincode);
        setAddress(addressData);
        
        // Determine which API was used based on the response
        // This is a simple heuristic - in practice, you might want to track this in the utility
        setApiSource('Address data fetched successfully');
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch address');
        setAddress({ city: '', state: '', country: '', pincode: '' });
      } finally {
        setIsLoading(false);
      }
    } else {
      setAddress({ city: '', state: '', country: '', pincode: '' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-16">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-black mb-8 text-center">
          Updated Pincode Auto-Fill Test
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Dual-Source Pincode Lookup
            </h2>
            <p className="text-gray-600 mb-4">
              This implementation uses <strong>India Postal API</strong> as the primary source 
              and <strong>Zippopotam API</strong> as fallback for more accurate Indian address data.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Key Improvements:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <strong>Hyderabad 500001</strong> now correctly shows <strong>Telangana</strong> instead of Andhra Pradesh</li>
                <li>• More accurate state mappings for Indian addresses</li>
                <li>• Automatic fallback to Zippopotam if India Postal API fails</li>
                <li>• Centralized utility function for consistent behavior</li>
              </ul>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter 6-digit Pincode
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => handlePincodeChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  maxLength={6}
                  placeholder="e.g., 500001 (Hyderabad), 110001 (Delhi)"
                />
                {isLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              {error && (
                <p className="text-red-500 text-sm mt-1">{error}</p>
              )}
              {apiSource && !error && (
                <p className="text-green-600 text-sm mt-1">{apiSource}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={address.city}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <input
                  type="text"
                  value={address.state}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={address.country}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pincode
                </label>
                <input
                  type="text"
                  value={address.pincode}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Test Cases</h3>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-800">500001 - Hyderabad</p>
                <p className="text-sm text-gray-600">Should show: Hyderabad, Telangana, India</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-800">110001 - New Delhi</p>
                <p className="text-sm text-gray-600">Should show: New Delhi, Delhi, India</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-800">400001 - Mumbai</p>
                <p className="text-sm text-gray-600">Should show: Mumbai, Maharashtra, India</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-800">560001 - Bangalore</p>
                <p className="text-sm text-gray-600">Should show: Bangalore, Karnataka, India</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">API Sources</h3>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="font-medium text-green-800">Primary: India Postal API</p>
                <p className="text-sm text-green-600">api.postalpincode.in/pincode/{pincode || 'XXXXXX'}</p>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="font-medium text-blue-800">Fallback: Zippopotam API</p>
                <p className="text-sm text-blue-600">api.zippopotam.us/in/{pincode || 'XXXXXX'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
