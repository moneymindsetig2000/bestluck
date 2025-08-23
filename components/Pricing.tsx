
import React, { useState } from 'react';
import FadeInSection from './FadeInSection';
import Logo from './Logo';

// Icons
const CheckIcon = ({ className = '' }: { className?: string }) => (
  <svg className={`flex-shrink-0 ${className}`} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.362 7.732a1.25 1.25 0 0 1 0 1.768l-7.143 7.143a1.25 1.25 0 0 1-1.768 0L5.638 13.83a1.25 1.25 0 0 1 1.768-1.768l1.963 1.963 6.257-6.257a1.25 1.25 0 0 1 1.768 0Z" fill="currentColor"/>
  </svg>
);

const CircleCheckIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="11" fill="#10B981" stroke="#34D399" strokeWidth="2"/>
        <path d="M8.5 12.5L11 15L16 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const CircleIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="11.5" stroke="#4B5563"/>
    </svg>
);

const XIcon = () => (
    <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

// Specific AI Model Icons
const ChatGptIcon = () => (
    <svg className="w-5 h-5 text-teal-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.53,9.72,18,5.19,16.28,7,18,8.72,13.5,13.22,9,8.72l4.5-4.5L11.78,2.5,2.25,12l9.53,9.5,1.72-1.72-4.5-4.5,4.5-4.5,4.5,4.5L20.22,13Z"></path>
    </svg>
);

const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.19,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.19,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.19,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1Z"/>
    </svg>
);

const PerplexityIcon = () => (
    <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12H18A6,6 0 0,0 12,6V4M4,12A8,8 0 0,1 12,4V6A6,6 0 0,0 6,12H4M12,20A8,8 0 0,1 4,12H6A6,6 0 0,0 12,18V20M20,12A8,8 0 0,1 12,20V18A6,6 0 0,0 18,12H20Z"></path>
    </svg>
);

const ClaudeIcon = () => (
    <div className="w-5 h-5 flex items-center justify-center font-bold text-base bg-[#d0825f] text-white rounded-sm p-1 leading-none">
        C
    </div>
);

const GrokIcon = () => (
    <div className="w-5 h-5 flex items-center justify-center bg-zinc-800 border border-zinc-600 rounded-sm p-0.5">
        <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 256 256">
            <path d="M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z"></path>
        </svg>
    </div>
);

const IconWrapper = ({ children, className, style }: { children: React.ReactNode, className?: string, style?: React.CSSProperties }) => (
    <div 
        className={`w-6 h-6 rounded-full flex items-center justify-center ring-2 ring-zinc-900 ${className}`}
        style={style}
    >
        {children}
    </div>
);

const ModelIcons = () => (
  <div className="flex items-center -space-x-2 ml-auto">
      {/* ChatGPT */}
      <IconWrapper className="bg-[#10A37F]" style={{ zIndex: 5 }}>
          <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M22.53,9.72,18,5.19,16.28,7,18,8.72,13.5,13.22,9,8.72l4.5-4.5L11.78,2.5,2.25,12l9.53,9.5,1.72-1.72-4.5-4.5,4.5-4.5,4.5,4.5L20.22,13Z"></path></svg>
      </IconWrapper>
      {/* Google Gemini */}
      <IconWrapper className="bg-white p-0.5" style={{ zIndex: 4 }}>
          <svg className="w-full h-full" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path fill="#4285F4" d="M45.12 24.52c0-1.6-.14-3.15-.4-4.66H24.48v8.78h11.6c-.5 2.82-1.93 5.23-4.08 6.86v5.7h7.34c4.3-3.96 6.78-9.92 6.78-16.68z"/>
              <path fill="#34A853" d="M24.48 46c5.94 0 10.95-1.96 14.6-5.32l-7.34-5.7c-1.96 1.32-4.48 2.1-7.26 2.1-5.58 0-10.3-3.76-12-8.82H5.06v5.86c3.55 7.04 10.8 11.88 19.42 11.88z"/>
              <path fill="#FBBC05" d="M12.48 28.28c-.42-1.32-.66-2.73-.66-4.18s.24-2.86.66-4.18V14.06H5.06c-1.32 2.6-2.08 5.52-2.08 8.76s.76 6.16 2.08 8.76l7.42-5.88z"/>
              <path fill="#EA4335" d="M24.48 9.92c3.24 0 6.12 1.1 8.4 3.3l6.52-6.52C35.42 2.94 30.42 1 24.48 1 15.86 1 8.6 5.84 5.06 12.9l7.42 5.86c1.7-5.06 6.42-8.84 12-8.84z"/>
          </svg>
      </IconWrapper>
      {/* Perplexity */}
      <IconWrapper className="bg-black" style={{ zIndex: 3 }}>
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12H18A6,6 0 0,0 12,6V4M4,12A8,8 0 0,1 12,4V6A6,6 0 0,0 6,12H4M12,20A8,8 0 0,1 4,12H6A6,6 0 0,0 12,18V20M20,12A8,8 0 0,1 12,20V18A6,6 0 0,0 18,12H20Z"></path></svg>
      </IconWrapper>
      {/* Claude */}
      <IconWrapper className="bg-[#D97706] text-white font-bold text-xs" style={{ zIndex: 2 }}>
          C
      </IconWrapper>
      {/* Grok */}
      <IconWrapper className="bg-zinc-800" style={{ zIndex: 1 }}>
          <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 256 256"><path d="M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z"></path></svg>
      </IconWrapper>
  </div>
);

interface PricingProps {
  onLogin: () => Promise<void>;
}

const Pricing: React.FC<PricingProps> = ({ onLogin }) => {
    const [plan, setPlan] = useState<'monthly' | 'yearly'>('monthly');

    return (
        <section id="pricing" className="py-20 sm:py-32 scroll-mt-28">
            <div className="container mx-auto px-6">
                <FadeInSection className="text-center max-w-4xl mx-auto">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tighter">
                        Get 6 Premium AI Models<br />for Half the Price of One
                    </h2>
                    <div className="flex justify-center mt-6">
                        <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-300 text-sm font-medium px-4 py-1.5 rounded-full">
                            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" /></svg>
                            Limited time: Save 90% compared to individual subscriptions
                        </div>
                    </div>
                </FadeInSection>
                
                <div className="mt-16 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-4">

                    {/* Left Card: Individual Subscriptions */}
                    <FadeInSection direction="left" className="w-full max-w-md">
                        <div className="bg-[#1C1C1C] border border-zinc-800 rounded-2xl p-6 h-full flex flex-col">
                            <h3 className="text-xl font-bold text-white">Individual AI Subscriptions</h3>
                            <p className="text-4xl font-bold text-white mt-4">$110 <span className="text-2xl text-zinc-400">(~₹10,000)</span></p>
                            <p className="text-zinc-500 text-sm mt-1">What you're paying now</p>
                            
                            <ul className="space-y-3 mt-6 text-zinc-300 text-sm">
                                <li className="flex items-center justify-between">
                                    <span className="flex items-center gap-2.5">
                                        <ChatGptIcon />
                                        ChatGPT 5
                                    </span>
                                    <span className="font-medium text-red-400">$20/mo</span>
                                </li>
                                <li className="flex items-center justify-between">
                                    <span className="flex items-center gap-2.5">
                                        <GoogleIcon />
                                        Google Gemini 2.5 Pro
                                    </span>
                                    <span className="font-medium text-red-400">$20/mo</span>
                                </li>
                                <li className="flex items-center justify-between">
                                     <span className="flex items-center gap-2.5">
                                        <PerplexityIcon />
                                        Perplexity Sonar Pro
                                    </span>
                                    <span className="font-medium text-red-400">$20/mo</span>
                                </li>
                                <li className="flex items-center justify-between">
                                     <span className="flex items-center gap-2.5">
                                        <ClaudeIcon />
                                        Claude Sonnet 4
                                    </span>
                                    <span className="font-medium text-red-400">$20/mo</span>
                                </li>
                                <li className="flex items-center justify-between">
                                     <span className="flex items-center gap-2.5">
                                        <GrokIcon />
                                        Grok 4
                                    </span>
                                    <span className="font-medium text-red-400">$30/mo</span>
                                </li>
                            </ul>
                            
                            <hr className="border-zinc-800 my-6" />

                            <ul className="space-y-3 text-zinc-400 mt-auto text-sm">
                                <li className="flex items-start gap-3">
                                    <XIcon />
                                    <span>Multiple subscriptions to manage - expensive</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <XIcon />
                                    <span>Constant tab switching</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <XIcon />
                                    <span>No comparison features</span>
                                </li>
                            </ul>
                        </div>
                    </FadeInSection>
                    
                    {/* VS Separator */}
                    <div className="text-zinc-600 font-bold text-2xl my-4 lg:my-0 lg:mx-4">VS</div>

                    {/* Right Card: AI Clavis */}
                    <FadeInSection direction="right" className="w-full max-w-2xl">
                         <div className="relative bg-[#1a1a1a]/50 border border-green-400/30 rounded-3xl p-8 shadow-2xl shadow-green-500/10">
                            <div className="absolute -inset-px bg-gradient-to-br from-green-400/50 to-teal-600/50 rounded-3xl blur-xl opacity-30 -z-10"></div>
                            <div className="flex items-center gap-3">
                                <Logo />
                                <h3 className="text-2xl font-bold text-white">AI Clavis</h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                                <button onClick={() => setPlan('monthly')} className={`p-4 border rounded-xl text-left transition-all duration-200 ${plan === 'monthly' ? 'bg-green-500/10 border-green-400' : 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-500'}`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-2xl font-bold text-white">₹999<span className="text-base font-medium text-zinc-400">/Month</span></p>
                                            <p className="text-sm text-zinc-400 mt-1">Monthly</p>
                                        </div>
                                        {plan === 'monthly' ? <CircleCheckIcon /> : <CircleIcon />}
                                    </div>
                                </button>
                                <button onClick={() => setPlan('yearly')} className={`p-4 border rounded-xl text-left transition-all duration-200 ${plan === 'yearly' ? 'bg-green-500/10 border-green-400' : 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-500'}`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-2xl font-bold text-white">₹9,999<span className="text-base font-medium text-zinc-400">/Year</span></p>
                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs mt-1">
                                                <span className="text-green-400 font-semibold">Yearly (Save 17%)</span>
                                                <span className="text-teal-400 bg-teal-400/10 px-1.5 py-0.5 rounded-full">+Quarterly Webinar Access</span>
                                            </div>
                                        </div>
                                        {plan === 'yearly' ? <CircleCheckIcon /> : <CircleIcon />}
                                    </div>
                                </button>
                            </div>
                            
                            <div className="text-center bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-sm py-3 px-4 rounded-lg mt-6 flex items-center justify-center gap-2">
                                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M5.25 3.25A2.25 2.25 0 003 5.5v1.854a.75.75 0 001.5 0V5.5a.75.75 0 01.75-.75h1.854a.75.75 0 010-1.5H5.25zM15.5 3.25a.75.75 0 01.75.75v1.854a.75.75 0 01-1.5 0V5.5a.75.75 0 00-.75-.75h-1.854a.75.75 0 010-1.5h1.854A2.25 2.25 0 0115.5 3.25zM3.25 15.5A2.25 2.25 0 005.5 17h1.854a.75.75 0 000-1.5H5.5a.75.75 0 01-.75-.75v-1.854a.75.75 0 00-1.5 0V15.5zM17 14.75a.75.75 0 01-.75.75h-1.854a.75.75 0 010-1.5h1.854a.75.75 0 00.75-.75v-1.854a.75.75 0 011.5 0v1.854A2.25 2.25 0 0117 14.75zM10 5a1 1 0 011 1v1.768l1.621-1.622a.75.75 0 111.06 1.06l-1.621 1.622H15a1 1 0 110 2h-1.768l1.622 1.621a.75.75 0 11-1.06 1.06L12 11.06V13a1 1 0 11-2 0v-1.94l-1.621 1.621a.75.75 0 11-1.06-1.06L8.94 10H7a1 1 0 110-2h1.94l-1.622-1.621a.75.75 0 011.06-1.06L10 8.94V6a1 1 0 011-1z"/></svg>
                                ULTIMATE PROMPTBOOK & COMMUNITY ACCESS
                            </div>

                            <ul className="space-y-4 mt-6 text-zinc-300">
                                <li className="flex items-center gap-3">
                                    <CheckIcon className="text-green-400" />
                                    <span>All premium AI models included</span>
                                    <ModelIcons />
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckIcon className="text-green-400" />
                                    <span>Side-by-side comparison</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckIcon className="text-green-400" />
                                    <span>400,000 tokens/month</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckIcon className="text-green-400" />
                                    <span>Instant prompt enhancement</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckIcon className="text-green-400" />
                                    <span>Image generation & Audio transcription</span>
                                </li>
                            </ul>
                            
                            <button
                              onClick={onLogin}
                              className="mt-8 w-full text-center inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-400 to-green-500 text-black font-bold px-8 py-4 rounded-full hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 relative overflow-hidden text-lg transform hover:-translate-y-0.5 group"
                            >
                              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.7) 1px, transparent 1px)', backgroundSize: '5px 5px' }}></div>
                              <span className="relative z-10">Get Started Now</span>
                              <svg className="relative z-10 w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </button>
                            <p className="text-center text-xs text-zinc-500 mt-4">
                                🔒 Payments are processed by TagMango using Razorpay & Stripe
                            </p>
                         </div>
                    </FadeInSection>
                </div>
            </div>
        </section>
    );
};

export default Pricing;