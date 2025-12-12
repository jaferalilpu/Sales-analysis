'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export function OptimizedHeroSection() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Memoize the timer calculation to prevent unnecessary re-renders
  const calculateTimeLeft = useCallback(() => {
    const nextDrop = new Date();
    nextDrop.setHours(nextDrop.getHours() + 24);
    
    const now = new Date().getTime();
    const distance = nextDrop.getTime() - now;

    if (distance > 0) {
      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      return { hours, minutes, seconds };
    }
    return { hours: 0, minutes: 0, seconds: 0 };
  }, []);

  useEffect(() => {
    // Use requestAnimationFrame for better performance
    let animationFrame: number;
    
    const updateTimer = () => {
      setTimeLeft(calculateTimeLeft());
      animationFrame = requestAnimationFrame(updateTimer);
    };
    
    // Start the timer
    animationFrame = requestAnimationFrame(updateTimer);
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [calculateTimeLeft]);

  // Memoize the building data to prevent recreation on every render
  const buildings = useMemo(() => [
    { x: 0, y: 40, width: 30, height: 60, delay: '0s', duration: '3s' },
    { x: 50, y: 20, width: 40, height: 80, delay: '0.5s', duration: '2.5s' },
    { x: 110, y: 35, width: 25, height: 65, delay: '1s', duration: '3.5s' },
    { x: 150, y: 10, width: 50, height: 90, delay: '1.5s', duration: '2.8s' },
    { x: 220, y: 25, width: 35, height: 75, delay: '2s', duration: '3.2s' },
    { x: 270, y: 15, width: 45, height: 85, delay: '2.5s', duration: '2.7s' },
    { x: 330, y: 30, width: 30, height: 70, delay: '3s', duration: '3.8s' },
    { x: 380, y: 20, width: 35, height: 80, delay: '3.5s', duration: '2.9s' },
  ], []);

  // Reduced spark elements for better performance
  const sparks = useMemo(() => [
    { top: '1/4', left: '1/4', delay: '0s', duration: '2s' },
    { top: '1/3', right: '1/3', delay: '0.5s', duration: '1.8s' },
    { bottom: '1/3', left: '1/3', delay: '1s', duration: '2.2s' },
    { bottom: '1/4', right: '1/4', delay: '1.5s', duration: '1.5s' },
    { top: '1/2', left: '1/5', delay: '2s', duration: '2.5s' },
  ], []);

  return (
    <section className="hero-section">
      <div className="w-full h-screen bg-black flex items-center justify-center relative overflow-hidden">
        {/* Optimized Background SVG - Reduced complexity */}
        <div className="absolute bottom-0 left-0 right-0 opacity-20">
          <svg width="100%" height="120" viewBox="0 0 450 100" className="w-full h-auto">
            {buildings.map((building, index) => (
              <rect
                key={index}
                x={building.x}
                y={building.y}
                width={building.width}
                height={building.height}
                fill="#FFFFFF"
                className="animate-bounce"
                style={{
                  animationDelay: building.delay,
                  animationDuration: building.duration,
                  animationTimingFunction: 'ease-in-out'
                }}
              />
            ))}
          </svg>
        </div>

        {/* Reduced floating elements - Only 2 instead of 4 */}
        <div className="absolute top-20 left-10 animate-pulse">
          <svg width="80" height="80" viewBox="0 0 200 200">
            <polygon points="0,0 200,0 150,200 0,150" fill="#FF0033" fillOpacity="0.3"/>
          </svg>
        </div>
        
        <div className="absolute top-32 right-16 animate-pulse" style={{animationDelay: '1s'}}>
          <svg width="60" height="60" viewBox="0 0 200 200">
            <polygon points="50,0 200,50 150,200 0,150" fill="#FF0033" fillOpacity="0.2"/>
          </svg>
        </div>

        {/* Single neon circle instead of two */}
        <div className="absolute top-40 right-20 animate-spin" style={{animationDuration: '20s'}}>
          <svg width="80" height="80" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="35" stroke="#00FFE5" strokeWidth="3" fill="none"/>
          </svg>
        </div>

        {/* Simplified wave - Single wave instead of two */}
        <div className="absolute top-1/3 left-0 opacity-30">
          <svg width="300" height="100" viewBox="0 0 300 100">
            <path d="M0 50 Q150 0 300 50" stroke="#FF00FF" strokeWidth="2" fill="none"/>
          </svg>
        </div>

        {/* Single graffiti stroke instead of two */}
        <div className="absolute top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/2 opacity-40">
          <svg width="150" height="40" viewBox="0 0 200 50">
            <path d="M0,25 C50,0 100,50 200,25" stroke="#FFD700" strokeWidth="4" fill="none" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Reduced spark elements - 5 instead of 10 */}
        {sparks.map((spark, index) => (
          <div
            key={index}
            className={`absolute w-1 h-1 bg-[#FFD700] transform rotate-45 animate-ping opacity-60 shadow-[0_0_8px_#FFD700] ${
              spark.top ? `top-${spark.top}` : ''
            } ${spark.bottom ? `bottom-${spark.bottom}` : ''} ${
              spark.left ? `left-${spark.left}` : ''
            } ${spark.right ? `right-${spark.right}` : ''}`}
            style={{
              animationDelay: spark.delay,
              animationDuration: spark.duration
            }}
          />
        ))}

        {/* Optimized Brand Logo */}
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-20">
          <div className="relative">
            <div className="w-24 h-24 md:w-28 md:h-28 border-2 border-[#FF0033] rounded-full flex items-center justify-center animate-pulse bg-black/20 backdrop-blur-sm">
              <span className="text-3xl md:text-4xl font-bold text-white font-heading tracking-wider">
                U
              </span>
            </div>
            
            {/* Single rotating ring instead of two */}
            <div className="absolute inset-0 border border-[#00FFE5] rounded-full animate-spin opacity-60" style={{animationDuration: '8s'}}></div>
          </div>
        </div>

        {/* Reduced corner elements - 2 instead of 4 */}
        <div className="absolute top-8 left-8 opacity-30">
          <svg width="40" height="40" viewBox="0 0 100 100">
            <path d="M10,10 L90,10 L90,90 L10,90 Z" stroke="#FF0033" strokeWidth="2" fill="none" className="animate-pulse"/>
          </svg>
        </div>
        
        <div className="absolute bottom-8 right-8 opacity-30">
          <svg width="40" height="40" viewBox="0 0 100 100">
            <rect x="20" y="20" width="60" height="60" stroke="#FFD700" strokeWidth="2" fill="none" className="animate-pulse"/>
          </svg>
        </div>

        {/* Main Content - Optimized with better positioning */}
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 font-heading">
            NEXT DROP
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Exclusive streetwear collection dropping soon
          </p>
          
          {/* Countdown Timer */}
          <div className="flex justify-center space-x-4 md:space-x-8 mb-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white font-mono">
                {timeLeft.hours.toString().padStart(2, '0')}
              </div>
              <div className="text-sm text-gray-400">HOURS</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white font-mono">
                {timeLeft.minutes.toString().padStart(2, '0')}
              </div>
              <div className="text-sm text-gray-400">MINUTES</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white font-mono">
                {timeLeft.seconds.toString().padStart(2, '0')}
              </div>
              <div className="text-sm text-gray-400">SECONDS</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/drops"
              className="bg-[#FF0033] hover:bg-[#FF0033]/90 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
            >
              View Drops
            </Link>
            <Link
              href="/products"
              className="border-2 border-white text-white hover:bg-white hover:text-black px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
