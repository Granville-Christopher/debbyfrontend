import React from 'react';
import { Link } from 'react-router-dom';

type LogoMarkProps = {
  className?: string;
  showPulse?: boolean;
  compactOnMobile?: boolean;
};

export const LogoMark: React.FC<LogoMarkProps> = ({
  className = "",
  showPulse = true,
  compactOnMobile = false
}) => {
  const markSizeClass = compactOnMobile
    ? "h-8 w-8 rounded-lg sm:h-10 sm:w-10 sm:rounded-xl"
    : "h-10 w-10 rounded-xl";
  const letterSizeClass = compactOnMobile ? "text-base sm:text-lg" : "text-lg";

  return (
    <div className={`relative ${className}`}>
      <div
        className={`${markSizeClass} bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-xl group-hover:shadow-blue-500/40 transition-all group-hover:scale-105`}
      >
        <span className={`text-white font-black ${letterSizeClass}`} style={{ fontFamily: "'Orbitron', sans-serif" }}>
          D
        </span>
      </div>
      {showPulse ? (
        <div className={`${markSizeClass} absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 animate-ping opacity-20`}></div>
      ) : null}
    </div>
  );
};

type LogoProps = {
  compactOnMobile?: boolean;
};

export const Logo: React.FC<LogoProps> = ({ compactOnMobile = false }) => {
  const wordmarkSizeClass = compactOnMobile ? "text-xl sm:text-2xl" : "text-2xl";
  return (
    <Link to="/" className="flex items-center gap-2 group">
      <LogoMark compactOnMobile={compactOnMobile} />
      <span 
        className={`${wordmarkSizeClass} font-black tracking-wider bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent drop-shadow-sm`}
        style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.15em' }}
      >
        DEBBY
      </span>
    </Link>
  );
};
