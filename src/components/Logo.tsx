import React from 'react';
import { Link } from 'react-router-dom';

export const Logo = () => {
  return (
    <Link to="/" className="flex items-center gap-2 group">
      <div className="relative">
        {/* Logo Icon */}
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-xl group-hover:shadow-blue-500/40 transition-all group-hover:scale-105">
          <span className="text-white font-black text-lg" style={{ fontFamily: "'Orbitron', sans-serif" }}>D</span>
        </div>
        {/* Pulse effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl animate-ping opacity-20"></div>
      </div>
      <span 
        className="text-2xl font-black tracking-wider bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent drop-shadow-sm"
        style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.15em' }}
      >
        DEBBY
      </span>
    </Link>
  );
};
