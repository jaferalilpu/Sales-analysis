export default function ContactUsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-black mb-8">Contact Us</h1>
        <p className="text-gray-600 text-lg mb-8">
          We'd love to hear from you. Send us a message and we'll respond as soon as possible.
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Last name"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="your@email.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black">
                  <option>General Inquiry</option>
                  <option>Order Support</option>
                  <option>Product Question</option>
                  <option>Returns & Exchanges</option>
                  <option>Partnership</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Tell us how we can help you..."
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-black text-white py-3 px-4 rounded-md hover:bg-gray-800 transition-colors font-medium"
              >
                Send Message
              </button>
            </form>
          </div>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-black mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-black">Email</h4>
                  <p className="text-gray-600">support@ulica.com</p>
                </div>
                <div>
                  <h4 className="font-medium text-black">Phone</h4>
                  <p className="text-gray-600">+91 98765 43210</p>
                </div>
                <div>
                  <h4 className="font-medium text-black">Address</h4>
                  <p className="text-gray-600">
                    123 Fashion Street<br />
                    Mumbai, Maharashtra 400001<br />
                    India
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-black mb-4">Business Hours</h3>
              <div className="space-y-2 text-gray-600">
                <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                <p>Saturday: 10:00 AM - 4:00 PM</p>
                <p>Sunday: Closed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
