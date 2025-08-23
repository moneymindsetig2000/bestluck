import React from 'react';
import FadeInSection from './FadeInSection';
import Logo from './Logo';
import { ChatGptIcon, ClaudeIcon, DeepSeekIcon, GeminiIcon, GrokIcon, PerplexityIcon } from './shared/ModelIcons';

const modelData = [
    { side: 'left', icon: <ChatGptIcon size={24} />, name: 'ChatGPT 5', tag: 'All Rounder Explainer', description: 'Great for questions, brainstorming, and clear step-by-step explanations.' },
    { side: 'left', icon: <ClaudeIcon size={24} />, name: 'Claude Sonnet 4', tag: 'Co-Writing Master', description: 'Refines polished emails, essays, and scripts while keeping your style.' },
    { side: 'left', icon: <GeminiIcon size={24} className="text-white" />, name: 'Gemini 2.5 Pro', tag: 'Long Context Master', description: 'Handles long documents and images, tracking full context and details.' },
    { side: 'right', icon: <PerplexityIcon size={20} />, name: 'Perplexity Sonar Pro', tag: 'Live Web Researcher', description: 'Delivers fresh answers and news from credible, real-time sources.' },
    { side: 'right', icon: <DeepSeekIcon size={24} />, name: 'DeepSeek', tag: 'Reasoning Specialist', description: 'Excels at logic, math, and coding with clear, detailed solutions.' },
    { side: 'right', icon: <GrokIcon size={20} />, name: 'Grok 4', tag: 'Creative Powerhouse', description: 'Bold, unconventional ideas and punchy copy for trend-focused content.' },
];

const ModelCard = ({ icon, name, tag, description }: { icon: JSX.Element, name: string, tag: string, description: string }) => (
  <div className="bg-[#1C1C1C]/60 backdrop-blur-md border border-zinc-800 rounded-2xl p-6 text-left relative overflow-hidden group">
    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent"></div>
    <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent"></div>
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-teal-500/20 to-green-600/20 flex-shrink-0 border-2 border-zinc-800">
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-bold text-white">{name}</h3>
        <span className="inline-block mt-1.5 bg-zinc-800 text-zinc-300 text-xs font-medium px-2.5 py-1 rounded-full border border-zinc-700">{tag}</span>
      </div>
    </div>
    <p className="mt-4 text-zinc-400 text-sm leading-relaxed">{description}</p>
  </div>
);

const CentralLogo = () => (
    <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Grainy glow */}
        <div 
            className="absolute inset-0 z-0"
            style={{
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(20, 184, 166, 0.2) 0%, rgba(20, 184, 166, 0) 60%)',
                filter: 'blur(30px)',
            }}
        ></div>

        {/* Concentric circles */}
        <div className="absolute inset-10 rounded-full border border-white/5 animate-pulse-slow"></div>
        <div className="absolute inset-16 rounded-full border border-white/5 animate-pulse-slow delay-150"></div>
        <div className="absolute inset-24 rounded-full border border-white/5 animate-pulse-slow delay-300"></div>

        {/* Logo SVG */}
        <Logo width={80} height={80} className="relative z-10" />
    </div>
);


const ModelShowcase: React.FC = () => {
    const allModels = [...modelData.filter(m => m.side === 'left'), ...modelData.filter(m => m.side === 'right')];

    return (
      <section className="py-20 sm:py-32 overflow-hidden">
        <div className="container mx-auto px-6 text-center">
            <FadeInSection>
                <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tighter">
                Pick the best characteristics<br />of each AI model
                </h2>
            </FadeInSection>

            {/* Desktop Layout */}
            <div className="mt-20 max-w-7xl mx-auto relative h-[700px] hidden lg:block">
                <div className="absolute inset-0 flex items-center justify-center z-0">
                    <CentralLogo />
                </div>
                
                <div className="absolute inset-0 pointer-events-none z-0">
                    <svg width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 700" preserveAspectRatio="xMidYMid meet">
                        <defs>
                            <radialGradient id="line-grad" cx="640" cy="350" r="400" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stopColor="#67E8F9" stopOpacity="0.6" />
                                <stop offset="100%" stopColor="#34D399" stopOpacity="0.1" />
                            </radialGradient>
                        </defs>
                        {/* Connector lines */}
                        {/* Left */}
                        <path d="M 620,330 C 534,330 534,110 448,110" stroke="url(#line-grad)" strokeWidth="1.5" />
                        <path d="M 600,350 C 550,390 498,310 448,350" stroke="url(#line-grad)" strokeWidth="1.5" />
                        <path d="M 620,370 C 534,370 534,590 448,590" stroke="url(#line-grad)" strokeWidth="1.5" />
                        {/* Right */}
                        <path d="M 660,330 C 746,330 746,110 832,110" stroke="url(#line-grad)" strokeWidth="1.5" />
                        <path d="M 680,350 C 730,390 782,310 832,350" stroke="url(#line-grad)" strokeWidth="1.5" />
                        <path d="M 660,370 C 746,370 746,590 832,590" stroke="url(#line-grad)" strokeWidth="1.5" />
                    </svg>
                </div>

                <div className="relative z-10 grid grid-cols-2 h-full">
                    <div className="flex flex-col justify-between h-full py-4 items-end pr-48">
                        {modelData.filter(m => m.side === 'left').map((model) => (
                            <FadeInSection key={model.name} direction="right" className="lg:max-w-sm w-full">
                                <ModelCard {...model} />
                            </FadeInSection>
                        ))}
                    </div>
                    
                    <div className="flex flex-col justify-between h-full py-4 items-start pl-48">
                        {modelData.filter(m => m.side === 'right').map((model) => (
                            <FadeInSection key={model.name} direction="left" className="lg:max-w-sm w-full">
                                <ModelCard {...model} />
                            </FadeInSection>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Mobile Layout */}
            <div className="mt-16 lg:hidden">
              <div className="flex flex-col items-center gap-8 max-w-md mx-auto">
                {allModels.map((model, index) => (
                  <React.Fragment key={model.name}>
                    <FadeInSection className="w-full">
                      <ModelCard {...model} />
                    </FadeInSection>
                    {index === 2 && (
                      <div className="my-8">
                        <CentralLogo />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
        </div>
      </section>
    )
};

export default ModelShowcase;