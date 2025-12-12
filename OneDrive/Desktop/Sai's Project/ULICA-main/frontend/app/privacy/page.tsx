export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-black mb-6" >
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto" >
            Your privacy is important to us. Learn how we collect, use, and protect your personal information.
          </p>
          <p className="text-sm text-gray-500 mt-4" >
            Last updated: December 2024
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="space-y-16">
          {/* Introduction */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <h2 className="text-3xl font-bold text-black mb-6" >
              Introduction
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6" >
              ULICA ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make a purchase from us.
            </p>
            <p className="text-gray-600 leading-relaxed" >
              Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
            </p>
          </div>

          {/* Information We Collect */}
          <div>
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-black mb-6" >
                Information We Collect
              </h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-black mb-4" >
                    Personal Information
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4" >
                    We collect personal information that you voluntarily provide to us when you:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4 mb-4">
                    <li >Register for an account</li>
                    <li >Make a purchase</li>
                    <li >Subscribe to our newsletter</li>
                    <li >Contact us for support</li>
                    <li >Participate in surveys or promotions</li>
                  </ul>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600" >
                      <strong>Examples:</strong> Name, email address, phone number, shipping address, billing address, payment information, and order history.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-black mb-4" >
                    Automatically Collected Information
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4" >
                    We automatically collect certain information when you visit our website:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                    <li >IP address and location data</li>
                    <li >Browser type and version</li>
                    <li >Device information</li>
                    <li >Pages visited and time spent on site</li>
                    <li >Referring website</li>
                    <li >Cookies and similar tracking technologies</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* How We Use Information */}
          <div>
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-black mb-6" >
                How We Use Your Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-black mb-3" >
                    Order Processing
                  </h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm">
                    <li >Process and fulfill orders</li>
                    <li >Send order confirmations</li>
                    <li >Provide shipping updates</li>
                    <li >Handle returns and refunds</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-black mb-3" >
                    Customer Service
                  </h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm">
                    <li >Respond to inquiries</li>
                    <li >Provide support</li>
                    <li >Send important updates</li>
                    <li >Resolve issues</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-black mb-3" >
                    Marketing & Communication
                  </h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm">
                    <li >Send newsletters</li>
                    <li >Promotional offers</li>
                    <li >Product recommendations</li>
                    <li >Event invitations</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-black mb-3" >
                    Website Improvement
                  </h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm">
                    <li >Analyze usage patterns</li>
                    <li >Improve user experience</li>
                    <li >Develop new features</li>
                    <li >Prevent fraud</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Information Sharing */}
          <div>
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-black mb-6" >
                Information Sharing and Disclosure
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-black mb-3" >
                    We Do Not Sell Your Information
                  </h3>
                  <p className="text-gray-600 leading-relaxed" >
                    We do not sell, trade, or otherwise transfer your personal information to third parties for their marketing purposes.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-black mb-3" >
                    Service Providers
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4" >
                    We may share your information with trusted third-party service providers who assist us in operating our website and conducting our business:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                    <li >Payment processors (Razorpay, PhonePe)</li>
                    <li >Shipping and logistics partners (Shiprocket)</li>
                    <li >Email marketing services</li>
                    <li >Analytics providers</li>
                    <li >Customer support tools</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-black mb-3" >
                    Legal Requirements
                  </h3>
                  <p className="text-gray-600 leading-relaxed" >
                    We may disclose your information if required by law or if we believe such action is necessary to comply with legal processes, protect our rights, or protect the safety of our users.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Data Security */}
          <div>
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-black mb-6" >
                Data Security
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-black mb-3" >
                    Security Measures
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4" >
                    We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                    <li >SSL encryption for data transmission</li>
                    <li >Secure payment processing</li>
                    <li >Regular security audits</li>
                    <li >Access controls and authentication</li>
                    <li >Data backup and recovery systems</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800" >
                    <strong>Important:</strong> While we strive to protect your personal information, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Your Rights */}
          <div>
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-black mb-6" >
                Your Rights and Choices
              </h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-black mb-2" >
                      Access & Update
                    </h3>
                    <p className="text-sm text-gray-600" >
                      Access and update your personal information through your account settings.
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-black mb-2" >
                      Unsubscribe
                    </h3>
                    <p className="text-sm text-gray-600" >
                      Unsubscribe from marketing emails using the link in any email or your account preferences.
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-black mb-2" >
                      Data Deletion
                    </h3>
                    <p className="text-sm text-gray-600" >
                      Request deletion of your account and associated data by contacting us.
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-black mb-2" >
                      Cookie Preferences
                    </h3>
                    <p className="text-sm text-gray-600" >
                      Manage cookie preferences through your browser settings or our cookie banner.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Us */}
          <div className="bg-gray-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-black mb-6" >
              Contact Us
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed" >
              If you have any questions about this Privacy Policy or our privacy practices, please contact us:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-2" >Email</p>
                <p className="text-black font-medium" >privacy@ulica.com</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2" >Phone</p>
                <p className="text-black font-medium" >+91 98765 43210</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}