'use client';

import Image from 'next/image';
import { useMemo } from 'react';

export function OptimizedWildernessDropHero() {
  // Memoize wind stroke data to prevent recreation
  const windStrokes = useMemo(() => [
    { top: '1/4', width: 'w-20', delay: '0s', duration: '8s' },
    { top: '1/3', width: 'w-16', delay: '2s', duration: '12s' },
    { top: '1/2', width: 'w-24', delay: '4s', duration: '10s' },
    { bottom: '1/3', width: 'w-28', delay: '1s', duration: '15s' },
    { bottom: '1/2', width: 'w-18', delay: '3s', duration: '9s' },
  ], []);

  return (
    <>
      <style jsx>{`
        @keyframes wind-left {
          0% { 
            transform: translateX(-150px); 
            opacity: 0; 
          }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { 
            transform: translateX(calc(100vw + 150px)); 
            opacity: 0; 
          }
        }
        @keyframes wind-right {
          0% { 
            transform: translateX(calc(100vw + 150px)); 
            opacity: 0; 
          }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { 
            transform: translateX(-150px); 
            opacity: 0; 
          }
        }
        @keyframes wind-slow {
          0% { 
            transform: translateX(-200px); 
            opacity: 0; 
          }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { 
            transform: translateX(calc(100vw + 200px)); 
            opacity: 0; 
          }
        }
      `}</style>
      <div className="relative w-full">
        {/* Forest Layer - Mobile/Small Screens */}
        <div className="w-full sm:hidden">
          <Image
            src="/21303405_bvny_bp58_210816.svg"
            alt="Forest Background Mobile"
            width={1200}
            height={300}
            className="w-full h-auto"
            priority
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          />
        </div>

        {/* Forest Layer - Medium+ Screens */}
        <div className="w-full hidden sm:block">
          <Image
            src="/27546740_t32h_phbt_211202.svg"
            alt="Forest Background Desktop"
            width={1200}
            height={300}
            className="w-full h-auto"
            priority
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          />
        </div>

        {/* Reduced Wind Effects - 5 instead of 12 */}
        {windStrokes.map((stroke, index) => (
          <div
            key={index}
            className={`absolute ${stroke.top || stroke.bottom || ''} left-0 ${stroke.width} h-px bg-white/15 rounded-full z-5`}
            style={{
              animation: index % 2 === 0 ? 'wind-left' : 'wind-right',
              animationDelay: stroke.delay,
              animationDuration: stroke.duration,
              animationTimingFunction: 'linear',
              animationIterationCount: 'infinite'
            }}
          />
        ))}

        {/* Fox - Bottom Right on Land - Hidden on Mobile */}
        <div className="absolute bottom-0 right-24 z-15 hidden sm:block">
          <Image
            src="/image copy.png"
            alt="Fox"
            width={702}
            height={702}
            className="w-32 h-32 md:w-48 md:h-48 object-contain"
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          />
        </div>

        {/* Main Content Overlay */}
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="text-center text-white px-4">
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
                    00
                  </div>
                  <div className="text-sm text-gray-400 mt-1">HOURS</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-[#00FFE5] bg-black/30 backdrop-blur-sm rounded-lg px-4 py-2 border border-[#00FFE5]/50">
                    00
                  </div>
                  <div className="text-sm text-gray-400 mt-1">MINUTES</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-[#FFD700] bg-black/30 backdrop-blur-sm rounded-lg px-4 py-2 border border-[#FFD700]/50">
                    00
                  </div>
                  <div className="text-sm text-gray-400 mt-1">SECONDS</div>
                </div>
              </div>
            </div>
            
            {/* Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                className="px-8 py-4 bg-gradient-to-r from-[#FF0033] to-[#FF00FF] text-white font-bold rounded-lg hover:from-[#FF0033]/80 hover:to-[#FF00FF]/80 transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_#FF0033]/50"
                href="/drops"
              >
                Shop Now
              </a>
              <a 
                className="px-8 py-4 border-2 border-[#00FFE5] text-[#00FFE5] font-bold rounded-lg hover:bg-[#00FFE5] hover:text-black transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_#00FFE5]/50"
                href="/products"
              >
                Explore Collection
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
