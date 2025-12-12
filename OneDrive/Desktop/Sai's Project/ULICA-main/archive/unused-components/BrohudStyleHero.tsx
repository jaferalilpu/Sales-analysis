'use client';

export function BrohudStyleHero() {
  return (
    <section className="relative w-full h-screen bg-black overflow-hidden">
      {/* Base Dark Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
      
      {/* Background Planets with Gradients */}
      <div className="absolute inset-0">
        {/* Planet 1 - Large Red/Pink */}
        <div className="absolute top-20 left-1/4 animate-spin opacity-40" style={{animationDuration: '30s'}}>
          <svg width="120" height="120" viewBox="0 0 200 200">
            <defs>
              <radialGradient id="planet1" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FF0033" />
                <stop offset="70%" stopColor="#FF00FF" />
                <stop offset="100%" stopColor="#990033" />
              </radialGradient>
            </defs>
            <circle cx="100" cy="100" r="80" fill="url(#planet1)" className="drop-shadow-[0_0_30px_#FF0033]"/>
            <circle cx="100" cy="100" r="60" fill="none" stroke="#FF0033" strokeWidth="2" opacity="0.5"/>
          </svg>
        </div>

        {/* Planet 2 - Medium Cyan */}
        <div className="absolute top-1/3 right-1/3 animate-spin opacity-35" style={{animationDuration: '25s', animationDirection: 'reverse'}}>
          <svg width="80" height="80" viewBox="0 0 200 200">
            <defs>
              <radialGradient id="planet2" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#00FFE5" />
                <stop offset="70%" stopColor="#0099CC" />
                <stop offset="100%" stopColor="#006699" />
              </radialGradient>
            </defs>
            <circle cx="100" cy="100" r="60" fill="url(#planet2)" className="drop-shadow-[0_0_25px_#00FFE5]"/>
            <circle cx="100" cy="100" r="45" fill="none" stroke="#00FFE5" strokeWidth="1.5" opacity="0.6"/>
          </svg>
        </div>

        {/* Planet 3 - Small Gold */}
        <div className="absolute bottom-1/4 left-1/6 animate-spin opacity-30" style={{animationDuration: '20s'}}>
          <svg width="60" height="60" viewBox="0 0 200 200">
            <defs>
              <radialGradient id="planet3" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFD700" />
                <stop offset="70%" stopColor="#FFA500" />
                <stop offset="100%" stopColor="#CC6600" />
              </radialGradient>
            </defs>
            <circle cx="100" cy="100" r="50" fill="url(#planet3)" className="drop-shadow-[0_0_20px_#FFD700]"/>
            <circle cx="100" cy="100" r="35" fill="none" stroke="#FFD700" strokeWidth="1" opacity="0.7"/>
          </svg>
        </div>

        {/* Planet 4 - Medium Purple */}
        <div className="absolute bottom-1/3 right-1/4 animate-spin opacity-25" style={{animationDuration: '35s', animationDirection: 'reverse'}}>
          <svg width="90" height="90" viewBox="0 0 200 200">
            <defs>
              <radialGradient id="planet4" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FF00FF" />
                <stop offset="70%" stopColor="#9900CC" />
                <stop offset="100%" stopColor="#660099" />
              </radialGradient>
            </defs>
            <circle cx="100" cy="100" r="70" fill="url(#planet4)" className="drop-shadow-[0_0_22px_#FF00FF]"/>
            <circle cx="100" cy="100" r="50" fill="none" stroke="#FF00FF" strokeWidth="1.5" opacity="0.5"/>
          </svg>
        </div>
      </div>

      {/* Blur Layers for Depth */}
      <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-red-900/10 to-transparent blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-cyan-900/10 to-transparent blur-3xl"></div>

      {/* Left Side: Abstract Layered Shapes */}
      <div className="absolute left-0 top-0 w-1/2 h-full">
        {/* Layer 1: Polygon Shards */}
        <div className="absolute top-20 left-10 animate-spin opacity-40" style={{animationDuration: '20s'}}>
          <svg width="100" height="100" viewBox="0 0 200 200" className="drop-shadow-[0_0_15px_#FF0033]">
            <polygon points="0,0 200,0 150,200 0,150" fill="#FF0033" fillOpacity="0.4"/>
          </svg>
        </div>

        <div className="absolute top-40 left-20 animate-pulse opacity-35" style={{animationDelay: '1s'}}>
          <svg width="80" height="80" viewBox="0 0 200 200" className="drop-shadow-[0_0_12px_#FF00FF]">
            <polygon points="50,0 200,50 150,200 0,150" fill="#FF00FF" fillOpacity="0.3"/>
          </svg>
        </div>

        {/* Layer 2: Neon Circles */}
        <div className="absolute top-1/3 left-16 animate-spin opacity-45" style={{animationDuration: '18s', animationDirection: 'reverse'}}>
          <svg width="120" height="120" viewBox="0 0 100 100" className="drop-shadow-[0_0_20px_#00FFE5]">
            <circle cx="50" cy="50" r="45" stroke="#00FFE5" strokeWidth="3" fill="none"/>
            <circle cx="50" cy="50" r="30" stroke="#00FFE5" strokeWidth="2" fill="none" opacity="0.6"/>
            <circle cx="50" cy="50" r="15" stroke="#00FFE5" strokeWidth="1" fill="none" opacity="0.4"/>
          </svg>
        </div>

        {/* Layer 3: Angular Waves */}
        <div className="absolute top-1/2 left-0 opacity-30 animate-pulse">
          <svg width="300" height="80" viewBox="0 0 400 80" className="drop-shadow-[0_0_10px_#FF00FF]">
            <path d="M0 40 Q100 10 200 40 T400 40" stroke="#FF00FF" strokeWidth="3" fill="none"/>
            <path d="M0 50 Q100 20 200 50 T400 50" stroke="#FF00FF" strokeWidth="2" fill="none" opacity="0.6"/>
          </svg>
        </div>

        {/* Layer 4: Graffiti Strokes */}
        <div className="absolute bottom-1/3 left-8 opacity-40 animate-pulse" style={{animationDelay: '2s'}}>
          <svg width="200" height="60" viewBox="0 0 250 60" className="drop-shadow-[0_0_15px_#FFD700]">
            <path d="M0,30 C60,5 190,55 250,30" stroke="#FFD700" strokeWidth="6" fill="none" strokeLinecap="round"/>
            <path d="M0,40 C50,15 180,45 250,40" stroke="#FFD700" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7"/>
          </svg>
        </div>
      </div>

      {/* Right Side: Urban Animals/Mascots */}
      <div className="absolute right-0 top-0 w-1/2 h-full">
        {/* Urban Fox - Top Right */}
        <div className="absolute top-32 right-20 animate-bounce opacity-80" style={{animationDuration: '4s', animationDelay: '0.5s'}}>
          <svg width="80" height="80" viewBox="0 0 100 100" className="drop-shadow-[0_0_20px_#FF0033]">
            {/* Fox Head */}
            <path d="M50 20 C30 25 20 40 25 55 C20 60 25 70 35 75 C45 80 55 80 65 75 C75 70 80 60 75 55 C80 40 70 25 50 20 Z" fill="#FF0033" fillOpacity="0.8"/>
            {/* Fox Ears */}
            <path d="M40 25 C35 15 25 20 30 30 C35 25 40 25 Z" fill="#FF0033"/>
            <path d="M60 25 C65 15 75 20 70 30 C65 25 60 25 Z" fill="#FF0033"/>
            {/* Fox Eyes */}
            <circle cx="45" cy="45" r="3" fill="#FFFFFF"/>
            <circle cx="55" cy="45" r="3" fill="#FFFFFF"/>
            {/* Fox Nose */}
            <circle cx="50" cy="55" r="2" fill="#000000"/>
          </svg>
        </div>

        {/* Graffiti Cat - Middle Right */}
        <div className="absolute top-1/2 right-16 animate-pulse opacity-75" style={{animationDuration: '3s', animationDelay: '1s'}}>
          <svg width="70" height="70" viewBox="0 0 100 100" className="drop-shadow-[0_0_18px_#00FFE5]">
            {/* Cat Head */}
            <circle cx="50" cy="50" r="35" fill="#00FFE5" fillOpacity="0.8"/>
            {/* Cat Ears */}
            <path d="M35 25 C30 15 40 10 45 20 C40 18 35 20 Z" fill="#00FFE5"/>
            <path d="M65 25 C70 15 60 10 55 20 C60 18 65 20 Z" fill="#00FFE5"/>
            {/* Cat Eyes */}
            <ellipse cx="42" cy="45" rx="4" ry="6" fill="#FFFFFF"/>
            <ellipse cx="58" cy="45" rx="4" ry="6" fill="#FFFFFF"/>
            <ellipse cx="42" cy="45" rx="2" ry="3" fill="#000000"/>
            <ellipse cx="58" cy="45" rx="2" ry="3" fill="#000000"/>
            {/* Cat Nose */}
            <path d="M50 55 L45 60 L55 60 Z" fill="#000000"/>
          </svg>
        </div>

        {/* Robotic Bird - Bottom Right */}
        <div className="absolute bottom-1/4 right-24 animate-spin opacity-70" style={{animationDuration: '8s', animationDelay: '2s'}}>
          <svg width="60" height="60" viewBox="0 0 100 100" className="drop-shadow-[0_0_15px_#FFD700]">
            {/* Robot Body */}
            <rect x="30" y="40" width="40" height="50" fill="#FFD700" fillOpacity="0.8" rx="5"/>
            {/* Robot Head */}
            <rect x="35" y="20" width="30" height="25" fill="#FFD700" fillOpacity="0.9" rx="3"/>
            {/* Robot Eyes */}
            <rect x="40" y="28" width="6" height="8" fill="#FF0033"/>
            <rect x="54" y="28" width="6" height="8" fill="#FF0033"/>
            {/* Robot Wings */}
            <path d="M20 50 C10 45 15 60 25 55 C22 52 20 50 Z" fill="#FFD700" fillOpacity="0.6"/>
            <path d="M80 50 C90 45 85 60 75 55 C78 52 80 50 Z" fill="#FFD700" fillOpacity="0.6"/>
            {/* Robot Antenna */}
            <line x1="50" y1="20" x2="50" y2="10" stroke="#FFD700" strokeWidth="2"/>
            <circle cx="50" cy="10" r="2" fill="#FF00FF"/>
          </svg>
        </div>
      </div>

      {/* Spark/Diamond Particles */}
      <div className="absolute top-1/5 left-1/5 w-1 h-1 bg-[#FFD700] transform rotate-45 animate-ping opacity-70 shadow-[0_0_8px_#FFD700]" style={{animationDelay: '0s', animationDuration: '2s'}}></div>
      <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-[#FFD700] transform rotate-45 animate-ping opacity-80 shadow-[0_0_10px_#FFD700]" style={{animationDelay: '0.8s', animationDuration: '1.8s'}}></div>
      <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-[#FFD700] transform rotate-45 animate-ping opacity-60 shadow-[0_0_8px_#FFD700]" style={{animationDelay: '1.2s', animationDuration: '2.2s'}}></div>
      <div className="absolute bottom-1/3 right-1/5 w-1.5 h-1.5 bg-[#FFD700] transform rotate-45 animate-ping opacity-90 shadow-[0_0_12px_#FFD700]" style={{animationDelay: '0.3s', animationDuration: '1.6s'}}></div>
      <div className="absolute top-1/2 left-1/6 w-1 h-1 bg-[#FFD700] transform rotate-45 animate-ping opacity-75 shadow-[0_0_8px_#FFD700]" style={{animationDelay: '1.8s', animationDuration: '2.4s'}}></div>
      <div className="absolute top-1/6 right-1/6 w-1.5 h-1.5 bg-[#FFD700] transform rotate-45 animate-ping opacity-55 shadow-[0_0_10px_#FFD700]" style={{animationDelay: '0.6s', animationDuration: '2.1s'}}></div>
      <div className="absolute bottom-1/6 left-1/2 w-1 h-1 bg-[#FFD700] transform rotate-45 animate-ping opacity-85 shadow-[0_0_8px_#FFD700]" style={{animationDelay: '1.5s', animationDuration: '2.6s'}}></div>
      <div className="absolute top-2/3 right-1/3 w-1.5 h-1.5 bg-[#FFD700] transform rotate-45 animate-ping opacity-65 shadow-[0_0_12px_#FFD700]" style={{animationDelay: '0.9s', animationDuration: '1.9s'}}></div>

      {/* ULICA Logo - Centered */}
      <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-30">
        <div className="relative">
          {/* Main Logo */}
          <div className="w-32 h-32 md:w-40 md:h-40 border-2 border-[#FF0033] rounded-full flex items-center justify-center bg-black/30 backdrop-blur-md shadow-[0_0_30px_#FF0033]">
            <span className="text-4xl md:text-5xl font-bold text-white font-heading tracking-wider drop-shadow-[0_0_10px_#FF0033]">
              U
            </span>
          </div>
          
          {/* Rotating Ring */}
          <div className="absolute inset-0 border-2 border-[#00FFE5] rounded-full animate-spin opacity-70 shadow-[0_0_25px_#00FFE5]" style={{animationDuration: '12s'}}></div>
          
          {/* Outer Glow Ring */}
          <div className="absolute -inset-4 border border-[#FFD700] rounded-full animate-ping opacity-40 shadow-[0_0_20px_#FFD700]" style={{animationDuration: '4s'}}></div>
        </div>
      </div>
    </section>
  );
}
