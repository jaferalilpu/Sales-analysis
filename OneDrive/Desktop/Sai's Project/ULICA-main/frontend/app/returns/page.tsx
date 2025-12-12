'use client';

import Link from 'next/link';
import { ExclamationTriangleIcon, ClockIcon } from '@/components/ui/icons';

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-900 to-black text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            Returns & Exchanges
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            Currently Not Available
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
          {/* Icon */}
          <div className="mx-auto w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
            <ExclamationTriangleIcon className="h-12 w-12 text-yellow-600" />
          </div>

          {/* Heading */}
          <h2 className="text-3xl font-bold text-gray-900 mb-4" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            Returns Policy Temporarily Unavailable
          </h2>

          {/* Description */}
          <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            We apologize for the inconvenience, but returns and exchanges are currently not available. 
            We are working on implementing a return policy and will update this page once it becomes available.
          </p>

          {/* Additional Info */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left max-w-2xl mx-auto">
            <div className="flex items-start space-x-4">
              <ClockIcon className="h-6 w-6 text-gray-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                  When will returns be available?
                </h3>
                <p className="text-gray-600 leading-relaxed" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                  We are actively working on implementing our return policy. Please check back soon for updates. 
                  In the meantime, if you have any concerns about your order, please contact our support team.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/support"
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium inline-flex items-center justify-center space-x-2"
              style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
            >
              <span>Contact Support</span>
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium inline-flex items-center justify-center space-x-2"
              style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
            >
              <span>Get Help</span>
            </Link>
          </div>
        </div>

        {/* Shipping Info */}
        <div className="mt-12 bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            Shipping Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                Standard Shipping
              </h4>
              <p className="text-gray-600" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                5-7 business days
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                Express Shipping
              </h4>
              <p className="text-gray-600" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                2-3 business days
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                Order Tracking
              </h4>
              <p className="text-gray-600" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                Available via email
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
