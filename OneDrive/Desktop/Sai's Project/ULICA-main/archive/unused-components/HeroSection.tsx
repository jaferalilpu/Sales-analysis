'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export function HeroSection() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Set next drop time (24 hours from now for demo)
    const nextDrop = new Date();
    nextDrop.setHours(nextDrop.getHours() + 24);

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = nextDrop.getTime() - now;

      if (distance > 0) {
        const hours = Math.floor(distance / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft({ hours, minutes, seconds });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="hero-section">
      <div className="w-full h-screen bg-black flex items-center justify-center relative overflow-hidden">
        {/* Background SVG Layers */}
        
        {/* Layer 1: City Skyline - Fast Animated Buildings */}
        <div className="absolute bottom-0 left-0 right-0 opacity-20">
          <svg width="100%" height="120" viewBox="0 0 450 100" className="w-full h-auto">
            {/* Building 1 - Fast bounce */}
            <rect x="0" y="40" width="30" height="60" fill="#FFFFFF" className="animate-bounce" style={{animationDelay: '0s', animationDuration: '3s', animationTimingFunction: 'ease-in-out'}}/>
            
            {/* Building 2 - Quick pulse */}
            <rect x="50" y="20" width="40" height="80" fill="#FFFFFF" className="animate-bounce" style={{animationDelay: '0.5s', animationDuration: '2.5s', animationTimingFunction: 'ease-in-out'}}/>
            
            {/* Building 3 - Fast float */}
            <rect x="110" y="35" width="25" height="65" fill="#FFFFFF" className="animate-bounce" style={{animationDelay: '1s', animationDuration: '3.5s', animationTimingFunction: 'ease-in-out'}}/>
            
            {/* Building 4 - Quick pulse */}
            <rect x="150" y="10" width="50" height="90" fill="#FFFFFF" className="animate-bounce" style={{animationDelay: '1.5s', animationDuration: '2.8s', animationTimingFunction: 'ease-in-out'}}/>
            
            {/* Building 5 - Fast bounce */}
            <rect x="220" y="25" width="35" height="75" fill="#FFFFFF" className="animate-bounce" style={{animationDelay: '2s', animationDuration: '3.2s', animationTimingFunction: 'ease-in-out'}}/>
            
            {/* Building 6 - Quick pulse */}
            <rect x="270" y="15" width="45" height="85" fill="#FFFFFF" className="animate-bounce" style={{animationDelay: '2.5s', animationDuration: '2.7s', animationTimingFunction: 'ease-in-out'}}/>
            
            {/* Building 7 - Fast movement */}
            <rect x="330" y="30" width="30" height="70" fill="#FFFFFF" className="animate-bounce" style={{animationDelay: '3s', animationDuration: '3.8s', animationTimingFunction: 'ease-in-out'}}/>
            
            {/* Building 8 - NEW: Additional building on right */}
            <rect x="380" y="20" width="35" height="80" fill="#FFFFFF" className="animate-bounce" style={{animationDelay: '3.5s', animationDuration: '2.9s', animationTimingFunction: 'ease-in-out'}}/>
          </svg>
        </div>

        {/* Layer 2: Floating Polygon Shards */}
        <div className="absolute top-20 left-10 animate-pulse">
          <svg width="120" height="120" viewBox="0 0 200 200">
            <polygon points="0,0 200,0 150,200 0,150" fill="#FF0033" fillOpacity="0.3"/>
          </svg>
        </div>
        
        <div className="absolute top-32 right-16 animate-pulse" style={{animationDelay: '1s'}}>
          <svg width="80" height="80" viewBox="0 0 200 200">
            <polygon points="50,0 200,50 150,200 0,150" fill="#FF0033" fillOpacity="0.2"/>
          </svg>
        </div>

        {/* Layer 3: Neon Circles */}
        <div className="absolute top-40 right-20 animate-spin" style={{animationDuration: '20s'}}>
          <svg width="100" height="100" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" stroke="#00FFE5" strokeWidth="4" fill="none"/>
          </svg>
        </div>

        <div className="absolute bottom-40 left-20 animate-spin" style={{animationDuration: '15s', animationDirection: 'reverse'}}>
          <svg width="60" height="60" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="30" stroke="#00FFE5" strokeWidth="3" fill="none"/>
          </svg>
        </div>

        {/* Layer 4: Angular Waves */}
        <div className="absolute top-1/3 left-0 opacity-30">
          <svg width="300" height="100" viewBox="0 0 300 100">
            <path d="M0 50 Q150 0 300 50 T600 50" stroke="#FF00FF" strokeWidth="3" fill="none"/>
          </svg>
        </div>

        <div className="absolute bottom-1/3 right-0 opacity-25">
          <svg width="250" height="80" viewBox="0 0 300 100">
            <path d="M0 30 Q150 80 300 30 T600 30" stroke="#FF00FF" strokeWidth="2" fill="none"/>
          </svg>
        </div>

        {/* Layer 5: Graffiti Brush Strokes */}
        <div className="absolute top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/2 opacity-40">
          <svg width="200" height="50" viewBox="0 0 200 50">
            <path d="M0,25 C50,0 150,50 200,25" stroke="#FFD700" strokeWidth="6" fill="none" strokeLinecap="round"/>
          </svg>
        </div>

        <div className="absolute bottom-1/2 right-1/4 transform translate-x-1/2 translate-y-1/2 opacity-35">
          <svg width="150" height="40" viewBox="0 0 200 50">
            <path d="M0,30 C40,10 110,40 200,30" stroke="#FFD700" strokeWidth="4" fill="none" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Spark Elements - Small Glowing Gold Diamonds */}
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-[#FFD700] transform rotate-45 animate-ping opacity-60 shadow-[0_0_8px_#FFD700]" style={{animationDelay: '0s', animationDuration: '2s'}}></div>
        <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-[#FFD700] transform rotate-45 animate-ping opacity-70 shadow-[0_0_10px_#FFD700]" style={{animationDelay: '0.5s', animationDuration: '1.8s'}}></div>
        <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-[#FFD700] transform rotate-45 animate-ping opacity-80 shadow-[0_0_8px_#FFD700]" style={{animationDelay: '1s', animationDuration: '2.2s'}}></div>
        <div className="absolute bottom-1/4 right-1/4 w-1.5 h-1.5 bg-[#FFD700] transform rotate-45 animate-ping opacity-60 shadow-[0_0_12px_#FFD700]" style={{animationDelay: '1.5s', animationDuration: '1.5s'}}></div>
        <div className="absolute top-1/2 left-1/5 w-1 h-1 bg-[#FFD700] transform rotate-45 animate-ping opacity-70 shadow-[0_0_8px_#FFD700]" style={{animationDelay: '2s', animationDuration: '2.5s'}}></div>
        <div className="absolute top-1/6 right-1/5 w-1.5 h-1.5 bg-[#FFD700] transform rotate-45 animate-ping opacity-50 shadow-[0_0_10px_#FFD700]" style={{animationDelay: '2.5s', animationDuration: '1.7s'}}></div>
        <div className="absolute bottom-1/6 left-1/2 w-1 h-1 bg-[#FFD700] transform rotate-45 animate-ping opacity-90 shadow-[0_0_8px_#FFD700]" style={{animationDelay: '3s', animationDuration: '2.1s'}}></div>
        <div className="absolute top-2/3 right-1/6 w-1.5 h-1.5 bg-[#FFD700] transform rotate-45 animate-ping opacity-60 shadow-[0_0_12px_#FFD700]" style={{animationDelay: '3.5s', animationDuration: '1.9s'}}></div>
        <div className="absolute bottom-1/2 right-1/2 w-1 h-1 bg-[#FFD700] transform rotate-45 animate-ping opacity-80 shadow-[0_0_8px_#FFD700]" style={{animationDelay: '4s', animationDuration: '2.3s'}}></div>
        <div className="absolute top-1/5 left-1/2 w-1.5 h-1.5 bg-[#FFD700] transform rotate-45 animate-ping opacity-70 shadow-[0_0_10px_#FFD700]" style={{animationDelay: '4.5s', animationDuration: '1.6s'}}></div>

        {/* Top Brand Logo */}
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-20">
          <div className="relative">
            {/* Main Logo Circle */}
            <div className="w-24 h-24 md:w-28 md:h-28 border-2 border-[#FF0033] rounded-full flex items-center justify-center animate-pulse bg-black/20 backdrop-blur-sm">
              <span className="text-3xl md:text-4xl font-bold text-white font-heading tracking-wider">
                U
              </span>
            </div>
            
            {/* Rotating Ring */}
            <div className="absolute inset-0 border border-[#00FFE5] rounded-full animate-spin opacity-60" style={{animationDuration: '8s'}}></div>
            
            {/* Outer Glow Ring */}
            <div className="absolute -inset-3 border border-[#FFD700] rounded-full animate-ping opacity-30" style={{animationDuration: '3s'}}></div>
          </div>
        </div>


        {/* Corner Accent Elements */}
        <div className="absolute top-8 left-8 opacity-30">
          <svg width="60" height="60" viewBox="0 0 100 100">
            <path d="M10,10 L90,10 L90,90 L10,90 Z" stroke="#FF0033" strokeWidth="2" fill="none" className="animate-pulse"/>
          </svg>
        </div>
        
        <div className="absolute top-8 right-8 opacity-25">
          <svg width="50" height="50" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" stroke="#00FFE5" strokeWidth="2" fill="none" className="animate-pulse"/>
          </svg>
        </div>
        
        <div className="absolute bottom-8 left-8 opacity-35">
          <svg width="45" height="45" viewBox="0 0 100 100">
            <polygon points="50,10 90,90 10,90" stroke="#FF00FF" strokeWidth="2" fill="none" className="animate-pulse"/>
          </svg>
        </div>
        
        <div className="absolute bottom-8 right-8 opacity-30">
          <svg width="55" height="55" viewBox="0 0 100 100">
            <rect x="20" y="20" width="60" height="60" stroke="#FFD700" strokeWidth="2" fill="none" className="animate-pulse"/>
          </svg>
        </div>

        {/* Main Content */}
        <div className="relative z-30 text-center text-white px-4">
          {/* ULICA Logo */}
          <div className="mb-8">
            <h1 className="text-6xl md:text-8xl font-bold font-heading tracking-wider mb-4 drop-shadow-[0_0_20px_#FF0033]">
              ULICA
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-[#FF0033] via-[#00FFE5] to-[#FFD700] mx-auto rounded-full"></div>
          </div>

          {/* Tagline */}
          <p className="text-xl md:text-2xl mb-8 text-gray-300 font-light max-w-2xl mx-auto">
            Streetwear that defines the urban landscape
          </p>

          {/* Countdown Timer */}
          <div className="mb-12">
            <p className="text-lg mb-4 text-gray-400">Next Drop In:</p>
            <div className="flex justify-center space-x-4 md:space-x-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#FF0033] bg-black/30 backdrop-blur-sm rounded-lg px-4 py-2 border border-[#FF0033]/50">
                  {timeLeft.hours.toString().padStart(2, '0')}
                </div>
                <div className="text-sm text-gray-400 mt-1">HOURS</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#00FFE5] bg-black/30 backdrop-blur-sm rounded-lg px-4 py-2 border border-[#00FFE5]/50">
                  {timeLeft.minutes.toString().padStart(2, '0')}
                </div>
                <div className="text-sm text-gray-400 mt-1">MINUTES</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#FFD700] bg-black/30 backdrop-blur-sm rounded-lg px-4 py-2 border border-[#FFD700]/50">
                  {timeLeft.seconds.toString().padStart(2, '0')}
                </div>
                <div className="text-sm text-gray-400 mt-1">SECONDS</div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/drops" 
              className="px-8 py-4 bg-gradient-to-r from-[#FF0033] to-[#FF00FF] text-white font-bold rounded-lg hover:from-[#FF0033]/80 hover:to-[#FF00FF]/80 transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_#FF0033]/50"
            >
              Shop Now
            </Link>
            <Link 
              href="/products" 
              className="px-8 py-4 border-2 border-[#00FFE5] text-[#00FFE5] font-bold rounded-lg hover:bg-[#00FFE5] hover:text-black transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_#00FFE5]/50"
            >
              Explore Collection
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}