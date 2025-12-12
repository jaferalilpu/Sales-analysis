export default function SupportPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-black mb-6" >
            Support Center
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto" >
            Find answers to common questions and get the help you need.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2">
            <div className="space-y-12">
              {/* Search Section */}
              <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-black mb-4" >
                  Search Help Articles
                </h2>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for help topics..."
                    className="w-full px-4 py-4 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                  />
                  <svg className="absolute right-4 top-4 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* FAQ Section */}
              <div>
                <h2 className="text-3xl font-bold text-black mb-8" >
                  Frequently Asked Questions
                </h2>
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
                    <h3 className="text-lg font-semibold text-black mb-3" >
                      How do I track my order?
                    </h3>
                    <p className="text-gray-600 leading-relaxed" >
                      You can track your order by logging into your account and visiting the "My Orders" section, or by using the tracking number sent to your email. We also send SMS updates for important milestones.
                    </p>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
                    <h3 className="text-lg font-semibold text-black mb-3" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                      What is your return policy?
                    </h3>
                    <p className="text-gray-600 leading-relaxed" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                      Returns and exchanges are currently not available. We are working on implementing a return policy. 
                      If you have any concerns about your order, please contact our support team and we'll be happy to help.
                    </p>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
                    <h3 className="text-lg font-semibold text-black mb-3" >
                      How long does shipping take?
                    </h3>
                    <p className="text-gray-600 leading-relaxed" >
                      Standard shipping takes 3-7 business days. Express shipping is available for 1-2 business days. International shipping takes 7-14 business days. Processing time is 1-2 business days.
                    </p>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
                    <h3 className="text-lg font-semibold text-black mb-3" >
                      What payment methods do you accept?
                    </h3>
                    <p className="text-gray-600 leading-relaxed" >
                      We accept all major credit cards, debit cards, UPI, net banking, and digital wallets through our secure payment partners Razorpay and PhonePe. All transactions are encrypted and secure.
                    </p>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
                    <h3 className="text-lg font-semibold text-black mb-3" >
                      How do I cancel my order?
                    </h3>
                    <p className="text-gray-600 leading-relaxed" >
                      You can cancel your order within 24 hours of placing it by contacting our support team or through your account dashboard. Refunds are processed within 5-7 business days.
                    </p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
                    <h3 className="text-lg font-semibold text-black mb-3" >
                      Do you offer international shipping?
                    </h3>
                    <p className="text-gray-600 leading-relaxed" >
                      Yes, we ship to most countries worldwide. International shipping costs and delivery times vary by location. Custom duties and taxes may apply and are the responsibility of the customer.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Contact Support Section */}
              <div className="bg-gray-50 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-black mb-4" >
                  Still need help?
                </h2>
                <p className="text-gray-600 mb-8 leading-relaxed" >
                  Can't find what you're looking for? Our support team is here to help you with any questions or concerns.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <a
                    href="/contact"
                    className="bg-black text-white py-4 px-6 rounded-lg hover:bg-gray-800 transition-colors text-center font-medium"
                  >
                    Contact Support
                  </a>
                  <a
                    href="mailto:ulicastreet25@gmail.com"
                    className="border border-gray-300 text-black py-4 px-6 rounded-lg hover:bg-gray-50 transition-colors text-center font-medium"
                    style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
                  >
                    Email Us Directly
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-black mb-6" >
                Quick Links
              </h3>
              <ul className="space-y-4">
                <li>
                  <a href="/dashboard" className="flex items-center text-gray-600 hover:text-black transition-colors group">
                    <svg className="w-5 h-5 mr-3 text-gray-400 group-hover:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span >My Orders</span>
                  </a>
                </li>
                {/* Returns temporarily disabled */}
                {/* <li>
                  <a href="/returns" className="flex items-center text-gray-600 hover:text-black transition-colors group">
                    <svg className="w-5 h-5 mr-3 text-gray-400 group-hover:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span >Start a Return</span>
                  </a>
                </li> */}
                <li>
                  <a href="/size-guide" className="flex items-center text-gray-600 hover:text-black transition-colors group">
                    <svg className="w-5 h-5 mr-3 text-gray-400 group-hover:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span >Size Guide</span>
                  </a>
                </li>
                <li>
                  <a href="/shipping-info" className="flex items-center text-gray-600 hover:text-black transition-colors group">
                    <svg className="w-5 h-5 mr-3 text-gray-400 group-hover:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <span >Shipping Information</span>
                  </a>
                </li>
              </ul>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-black mb-6" >
                Contact Support
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>Email</p>
                    <a href="mailto:ulicastreet25@gmail.com" className="text-black font-medium hover:text-gray-600 transition-colors" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                      ulicastreet25@gmail.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>WhatsApp</p>
                    <a 
                      href="https://wa.me/919390240737" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-black font-medium hover:text-green-600 transition-colors" 
                      style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
                    >
                      +91 93902 40737
                    </a>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500" >Response Time</p>
                    <p className="text-black font-medium" >Within 24 hours</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl p-6 text-white">
              <h3 className="text-xl font-bold mb-4" >
                Need Immediate Help?
              </h3>
              <p className="text-gray-300 mb-6" >
                For urgent issues, call us directly during business hours.
              </p>
              <div className="text-center">
                <a
                  href="https://wa.me/919390240737"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-black py-3 px-6 rounded-lg font-medium hover:bg-gray-100 transition-colors inline-block"
                  style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
                >
                  WhatsApp Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}