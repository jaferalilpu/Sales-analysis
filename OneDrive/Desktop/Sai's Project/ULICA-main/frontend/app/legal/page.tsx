export default function LegalPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-black mb-6" >
            Legal Information
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto" >
            Important legal information about using ULICA's services and products.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="space-y-16">
          {/* Table of Contents */}
          <div className="bg-gray-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-black mb-6" >
              Table of Contents
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a href="#terms" className="text-gray-600 hover:text-black transition-colors flex items-center group">
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-3 group-hover:bg-black"></span>
                <span >Terms of Service</span>
              </a>
              <a href="#privacy" className="text-gray-600 hover:text-black transition-colors flex items-center group">
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-3 group-hover:bg-black"></span>
                <span >Privacy Policy</span>
              </a>
              <a href="#intellectual" className="text-gray-600 hover:text-black transition-colors flex items-center group">
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-3 group-hover:bg-black"></span>
                <span >Intellectual Property</span>
              </a>
              <a href="#governing" className="text-gray-600 hover:text-black transition-colors flex items-center group">
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-3 group-hover:bg-black"></span>
                <span >Governing Law</span>
              </a>
            </div>
          </div>

          {/* Terms of Service */}
          <div id="terms" className="scroll-mt-20">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-black mb-6" >
                Terms of Service
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed" >
                By using ULICA's website and services, you agree to be bound by these terms and conditions. Please read them carefully.
              </p>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-black mb-4" >
                    Acceptance of Terms
                  </h3>
                  <p className="text-gray-600 leading-relaxed" >
                    These terms constitute a legally binding agreement between you and ULICA. By accessing our website, you acknowledge that you have read, understood, and agree to be bound by these terms.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-black mb-4" >
                    Use of Website
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4" >
                    You may use our website for lawful purposes only. You agree not to use the website in any way that could damage, disable, overburden, or impair our servers or networks.
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                    <li >You must be at least 18 years old to make purchases</li>
                    <li >You are responsible for maintaining the confidentiality of your account</li>
                    <li >You agree to provide accurate and complete information</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-black mb-4" >
                    Product Information
                  </h3>
                  <p className="text-gray-600 leading-relaxed" >
                    We strive to provide accurate product information, but we do not warrant that product descriptions or other content is accurate, complete, reliable, or error-free. Product colors may vary slightly from what is displayed on your screen.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-black mb-4" >
                    Limitation of Liability
                  </h3>
                  <p className="text-gray-600 leading-relaxed" >
                    ULICA shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the website or products. Our total liability shall not exceed the amount paid for the products in question.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Privacy Policy */}
          <div id="privacy" className="scroll-mt-20">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-black mb-6" >
                Privacy Policy
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed" >
                We are committed to protecting your privacy and personal information. This policy explains how we collect, use, and protect your information.
              </p>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-black mb-4" >
                    Information We Collect
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4" >
                    We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support.
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                    <li >Personal information (name, email, phone number)</li>
                    <li >Shipping and billing addresses</li>
                    <li >Payment information (processed securely by third parties)</li>
                    <li >Account preferences and purchase history</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-black mb-4" >
                    How We Use Information
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4" >
                    We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                    <li >Process and fulfill your orders</li>
                    <li >Send order updates and shipping notifications</li>
                    <li >Provide customer support</li>
                    <li >Improve our products and services</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-black mb-4" >
                    Information Sharing
                  </h3>
                  <p className="text-gray-600 leading-relaxed" >
                    We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this privacy policy. We may share information with service providers who assist us in operating our website and conducting our business.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-black mb-4" >
                    Data Security
                  </h3>
                  <p className="text-gray-600 leading-relaxed" >
                    We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. All payment information is encrypted and processed through secure payment gateways.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Intellectual Property */}
          <div id="intellectual" className="scroll-mt-20">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-black mb-6" >
                Intellectual Property
              </h2>
              <p className="text-gray-600 leading-relaxed" >
                All content on this website, including text, graphics, logos, images, and software, is the property of ULICA and is protected by copyright and other intellectual property laws. You may not reproduce, distribute, or create derivative works without our written permission.
              </p>
            </div>
          </div>
          
          {/* Governing Law */}
          <div id="governing" className="scroll-mt-20">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-black mb-6" >
                Governing Law
              </h2>
              <p className="text-gray-600 leading-relaxed" >
                These terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in Mumbai, India.
              </p>
            </div>
          </div>
          
          {/* Contact Information */}
          <div className="bg-gray-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-black mb-6" >
              Contact Information
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed" >
              If you have any questions about these legal terms, please contact us:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500" >Email</p>
                  <p className="text-black font-medium" >legal@ulica.com</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500" >Phone</p>
                  <p className="text-black font-medium" >+91 98765 43210</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500" >Address</p>
                  <p className="text-black font-medium text-sm" >
                    123 Fashion Street<br />
                    Mumbai, Maharashtra 400001<br />
                    India
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}