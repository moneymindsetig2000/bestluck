import React, { useState, useEffect } from 'react';
import FadeInSection from './FadeInSection';
import { ChatGptIcon, DeepSeekIcon, GeminiIcon, PerplexityIcon } from './shared/ModelIcons';

interface HeroProps {
  onLogin: () => Promise<void>;
}

const Hero: React.FC<HeroProps> = ({ onLogin }) => {
  const animatedWords = ['Chat.', 'Subscription.'];
  const [wordIndex, setWordIndex] = useState(0);
  const [animationState, setAnimationState] = useState<'in' | 'out'>('in');

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationState('out');
    }, 2500); // How long each word stays visible
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (animationState === 'out') {
      const timeout = setTimeout(() => {
        setWordIndex(prev => (prev + 1) % animatedWords.length);
        setAnimationState('in');
      }, 150);
      return () => clearTimeout(timeout);
    }
  }, [animationState]);


  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-24">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-5 gap-x-16 gap-y-12 items-center">
          {/* Left Column: Text Content */}
          <div className="text-left lg:col-span-3">
            <FadeInSection>
              <h1 className="text-6xl lg:text-7xl font-extrabold text-white leading-tight tracking-tighter">
                World's Most<br />
                Powerful AIs.<br />
                One&nbsp;
                <span className="relative inline-block h-[1.2em] w-[300px] lg:w-[500px] align-middle overflow-hidden text-left">
                  <span
                    key={wordIndex}
                    className={`absolute inset-0 ${
                      animationState === 'in' ? 'animate-text-slide-in-up' : 'animate-text-slide-out-up'
                    }`}
                  >
                    {animatedWords[wordIndex]}
                  </span>
                </span>
              </h1>
            </FadeInSection>
            <FadeInSection className="delay-150">
              <p className="mt-6 max-w-lg text-lg text-gray-400">
                Stop juggling tabs and subscriptions - AI Clavis gives you access to all best-in-class AI models for just $12/month. That's almost half of what you'd pay for a single premium AI chat subscription.
              </p>
            </FadeInSection>
            <FadeInSection className="delay-300">
              <div className="mt-10 flex flex-col items-start">
                <button
                  onClick={onLogin}
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-teal-400 to-green-500 text-white font-semibold px-10 py-5 rounded-full hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 relative overflow-hidden text-xl transform hover:-translate-y-1 group"
                >
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.7) 1px, transparent 1px)', backgroundSize: '5px 5px' }}></div>
                  <span className="relative z-10">Get Started Now</span>
                  <svg className="relative z-10 w-6 h-6 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
                <p className="mt-5 text-sm text-gray-500">
                  Experience smarter & more accurate answers
                </p>
              </div>
            </FadeInSection>
          </div>

          {/* Right Column: Video/App Preview */}
          <FadeInSection className="w-full max-w-2xl mx-auto lg:max-w-none delay-500 lg:col-span-2">
            <div className="relative">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-teal-500/80 to-green-600/80 rounded-3xl blur-2xl opacity-40 animate-pulse-slow"></div>
              <div className="relative bg-[#1C1C1C] border border-gray-800 rounded-2xl aspect-[4/3] flex flex-col overflow-hidden">
                
                {/* Header of the mock window with tabs */}
                <div className="flex-shrink-0 px-6 py-2 border-b border-gray-800 bg-black/20">
                    <div className="flex items-center gap-6 text-sm text-gray-400 font-medium">
                        <span className="flex items-center gap-2 text-white">
                          <ChatGptIcon size={16} />
                          ChatGPT
                        </span>
                        <span className="flex items-center gap-2 opacity-60">
                          <GeminiIcon size={16} />
                          Gemini
                        </span>
                         <span className="flex items-center gap-2 opacity-60">
                           <DeepSeekIcon size={16} />
                           DeepSeek
                         </span>
                         <span className="flex items-center gap-2 opacity-60">
                           <PerplexityIcon size={16} />
                           Perplexity
                         </span>
                    </div>
                </div>

                {/* Body with Play Button */}
                <div className="flex-grow flex items-center justify-center bg-black/10">
                    <button className="w-16 h-16 md:w-20 md:h-20 bg-white/5 rounded-full flex items-center justify-center backdrop-blur-sm group transition-transform hover:scale-110 border border-white/10">
                        <svg className="w-8 h-8 md:w-10 md:h-10 text-white/70 group-hover:text-white transition-colors ml-1" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </button>
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 p-4 border-t border-gray-800 bg-[#111111]">
                    <div className="text-gray-500">Ask me anything...</div>
                    <div className="flex gap-4 mt-3 text-sm text-gray-300">
                        <span className="flex items-center gap-1.5 opacity-80"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>Generate Image</span>
                        <span className="flex items-center gap-1.5 opacity-80"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" x2="12" y1="3" y2="15"></line></svg>Upload Image</span>
                    </div>
                </div>
              </div>
            </div>
          </FadeInSection>
        </div>
      </div>
    </section>
  );
};

export default Hero;