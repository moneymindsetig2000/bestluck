import React from 'react';

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ width = 32, height = 32, className = '' }) => (
  <svg width={width} height={height} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="planet-grad-logo" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
        <stop stopColor="#38D6E5" />
        <stop offset="1" stopColor="#F99B2C" />
      </linearGradient>
      <linearGradient id="ring-grad-logo" x1="0" y1="16" x2="32" y2="16" gradientUnits="userSpaceOnUse">
        <stop stopColor="#38B6E5" />
        <stop offset="1" stopColor="#F9A22C" />
      </linearGradient>
    </defs>
    <path d="M4.5 14.5 A 15 8 -25 0 1 27.5 17.5" stroke="url(#ring-grad-logo)" strokeWidth="3.5" strokeLinecap="round" />
    <circle cx="16" cy="16" r="10" fill="url(#planet-grad-logo)" />
    <path d="M4.5 14.5 A 15 8 -25 0 0 27.5 17.5" stroke="url(#ring-grad-logo)" strokeWidth="3.5" strokeLinecap="round" />
  </svg>
);

export default Logo;
