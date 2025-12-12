'use client';

import Image from 'next/image';

export function WildernessDropHero() {

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
        @keyframes wind-fast {
          0% { 
            transform: translateX(-100px); 
            opacity: 0; 
          }
          5% { opacity: 1; }
          95% { opacity: 1; }
          100% { 
            transform: translateX(calc(100vw + 100px)); 
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
          />
        </div>

        {/* Air Flow Effects - Wind Strokes */}
        <div className="absolute top-1/4 left-0 w-20 h-px bg-white/15 rounded-full z-5" style={{animation: 'wind-left 8s linear infinite'}}></div>
      <div className="absolute top-1/3 left-0 w-16 h-px bg-white/12 rounded-full z-5" style={{animation: 'wind-right 12s linear infinite', animationDelay: '2s'}}></div>
      <div className="absolute top-1/2 left-0 w-24 h-px bg-white/10 rounded-full z-5" style={{animation: 'wind-left 10s linear infinite', animationDelay: '4s'}}></div>
      <div className="absolute bottom-1/3 left-0 w-28 h-px bg-white/18 rounded-full z-5" style={{animation: 'wind-slow 15s linear infinite', animationDelay: '1s'}}></div>
      <div className="absolute bottom-1/2 left-0 w-18 h-px bg-white/8 rounded-full z-5" style={{animation: 'wind-right 9s linear infinite', animationDelay: '3s'}}></div>
      
      {/* Additional Wind Strokes */}
      <div className="absolute top-1/5 left-0 w-22 h-px bg-white/14 rounded-full z-5" style={{animation: 'wind-fast 6s linear infinite', animationDelay: '0.5s'}}></div>
      <div className="absolute bottom-1/4 left-0 w-20 h-px bg-white/16 rounded-full z-5" style={{animation: 'wind-left 11s linear infinite', animationDelay: '2.5s'}}></div>
      <div className="absolute top-2/3 left-0 w-26 h-px bg-white/12 rounded-full z-5" style={{animation: 'wind-right 13s linear infinite', animationDelay: '5s'}}></div>
      
      {/* More Wind Strokes */}
      <div className="absolute top-3/4 left-0 w-17 h-px bg-white/11 rounded-full z-5" style={{animation: 'wind-left 9s linear infinite', animationDelay: '1.5s'}}></div>
      <div className="absolute top-1/6 left-0 w-25 h-px bg-white/13 rounded-full z-5" style={{animation: 'wind-right 14s linear infinite', animationDelay: '3.5s'}}></div>
      <div className="absolute bottom-1/6 left-0 w-19 h-px bg-white/9 rounded-full z-5" style={{animation: 'wind-slow 16s linear infinite', animationDelay: '6s'}}></div>
      <div className="absolute top-5/6 left-0 w-21 h-px bg-white/15 rounded-full z-5" style={{animation: 'wind-fast 7s linear infinite', animationDelay: '0.8s'}}></div>
      <div className="absolute bottom-5/6 left-0 w-23 h-px bg-white/17 rounded-full z-5" style={{animation: 'wind-left 12s linear infinite', animationDelay: '4.2s'}}></div>
      <div className="absolute top-2/5 left-0 w-16 h-px bg-white/10 rounded-full z-5" style={{animation: 'wind-right 10s linear infinite', animationDelay: '2.8s'}}></div>
      <div className="absolute bottom-2/5 left-0 w-27 h-px bg-white/14 rounded-full z-5" style={{animation: 'wind-slow 18s linear infinite', animationDelay: '7s'}}></div>
      <div className="absolute top-3/5 left-0 w-18 h-px bg-white/12 rounded-full z-5" style={{animation: 'wind-fast 8s linear infinite', animationDelay: '1.2s'}}></div>

      {/* Fox - Bottom Right on Land - Hidden on Mobile */}
      <div className="absolute bottom-0 right-24 z-15 hidden sm:block">
        <Image
          src="/image copy.png"
          alt="Fox"
          width={702}
          height={546}
          className="opacity-85 grayscale brightness-90"
        />
      </div>

      {/* Lion - Beside Dog - Hidden on Mobile */}
      <div className="absolute bottom-36 left-1/2 transform -translate-x-80 z-15 hidden sm:block">
        <Image
          src="/running-lion-svgrepo-com.svg"
          alt="Running Lion"
          width={200}
          height={140}
          className="opacity-80"
        />
      </div>

      {/* Dog - On Forest Land - Hidden on Mobile */}
      <div className="absolute bottom-40 left-1/2 transform -translate-x-1/2 z-15 hidden sm:block">
        <Image
          src="/running-dog-silhouette-svgrepo-com.svg"
          alt="Running Dog"
          width={110}
          height={70}
          className="opacity-80 grayscale"
        />
      </div>

      </div>
    </>
  );
}
