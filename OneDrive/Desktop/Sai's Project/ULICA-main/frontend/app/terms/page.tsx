export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-black mb-6" >
            Terms of Service
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto" >
            Please read these terms carefully before using ULICA's website and services.
          </p>
          <p className="text-sm text-gray-500 mt-4" >
            Last updated: December 2024
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="space-y-16">
          {/* Agreement to Terms */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <h2 className="text-3xl font-bold text-black mb-6" >
              Agreement to Terms
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6" >
              These Terms of Service ("Terms") constitute a legally binding agreement between you ("User," "you," or "your") and ULICA ("Company," "we," "our," or "us") regarding your use of our website and services.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800" >
                <strong>Important:</strong> By accessing or using our website, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our services.
              </p>
            </div>
          </div>

          {/* Eligibility */}
          <div>
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-black mb-6" >
                Eligibility and Account Registration
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-black mb-3" >
                    Age Requirements
                  </h3>
                  <p className="text-gray-600 leading-relaxed" >
                    You must be at least 18 years old to use our services and make purchases. If you are under 18, you may only use our services with the involvement and consent of a parent or guardian.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-black mb-3" >
                    Account Registration
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4" >
                    To access certain features, you may need to create an account. You agree to:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                    <li >Provide accurate and complete information</li>
                    <li >Maintain the security of your password</li>
                    <li >Update your information as necessary</li>
                    <li >Accept responsibility for all activities under your account</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Use of Website */}
          <div>
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-black mb-6" >
                Use of Website and Services
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-black mb-3" >
                    Permitted Uses
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4" >
                    You may use our website and services for lawful purposes only. You agree to use our services in accordance with all applicable laws and regulations.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-black mb-3" >
                    Prohibited Activities
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4" >
                    You agree not to engage in any of the following prohibited activities:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                    <li >Violate any applicable laws or regulations</li>
                    <li >Infringe on intellectual property rights</li>
                    <li >Transmit harmful or malicious code</li>
                    <li >Attempt to gain unauthorized access to our systems</li>
                    <li >Interfere with the proper functioning of our website</li>
                    <li >Use our services for fraudulent or deceptive purposes</li>
                    <li >Harass or harm other users</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Products and Pricing */}
          <div>
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-black mb-6" >
                Products, Pricing, and Orders
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-black mb-3" >
                    Product Information
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4" >
                    We strive to provide accurate product descriptions, images, and pricing information. However, we do not warrant that such information is error-free or complete.
                  </p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800" >
                      <strong>Note:</strong> Product colors may vary slightly from what is displayed on your screen due to monitor settings and lighting conditions.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-black mb-3" >
                    Pricing and Payment
                  </h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                    <li >All prices are listed in Indian Rupees (INR)</li>
                    <li >Prices are subject to change without notice</li>
                    <li >Payment must be made at the time of purchase</li>
                    <li >We accept major credit cards, UPI, and other payment methods</li>
                    <li >All payments are processed securely through our payment partners</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-black mb-3" >
                    Order Processing
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4" >
                    When you place an order:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                    <li >You will receive an order confirmation email</li>
                    <li >We will process your order within 1-2 business days</li>
                    <li >You will receive shipping updates via email and SMS</li>
                    <li >Delivery times vary based on your location</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Returns and Refunds */}
          <div>
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-black mb-6" >
                Returns, Exchanges, and Refunds
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-black mb-3" >
                    Return Policy
                  </h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                    <li >30-day return window from delivery date</li>
                    <li >Items must be in original condition with tags attached</li>
                    <li >Original packaging must be included</li>
                    <li >No returns on sale items or personalized products</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-black mb-3" >
                    Refund Process
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4" >
                    Refunds will be processed within 5-7 business days after we receive and inspect the returned item. Refunds will be issued to the original payment method.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-black mb-3" >
                    Exchanges
                  </h3>
                  <p className="text-gray-600 leading-relaxed" >
                    Exchanges are subject to availability. If the desired size or color is not available, we will provide a refund instead.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Intellectual Property */}
          <div>
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-black mb-6" >
                Intellectual Property Rights
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-black mb-3" >
                    Our Content
                  </h3>
                  <p className="text-gray-600 leading-relaxed" >
                    All content on our website, including text, graphics, logos, images, and software, is the property of ULICA and is protected by copyright, trademark, and other intellectual property laws.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-black mb-3" >
                    License to Use
                  </h3>
                  <p className="text-gray-600 leading-relaxed" >
                    We grant you a limited, non-exclusive, non-transferable license to access and use our website for personal, non-commercial purposes only.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-black mb-3" >
                    Restrictions
                  </h3>
                  <p className="text-gray-600 leading-relaxed" >
                    You may not reproduce, distribute, modify, or create derivative works from our content without our express written permission.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Limitation of Liability */}
          <div>
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-black mb-6" >
                Limitation of Liability
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-black mb-3" >
                    Disclaimer of Warranties
                  </h3>
                  <p className="text-gray-600 leading-relaxed" >
                    Our website and services are provided "as is" and "as available" without warranties of any kind, either express or implied. We disclaim all warranties, including but not limited to merchantability, fitness for a particular purpose, and non-infringement.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-black mb-3" >
                    Limitation of Damages
                  </h3>
                  <p className="text-gray-600 leading-relaxed" >
                    ULICA shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or use, arising from your use of our services.
                  </p>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800" >
                    <strong>Maximum Liability:</strong> Our total liability to you for any claims arising from these Terms or your use of our services shall not exceed the amount you paid us for the products in question.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Governing Law */}
          <div>
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-black mb-6" >
                Governing Law and Dispute Resolution
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-black mb-3" >
                    Governing Law
                  </h3>
                  <p className="text-gray-600 leading-relaxed" >
                    These Terms shall be governed by and construed in accordance with the laws of India, without regard to conflict of law principles.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-black mb-3" >
                    Jurisdiction
                  </h3>
                  <p className="text-gray-600 leading-relaxed" >
                    Any disputes arising from these Terms or your use of our services shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra, India.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-black mb-3" >
                    Dispute Resolution
                  </h3>
                  <p className="text-gray-600 leading-relaxed" >
                    We encourage you to contact us first to resolve any disputes amicably. If we cannot resolve the dispute, it will be subject to binding arbitration.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Changes to Terms */}
          <div>
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-black mb-6" >
                Changes to Terms
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4" >
                We reserve the right to modify these Terms at any time. We will notify you of any material changes by posting the updated Terms on our website and updating the "Last updated" date.
              </p>
              <p className="text-gray-600 leading-relaxed" >
                Your continued use of our services after any changes constitutes acceptance of the updated Terms.
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-black mb-6" >
              Contact Information
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed" >
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-2" >Email</p>
                <p className="text-black font-medium" >legal@ulica.com</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2" >Phone</p>
                <p className="text-black font-medium" >+91 98765 43210</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2" >Address</p>
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
  );
}