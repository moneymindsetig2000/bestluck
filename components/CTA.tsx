import React from 'react';
import FadeInSection from './FadeInSection';

const ArrowIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 transition-transform group-hover:translate-x-1"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2.5"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

const Logo = () => (
    <div className="flex items-center gap-4 z-10">
      <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="planet-grad-cta" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38D6E5" />
            <stop offset="1" stopColor="#F99B2C" />
          </linearGradient>
          <linearGradient id="ring-grad-cta" x1="0" y1="16" x2="32" y2="16" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38B6E5" />
            <stop offset="1" stopColor="#F9A22C" />
          </linearGradient>
        </defs>
        <path d="M4.5 14.5 A 15 8 -25 0 1 27.5 17.5" stroke="url(#ring-grad-cta)" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="16" cy="16" r="10" fill="url(#planet-grad-cta)" />
        <path d="M4.5 14.5 A 15 8 -25 0 0 27.5 17.5" stroke="url(#ring-grad-cta)" strokeWidth="3.5" strokeLinecap="round" />
      </svg>
      <span className="text-2xl font-bold text-white tracking-wide">AI Fiesta</span>
    </div>
  );

interface CTAProps {
  onButtonHoverChange: (isHovered: boolean) => void;
  isHovered: boolean;
  onLogin: () => Promise<void>;
}

const CTA: React.FC<CTAProps> = ({ onButtonHoverChange, isHovered, onLogin }) => {
  return (
    <section className="relative py-28 sm:py-40">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        {/* Glow - MODIFIED to blend with section above */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/4 w-[80vw] h-[80vw] max-w-[1000px] max-h-[1000px] bg-emerald-800/30 rounded-full blur-3xl transition-opacity duration-700 ease-in-out ${isHovered ? 'opacity-80' : 'opacity-40'}`}></div>
        {/* Inverted Arc - A "rainbow" shape */}
        <div className="absolute left-1/2 -translate-x-1/2 w-[80rem] h-[80rem] border-b-2 border-white/20 rounded-full top-[-30rem] sm:top-[-25rem]"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <FadeInSection>
          <div className="max-w-xl mx-auto text-center flex flex-col items-center">
            <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight tracking-tight">
              Ready to experience smarter & more accurate AI answers?
            </h1>
            <p className="mt-6 max-w-lg mx-auto text-lg text-gray-300">
              Gain an edge with our exclusive Promptbook, designed to provide you with tailored insights and guidance across every industry and subject.
            </p>
            <div className="mt-12">
              <button
                onClick={onLogin}
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white rounded-full bg-zinc-900/80 backdrop-blur-sm border border-white/10 overflow-hidden shadow-2xl shadow-emerald-500/10 transition-transform duration-300 hover:scale-105"
                aria-label="Get Started Now"
                onMouseEnter={() => onButtonHoverChange(true)}
                onMouseLeave={() => onButtonHoverChange(false)}
              >
                {/* Gradient Shimmer */}
                <div className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity duration-300 animate-shimmer bg-[linear-gradient(110deg,#34d399,45%,#67e8f9,55%,#34d399)] bg-[length:250%_100%]" />
                
                {/* Dot pattern on the left */}
                <div className="absolute inset-0 w-1/2 h-full bg-[radial-gradient(white_0.5px,transparent_0.5px)] [background-size:6px_6px] opacity-10"></div>
                
                <span className="relative z-10 flex items-center gap-3">
                  Get Started Now <ArrowIcon />
                </span>
              </button>
            </div>
            <div className="mt-28">
              <Logo />
            </div>
          </div>
        </FadeInSection>
      </div>
    </section>
  );
};

export default CTA;