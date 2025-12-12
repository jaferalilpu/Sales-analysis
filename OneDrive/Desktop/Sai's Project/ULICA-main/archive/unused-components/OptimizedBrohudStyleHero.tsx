'use client';

import { useMemo } from 'react';

export function OptimizedBrohudStyleHero() {
  // Memoize the polygon data to prevent recreation
  const polygons = useMemo(() => [
    { points: "0,0 200,0 150,200 0,150", fill: "#FF0033", opacity: "0.4", delay: "0s", duration: "20s" },
    { points: "50,0 200,50 150,200 0,150", fill: "#FF00FF", opacity: "0.3", delay: "1s", duration: "15s" },
  ], []);

  const circles = useMemo(() => [
    { r: 45, strokeWidth: 3, delay: "0s", duration: "18s" },
    { r: 30, strokeWidth: 2, delay: "0.5s", duration: "12s" },
  ], []);

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden">
      {/* Reduced background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-cyan-900/20"></div>

      {/* Optimized Left Side - Reduced elements */}
      <div className="absolute left-0 top-0 w-1/2 h-full">
        {/* Reduced polygon shards - 2 instead of 4 */}
        {polygons.map((polygon, index) => (
          <div
            key={index}
            className={`absolute ${
              index === 0 ? 'top-20 left-10' : 'top-40 left-20'
            } animate-spin opacity-40`}
            style={{
              animationDuration: polygon.duration,
              animationDelay: polygon.delay
            }}
          >
            <svg width={index === 0 ? "100" : "80"} height={index === 0 ? "100" : "80"} viewBox="0 0 200 200">
              <polygon
                points={polygon.points}
                fill={polygon.fill}
                fillOpacity={polygon.opacity}
              />
            </svg>
          </div>
        ))}

        {/* Single neon circle instead of multiple */}
        <div className="absolute top-1/3 left-16 animate-spin opacity-45" style={{animationDuration: '18s', animationDirection: 'reverse'}}>
          <svg width="100" height="100" viewBox="0 0 100 100">
            {circles.map((circle, index) => (
              <circle
                key={index}
                cx="50"
                cy="50"
                r={circle.r}
                stroke="#00FFE5"
                strokeWidth={circle.strokeWidth}
                fill="none"
                opacity={index === 0 ? 1 : 0.6}
              />
            ))}
          </svg>
        </div>

        {/* Single wave instead of multiple */}
        <div className="absolute top-1/2 left-0 opacity-30 animate-pulse">
          <svg width="200" height="60" viewBox="0 0 300 80">
            <path d="M0 40 Q100 10 200 40 T400 40" stroke="#FF00FF" strokeWidth="2" fill="none"/>
          </svg>
        </div>
      </div>

      {/* Optimized Right Side - Reduced elements */}
      <div className="absolute right-0 top-0 w-1/2 h-full">
        {/* Single geometric shape instead of multiple */}
        <div className="absolute top-1/4 right-20 animate-pulse opacity-40">
          <svg width="80" height="80" viewBox="0 0 100 100">
            <rect x="20" y="20" width="60" height="60" stroke="#FFD700" strokeWidth="2" fill="none" transform="rotate(45 50 50)"/>
          </svg>
        </div>

        {/* Single data visualization instead of multiple */}
        <div className="absolute top-1/2 right-16 animate-pulse opacity-35">
          <svg width="120" height="60" viewBox="0 0 200 100">
            <path d="M0,80 L50,60 L100,40 L150,70 L200,30" stroke="#00FFE5" strokeWidth="3" fill="none"/>
          </svg>
        </div>
      </div>

      {/* Main Content - Optimized positioning */}
      <div className="relative z-10 flex items-center justify-center h-full px-8">
        <div className="text-center max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 font-heading">
            BROHUD
            <span className="block text-3xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
              STYLE
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Where street culture meets digital innovation. Experience the future of urban fashion.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105">
              Explore Collection
            </button>
            <button className="border-2 border-white text-white hover:bg-white hover:text-black px-8 py-3 rounded-lg font-semibold transition-all duration-200">
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Reduced floating particles - 3 instead of 6 */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-ping opacity-60"></div>
      <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping opacity-70" style={{animationDelay: '0.5s'}}></div>
      <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-yellow-400 rounded-full animate-ping opacity-50" style={{animationDelay: '1s'}}></div>
    </div>
  );
}
