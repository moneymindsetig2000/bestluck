import React, { useState, useEffect } from 'react';

const Logo = () => (
  <a href="#" className="flex items-center gap-4 z-10">
    <img 
      src="/components/PHOTO-2025-08-20-23-29-49.jpg" 
      alt="AI Fiesta Logo" 
      className="w-10 h-10 object-cover rounded-full" 
    />
    <span className="text-2xl font-bold text-white tracking-wide">AI Fiesta</span>
  </a>
);

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faqs', label: 'FAQs' },
];

interface HeaderProps {
  onLogin: () => Promise<void>;
}

const Header: React.FC<HeaderProps> = ({ onLogin }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const href = e.currentTarget.getAttribute('href');
    if (!href) return;

    const targetId = href.substring(1);
    const targetElement = document.getElementById(targetId);

    if (isMenuOpen) {
      // Synchronously remove overflow lock BEFORE scrolling and close menu
      document.body.style.overflow = 'auto';
      setIsMenuOpen(false);
    }
    
    if (targetElement) {
      const headerOffset = 112; // from `scroll-mt-28` (28 * 4px = 112px)
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
    
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };


  return (
    <>
      <header className={`fixed top-4 left-0 right-0 z-50 transition-all duration-300`}>
        <div className={`container mx-auto px-4 py-3 flex justify-between items-center transition-all duration-300 ${isScrolled ? 'bg-black/50 backdrop-blur-lg border border-gray-800 rounded-full' : 'bg-transparent'}`}>
          <Logo />
          
          <nav className="hidden md:flex items-center bg-zinc-900/70 border border-zinc-800 rounded-full p-1.5 backdrop-blur-md">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} onClick={handleNavClick} className="text-gray-300 hover:text-white transition-colors px-5 py-2 text-base font-medium">
                {link.label}
              </a>
            ))}
          </nav>

          <button
            onClick={onLogin}
            className="hidden md:flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-semibold px-6 py-3 rounded-full hover:shadow-lg hover:shadow-emerald-500/20 transition-shadow duration-300 relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '4px 4px' }}></div>
            <span className="relative z-10 text-base">Log In</span>
            <svg className="relative z-10 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>

          <button className="md:hidden text-white z-50" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? (
               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            )}
          </button>
        </div>
      </header>
      
      {/* Mobile Menu Overlay */}
      <div className={`md:hidden fixed inset-0 bg-black/95 z-40 transition-opacity duration-300 ease-in-out ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="flex flex-col items-center justify-center h-full space-y-10 text-center">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="text-gray-300 hover:text-white transition-colors px-5 py-2 text-2xl font-medium" onClick={handleNavClick}>
              {link.label}
            </a>
          ))}
          <button
            onClick={onLogin}
            className="flex items-center gap-3 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-semibold px-8 py-4 rounded-full hover:shadow-lg hover:shadow-emerald-500/20 transition-shadow duration-300 relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '4px 4px' }}></div>
            <span className="relative z-10 text-lg">Log In</span>
            <svg className="relative z-10 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </div>
      </div>
    </>
  );
};

export default Header;