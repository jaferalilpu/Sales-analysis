'use client';

import Link from 'next/link';
import { TruckIcon, ClockIcon, ShieldCheckIcon, GlobeAltIcon } from '@/components/ui/icons';

export default function ShippingInfoPage() {
  const shippingOptions = [
    {
      name: 'Standard Shipping',
      duration: '5-7 business days',
      price: '₹100',
      freeThreshold: 'Free on orders over ₹2,000',
      icon: TruckIcon,
      description: 'Regular shipping with tracking. Orders are processed within 1-2 business days.'
    },
    {
      name: 'Express Shipping',
      duration: '2-3 business days',
      price: '₹250',
      freeThreshold: 'Free on orders over ₹5,000',
      icon: ClockIcon,
      description: 'Fast delivery with priority handling. Orders are processed within 1 business day.'
    },
    {
      name: 'Same Day Delivery',
      duration: 'Same day',
      price: '₹500',
      freeThreshold: 'Available in select cities only',
      icon: ShieldCheckIcon,
      description: 'Available in major cities only. Order before 12 PM for same-day delivery.'
    }
  ];

  const shippingFaqs = [
    {
      question: 'How long does shipping take?',
      answer: 'Standard shipping takes 5-7 business days, express shipping takes 2-3 business days, and same-day delivery is available in select cities for orders placed before 12 PM.'
    },
    {
      question: 'Can I track my order?',
      answer: 'Yes! Once your order ships, you\'ll receive a tracking number via email and SMS. You can track your package in real-time using the tracking link provided.'
    },
    {
      question: 'What if my item is damaged?',
      answer: 'If your item arrives damaged, please contact us immediately with photos of the damaged item and packaging. We\'ll arrange for a replacement at no cost to you.'
    },
    {
      question: 'Do you ship internationally?',
      answer: 'Currently, we only ship within India. International shipping will be available soon. Please check back for updates.'
    },
    {
      question: 'How much is shipping?',
      answer: 'Shipping costs vary by method. Standard shipping is ₹100, express is ₹250, and same-day is ₹500. Free shipping is available on orders over ₹2,000 for standard shipping and ₹5,000 for express shipping.'
    },
    {
      question: 'When will my order be processed?',
      answer: 'Orders are typically processed within 1-2 business days. Express orders are processed within 1 business day. Orders placed on weekends or holidays will be processed the next business day.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-900 to-black text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mx-auto w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6">
            <TruckIcon className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            Shipping Information
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            Fast, reliable shipping to get your orders delivered safely
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Shipping Options */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            Shipping Options
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto text-center mb-12" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            Choose the shipping option that works best for you
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {shippingOptions.map((option, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mr-4">
                    <option.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    {option.name}
                  </h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-2xl font-bold text-black mb-1" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                      {option.price}
                    </p>
                    <p className="text-gray-600 text-sm" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                      {option.duration}
                    </p>
                  </div>
                  
                  <p className="text-gray-600 leading-relaxed" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    {option.description}
                  </p>
                  
                  <p className="text-green-600 text-sm font-medium" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    {option.freeThreshold}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Processing Time */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            Order Processing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-gray-900">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                Order Placed
              </h3>
              <p className="text-gray-600 text-sm" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                You'll receive an order confirmation email
              </p>
            </div>
            <div>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-gray-900">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                Processing
              </h3>
              <p className="text-gray-600 text-sm" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                Order is prepared and packed (1-2 business days)
              </p>
            </div>
            <div>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-gray-900">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                Shipped
              </h3>
              <p className="text-gray-600 text-sm" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                Tracking information sent via email and SMS
              </p>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            Frequently Asked Questions
          </h2>
          <div className="space-y-6 max-w-4xl mx-auto">
            {shippingFaqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-3" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                  {faq.question}
                </h3>
                <p className="text-gray-600 leading-relaxed" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-gray-50 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            Need More Help?
          </h3>
          <p className="text-gray-600 mb-6" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            Our customer service team is here to help with any shipping questions
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium inline-flex items-center justify-center"
              style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
            >
              Contact Us
            </Link>
            <Link
              href="/support"
              className="px-6 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium inline-flex items-center justify-center"
              style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
            >
              Support Center
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

