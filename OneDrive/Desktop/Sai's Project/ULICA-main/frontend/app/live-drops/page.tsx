import Image from 'next/image';

export default function LiveDropsPage() {
  const liveDrops = [
    {
      id: 1,
      title: "Wilderness Collection",
      subtitle: "Drop III - LIVE NOW",
      timeRemaining: "2h 34m 12s",
      image: "/27546740_t32h_phbt_211202.svg",
      items: 18,
      soldOut: 0,
      price: "₹2,999",
      discount: "20% OFF",
      viewers: "2.3k watching",
      category: "Hoodies",
      colors: ["Black", "Gray", "Green"],
      sizes: ["S", "M", "L", "XL"]
    },
    {
      id: 2,
      title: "Urban Explorer",
      subtitle: "Drop II - LIVE NOW",
      timeRemaining: "5h 21m 45s",
      image: "/placeholder-product.jpg",
      items: 12,
      soldOut: 3,
      price: "₹1,299",
      discount: "15% OFF",
      viewers: "1.8k watching",
      category: "T-Shirts",
      colors: ["White", "Navy"],
      sizes: ["S", "M", "L"]
    },
    {
      id: 3,
      title: "Street Culture",
      subtitle: "Drop I - LIVE NOW",
      timeRemaining: "1h 15m 30s",
      image: "/placeholder-product.jpg",
      items: 8,
      soldOut: 1,
      price: "₹899",
      discount: "25% OFF",
      viewers: "950 watching",
      category: "Accessories",
      colors: ["Black", "Red"],
      sizes: ["One Size"]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Advanced Animations */}
      <div className="relative bg-gradient-to-br from-red-50 via-white to-red-50 py-24 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-red-100 rounded-full animate-pulse opacity-20"></div>
          <div className="absolute top-32 right-32 w-32 h-32 bg-red-200 rounded-full animate-bounce opacity-15"></div>
          <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-red-300 rounded-full animate-ping opacity-20"></div>
          <div className="absolute top-1/2 right-10 w-16 h-16 bg-red-400 rounded-full animate-pulse opacity-25"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Live Indicator */}
          <div className="inline-flex items-center bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-4 rounded-full text-lg font-bold mb-8 shadow-2xl animate-pulse">
            <div className="w-4 h-4 bg-white rounded-full mr-3 animate-ping"></div>
            <div className="w-2 h-2 bg-white rounded-full mr-3 animate-pulse"></div>
            LIVE NOW • {liveDrops.length} ACTIVE DROPS
          </div>
          
          <h1 className="text-7xl font-bold text-black mb-8" >
            Live Drops
          </h1>
          
          <p className="text-2xl text-gray-600 max-w-4xl mx-auto mb-12 leading-relaxed" >
            Exclusive limited releases happening right now. Don't miss out on these one-time drops with special discounts and real-time availability.
          </p>
          
          {/* Enhanced Live Stats */}
          <div className="flex justify-center items-center space-x-12 mb-12">
            <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-red-600 mb-2" >
                {liveDrops.reduce((acc, drop) => acc + parseInt(drop.viewers.split(' ')[0]), 0)}k
              </div>
              <div className="text-sm text-gray-600 font-medium">Total Viewers</div>
            </div>
            <div className="w-px h-12 bg-gray-300"></div>
            <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-red-600 mb-2" >
                {liveDrops.reduce((acc, drop) => acc + drop.items, 0)}
              </div>
              <div className="text-sm text-gray-600 font-medium">Available Items</div>
            </div>
            <div className="w-px h-12 bg-gray-300"></div>
            <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-red-600 mb-2" >
                {liveDrops.length}
              </div>
              <div className="text-sm text-gray-600 font-medium">Active Drops</div>
            </div>
            <div className="w-px h-12 bg-gray-300"></div>
            <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-red-600 mb-2" >
                Up to 25%
              </div>
              <div className="text-sm text-gray-600 font-medium">Discount</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Live Drops Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-10 mb-20">
          {liveDrops.map((drop, index) => (
            <div key={drop.id} className="group bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-700 border-2 border-red-100 hover:border-red-300 transform hover:-translate-y-3 hover:scale-105">
              {/* Image Section */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={drop.image}
                  alt={drop.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-1000"
                />
                
                {/* Advanced Overlay Gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-transparent"></div>
                
                {/* Live Badge with Animation */}
                <div className="absolute top-5 left-5">
                  <div className="flex items-center bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-3 rounded-full text-sm font-bold shadow-2xl animate-pulse">
                    <div className="w-3 h-3 bg-white rounded-full mr-2 animate-ping"></div>
                    LIVE
                  </div>
                </div>
                
                {/* Discount Badge */}
                <div className="absolute top-5 right-5">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-bounce">
                    {drop.discount}
                  </div>
                </div>
                
                {/* Category Badge */}
                <div className="absolute top-16 right-5">
                  <div className="bg-black/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                    {drop.category}
                  </div>
                </div>
                
                {/* Price Badge */}
                <div className="absolute bottom-5 right-5">
                  <div className="bg-black/90 backdrop-blur-sm text-white px-5 py-3 rounded-xl text-xl font-bold shadow-lg">
                    {drop.price}
                  </div>
                </div>
                
                {/* Viewers Count with Icon */}
                <div className="absolute bottom-5 left-5">
                  <div className="bg-red-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-lg">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    </svg>
                    {drop.viewers}
                  </div>
                </div>
                
                {/* Product Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="bg-black/80 backdrop-blur-sm rounded-2xl p-5 text-white">
                    <h3 className="text-2xl font-bold mb-2" >
                      {drop.title}
                    </h3>
                    <p className="text-red-300 mb-3 font-medium text-lg">{drop.subtitle}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{drop.items - drop.soldOut} items left</span>
                      {drop.soldOut > 0 && (
                        <span className="text-sm text-red-300">{drop.soldOut} sold out</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Enhanced Content Section */}
              <div className="p-8">
                {/* Countdown Timer */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-500 font-semibold">Time Remaining</span>
                    <span className="text-sm text-red-500 font-bold bg-red-50 px-3 py-1 rounded-full">Limited Time</span>
                  </div>
                  <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-2xl p-6 text-center border-2 border-red-200">
                    <span className="text-4xl font-mono font-bold text-red-600" >
                      {drop.timeRemaining}
                    </span>
                  </div>
                </div>
                
                {/* Product Details */}
                <div className="mb-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Available Colors</h4>
                      <div className="flex space-x-2">
                        {drop.colors.map((color, idx) => (
                          <div key={idx} className="w-6 h-6 bg-gray-300 rounded-full border-2 border-gray-400"></div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Sizes</h4>
                      <div className="flex space-x-1">
                        {drop.sizes.map((size, idx) => (
                          <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">{size}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="space-y-4">
                  <button className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-5 rounded-2xl font-bold text-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                    Shop Now - {drop.discount}
                  </button>
                  <button className="w-full border-2 border-gray-300 text-black py-4 rounded-2xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300">
                    View Collection
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Notification Section */}
        <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 rounded-3xl p-16 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-24 h-24 bg-white rounded-full animate-pulse"></div>
            <div className="absolute top-32 right-20 w-20 h-20 bg-white rounded-full animate-bounce"></div>
            <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-white rounded-full animate-ping"></div>
          </div>
          
          <div className="relative z-10 text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            
            <h3 className="text-4xl font-bold mb-6" >
              Never Miss a Drop
            </h3>
            <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed" >
              Get instant notifications when new exclusive drops go live. Be the first to shop limited collections with early access and special discounts.
            </p>
            
            <div className="max-w-lg mx-auto flex gap-4 mb-8">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-6 py-5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg"
              />
              <button className="bg-gradient-to-r from-red-500 to-red-600 text-white px-10 py-5 rounded-2xl font-bold hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl text-lg">
                Notify Me
              </button>
            </div>
            
            <div className="flex justify-center items-center space-x-8 text-sm text-gray-400">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                No spam, ever
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                Secure & private
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Unsubscribe anytime
              </div>
            </div>
            
            <p className="text-sm text-gray-400 mt-6" >
              Join 75,000+ fashion enthusiasts who never miss a drop
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
