import React, { useState, useRef } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import TrustedBy from '../components/TrustedBy';
import ModelShowcase from '../components/ModelShowcase';
import Showcase from '../components/Showcase';
import Features from '../components/Features';
import Pricing from '../components/Pricing';
import FAQs from '../components/FAQs';
import CTA from '../components/CTA';
import Footer from '../components/Footer';
import Starfield from '../components/Starfield';

interface LandingPageProps {
  onLogin: () => Promise<void>;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const [isCtaHovered, setIsCtaHovered] = useState(false);
  const faqsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  return (
    <div className="bg-black text-white selection:bg-emerald-500/30">
        <Starfield 
            scrollFadeStartRef={faqsRef}
            scrollFadeEndRef={ctaRef}
            hoverReappearRef={ctaRef}
            isHoverReappearActive={isCtaHovered}
        />
        <div className="relative z-10">
            <Header onLogin={onLogin} />
            <main>
                <Hero onLogin={onLogin} />
                <TrustedBy />
                <ModelShowcase />
                <Showcase onLogin={onLogin} />
                <Features />
                <Pricing onLogin={onLogin} />
                <div ref={faqsRef}>
                  <FAQs />
                </div>
                <div ref={ctaRef}>
                    <CTA 
                        onButtonHoverChange={setIsCtaHovered}
                        isHovered={isCtaHovered}
                        onLogin={onLogin}
                    />
                </div>
            </main>
            <Footer />
        </div>
    </div>
  );
};

export default LandingPage;
