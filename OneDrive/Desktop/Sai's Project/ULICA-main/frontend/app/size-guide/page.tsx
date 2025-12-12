'use client';

export default function SizeGuidePage() {
  const sizeChart = [
    { size: 'XS', chest: '36"', length: '26"', sleeve: '23"', shoulder: '16"' },
    { size: 'S', chest: '38"', length: '27"', sleeve: '24"', shoulder: '16.5"' },
    { size: 'M', chest: '40"', length: '28"', sleeve: '25"', shoulder: '17"' },
    { size: 'L', chest: '42"', length: '29"', sleeve: '26"', shoulder: '17.5"' },
    { size: 'XL', chest: '44"', length: '30"', sleeve: '27"', shoulder: '18"' },
    { size: 'XXL', chest: '46"', length: '31"', sleeve: '28"', shoulder: '18.5"' },
    { size: 'XXXL', chest: '48"', length: '32"', sleeve: '29"', shoulder: '19"' },
  ];

  const measurementTips = [
    {
      title: 'Chest',
      description: 'Measure around the fullest part of your chest, keeping the tape measure horizontal and under your arms.'
    },
    {
      title: 'Length',
      description: 'Measure from the top of the shoulder down to where you want the garment to end.'
    },
    {
      title: 'Sleeve',
      description: 'Measure from the shoulder point down the arm to where you want the sleeve to end.'
    },
    {
      title: 'Shoulder',
      description: 'Measure across the back from one shoulder point to the other.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-900 to-black text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mx-auto w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6">
            <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            Size Guide
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            Find your perfect fit with our comprehensive size guide
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Size Chart */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            Size Chart
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    Size
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    Chest
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    Length
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    Sleeve
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    Shoulder
                  </th>
                </tr>
              </thead>
              <tbody>
                {sizeChart.map((row, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-300 px-4 py-3 font-semibold text-gray-900" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                      {row.size}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-600" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                      {row.chest}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-600" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                      {row.length}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-600" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                      {row.sleeve}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-600" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                      {row.shoulder}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Measurement Tips */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {measurementTips.map((tip, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                {tip.title}
              </h3>
              <p className="text-gray-600 leading-relaxed" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                {tip.description}
              </p>
            </div>
          ))}
        </div>

        {/* Fitting Tips */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            Fitting Tips
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                Measure Yourself
              </h3>
              <p className="text-gray-600 text-sm" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                Use a flexible measuring tape for accurate measurements
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                Compare Sizes
              </h3>
              <p className="text-gray-600 text-sm" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                Compare your measurements with our size chart to find the best fit
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                Choose Your Fit
              </h3>
              <p className="text-gray-600 text-sm" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                Our sizing runs true to size, but check product descriptions for fit notes
              </p>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-12 bg-gray-50 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            Still Not Sure About Your Size?
          </h3>
          <p className="text-gray-600 mb-6" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            Our support team is here to help you find the perfect fit
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium inline-flex items-center justify-center"
              style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
            >
              Contact Us
            </a>
            <a
              href="/support"
              className="px-6 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium inline-flex items-center justify-center"
              style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
            >
              Support Center
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

