import React from 'react';
import video from "../assets/banner.mp4";

const HeroSection = () => {
  return (
    <div className="relative w-full h-screen">
      <video 
        className="w-full h-full object-cover" 
        autoPlay 
        loop 
        muted 
        playsInline
      >
        <source src={video} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay for better button visibility */}
      <div className="absolute inset-0 bg-black/30"></div>

      {/* Centered Action Buttons - Positioned Lower */}
      <div className="absolute inset-0 flex items-end justify-center p-4 pb-24 sm:pb-32">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <a
            href="/dashboard/shop"
            className="px-8 py-3 bg-green-600 text-white font-bold rounded-full hover:bg-green-700 transition-transform transform hover:scale-105 w-full sm:w-auto"
          >
            Shop Now
          </a>
          <a
            href="/#categories"
            className="px-8 py-3 bg-white/20 backdrop-blur-sm border border-white/50 text-white font-bold rounded-full hover:bg-white/30 transition w-full sm:w-auto"
          >
            Explore Deals
          </a>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;